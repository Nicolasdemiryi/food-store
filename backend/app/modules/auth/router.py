"""/api/v1/auth: registro, login con cookie HttpOnly, logout y perfil."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, UsuarioActual
from app.modules.auth.schemas import LoginResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])

# Mismos atributos al crear y al borrar la cookie (si no coinciden, el navegador no la borra).
_COOKIE = {"key": COOKIE_NAME, "httponly": True, "samesite": "lax", "secure": settings.COOKIE_SECURE, "path": "/"}


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED, summary="Registro (rol user)")
def register(data: UserCreate, service: ServiceDep):
    return service.registrar(data)


@router.post("/token", response_model=LoginResponse, summary="Login: el JWT viaja en la cookie HttpOnly")
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, service: ServiceDep):
    token = service.autenticar(form_data.username, form_data.password)
    # El token NO va en el cuerpo: JavaScript no puede leer una cookie HttpOnly (mitiga XSS).
    response.set_cookie(value=token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **_COOKIE)  # type: ignore[arg-type]
    return LoginResponse(message="Login exitoso")


@router.post("/logout", response_model=LoginResponse, summary="Borra la cookie")
def logout(response: Response):
    response.delete_cookie(**_COOKIE)  # type: ignore[arg-type]
    return LoginResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic, summary="Usuario autenticado")
def me(current_user: UsuarioActual):
    return current_user
