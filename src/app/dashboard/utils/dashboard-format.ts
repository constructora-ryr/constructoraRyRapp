/**
 * Utilidades de formato del dashboard.
 *
 * Todas las fechas se calculan en America/Bogota para que el SSR (Vercel, UTC)
 * y el navegador rendericen lo mismo y no haya hydration mismatch.
 */

const TIME_ZONE = 'America/Bogota'

export function getContextoFecha(now: Date = new Date()) {
  const hora = Number(
    new Intl.DateTimeFormat('es-CO', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: TIME_ZONE,
    }).format(now)
  )

  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const fechaHoy = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TIME_ZONE,
  }).format(now)

  const mesActual = new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    timeZone: TIME_ZONE,
  }).format(now)

  return { saludo, fechaHoy, mesActual }
}

/** $45,2 M · $850 mil · $1.230 M */
export function formatCOPCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    const millones = value / 1_000_000
    return `$${millones.toLocaleString('es-CO', {
      maximumFractionDigits: abs >= 100_000_000 ? 0 : 1,
    })} M`
  }
  if (abs >= 1_000) {
    return `$${Math.round(value / 1_000).toLocaleString('es-CO')} mil`
  }
  return `$${Math.round(value).toLocaleString('es-CO')}`
}
