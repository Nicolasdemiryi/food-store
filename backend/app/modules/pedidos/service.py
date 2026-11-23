"""Casos de uso de pedidos: RN-01 a RN-06, máquina de estados y resumen."""

from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

# Máquina de estados (RN-02): estado actual → estados a los que puede pasar.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),  # terminal
    "CANCELADO": set(),  # terminal
}


# ------------------------------------------------------------ excepciones de dominio
class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"El pedido {pedido_id} pertenece a otro usuario")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado o inactivo")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente de '{nombre}': hay {stock} y se pidieron {pedido}")


class ProductoRepetido(Exception):
    def __init__(self, ids: list[int]) -> None:
        super().__init__(f"Productos repetidos en el pedido: {ids}")


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"Transición inválida: de {actual} a {nuevo}")


class PedidoNoCancelable(Exception):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE (está {estado})")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ------------------------------------------------------------------ helpers
    @staticmethod
    def _es_admin(usuario: UserPublic) -> bool:
        return usuario.role == "admin"

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock las cantidades de cada línea."""
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    @staticmethod
    def _cambiar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        """Valida la transición con el mapa ANTES de modificar el pedido."""
        if nuevo not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(pedido.estado, nuevo)
        if nuevo == "CANCELADO":
            PedidoService._restituir_stock(uow, pedido)  # misma transacción que el cambio
        pedido.estado = nuevo
        pedido.updated_at = datetime.now(timezone.utc)
        uow.pedidos.add(pedido)

    # ------------------------------------------------------------------ RN-01
    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            ids = [i.producto_id for i in data.items]
            repetidos = sorted({i for i in ids if ids.count(i) > 1})
            if repetidos:
                raise ProductoRepetido(repetidos)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,  # siempre de la sesión
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)
                # En la misma iteración: se descuenta el stock y se crea la línea.
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)  # dentro del with
        # Si cualquier validación lanza una excepción, el __exit__ hace rollback:
        # no queda el pedido ni el descuento de stock de los ítems anteriores.

    # ------------------------------------------------------------------ consultas
    def listar(self, usuario: UserPublic, *, estado: str | None, skip: int, limit: int) -> PedidosPaginados:
        """RN-04: el user ve solo los suyos; el admin, todos."""
        with self.uow as uow:
            filtro = None if self._es_admin(usuario) else usuario.id
            total, items = uow.pedidos.list_by_usuario(filtro, estado=estado, skip=skip, limit=limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if not self._es_admin(usuario) and pedido.usuario_id != usuario.id:
                raise PedidoAjeno(pedido_id)
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------------------ RN-02 / RN-03 / RN-04
    def cambiar_estado(self, pedido_id: int, nuevo: str) -> PedidoRead:
        """Admin: avanza o cancela desde cualquier estado no terminal."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            self._cambiar(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Dueño: cancela su pedido solo si está PENDIENTE."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno(pedido_id)
            if pedido.estado != "PENDIENTE":
                raise PedidoNoCancelable(pedido.estado)
            self._cambiar(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------------------ panel
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado("ENTREGADO"), 2),
            )
