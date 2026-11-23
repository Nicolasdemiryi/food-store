import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/BadgeEstado'
import { emojiCategoria } from '@/shared/utils/emojiCategoria'
import { formatearPrecio } from '@/shared/utils/formato'
import type { Producto } from '../types/producto'

// Tarjeta del catálogo. Lee el carrito (Zustand) para saber cuántas unidades ya se agregaron.
export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock === 0
  const puedeAgregar = producto.disponible && !sinStock && enCarrito < producto.stock

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 bg-brand-soft">
        {/* El emoji queda debajo: se ve mientras carga la foto o si la URL no funciona */}
        <div className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden="true">
          {emojiCategoria(producto.categoria.nombre)}
        </div>
        {producto.imagen_url && !imagenRota && (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="relative h-full w-full object-cover"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-stone-700 shadow">
          {producto.categoria.nombre}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-brand">{formatearPrecio(producto.precio_base)}</span>
          {!producto.disponible ? (
            <Badge color="stone">No disponible</Badge>
          ) : sinStock ? (
            <Badge color="red">Sin stock</Badge>
          ) : (
            <span className="text-xs text-stone-500">Stock: {producto.stock}</span>
          )}
        </div>

        <Button
          className="mt-4 w-full"
          disabled={!puedeAgregar}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
              stock: producto.stock,
              imagen_url: producto.imagen_url,
            })
          }
        >
          {enCarrito > 0 && enCarrito >= producto.stock ? 'Máximo en el carrito' : '🛒 Agregar al carrito'}
        </Button>
        {enCarrito > 0 && <p className="mt-2 text-center text-xs font-medium text-success">En el carrito: {enCarrito}</p>}
      </div>
    </article>
  )
}
