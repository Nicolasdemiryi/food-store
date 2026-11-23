import { createColumnHelper } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { PageHeader } from '@/shared/components/PageHeader'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaPayload } from '../types/categoria'

const col = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [modal, setModal] = useState<{ abierto: boolean; categoria: Categoria | null }>({ abierto: false, categoria: null })
  const cerrar = () => setModal({ abierto: false, categoria: null })
  const mutacion = modal.categoria ? actualizar : crear

  const guardar = (datos: CategoriaPayload) => {
    if (modal.categoria) actualizar.mutate({ id: modal.categoria.id, datos }, { onSuccess: cerrar })
    else crear.mutate(datos, { onSuccess: cerrar })
  }

  const { mutate: eliminarCategoria, reset: resetEliminar } = eliminar
  const { reset: resetCrear } = crear
  const { reset: resetActualizar } = actualizar

  const columns = useMemo(
    () => [
      col.accessor('nombre', { header: 'Nombre', cell: (i) => <span className="font-semibold text-stone-900">{i.getValue()}</span> }),
      col.accessor('descripcion', {
        header: 'Descripción',
        cell: (i) => i.getValue() || <span className="italic text-stone-400">Sin descripción</span>,
      }),
      col.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetActualizar()
                setModal({ abierto: true, categoria: row.original })
              }}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm(`¿Dar de baja la categoría «${row.original.nombre}»? Sus productos siguen visibles.`)) {
                  resetEliminar()
                  eliminarCategoria(row.original.id)
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [eliminarCategoria, resetEliminar, resetActualizar],
  )

  return (
    <>
      <PageHeader
        titulo="Categorías"
        descripcion={data ? `${data.length} categorías activas` : undefined}
        accion={
          <Button
            onClick={() => {
              resetCrear()
              setModal({ abierto: true, categoria: null })
            }}
          >
            + Nueva categoría
          </Button>
        }
      />
      {eliminar.isError && <Alert mensaje={handleApiError(eliminar.error)} onCerrar={resetEliminar} />}
      {isPending ? (
        <SkeletonTabla />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <DataTable data={data} columns={columns} buscarPlaceholder="Buscar categorías…" />
      )}

      <Modal abierto={modal.abierto} titulo={modal.categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={cerrar}>
        <CategoriaForm
          key={modal.categoria?.id ?? 'nueva'} // un formulario nuevo por categoría: precarga sin efectos
          inicial={modal.categoria}
          guardando={mutacion.isPending}
          error={mutacion.isError ? handleApiError(mutacion.error) : null}
          onGuardar={guardar}
          onCancelar={cerrar}
        />
      </Modal>
    </>
  )
}
