import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { PageHeader } from '@/shared/components/PageHeader'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { Alert } from '@/shared/ui/Alert'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'

const POR_PAGINA = 5

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(null)
  const nuevoPedido = (useLocation().state as { nuevoPedido?: number } | null)?.nuevoPedido
  const { data, isPending, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader titulo="Mis pedidos" descripcion={data ? `${data.total} pedidos` : undefined} />
      {nuevoPedido && <Alert tipo="exito" mensaje={`¡Pedido #${nuevoPedido} confirmado! Te avisamos cuando lo estemos preparando.`} />}
      {cancelar.isError && <Alert mensaje={handleApiError(cancelar.error)} onCerrar={cancelar.reset} />}

      {isPending ? (
        <SkeletonTabla filas={4} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          icono="🧾"
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
              Ver el catálogo
            </Link>
          }
        />
      ) : (
        <>
          <ul className="space-y-4">
            {data.items.map((p) => (
              <li key={p.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        Pedido #{p.id} <BadgeEstado estado={p.estado} />
                      </p>
                      <p className="text-sm text-stone-500">
                        {formatearFecha(p.created_at)} · {p.items.length} productos
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-brand">{formatearPrecio(p.total)}</span>
                      <Button variant="secondary" size="sm" onClick={() => setAbierto(abierto === p.id ? null : p.id)} aria-expanded={abierto === p.id}>
                        {abierto === p.id ? 'Ocultar' : 'Ver detalle'}
                      </Button>
                      {p.estado === 'PENDIENTE' && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={cancelar.isPending && cancelar.variables === p.id}
                          onClick={() => window.confirm(`¿Cancelar el pedido #${p.id}?`) && cancelar.mutate(p.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                  {abierto === p.id && (
                    <div className="mt-4 border-t border-stone-100 pt-4">
                      <PedidoDetalle pedido={p} />
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} total={data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}
    </main>
  )
}
