import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Campo, Input, Select, Textarea } from '@/shared/ui/Input'
import { entero, largo, maximo, noNegativo } from '@/shared/utils/validadores'
import type { Producto, ProductoPayload } from '../types/producto'

interface ProductoFormProps {
  inicial: Producto | null
  categorias: Categoria[]
  guardando: boolean
  error: string | null
  onGuardar: (datos: ProductoPayload) => void
  onCancelar: () => void
}

export function ProductoForm({ inicial, categorias, guardando, error, onGuardar, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial?.categoria_id ?? 0,
    },
    onSubmit: ({ value }) =>
      onGuardar({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        imagen_url: value.imagen_url.trim() || null,
      }),
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
      <form.Field name="nombre" validators={{ onChange: largo('El nombre', 1, 150) }}>
        {(field) => (
          <Campo id="p-nombre" label="Nombre *" errores={field.state.meta.errors}>
            <Input id="p-nombre" autoFocus value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} aria-invalid={field.state.meta.errors.length > 0} />
          </Campo>
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría'), onSubmit: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <Campo id="p-cat" label="Categoría *" errores={field.state.meta.errors}>
            <Select id="p-cat" value={field.state.value} onChange={(e) => field.handleChange(Number(e.target.value))} aria-invalid={field.state.meta.errors.length > 0}>
              <option value={0}>Elegir…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          </Campo>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="precio_base" validators={{ onChange: noNegativo('El precio') }}>
          {(field) => (
            <Campo id="p-precio" label="Precio ($) *" errores={field.state.meta.errors}>
              <Input id="p-precio" type="number" min={0} step="0.01" value={Number.isNaN(field.state.value) ? '' : field.state.value} onChange={(e) => field.handleChange(e.target.valueAsNumber)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
        <form.Field name="stock" validators={{ onChange: entero('El stock') }}>
          {(field) => (
            <Campo id="p-stock" label="Stock *" errores={field.state.meta.errors}>
              <Input id="p-stock" type="number" min={0} step={1} value={Number.isNaN(field.state.value) ? '' : field.state.value} onChange={(e) => field.handleChange(e.target.valueAsNumber)} aria-invalid={field.state.meta.errors.length > 0} />
            </Campo>
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url" validators={{ onChange: maximo(500) }}>
        {(field) => (
          <Campo id="p-img" label="URL de la imagen" errores={field.state.meta.errors} ayuda="Opcional. Ej.: https://…/foto.jpg">
            <Input id="p-img" type="url" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>

      <form.Field name="descripcion" validators={{ onChange: maximo(1000) }}>
        {(field) => (
          <Campo id="p-desc" label="Descripción" errores={field.state.meta.errors}>
            <Textarea id="p-desc" rows={2} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
          </Campo>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-700">
            <input type="checkbox" checked={field.state.value} onChange={(e) => field.handleChange(e.target.checked)} className="h-4 w-4 accent-brand" />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || guardando}>
              {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
