import { useForm } from '@tanstack/react-form'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Campo, Input } from '@/shared/ui/Input'
import { entero } from '@/shared/utils/validadores'
import type { Producto, StockPayload } from '../types/producto'

interface StockFormProps {
  producto: Producto
  guardando: boolean
  error: string | null
  onGuardar: (datos: StockPayload) => void
  onCancelar: () => void
}

// PATCH /productos/{id}/stock: stock y disponibilidad.
export function StockForm({ producto, guardando, error, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onGuardar(value),
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
      <p className="mb-4 text-sm text-stone-600">
        Producto: <strong>{producto.nombre}</strong>
      </p>
      <form.Field name="stock" validators={{ onChange: entero('El stock') }}>
        {(field) => (
          <Campo id="s-stock" label="Stock disponible" errores={field.state.meta.errors}>
            <Input id="s-stock" type="number" min={0} step={1} autoFocus value={Number.isNaN(field.state.value) ? '' : field.state.value} onChange={(e) => field.handleChange(e.target.valueAsNumber)} aria-invalid={field.state.meta.errors.length > 0} />
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
              {guardando ? 'Guardando…' : 'Actualizar stock'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
