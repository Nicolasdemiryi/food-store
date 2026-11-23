// Carrito (Zustand + persist en localStorage): sobrevive a recargar la página.
// Es estado del cliente: el precio definitivo lo fija el backend al crear el pedido.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock: number // tope para la cantidad (el backend lo vuelve a validar)
  imagen_url: string | null
}

interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id
                  ? { ...i, ...item, cantidad: Math.min(i.cantidad + cantidad, item.stock) }
                  : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, cantidad: Math.min(cantidad, item.stock) }] }
        }),

      quitar: (productoId) => set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.producto_id === productoId ? { ...i, cantidad: Math.min(Math.max(cantidad, 0), i.stock) } : i))
            .filter((i) => i.cantidad > 0), // cantidad 0 = se quita
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),
      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: 'cart-storage', // clave en localStorage
      partialize: (state) => ({ items: state.items }), // las funciones no se guardan
    },
  ),
)
