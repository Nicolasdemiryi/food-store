import { Card } from '@/shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  icono: string
  color: string // clases de Tailwind para el ícono
}

export function ResumenCard({ titulo, valor, icono, color }: ResumenCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${color}`} aria-hidden="true">
        {icono}
      </span>
      <div>
        <p className="text-sm text-stone-500">{titulo}</p>
        <p className="text-2xl font-extrabold tabular-nums text-stone-900">{valor}</p>
      </div>
    </Card>
  )
}
