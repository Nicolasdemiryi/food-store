import type { ReactNode } from 'react'

export function PageHeader({ titulo, descripcion, accion }: { titulo: string; descripcion?: string; accion?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{titulo}</h1>
        {descripcion && <p className="text-sm text-stone-500">{descripcion}</p>}
      </div>
      {accion}
    </div>
  )
}
