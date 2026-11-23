import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonTarjetas } from '@/shared/components/Skeleton'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

// Catálogo público: paginación en el servidor (skip = página × limit), búsqueda y filtro por categoría.
export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const search = useDebounce(busqueda)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })
  const { data: categorias } = useCategorias()

  const cambiarCategoria = (id: number | undefined) => {
    setCategoriaId(id)
    setPagina(0) // un filtro nuevo vuelve a la primera página
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-10 text-white shadow">
        <h1 className="text-3xl font-extrabold">¿Qué vas a pedir hoy?</h1>
        <p className="mt-1 text-orange-50">Elegí tus comidas, armá el carrito y recibilo en tu casa.</p>
        <Input
          type="search"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
          placeholder="Buscar por nombre: pizza, empanada…"
          aria-label="Buscar productos"
          className="mt-5 max-w-md border-none py-3 text-base"
        />
      </section>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
        <Button variant={categoriaId === undefined ? 'primary' : 'secondary'} size="sm" onClick={() => cambiarCategoria(undefined)}>
          Todas
        </Button>
        {categorias?.map((c) => (
          <Button key={c.id} variant={categoriaId === c.id ? 'primary' : 'secondary'} size="sm" onClick={() => cambiarCategoria(c.id)}>
            {c.nombre}
          </Button>
        ))}
      </div>

      {isPending ? (
        <SkeletonTarjetas cantidad={POR_PAGINA} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          icono="🔍"
          titulo="No encontramos productos"
          descripcion={search || categoriaId ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
        />
      ) : (
        <>
          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} total={data.total} porPagina={POR_PAGINA} onCambiar={setPagina} />
        </>
      )}
    </main>
  )
}
