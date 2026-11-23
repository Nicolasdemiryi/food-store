import { useEffect, useState } from 'react'

// Devuelve el valor recién cuando dejó de cambiar durante `ms` (evita una petición por tecla).
export function useDebounce<T>(valor: T, ms = 350): T {
  const [demorado, setDemorado] = useState(valor)
  useEffect(() => {
    const t = setTimeout(() => setDemorado(valor), ms)
    return () => clearTimeout(t)
  }, [valor, ms])
  return demorado
}
