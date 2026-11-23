import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { CarritoItem } from '../components/CarritoItem'

// Público: el carrito vive en el navegador (cartStore con persist). Confirmar exige sesión.
export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader titulo="Tu carrito" descripcion={items.length ? `${items.length} productos distintos` : undefined} />
      {items.length === 0 ? (
        <EstadoVacio
          icono="🛒"
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo."
          accion={
            <Link to="/" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              Ver el catálogo
            </Link>
          }
        />
      ) : (
        <Card className="p-6">
          <ul className="divide-y divide-stone-100">
            {items.map((item) => (
              <CarritoItem key={item.producto_id} item={item} />
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4">
            <Button variant="ghost" size="sm" onClick={() => window.confirm('¿Vaciar el carrito?') && vaciar()}>
              Vaciar carrito
            </Button>
            <div className="flex items-center gap-6">
              <p className="text-lg">
                Total: <span className="font-extrabold text-brand">{formatearPrecio(total)}</span>
              </p>
              <Link to="/checkout" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">
                Confirmar pedido →
              </Link>
            </div>
          </div>
        </Card>
      )}
    </main>
  )
}
