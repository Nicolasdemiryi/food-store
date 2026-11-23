"""/api/v1/productos: lecturas públicas (solo activos), escrituras solo admin."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import SoloAdmin
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]

_NO_ENCONTRADO = (ProductoNoEncontrado, CategoriaNoEncontrada)  # ambos → 404


@router.get("", response_model=ProductosPaginados, summary="Listado paginado de productos activos")
def listar(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=100, description="Busca en el nombre (sin distinguir mayúsculas)")] = None,
    categoria_id: Annotated[int | None, Query(ge=1)] = None,
    disponible: bool | None = None,
):
    return service.listar(skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible)


@router.get("/{id}", response_model=ProductoRead, summary="Detalle con su categoría")
def obtener(id: int, service: ServiceDep):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear(data: ProductoCreate, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.put("/{id}", response_model=ProductoRead, summary="Actualiza los campos enviados")
def actualizar(id: int, data: ProductoUpdate, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.actualizar(id, data)
    except _NO_ENCONTRADO as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.patch("/{id}/stock", response_model=ProductoRead, summary="Actualiza stock y disponible")
def actualizar_stock(id: int, data: ProductoStockUpdate, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e)) from None


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response, summary="Baja lógica")
def eliminar(id: int, _admin: SoloAdmin, service: ServiceDep) -> Response:
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(e)) from None
    return Response(status_code=status.HTTP_204_NO_CONTENT)
