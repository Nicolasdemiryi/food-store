from pydantic import field_validator
from sqlmodel import Field, SQLModel


class _NombreValidado(SQLModel):
    @field_validator("nombre", check_fields=False)
    @classmethod
    def nombre_sin_espacios(cls, v: str | None) -> str | None:
        """Quita espacios de los extremos: "  a " no cuenta como 2 caracteres."""
        if v is None:
            return v
        v = v.strip()
        if not 2 <= len(v) <= 100:
            raise ValueError("El nombre debe tener entre 2 y 100 caracteres")
        return v


class CategoriaCreate(_NombreValidado):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)


class CategoriaUpdate(_NombreValidado):
    """PUT parcial: se actualizan solo los campos enviados."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
