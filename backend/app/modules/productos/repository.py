from collections.abc import Sequence

from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self,
        *,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, Sequence[Producto]]:
        """Productos ACTIVOS filtrados y paginados. Devuelve (total, página)."""
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))  # sin distinguir mayúsculas
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        items = self.session.exec(
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]  (evita N+1)
            .order_by(col(Producto.nombre))
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items
