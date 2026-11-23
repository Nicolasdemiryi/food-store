import { useCartStore, type ItemCarrito } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'
import { formatearPrecio } from '@/shared/utils/formato'

export function CarritoItem({ item }: { item: ItemCarrito }) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-2xl">
        🍽️
        {item.imagen_url && (
          <img src={item.imagen_url} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
      </span>
      <div className="min-w-40 flex-1">
        <p className="font-semibold text-stone-900">{item.nombre}</p>
        <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>
      <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.nombre}`}>
        <Button variant="secondary" size="sm" aria-label="Restar uno" onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}>
          −
        </Button>
        <span className="w-8 text-center font-semibold tabular-nums">{item.cantidad}</span>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Sumar uno"
          disabled={item.cantidad >= item.stock}
          title={item.cantidad >= item.stock ? `Stock máximo: ${item.stock}` : undefined}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
        >
          +
        </Button>
      </div>
      <p className="w-28 text-right font-bold tabular-nums">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>
      <Button variant="ghost" size="sm" onClick={() => quitar(item.producto_id)} aria-label={`Quitar ${item.nombre}`}>
        🗑️
      </Button>
    </li>
  )
}
