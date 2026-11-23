import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { PageHeader } from '@/shared/components/PageHeader'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatearPrecio } from '@/shared/utils/formato'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos()

  return (
    <>
      <PageHeader titulo="Resumen del negocio" descripcion="Indicadores de los pedidos" />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={data.pendientes} icono="⏳" color="bg-amber-100" />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} icono="👨‍🍳" color="bg-sky-100" />
          <ResumenCard titulo="Entregados" valor={data.entregados} icono="✅" color="bg-green-100" />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} icono="✖️" color="bg-stone-200" />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} icono="📅" color="bg-brand-soft" />
          <ResumenCard titulo="Ingresos (entregados)" valor={formatearPrecio(data.ingresos_entregados)} icono="💰" color="bg-emerald-100" />
        </div>
      )}
    </>
  )
}
