import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
import type { CategoriaPayload } from '../types/categoria'

export const categoriasKey = ['categorias'] as const

// Listado de categorías activas (público: lo usan el catálogo y el panel).
export function useCategorias() {
  return useQuery({ queryKey: categoriasKey, queryFn: categoriasApi.listar, staleTime: 60_000 })
}

function useInvalidar() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: categoriasKey })
    void queryClient.invalidateQueries({ queryKey: ['productos'] }) // muestran su categoría
  }
}

export function useCrearCategoria() {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: (datos: CategoriaPayload) => categoriasApi.crear(datos), onSuccess: invalidar })
}

export function useActualizarCategoria() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaPayload }) => categoriasApi.actualizar(id, datos),
    onSuccess: invalidar,
  })
}

export function useEliminarCategoria() {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: (id: number) => categoriasApi.eliminar(id), onSuccess: invalidar })
}
