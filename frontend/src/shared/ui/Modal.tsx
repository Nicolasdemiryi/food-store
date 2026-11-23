import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

// Se cierra con Escape o haciendo clic en el fondo.
export function Modal({ abierto, titulo, onCerrar, children, ancho = 'md' }: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto, onCerrar])

  if (!abierto) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50" onClick={onCerrar} aria-hidden="true" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="modal-titulo" className="text-xl font-bold text-stone-900">
            {titulo}
          </h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="text-stone-400 hover:text-stone-700">
            ✕
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
