from collections.abc import Sequence

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca también entre las dadas de baja: la baja lógica no libera el nombre."""
        return self.session.exec(select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())).first()

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        ).all()
