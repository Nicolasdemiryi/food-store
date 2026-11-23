import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
type Tamano = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante
  size?: Tamano
}

const variantes: Record<Variante, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200',
  outline: 'border border-brand text-brand hover:bg-brand-soft',
  danger: 'bg-red-50 text-error hover:bg-red-100',
  ghost: 'text-stone-600 hover:bg-stone-100',
}

const tamanos: Record<Tamano, string> = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

export function Button({ variant = 'primary', size = 'md', type = 'button', className = '', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${tamanos[size]} ${variantes[variant]} ${className}`}
      {...props}
    />
  )
}
