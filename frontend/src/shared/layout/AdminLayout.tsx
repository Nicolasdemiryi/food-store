import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: '/admin/resumen', texto: '📊 Resumen' },
  { to: '/admin/pedidos', texto: '🧾 Pedidos' },
  { to: '/admin/productos', texto: '🍕 Productos' },
  { to: '/admin/categorias', texto: '🏷️ Categorías' },
  { to: '/admin/usuarios', texto: '👥 Usuarios' },
]

// Panel de administración: menú lateral + la sección activa.
export function AdminLayout() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[13rem_1fr]">
      <aside>
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-stone-400">Panel de administración</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand text-white' : 'text-stone-600 hover:bg-stone-100'}`
              }
            >
              {s.texto}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  )
}
