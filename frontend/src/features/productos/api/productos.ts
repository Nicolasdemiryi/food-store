import { api } from '@/shared/api/axiosInstance'
import type { Paginado } from '@/shared/api/api.types'
import type { FiltrosProductos, Producto, ProductoPayload, StockPayload } from '../types/producto'

export const productosApi = {
  // Paginado en el servidor: { total, items }. Los filtros vacíos no se envían.
  listar: async ({ search, ...filtros }: FiltrosProductos) =>
    (await api.get<Paginado<Producto>>('/productos', { params: { ...filtros, search: search?.trim() || undefined } })).data,
  obtener: async (id: number) => (await api.get<Producto>(`/productos/${id}`)).data,
  crear: async (datos: ProductoPayload) => (await api.post<Producto>('/productos', datos)).data,
  actualizar: async (id: number, datos: Partial<ProductoPayload>) => (await api.put<Producto>(`/productos/${id}`, datos)).data,
  actualizarStock: async (id: number, datos: StockPayload) => (await api.patch<Producto>(`/productos/${id}/stock`, datos)).data,
  eliminar: async (id: number) => {
    await api.delete(`/productos/${id}`)
  },
}
