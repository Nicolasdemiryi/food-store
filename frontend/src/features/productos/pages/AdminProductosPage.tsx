import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { useCategorias } from '@/features/categorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { PageHeader } from '@/shared/components/PageHeader'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { Alert } from '@/shared/ui/Alert'
import { Badge } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { emojiCategoria } from '@/shared/utils/emojiCategoria'
import { formatearPrecio } from '@/shared/utils/formato'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useActualizarProducto, useActualizarStock, useCrearProducto, useEliminarProducto, useProductos } from '../hooks/useProductos'
import type { Producto, ProductoPayload } from '../types/producto'

const col = createColumnHelper<Producto>()
type Dialogo = { tipo: 'cerrado' } | { tipo: 'producto'; producto: Producto | null } | { tipo: 'stock'; producto: Producto }

export function AdminProductosPage() {
  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const { data, isPending, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const { data: categorias = [] } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [dialogo, setDialogo] = useState<Dialogo>({ tipo: 'cerrado' })
  const cerrar = () => setDialogo({ tipo: 'cerrado' })

  const { mutate: eliminarProducto, reset: resetEliminar } = eliminar
  const { reset: resetActualizar } = actualizar
  const { reset: resetStock } = actualizarStock

  const columns = useMemo(
    () => [
      col.accessor('nombre', {
        header: 'Producto',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft">
              {emojiCategoria(row.original.categoria.nombre)}
              {row.original.imagen_url && (
                <img src={row.original.imagen_url} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </span>
            <span className="font-semibold text-stone-900">{row.original.nombre}</span>
          </div>
        ),
      }),
      col.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
      col.accessor('precio_base', { header: 'Precio', cell: (i) => <span className="tabular-nums">{formatearPrecio(i.getValue())}</span> }),
      col.accessor('stock', {
        header: 'Stock',
        cell: (i) => <span className={`font-semibold tabular-nums ${i.getValue() === 0 ? 'text-error' : ''}`}>{i.getValue()}</span>,
      }),
      col.accessor('disponible', {
        header: 'Estado',
        cell: (i) => (i.getValue() ? <Badge color="green">Disponible</Badge> : <Badge>No disponible</Badge>),
      }),
      col.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => { resetActualizar(); setDialogo({ tipo: 'producto', producto: row.original }) }}>
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => { resetStock(); setDialogo({ tipo: 'stock', producto: row.original }) }}>
              Stock
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm(`¿Dar de baja «${row.original.nombre}»? Deja de verse en el catálogo.`)) {
                  resetEliminar()
                  eliminarProducto(row.original.id)
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [eliminarProducto, resetEliminar, resetActualizar, resetStock],
  )

  const mutacionProducto = dialogo.tipo === 'producto' && dialogo.producto ? actualizar : crear
  const guardarProducto = (datos: ProductoPayload) => {
    if (dialogo.tipo === 'producto' && dialogo.producto) actualizar.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })
    else crear.mutate(datos, { onSuccess: cerrar })
  }

  return (
    <>
      <PageHeader
        titulo="Productos"
        descripcion={data ? `${data.total} productos activos` : undefined}
        accion={
          <Button onClick={() => { crear.reset(); setDialogo({ tipo: 'producto', producto: null }) }}>
            + Nuevo producto
          </Button>
        }
      />
      {eliminar.isError && <Alert mensaje={handleApiError(eliminar.error)} onCerrar={resetEliminar} />}
      {isPending ? (
        <SkeletonTabla />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <DataTable data={data.items} columns={columns} buscarPlaceholder="Buscar por nombre o categoría…" />
      )}

      <Modal abierto={dialogo.tipo === 'producto'} titulo={dialogo.tipo === 'producto' && dialogo.producto ? 'Editar producto' : 'Nuevo producto'} onCerrar={cerrar} ancho="lg">
        {dialogo.tipo === 'producto' && (
          <ProductoForm
            key={dialogo.producto?.id ?? 'nuevo'}
            inicial={dialogo.producto}
            categorias={categorias}
            guardando={mutacionProducto.isPending}
            error={mutacionProducto.isError ? handleApiError(mutacionProducto.error) : null}
            onGuardar={guardarProducto}
            onCancelar={cerrar}
          />
        )}
      </Modal>

      <Modal abierto={dialogo.tipo === 'stock'} titulo="Stock y disponibilidad" onCerrar={cerrar}>
        {dialogo.tipo === 'stock' && (
          <StockForm
            key={dialogo.producto.id}
            producto={dialogo.producto}
            guardando={actualizarStock.isPending}
            error={actualizarStock.isError ? handleApiError(actualizarStock.error) : null}
            onGuardar={(datos) => actualizarStock.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })}
            onCancelar={cerrar}
          />
        )}
      </Modal>
    </>
  )
}
