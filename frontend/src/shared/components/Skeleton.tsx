// Bloques grises animados que anticipan la forma del contenido mientras carga.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />
}

export function SkeletonTarjetas({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <Skeleton className="h-40 rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTabla({ filas = 6 }: { filas?: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-8 w-1/3" />
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  )
}
