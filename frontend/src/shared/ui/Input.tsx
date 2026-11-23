import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const base =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 aria-invalid:border-error'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${base} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} ${className}`} {...props} />
}

interface CampoProps {
  id: string
  label: string
  errores?: ReadonlyArray<unknown> // field.state.meta.errors de TanStack Form
  ayuda?: string
  children: ReactNode
}

// Etiqueta + control + errores del campo (sin repetir el mismo mensaje).
export function Campo({ id, label, errores = [], ayuda, children }: CampoProps) {
  const mensajes = [...new Set(errores.filter(Boolean).map(String))]
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {ayuda && mensajes.length === 0 && <p className="mt-1 text-xs text-stone-500">{ayuda}</p>}
      {mensajes.map((m) => (
        <p key={m} className="mt-1 text-xs text-error">
          {m}
        </p>
      ))}
    </div>
  )
}
