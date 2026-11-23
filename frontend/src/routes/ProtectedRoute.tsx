import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Rol } from '@/features/usuarios'

interface ProtectedRouteProps {
  roles?: Rol[] // sin roles: alcanza con tener sesión
}

// Organiza la navegación; la protección real la aplica el backend (401 / 403).
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  // checkSession todavía no respondió y no hay usuario persistido: se espera sin redirigir.
  if (cargando && !usuario) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-stone-500" aria-busy="true">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        Verificando la sesión…
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
