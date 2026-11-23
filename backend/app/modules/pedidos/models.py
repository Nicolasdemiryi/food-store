"""Pedido y DetallePedido (paquete Pedidos del UML)."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    """No se borra: se cancela. total queda fijo desde la creación (RN-05)."""

    __tablename__ = "pedido"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    forma_pago: str = Field(max_length=20)  # EFECTIVO | TRANSFERENCIA
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))

    usuario: "Usuario" = Relationship(back_populates="pedidos")  # Usuario 1:N Pedido
    # Pedido 1:N DetallePedido (composición: las líneas pertenecen al pedido)
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido", sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "DetallePedido.id"}
    )


class DetallePedido(SQLModel, table=True):
    """Línea inmutable: nombre_producto y precio_unitario son COPIAS del producto
    al momento de la compra; si después cambia el precio, el pedido no cambia."""

    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int  # >= 1
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float  # precio_unitario × cantidad

    pedido: "Pedido" = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")  # Producto 1:N DetallePedido
