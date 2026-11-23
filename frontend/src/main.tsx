import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { queryClient } from '@/shared/api/queryClient'
import { useAuthStore } from '@/store/authStore'
import App from './App'
import './index.css'

// Al cerrarse la sesión (logout o 401) se vacía la caché: otro usuario no ve datos del anterior.
useAuthStore.subscribe((estado, anterior) => {
  if (anterior.usuario && !estado.usuario) queryClient.clear()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
