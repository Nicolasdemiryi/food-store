// Convierte el error de una petición en un mensaje para la pantalla.
import axios from 'axios'
import type { ApiErrorBody } from './api.types'

export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return error instanceof Error ? error.message : 'Error inesperado.'
  }
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.'
  if (!error.response) return 'No se pudo conectar con el servidor. Verificá que la API esté encendida.'

  const { status, data } = error.response
  const detail = data?.detail
  if (status === 403 && typeof detail !== 'string') return 'No tenés permisos para esta acción.'
  if (Array.isArray(detail)) {
    // 422: lista de errores de validación
    return detail.map((d) => `${d.loc.at(-1)}: ${d.msg}`).join(' · ')
  }
  if (typeof detail === 'string') return detail // 400, 401, 403, 404, 409: mensaje del backend
  if (status >= 500) return 'Error interno del servidor. Intentá de nuevo más tarde.'
  return `Error ${status}`
}
