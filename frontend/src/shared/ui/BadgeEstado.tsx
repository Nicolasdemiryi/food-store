import type { ReactNode } from 'react'

// Colores de los cuatro estados del pedido.
const estilos: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 ring-amber-200',
  EN_PREPARACION: 'bg-sky-100 text-sky-800 ring-sky-200',
  ENTREGADO: 'bg-green-100 text-green-800 ring-green-200',
  CANCELADO: 'bg-stone-200 text-stone-600 ring-stone-300',
}

const etiquetas: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function BadgeEstado({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${estilos[estado] ?? estilos.CANCELADO}`}>
      {etiquetas[estado] ?? estado}
    </span>
  )
}

// Badge genérico (rol, disponibilidad, estado de la cuenta…).
export function Badge({ children, color = 'stone' }: { children: ReactNode; color?: 'stone' | 'green' | 'red' | 'amber' | 'brand' }) {
  const colores = {
    stone: 'bg-stone-100 text-stone-700',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-800',
    brand: 'bg-brand-soft text-brand',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colores[color]}`}>{children}</span>
}
