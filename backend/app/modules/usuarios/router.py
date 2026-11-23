"""/api/v1/admin/usuarios: solo admin."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import SoloAdmin
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic], summary="Listado de usuarios")
def listar_usuarios(_admin: SoloAdmin, service: ServiceDep):
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic, summary="Alta lógica (disabled = false)")
def activar_usuario(id: int, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.activar(id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.post("/{id}/desactivar", response_model=UserPublic, summary="Baja lógica (disabled = true)")
def desactivar_usuario(id: int, admin: SoloAdmin, service: ServiceDep):
    try:
        return service.desactivar(id, admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e)) from None
    except AutoDesactivacion as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(e)) from None
