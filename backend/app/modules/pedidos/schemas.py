from datetime import datetime
from typing import Literal

from pydantic import field_validator
from sqlmodel import Field, SQLModel

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]  # RN-06


# ------------------------------------------------------------------ entrada
class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(ge=1)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)  # RN-01: al menos un ítem
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)  # RN-06
    notas: str | None = Field(default=None, max_length=500)

    @field_validator("direccion_entrega")
    @classmethod
    def direccion_sin_espacios(cls, v: str) -> str:
        v = v.strip()
        if not 5 <= len(v) <= 200:
            raise ValueError("La dirección de entrega debe tener entre 5 y 200 caracteres")
        return v

    @field_validator("notas")
    @classmethod
    def notas_vacias_son_nulas(cls, v: str | None) -> str | None:
        return (v.strip() or None) if v else None


class CambioEstado(SQLModel):
    estado: EstadoPedido  # uno de los cuatro estados (otro valor → 422)


# ------------------------------------------------------------------ salida
class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class ClientePedido(SQLModel):
    """Datos mínimos del usuario dueño (para la tabla del admin)."""

    id: int
    username: str
    full_name: str


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]  # desde la relación Pedido.items
    usuario: ClientePedido  # desde la relación Pedido.usuario


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
