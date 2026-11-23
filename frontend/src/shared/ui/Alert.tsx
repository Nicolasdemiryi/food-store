interface AlertProps {
  mensaje: string
  tipo?: 'error' | 'exito'
  onCerrar?: () => void
}

export function Alert({ mensaje, tipo = 'error', onCerrar }: AlertProps) {
  const estilo = tipo === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-800'
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${estilo}`}>
      <span>{mensaje}</span>
      {onCerrar && (
        <button type="button" onClick={onCerrar} className="shrink-0 font-semibold hover:underline">
          Cerrar
        </button>
      )}
    </div>
  )
}
