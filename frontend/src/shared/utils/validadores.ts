// Validadores para TanStack Form: devuelven el mensaje de error o undefined.
type Validador<T> = (p: { value: T }) => string | undefined

export const requerido =
  (campo: string): Validador<string> =>
  ({ value }) =>
    value.trim() ? undefined : `${campo} es obligatorio`

export const largo =
  (campo: string, min: number, max: number): Validador<string> =>
  ({ value }) => {
    const n = value.trim().length
    if (n < min) return `${campo}: mínimo ${min} caracteres`
    if (n > max) return `${campo}: máximo ${max} caracteres`
    return undefined
  }

export const maximo =
  (max: number): Validador<string> =>
  ({ value }) =>
    value.length > max ? `Máximo ${max} caracteres` : undefined

export const emailValido: Validador<string> = ({ value }) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : 'Ingresá un email válido'

export const noNegativo =
  (campo: string): Validador<number> =>
  ({ value }) => {
    if (Number.isNaN(value)) return `${campo} es obligatorio`
    return value < 0 ? `${campo} no puede ser negativo` : undefined
  }

export const entero =
  (campo: string): Validador<number> =>
  ({ value }) =>
    Number.isInteger(value) ? noNegativo(campo)({ value }) : `${campo} debe ser un número entero`
