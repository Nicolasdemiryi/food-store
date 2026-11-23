const precioFmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })
const fechaFmt = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export const formatearPrecio = (valor: number): string => precioFmt.format(valor)
export const formatearFecha = (iso: string): string => fechaFmt.format(new Date(iso))
