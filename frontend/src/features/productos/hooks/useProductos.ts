import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { FiltrosProductos, ProductoPayload, StockPayload } from '../types/producto'

// queryKey con los filtros: cada combinación (página, búsqueda, categoría) tiene su caché.
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => productosApi.listar(filtros),
    placeholderData: keepPreviousData, // al cambiar de página se mantiene la anterior mientras carga
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: ['productos'] })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: (datos: ProductoPayload) => productosApi.crear(datos), onSuccess: invalidar })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoPayload }) => productosApi.actualizar(id, datos),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: StockPayload }) => productosApi.actualizarStock(id, datos),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: (id: number) => productosApi.eliminar(id), onSuccess: invalidar })
}
