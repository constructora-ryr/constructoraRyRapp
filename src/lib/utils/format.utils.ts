/**
 * Utilidades de formato para datos
 */

/**
 * Formatea tamaño de archivo en bytes a formato legible
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB", "350 KB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  // Manejo robusto de valores inválidos
  if (bytes == null || bytes <= 0 || isNaN(bytes) || !isFinite(bytes)) {
    return '0 B'
  }

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  // Validar que el índice esté en rango
  const sizeIndex = Math.max(0, Math.min(i, sizes.length - 1))
  const size = bytes / Math.pow(1024, sizeIndex)

  return `${size.toFixed(sizeIndex === 0 ? 0 : 2)} ${sizes[sizeIndex]}`
}

/**
 * Formatea número como moneda en pesos colombianos
 * @param value - Valor numérico a formatear
 * @returns String formateado (ej: "$150.000.000", "$0")
 */
export function formatCurrency(value: number | null | undefined): string {
  // Manejo robusto de valores inválidos
  if (value == null || isNaN(value) || !isFinite(value)) {
    return '$0'
  }

  // Formatear con separadores de miles
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea un teléfono colombiano para mostrarlo (no para guardarlo):
 * - Celular de 10 dígitos: "3148905064" → "314 890 5064"
 * - Fijo de 7 dígitos:     "4451234"    → "445 1234"
 * - Con indicativo +57:    "573148905064" → "+57 314 890 5064"
 * Cualquier otro formato se devuelve tal cual.
 */
export function formatTelefono(telefono: string | null | undefined): string {
  if (!telefono) return ''
  const d = telefono.replace(/\D/g, '')
  if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  if (d.length === 7) return `${d.slice(0, 3)} ${d.slice(3)}`
  if (d.length === 12 && d.startsWith('57'))
    return `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`
  return telefono
}
