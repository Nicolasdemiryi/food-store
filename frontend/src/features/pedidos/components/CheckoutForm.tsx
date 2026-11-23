import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Campo, Input, Textarea } from '@/shared/ui/Input'
import { largo, maximo } from '@/shared/utils/validadores'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface CheckoutFormProps {
  enviando: boolean
  onConfirmar: (datos: DatosCheckout) => void
}

const FORMAS: { valor: FormaPago; texto: string; icono: string }[] = [
  { valor: 'EFECTIVO', texto: 'Efectivo', icono: '💵' },
  { valor: 'TRANSFERENCIA', texto: 'Transferencia', icono: '🏦' },
]

export function CheckoutForm({ enviando, onConfirmar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) =>
      onConfirmar({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
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
      <form.Field
        name="direccion_entrega"
        validators={{ onChange: largo('La dirección', 5, 200), onSubmit: largo('La dirección', 5, 200) }}
      >
        {(field) => (
          <Campo id="direccion" label="Dirección de entrega *" errores={field.state.meta.isTouched ? field.state.meta.errors : []}>
            <Input
              id="direccion"
              autoFocus
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Calle, número, piso, ciudad"
              aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
            />
          </Campo>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="mb-4">
            <legend className="mb-2 text-sm font-medium text-stone-700">Forma de pago *</legend>
            <div className="grid grid-cols-2 gap-3">
              {FORMAS.map((f) => (
                <label
                  key={f.valor}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    field.state.value === f.valor ? 'border-brand bg-brand-soft text-brand' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    value={f.valor}
                    checked={field.state.value === f.valor}
                    onChange={() => field.handleChange(f.valor)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{f.icono}</span> {f.texto}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: maximo(500) }}>
        {(field) => (
          <Campo id="notas" label="Notas (opcional)" errores={field.state.meta.errors}>
            <Textarea id="notas" rows={2} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Ej.: tocar timbre 2B" />
          </Campo>
        )}
      </form.Field>

      <Button type="submit" className="mt-2 w-full py-3 text-base" disabled={enviando}>
        {enviando ? 'Confirmando…' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
