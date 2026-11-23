import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { PageHeader } from '@/shared/components/PageHeader'
import { Alert } from '@/shared/ui/Alert'
import { Card } from '@/shared/ui/Card'
import { formatearPrecio } from '@/shared/utils/formato'
import { CheckoutForm, type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  const confirmar = (datos: DatosCheckout) =>
    crearPedido.mutate(
      { ...datos, items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })) },
      {
        onSuccess: (pedido) => {
          vaciar()
          navigate('/mis-pedidos', { replace: true, state: { nuevoPedido: pedido.id } })
        },
      },
    )

  if (items.length === 0 && !crearPedido.isSuccess) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <EstadoVacio
          icono="🛒"
          titulo="No hay nada para confirmar"
          descripcion="Tu carrito está vacío."
          accion={
            <Link to="/" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              Ir al catálogo
            </Link>
          }
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader titulo="Confirmar pedido" descripcion="Indicá dónde lo enviamos y cómo vas a pagar." />
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="p-6 md:col-span-3">
          {/* 400 stock insuficiente / no disponible · 404 producto dado de baja */}
          {crearPedido.isError && <Alert mensaje={handleApiError(crearPedido.error)} onCerrar={crearPedido.reset} />}
          <CheckoutForm enviando={crearPedido.isPending} onConfirmar={confirmar} />
        </Card>
        <Card className="h-fit p-6 md:col-span-2">
          <h2 className="mb-3 font-bold">Resumen</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-3">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="tabular-nums">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-stone-200 pt-3 text-lg font-extrabold">
            Total <span className="text-brand">{formatearPrecio(total)}</span>
          </p>
          <Link to="/carrito" className="mt-3 inline-block text-sm text-brand hover:underline">
            ← Modificar el carrito
          </Link>
        </Card>
      </div>
    </main>
  )
}
