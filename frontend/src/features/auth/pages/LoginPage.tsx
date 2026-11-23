import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Campo, Input } from '@/shared/ui/Input'
import { requerido } from '@/shared/utils/validadores'
import { AuthCard } from '../components/AuthCard'
import type { Credenciales } from '../types/auth'

interface EstadoNavegacion {
  from?: Location // pantalla protegida que se pidió (la guarda ProtectedRoute)
  registrado?: string // username recién registrado
}

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const estado = (useLocation().state ?? {}) as EstadoNavegacion

  const destino = (rol: string) => estado.from?.pathname ?? (rol === 'admin' ? '/admin/resumen' : '/')

  const iniciarSesion = useMutation({
    mutationFn: ({ username, password }: Credenciales) => login(username, password),
    onSuccess: (u) => navigate(destino(u.role), { replace: true }),
  })

  const form = useForm({
    defaultValues: { username: estado.registrado ?? '', password: '' } satisfies Credenciales,
    onSubmit: ({ value }) => iniciarSesion.mutate({ username: value.username.trim(), password: value.password }),
  })

  if (usuario && !iniciarSesion.isPending) return <Navigate to={destino(usuario.role)} replace />

  return (
    <AuthCard
      titulo="Iniciar sesión"
      subtitulo="Ingresá para hacer tu pedido"
      pie={
        <>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      {estado.registrado && !iniciarSesion.isError && <Alert tipo="exito" mensaje="Cuenta creada. Ya podés iniciar sesión." />}
      {/* 401 «Credenciales incorrectas» · 400 «Cuenta de usuario desactivada» */}
      {iniciarSesion.isError && <Alert mensaje={handleApiError(iniciarSesion.error)} onCerrar={iniciarSesion.reset} />}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onSubmit: requerido('El usuario') }}>
          {(field) => (
            <Campo id="username" label="Usuario" errores={field.state.meta.errors}>
              <Input id="username" autoComplete="username" autoFocus={!estado.registrado} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <form.Field name="password" validators={{ onSubmit: requerido('La contraseña') }}>
          {(field) => (
            <Campo id="password" label="Contraseña" errores={field.state.meta.errors}>
              <Input id="password" type="password" autoComplete="current-password" autoFocus={Boolean(estado.registrado)} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <Button type="submit" className="mt-2 w-full py-2.5" disabled={iniciarSesion.isPending}>
          {iniciarSesion.isPending ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthCard>
  )
}
