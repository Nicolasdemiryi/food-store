import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

// Navbar + contenido de la ruta activa.
export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  )
}
