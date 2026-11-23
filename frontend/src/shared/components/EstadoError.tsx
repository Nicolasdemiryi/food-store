import { Button } from '@/shared/ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-semibold text-red-700">No se pudieron cargar los datos</p>
      <p className="mt-1 text-sm text-red-600">{mensaje}</p>
      {onReintentar && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
