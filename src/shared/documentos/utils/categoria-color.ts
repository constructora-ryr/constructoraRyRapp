/**
 * Color de una categoría como hex. En la BD conviven nombres ("red", "teal")
 * y hex ("#8B5CF6"); los componentes usan el hex para fondos con
 * transparencia (`${hex}1f`) y para el ícono.
 */

const HEX_POR_NOMBRE: Record<string, string> = {
  blue: '#3B82F6',
  green: '#22C55E',
  red: '#EF4444',
  purple: '#A855F7',
  yellow: '#EAB308',
  pink: '#EC4899',
  indigo: '#6366F1',
  orange: '#F97316',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  gray: '#6B7280',
}

const COLOR_POR_DEFECTO = HEX_POR_NOMBRE.blue

export function colorCategoria(color: string | null | undefined): string {
  if (!color) return COLOR_POR_DEFECTO
  if (/^#[0-9a-f]{6}$/i.test(color)) return color
  return HEX_POR_NOMBRE[color.toLowerCase()] ?? COLOR_POR_DEFECTO
}
