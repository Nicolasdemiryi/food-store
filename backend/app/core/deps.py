"""Dependencias de sesión y rol. Se encadenan así:

    oauth2_scheme  →  get_current_user  →  get_current_active_user  →  require_role([...])
    (lee la cookie)   401 token inválido    400 cuenta desactivada       403 rol no permitido
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Lee el token SOLO de la cookie HttpOnly; el encabezado Authorization no se acepta."""

    async def __call__(self, request: Request) -> str | None:  # type: ignore[override]
        token = request.cookies.get(COOKIE_NAME)
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED, detail="No autenticado", headers={"WWW-Authenticate": "Bearer"}
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    """Valida firma, expiración y tipo del JWT y carga el usuario de la base (401 si algo falla)."""
    credenciales_invalidas = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    username = payload.get("sub") if payload else None
    if not isinstance(username, str):
        raise credenciales_invalidas
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise credenciales_invalidas
        return UserPublic.model_validate(usuario)


def get_current_active_user(current_user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    """El rol y el estado se leen de la base en cada petición: una desactivación rige al instante."""
    if current_user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return current_user


def require_role(allowed_roles: list[str]):  # type: ignore[no-untyped-def]
    """Fábrica de dependencias: 403 si el rol del usuario no está en la lista."""

    def role_checker(current_user: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes")
        return current_user

    return role_checker


# Alias para los routers
UsuarioActual = Annotated[UserPublic, Depends(get_current_active_user)]
SoloAdmin = Annotated[UserPublic, Depends(require_role(["admin"]))]
