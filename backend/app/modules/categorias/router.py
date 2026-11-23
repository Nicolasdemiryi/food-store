"""/api/v1/categorias: lecturas públicas, escrituras solo admin."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import SoloAdmin
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


def _http(error: Exception) -> HTTPException:
    """Traduce las excepciones de dominio a códigos HTTP."""
    if isinstance(error, CategoriaNoEncontrada):
        return HTTPException(status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, NombreDuplicado):
        return HTTPException(status.HTTP_409_CONFLICT, detail=str(error))
    raise error


@router.get("", response_model=list[CategoriaRead], summary="Lista las categorías activas")
def listar(service: ServiceDep):
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener(id: int, service: ServiceDep):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as e:
        raise _http(e) from None


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear(data: CategoriaCreate, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise _http(e) from None


@router.put("/{id}", response_model=CategoriaRead, summary="Actualiza los campos enviados")
def actualizar(id: int, data: CategoriaUpdate, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.actualizar(id, data)
    except (CategoriaNoEncontrada, NombreDuplicado) as e:
        raise _http(e) from None


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response, summary="Baja lógica")
def eliminar(id: int, _admin: SoloAdmin, service: ServiceDep) -> Response:
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as e:
        raise _http(e) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
