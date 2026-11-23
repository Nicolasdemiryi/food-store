import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'

const usuariosKey = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({ queryKey: usuariosKey, queryFn: usuariosApi.listar })
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) => (activar ? usuariosApi.activar(id) : usuariosApi.desactivar(id)),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: usuariosKey }),
  })
}
