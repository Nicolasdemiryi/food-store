import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaPayload } from '../types/categoria'

export const categoriasApi = {
  listar: async () => (await api.get<Categoria[]>('/categorias')).data,
  crear: async (datos: CategoriaPayload) => (await api.post<Categoria>('/categorias', datos)).data,
  actualizar: async (id: number, datos: Partial<CategoriaPayload>) => (await api.put<Categoria>(`/categorias/${id}`, datos)).data,
  eliminar: async (id: number) => {
    await api.delete(`/categorias/${id}`) // 204: baja lógica
  },
}
