/**
 * Reglas de la fecha de nacimiento del cliente (sin dependencias, para
 * poder probarlas y usarlas en la interfaz).
 */

export const EDAD_MINIMA = 18
const EDAD_MAXIMA = 120

/** Error de la fecha de nacimiento o null si es válida (o está vacía) */
export function errorFechaNacimiento(fecha: string): string | null {
  if (!fecha) return null
  const nacimiento = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(nacimiento.getTime())) return 'Fecha inválida'
  const hoy = new Date()
  if (nacimiento > hoy) return 'La fecha no puede ser futura'
  const limiteViejo = new Date()
  limiteViejo.setFullYear(hoy.getFullYear() - EDAD_MAXIMA)
  if (nacimiento < limiteViejo) return 'Revisa el año: fuera de rango'
  const limiteMenor = new Date()
  limiteMenor.setFullYear(hoy.getFullYear() - EDAD_MINIMA)
  if (nacimiento > limiteMenor)
    return `Debe ser mayor de ${EDAD_MINIMA} años para firmar contratos`
  return null
}

/** Edad en años cumplidos (para mostrarla junto al campo) */
export function edad(fecha: string): number | null {
  if (!fecha) return null
  const n = new Date(`${fecha}T12:00:00`)
  if (Number.isNaN(n.getTime())) return null
  const hoy = new Date()
  let anos = hoy.getFullYear() - n.getFullYear()
  const cumplio =
    hoy.getMonth() > n.getMonth() ||
    (hoy.getMonth() === n.getMonth() && hoy.getDate() >= n.getDate())
  if (!cumplio) anos -= 1
  return anos >= 0 ? anos : null
}
