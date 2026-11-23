import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from '../types/pedido'

// Propios (user) o todos (admin): el backend decide según la sesión.
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => pedidosApi.listar(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos', 'resumen'], queryFn: pedidosApi.resumen })
}

// Crear, cancelar o cambiar el estado mueve el stock: se invalidan pedidos Y productos.
function useInvalidar() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    void queryClient.invalidateQueries({ queryKey: ['productos'] })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: (datos: PedidoCreate) => pedidosApi.crear(datos), onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.cambiarEstado(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: (id: number) => pedidosApi.cancelar(id), onSuccess: invalidar })
}
