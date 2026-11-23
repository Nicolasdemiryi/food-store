"""/api/v1/pedidos. El Router obtiene el Service con Depends, no abre el Unit of Work
y traduce las excepciones de dominio a HTTPException."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import SoloAdmin, UsuarioActual
from app.modules.pedidos.schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

# Excepción de dominio → código HTTP
_CODIGOS: dict[type[Exception], int] = {
    PedidoNoEncontrado: status.HTTP_404_NOT_FOUND,
    ProductoNoEncontrado: status.HTTP_404_NOT_FOUND,
    PedidoAjeno: status.HTTP_403_FORBIDDEN,
    StockInsuficiente: status.HTTP_400_BAD_REQUEST,
    ProductoNoDisponible: status.HTTP_400_BAD_REQUEST,
    ProductoRepetido: status.HTTP_400_BAD_REQUEST,
    TransicionInvalida: status.HTTP_400_BAD_REQUEST,
    PedidoNoCancelable: status.HTTP_400_BAD_REQUEST,
}
_DOMINIO = tuple(_CODIGOS)


def _http(error: Exception) -> HTTPException:
    return HTTPException(_CODIGOS[type(error)], detail=str(error))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED, summary="Crea el pedido (RN-01)")
def crear(data: PedidoCreate, usuario: UsuarioActual, service: ServiceDep):
    try:
        return service.crear(data, usuario)
    except _DOMINIO as e:
        raise _http(e) from None


@router.get("", response_model=PedidosPaginados, summary="Propios (user) o todos (admin)")
def listar(
    usuario: UsuarioActual,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, estado=estado, skip=skip, limit=limit)


# Se declara ANTES de /{id}: si no, "resumen" se interpretaría como un id.
@router.get("/resumen", response_model=ResumenPedidos, summary="Indicadores del panel")
def resumen(_admin: SoloAdmin, service: ServiceDep):
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead, summary="Detalle (dueño o admin)")
def obtener(id: int, usuario: UsuarioActual, service: ServiceDep):
    try:
        return service.obtener(id, usuario)
    except _DOMINIO as e:
        raise _http(e) from None


@router.patch("/{id}/estado", response_model=PedidoRead, summary="Avanza o cancela (admin, RN-02/RN-03)")
def cambiar_estado(id: int, data: CambioEstado, _admin: SoloAdmin, service: ServiceDep):
    try:
        return service.cambiar_estado(id, data.estado)
    except _DOMINIO as e:
        raise _http(e) from None


@router.patch("/{id}/cancelar", response_model=PedidoRead, summary="El dueño cancela en PENDIENTE (RN-03/RN-04)")
def cancelar(id: int, usuario: UsuarioActual, service: ServiceDep):
    try:
        return service.cancelar(id, usuario)
    except _DOMINIO as e:
        raise _http(e) from None
