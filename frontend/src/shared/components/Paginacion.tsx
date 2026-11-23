import { Button } from '@/shared/ui/Button'

interface PaginacionProps {
  pagina: number // 0-indexada
  total: number // total de registros (lo devuelve el backend)
  porPagina: number
  onCambiar: (pagina: number) => void
}

// Paginación del lado del servidor: la página pedida es skip = pagina × porPagina.
export function Paginacion({ pagina, total, porPagina, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / porPagina))
  if (total === 0) return null
  const desde = pagina * porPagina + 1
  const hasta = Math.min((pagina + 1) * porPagina, total)
  return (
    <nav aria-label="Paginación" className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
      <span>
        {desde}–{hasta} de {total}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
          ← Anterior
        </Button>
        <span>
          Página {pagina + 1} de {paginas}
        </span>
        <Button variant="secondary" size="sm" disabled={pagina + 1 >= paginas} onClick={() => onCambiar(pagina + 1)}>
          Siguiente →
        </Button>
      </div>
    </nav>
  )
}
