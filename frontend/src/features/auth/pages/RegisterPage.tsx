import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/shared/api/handleApiError'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Campo, Input } from '@/shared/ui/Input'
import { emailValido, largo } from '@/shared/utils/validadores'
import { authApi } from '../api/auth'
import { AuthCard } from '../components/AuthCard'
import type { RegistroPayload } from '../types/auth'

const usernameValido = ({ value }: { value: string }) =>
  /^[A-Za-z0-9_.-]{3,50}$/.test(value.trim()) ? undefined : 'De 3 a 50 caracteres: letras, números, punto, guion o guion bajo'

const passwordValida = ({ value }: { value: string }) => {
  if (value.length < 8) return 'Mínimo 8 caracteres'
  if (new TextEncoder().encode(value).length > 72) return 'Máximo 72 bytes'
  return undefined
}

export function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()

  const registro = useMutation({
    mutationFn: (datos: RegistroPayload) => authApi.register(datos),
    onSuccess: (u) => navigate('/login', { replace: true, state: { registrado: u.username } }),
  })

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' },
    onSubmit: ({ value }) =>
      registro.mutate({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      }),
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <AuthCard
      titulo="Crear cuenta"
      subtitulo="Registrate para hacer pedidos"
      pie={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      {/* 409 usuario o email repetido · 422 datos inválidos */}
      {registro.isError && <Alert mensaje={handleApiError(registro.error)} onCerrar={registro.reset} />}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onSubmit: usernameValido, onChange: ({ value }) => (value ? usernameValido({ value }) : undefined) }}>
          {(field) => (
            <Campo id="r-username" label="Usuario *" errores={field.state.meta.errors}>
              <Input id="r-username" autoFocus autoComplete="username" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <form.Field name="full_name" validators={{ onSubmit: largo('El nombre', 1, 100) }}>
          {(field) => (
            <Campo id="r-nombre" label="Nombre completo *" errores={field.state.meta.errors}>
              <Input id="r-nombre" autoComplete="name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <form.Field name="email" validators={{ onSubmit: emailValido }}>
          {(field) => (
            <Campo id="r-email" label="Email *" errores={field.state.meta.errors}>
              <Input id="r-email" type="email" autoComplete="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <form.Field name="password" validators={{ onSubmit: passwordValida, onChange: ({ value }) => (value ? passwordValida({ value }) : undefined) }}>
          {(field) => (
            <Campo id="r-password" label="Contraseña * (mínimo 8 caracteres)" errores={field.state.meta.errors}>
              <Input id="r-password" type="password" autoComplete="new-password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <form.Field
          name="confirmar"
          validators={{
            onChangeListenTo: ['password'],
            onSubmit: ({ value, fieldApi }) => (value === fieldApi.form.getFieldValue('password') ? undefined : 'Las contraseñas no coinciden'),
          }}
        >
          {(field) => (
            <Campo id="r-confirmar" label="Repetir contraseña *" errores={field.state.meta.errors}>
              <Input id="r-confirmar" type="password" autoComplete="new-password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <Button type="submit" className="mt-2 w-full py-2.5" disabled={registro.isPending}>
          {registro.isPending ? 'Creando la cuenta…' : 'Registrarme'}
        </Button>
      </form>
    </AuthCard>
  )
}
