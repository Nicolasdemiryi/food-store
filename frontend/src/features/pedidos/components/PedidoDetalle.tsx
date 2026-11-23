import { formatearPrecio } from '@/shared/utils/formato'
import type { Pedido } from '../types/pedido'

// Líneas del pedido (copias de nombre y precio) y datos de entrega.
export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-stone-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2 text-right">Precio</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.producto_id} className="border-t border-stone-100">
              <td className="py-2 font-medium">{item.nombre_producto}</td>
              <td className="py-2 text-right tabular-nums">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right tabular-nums">{item.cantidad}</td>
              <td className="py-2 text-right tabular-nums">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-stone-200 font-bold">
            <td colSpan={3} className="py-2">
              Total
            </td>
            <td className="py-2 text-right tabular-nums text-brand">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
      <dl className="grid gap-2 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-stone-500">Dirección de entrega</dt>
          <dd className="font-medium">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-stone-500">Forma de pago</dt>
          <dd className="font-medium">{pedido.forma_pago === 'EFECTIVO' ? '💵 Efectivo' : '🏦 Transferencia'}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-stone-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
