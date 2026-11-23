"""Reglas de Producto: categoría activa, stock >= 0 y baja lógica."""

from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# ------------------------------------------------------------ excepciones de dominio
class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado")


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada o dada de baja")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _activo_o_error(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:  # dado de baja = inexistente
            raise ProductoNoEncontrado(producto_id)
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)

    def listar(
        self, *, skip: int, limit: int, search: str | None, categoria_id: int | None, disponible: bool | None
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                search=search, categoria_id=categoria_id, disponible=disponible, skip=skip, limit=limit
            )
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo_o_error(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto)  # dentro del with: carga producto.categoria

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo_o_error(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True)  # solo lo enviado
            if cambios.get("categoria_id") is not None:
                self._validar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                if valor is None and campo in {"nombre", "precio_base", "stock", "disponible", "categoria_id"}:
                    continue  # campos obligatorios: null no los borra
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            uow.session.refresh(producto)  # recarga la relación si cambió la categoría
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo_o_error(uow, producto_id)
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: activo = false (los pedidos lo siguen referenciando)."""
        with self.uow as uow:
            producto = self._activo_o_error(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)
