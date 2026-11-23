import { api } from '@/shared/api/axiosInstance'
import type { Usuario } from '../types/usuario'

// Gestión de usuarios (solo admin).
export const usuariosApi = {
  listar: async () => (await api.get<Usuario[]>('/admin/usuarios')).data,
  activar: async (id: number) => (await api.post<Usuario>(`/admin/usuarios/${id}/activar`)).data,
  desactivar: async (id: number) => (await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`)).data,
}
