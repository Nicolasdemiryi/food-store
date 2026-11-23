// Estado de la sesión (Zustand). Guarda los datos del usuario, NUNCA el token:
// el token viaja en la cookie HttpOnly, que JavaScript no puede leer.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { authApi } from '@/features/auth/api/auth'
import type { Usuario } from '@/features/usuarios/types/usuario'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean // true mientras checkSession confirma la sesión con /auth/me

  login: (username: string, password: string) => Promise<Usuario> // lanza el error si falla
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      // POST /auth/token (el navegador guarda la cookie) y luego GET /auth/me.
      login: async (username, password) => {
        await authApi.login({ username, password })
        const usuario = await authApi.me()
        set({ usuario })
        return usuario
      },

      // POST /auth/logout borra la cookie; limpiar solo el store no alcanzaría.
      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
        }
      },

      // Al montar la app: los datos persistidos pueden estar vencidos. El servidor decide.
      checkSession: async () => {
        try {
          set({ usuario: await authApi.me() })
        } catch {
          set({ usuario: null }) // 401 sin sesión · 400 cuenta desactivada · backend caído
        } finally {
          set({ cargando: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ usuario: state.usuario }), // solo el usuario; nunca el token
    },
  ),
)

// Selectores reutilizables
export const useEsAdmin = () => useAuthStore((s) => s.usuario?.role === 'admin')
