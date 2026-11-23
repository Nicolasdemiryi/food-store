from pydantic import field_validator, model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class _NombreProducto(SQLModel):
    @field_validator("nombre", check_fields=False)
    @classmethod
    def nombre_no_vacio(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("El nombre es obligatorio")
        return v


class ProductoCreate(_NombreProducto):
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(ge=1)


class ProductoUpdate(_NombreProducto):
    """PUT parcial: se actualizan solo los campos enviados."""

    nombre: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = Field(default=None, ge=1)


class ProductoStockUpdate(SQLModel):
    """PATCH /productos/{id}/stock: stock y/o disponibilidad."""

    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    @model_validator(mode="after")
    def al_menos_un_campo(self) -> "ProductoStockUpdate":
        if self.stock is None and self.disponible is None:
            raise ValueError("Enviá stock, disponible o ambos")
        return self


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead  # se arma desde la relación Producto.categoria


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
