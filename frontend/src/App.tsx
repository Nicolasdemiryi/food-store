import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // La única llamada en un useEffect: confirmar la sesión con /auth/me al montar.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
