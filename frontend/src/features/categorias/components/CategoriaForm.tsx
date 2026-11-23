import { useForm } from '@tanstack/react-form'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Campo, Input, Textarea } from '@/shared/ui/Input'
import { largo, maximo } from '@/shared/utils/validadores'
import type { Categoria, CategoriaPayload } from '../types/categoria'

interface CategoriaFormProps {
  inicial: Categoria | null // null = alta
  guardando: boolean
  error: string | null // p. ej. 409 nombre duplicado
  onGuardar: (datos: CategoriaPayload) => void
  onCancelar: () => void
}

export function CategoriaForm({ inicial, guardando, error, onGuardar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: ({ value }) => onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      {error && <Alert mensaje={error} />}
      <form.Field name="nombre" validators={{ onChange: largo('El nombre', 2, 100) }}>
        {(field) => (
          <Campo id="cat-nombre" label="Nombre *" errores={field.state.meta.errors}>
            <Input
              id="cat-nombre"
              autoFocus
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={field.state.meta.errors.length > 0}
              placeholder="Ej.: Pizzas"
            />
          </Campo>
        )}
      </form.Field>
      <form.Field name="descripcion" validators={{ onChange: maximo(500) }}>
        {(field) => (
          <Campo id="cat-desc" label="Descripción" errores={field.state.meta.errors}>
            <Textarea id="cat-desc" rows={3} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || guardando}>
              {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
