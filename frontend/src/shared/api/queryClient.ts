// Instancia única de TanStack Query (caché del estado del servidor).
import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Los 4xx (401, 403, 404…) no se reintentan: repetirlos no los arregla.
      retry: (intentos, error) =>
        !(axios.isAxiosError(error) && error.response && error.response.status < 500) && intentos < 2,
    },
  },
})
