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

  // Mes (1-12) actual en Bogotá → nombre del mes anterior, sin depender de la
  // zona horaria del proceso
  const mesNum = Number(
    new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      timeZone: TIME_ZONE,
    }).format(now)
  )
  const mesAnterior = new Date(2000, (mesNum + 10) % 12, 1).toLocaleString(
    'es-CO',
    { month: 'long' }
  )

  return { saludo, fechaHoy, mesActual, mesAnterior }
}

/** 'YYYY-MM' → Date local del día 1 (sin conversión de zona) */
function parseMes(mes: string): Date {
  const [y, m] = mes.split('-').map(Number)
  return new Date(y, m - 1, 1)
}

/** 'YYYY-MM' → "nov" (o "ene 26" en enero, para marcar el cambio de año) */
export function formatMesCorto(mes: string): string {
  const d = parseMes(mes)
  const corto = d.toLocaleString('es-CO', { month: 'short' }).replace('.', '')
  return d.getMonth() === 0
    ? `${corto} ${String(d.getFullYear()).slice(2)}`
    : corto
}

/** 'YYYY-MM' → "noviembre de 2025" */
export function formatMesLargo(mes: string): string {
  return parseMes(mes).toLocaleString('es-CO', {
    month: 'long',
    year: 'numeric',
  })
}

/** Variación porcentual; null si no hay base de comparación */
export function pctChange(actual: number, anterior: number): number | null {
  if (!anterior) return null
  return ((actual - anterior) / anterior) * 100
}

/** Máximo "redondo" y paso para un eje de `ticks` divisiones */
export function niceScale(
  max: number,
  ticks = 4
): { max: number; step: number } {
  if (max <= 0) return { max: 1, step: 1 / ticks }
  const raw = max / ticks
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  const nice =
    norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10
  const step = nice * mag
  return { max: step * ticks, step }
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

/** 'YYYY-MM-DD' → "16 oct 2026" (fecha sin hora: no se convierte de zona) */
export function formatFechaCorta(fecha: string): string {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
    .toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace('.', '')
}

/** ISO → "16 oct, 12:55 p. m." en hora Colombia */
export function formatFechaHora(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  })
    .format(new Date(iso))
    .replace('.', '')
}

/** Días entre el pago ('YYYY-MM-DD') y su registro (ISO), en hora Colombia */
export function diasEntre(fechaPago: string, registroIso: string): number {
  const registroDia = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
  }).format(new Date(registroIso)) // 'YYYY-MM-DD'
  const aUTC = (ymd: string) => {
    const [y, m, d] = ymd.slice(0, 10).split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((aUTC(registroDia) - aUTC(fechaPago)) / 86_400_000)
}
