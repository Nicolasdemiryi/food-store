import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/shared/ui/Button'

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand-soft text-brand' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`

// Nombre y rol del usuario, «Cerrar sesión» y acceso al panel solo para admin.
export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.cantidadTotal())
  const navigate = useNavigate()

  const salir = async () => {
    await logout() // POST /auth/logout + limpia el authStore
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span aria-hidden="true">🍔</span> Food <span className="text-brand">Store</span>
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            <NavLink to="/" end className={enlace}>
              Catálogo
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={enlace}>
                Mis pedidos
              </NavLink>
            )}
            {usuario?.role === 'admin' && (
              <NavLink to="/admin" className={enlace}>
                Panel admin
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/carrito" className={enlace} aria-label={`Carrito: ${cantidad} productos`}>
            <span className="relative">
              🛒
              {cantidad > 0 && (
                <span className="absolute -right-3 -top-2 min-w-5 rounded-full bg-brand px-1.5 text-center text-xs font-bold text-white">{cantidad}</span>
              )}
            </span>
          </NavLink>
          {usuario ? (
            <>
              <div className="hidden text-right leading-tight md:block">
                <p className="text-sm font-semibold">{usuario.full_name}</p>
                <p className="text-xs text-stone-500">@{usuario.username}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${usuario.role === 'admin' ? 'bg-brand text-white' : 'bg-stone-100 text-stone-600'}`}>
                {usuario.role}
              </span>
              <Button variant="secondary" size="sm" onClick={() => void salir()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-stone-700 hover:text-brand">
                Ingresar
              </Link>
              <Link to="/register" className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
