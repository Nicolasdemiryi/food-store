// Formato de error de FastAPI: {"detail": "..."} o, en un 422, {"detail": [{loc, msg, type}]}.
export interface ErrorValidacion {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface ApiErrorBody {
  detail?: string | ErrorValidacion[]
}

// Respuesta de los listados paginados del backend: { total, items }.
export interface Paginado<T> {
  total: number
  items: T[]
}
