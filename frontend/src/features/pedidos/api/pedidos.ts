import { api } from '@/shared/api/axiosInstance'
import type { Paginado } from '@/shared/api/api.types'
import type { EstadoPedido, FiltrosPedidos, Pedido, PedidoCreate, ResumenPedidos } from '../types/pedido'

export const pedidosApi = {
  crear: async (datos: PedidoCreate) => (await api.post<Pedido>('/pedidos', datos)).data,
  listar: async (filtros: FiltrosPedidos) => (await api.get<Paginado<Pedido>>('/pedidos', { params: filtros })).data,
  obtener: async (id: number) => (await api.get<Pedido>(`/pedidos/${id}`)).data,
  cambiarEstado: async (id: number, estado: EstadoPedido) => (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data,
  cancelar: async (id: number) => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data,
  resumen: async () => (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
}
