// Ícono de respaldo cuando un producto no tiene imagen o la URL no carga.
const EMOJIS: Record<string, string> = {
  pizzas: '🍕',
  hamburguesas: '🍔',
  empanadas: '🥟',
  bebidas: '🥤',
  postres: '🍮',
  sushi: '🍣',
}

export const emojiCategoria = (nombre: string | undefined): string => EMOJIS[(nombre ?? '').toLowerCase()] ?? '🍽️'
