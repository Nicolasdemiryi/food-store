import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { PageHeader } from '@/shared/components/PageHeader'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { Alert } from '@/shared/ui/Alert'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '@/shared/utils/formato'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const col = createColumnHelper<Pedido>()

const ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'A preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelar',
}

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const { data, isPending, isError, error, refetch } = usePedidos({ skip: 0, limit: 100, estado: estado || undefined })
  const cambiar = useCambiarEstadoPedido()
  const { mutate: cambiarEstado, reset: resetCambiar } = cambiar
  const enCurso = cambiar.isPending ? cambiar.variables?.id : undefined

  const columns = useMemo(
    () => [
      col.accessor('id', { header: '#', cell: (i) => <span className="font-bold">#{i.getValue()}</span> }),
      col.accessor((p) => `${p.usuario.full_name} ${p.usuario.username}`, {
        id: 'cliente',
        header: 'Cliente',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-stone-900">{row.original.usuario.full_name}</p>
            <p className="text-xs text-stone-500">@{row.original.usuario.username}</p>
          </div>
        ),
      }),
      col.accessor('created_at', { header: 'Fecha', cell: (i) => formatearFecha(i.getValue()) }),
      col.accessor('total', { header: 'Total', cell: (i) => <span className="font-semibold tabular-nums">{formatearPrecio(i.getValue())}</span> }),
      col.accessor('estado', { header: 'Estado', cell: (i) => <BadgeEstado estado={i.getValue()} /> }),
      col.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDetalle(p)}>
                Ver
              </Button>
              {/* Solo los botones de las transiciones válidas según la máquina de estados */}
              {TRANSICIONES[p.estado].map((siguiente) => (
                <Button
                  key={siguiente}
                  size="sm"
                  variant={siguiente === 'CANCELADO' ? 'danger' : 'primary'}
                  disabled={enCurso === p.id}
                  onClick={() => {
                    if (siguiente === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${p.id}? Se restituye el stock.`)) return
                    resetCambiar()
                    cambiarEstado({ id: p.id, estado: siguiente })
                  }}
                >
                  {ACCION[siguiente]}
                </Button>
              ))}
            </div>
          )
        },
      }),
    ],
    [cambiarEstado, resetCambiar, enCurso],
  )

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        descripcion={data ? `${data.total} pedidos${estado ? ` en estado ${estado}` : ''}` : undefined}
        accion={
          <label className="flex items-center gap-2 text-sm text-stone-600">
            Estado
            <Select value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido | '')} className="w-48" aria-label="Filtrar por estado">
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </label>
        }
      />
      {cambiar.isError && <Alert mensaje={handleApiError(cambiar.error)} onCerrar={resetCambiar} />}
      {isPending ? (
        <SkeletonTabla />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <DataTable data={data.items} columns={columns} buscarPlaceholder="Buscar por cliente…" porPagina={10} />
      )}
      <Modal abierto={detalle !== null} titulo={detalle ? `Pedido #${detalle.id} · ${detalle.usuario.full_name}` : ''} onCerrar={() => setDetalle(null)} ancho="lg">
        {detalle && (
          <>
            <p className="mb-4">
              <BadgeEstado estado={detalle.estado} />
              <span className="ml-2 text-sm text-stone-500">{formatearFecha(detalle.created_at)}</span>
            </p>
            <PedidoDetalle pedido={detalle} />
          </>
        )}
      </Modal>
    </>
  )
}
