import { api } from '@/shared/api/axiosInstance'
import type { Usuario } from '@/features/usuarios/types/usuario'
import type { Credenciales, LoginResponse, RegistroPayload } from '../types/auth'

export const authApi = {
  // Formulario OAuth2 (x-www-form-urlencoded). La respuesta trae la cookie; el cuerpo NO trae el token.
  login: async ({ username, password }: Credenciales): Promise<void> => {
    await api.post<LoginResponse>('/auth/token', new URLSearchParams({ username, password }))
  },
  me: async (): Promise<Usuario> => (await api.get<Usuario>('/auth/me')).data,
  logout: async (): Promise<void> => {
    await api.post<LoginResponse>('/auth/logout')
  },
  register: async (datos: RegistroPayload): Promise<Usuario> => (await api.post<Usuario>('/auth/register', datos)).data,
}
