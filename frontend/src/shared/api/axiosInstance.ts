// Cliente HTTP único. La sesión viaja en la cookie HttpOnly: el frontend nunca lee ni guarda el token.
import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { ApiErrorBody } from './api.types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  timeout: 10_000,
  withCredentials: true, // envía y recibe la cookie entre localhost:5173 y localhost:8000
})

// En /auth/token un 401 es «credenciales incorrectas» (lo muestra el formulario)
// y /auth/me lo maneja checkSession: no cierran la sesión desde acá.
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const url = error.config?.url ?? ''
    const status = error.response?.status
    const detail = error.response?.data?.detail
    const sesionVencida = status === 401 && !RUTAS_DE_AUTH.some((r) => url.includes(r))
    const cuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada'
    if (sesionVencida || cuentaDesactivada) {
      // Se limpia la sesión; ProtectedRoute lleva al login si la pantalla lo requiere.
      useAuthStore.setState({ usuario: null })
    }
    return Promise.reject(error) // el componente o la mutación también se enteran
  },
)
