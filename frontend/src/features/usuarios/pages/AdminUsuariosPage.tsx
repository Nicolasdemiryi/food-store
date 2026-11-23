import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { DataTable } from '@/shared/components/DataTable'
import { EstadoError } from '@/shared/components/EstadoError'
import { PageHeader } from '@/shared/components/PageHeader'
import { SkeletonTabla } from '@/shared/components/Skeleton'
import { Alert } from '@/shared/ui/Alert'
import { Badge } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

const col = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const miId = useAuthStore((s) => s.usuario?.id)
  const { data, isPending, isError, error, refetch } = useUsuarios()
  const cambiar = useCambiarEstadoUsuario()
  const { mutate, reset } = cambiar
  const enCurso = cambiar.isPending ? cambiar.variables?.id : undefined

  const columns = useMemo(
    () => [
      col.accessor('username', { header: 'Usuario', cell: (i) => <span className="font-semibold">@{i.getValue()}</span> }),
      col.accessor('full_name', { header: 'Nombre' }),
      col.accessor('email', { header: 'Email' }),
      col.accessor('role', { header: 'Rol', cell: (i) => <Badge color={i.getValue() === 'admin' ? 'brand' : 'stone'}>{i.getValue()}</Badge> }),
      col.accessor('disabled', {
        header: 'Estado',
        cell: (i) => (i.getValue() ? <Badge color="red">Desactivado</Badge> : <Badge color="green">Activo</Badge>),
      }),
      col.display({
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const u = row.original
          return (
            <div className="flex justify-end">
              {u.disabled ? (
                <Button variant="outline" size="sm" disabled={enCurso === u.id} onClick={() => { reset(); mutate({ id: u.id, activar: true }) }}>
                  Activar
                </Button>
              ) : (
                u.id !== miId && ( // el botón Desactivar no se muestra en la fila propia
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={enCurso === u.id}
                    onClick={() => {
                      if (window.confirm(`¿Desactivar a @${u.username}? No podrá iniciar sesión.`)) {
                        reset()
                        mutate({ id: u.id, activar: false })
                      }
                    }}
                  >
                    Desactivar
                  </Button>
                )
              )}
            </div>
          )
        },
      }),
    ],
    [miId, mutate, reset, enCurso],
  )

  return (
    <>
      <PageHeader titulo="Usuarios" descripcion={data ? `${data.length} usuarios · ${data.filter((u) => !u.disabled).length} activos` : undefined} />
      {cambiar.isError && <Alert mensaje={handleApiError(cambiar.error)} onCerrar={reset} />}
      {isPending ? (
        <SkeletonTabla />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <DataTable data={data} columns={columns} buscarPlaceholder="Buscar usuarios…" porPagina={10} />
      )}
    </>
  )
}
