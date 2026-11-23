import { Link } from 'react-router-dom'

// Sesión válida pero sin el rol requerido (equivale al 403 del backend).
export function UnauthorizedPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl" aria-hidden="true">
        🔒
      </p>
      <h1 className="mt-4 text-2xl font-extrabold">Acceso denegado</h1>
      <p className="mt-2 text-stone-600">Tu cuenta no tiene permisos para ver esta página.</p>
      <Link to="/" className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">
        Volver al inicio
      </Link>
    </main>
  )
}
