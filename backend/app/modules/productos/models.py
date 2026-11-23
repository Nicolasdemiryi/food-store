"""Producto (paquete Catálogo del UML). Pertenece a una sola categoría (1:N)."""

from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(max_length=150, index=True)
    descripcion: str | None = Field(default=None)
    precio_base: float  # >= 0: se valida en el schema
    imagen_url: str | None = Field(default=None)
    stock: int = Field(default=0)  # >= 0: se valida en el schema y en el Service
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)  # baja lógica

    categoria: "Categoria" = Relationship(back_populates="productos")  # Categoria 1:N Producto
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")  # Producto 1:N DetallePedido
