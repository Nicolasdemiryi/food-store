import type { ReactNode } from 'react'

interface EstadoVacioProps {
  icono?: string
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({ icono = '🍽️', titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <p className="text-4xl">{icono}</p>
      <p className="mt-3 font-semibold text-stone-800">{titulo}</p>
      {descripcion && <p className="mt-1 text-sm text-stone-500">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
