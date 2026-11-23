export interface Credenciales {
  username: string
  password: string
}

// Cuerpo de POST /auth/register (UserCreate).
export interface RegistroPayload {
  username: string
  full_name: string
  email: string
  password: string
}

export interface LoginResponse {
  message: string
}
