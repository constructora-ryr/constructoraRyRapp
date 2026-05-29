/**
 * 📅 Utilidades de Fecha - Constructora RyR
 *
 * Funciones centralizadas para manejo consistente de fechas
 * en toda la aplicación, evitando problemas de zona horaria.
 *
 * @module date.utils
 */

/**
 * Convierte una fecha del input (YYYY-MM-DD) a formato ISO con hora del mediodía
 * para evitar cambios de día por conversión de zona horaria.
 *
 * @param dateString - Fecha en formato YYYY-MM-DD (ej: "2025-10-23")
 * @returns Fecha en formato ISO con hora 12:00:00 (ej: "2025-10-23T12:00:00")
 *
 * @example
 * ```ts
 * const fecha = formatDateForDB("2025-10-23")
 * // → "2025-10-23T12:00:00"
 * // Guardar en DB: timestamp será siempre el día correcto
 * ```
 */
export function formatDateForDB(dateString: string): string {
  if (!dateString) return ''

  // Si ya tiene hora, retornar tal cual
  if (dateString.includes('T')) return dateString

  // Agregar hora del mediodía para evitar problemas de zona horaria
  return `${dateString}T12:00:00`
}

/**
 * Formatea una fecha de la DB para mostrar en la UI (solo día, mes, año)
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @param options - Opciones de formato (por defecto: día, mes largo, año)
 * @returns Fecha formateada en español colombiano
 *
 * @example
 * ```ts
 * formatDateForDisplay("2025-10-23T12:00:00")
 * // → "23 de octubre de 2025"
 *
 * formatDateForDisplay("2025-10-23", { month: 'short' })
 * // → "23 oct 2025"
 * ```
 */
export function formatDateForDisplay(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return ''

  // Si la fecha está en formato YYYY-MM-DD (sin hora), agregar hora del mediodía
  // para evitar problemas de timezone al parsear
  let dateToFormat = dateString
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    dateToFormat = `${dateString}T12:00:00`
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota', // Zona horaria de Colombia
  }

  const finalOptions = { ...defaultOptions, ...options }

  return new Date(dateToFormat).toLocaleDateString('es-CO', finalOptions)
}

/**
 * Formatea una fecha en formato compacto dd/MM/yyyy (SIN problemas de timezone)
 *
 * ⚠️ USAR ESTA FUNCIÓN para mostrar fechas en formato corto en toda la app
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @returns Fecha en formato dd/MM/yyyy
 *
 * @example
 * ```ts
 * formatDateShort("2025-10-26")
 * // → "26/10/2025"
 *
 * formatDateShort("2025-10-26T12:00:00")
 * // → "26/10/2025"
 * ```
 */
export function formatDateShort(dateString: string): string {
  if (!dateString) return ''

  // Extraer YYYY-MM-DD sin conversión de timezone
  const dateInput = formatDateForInput(dateString)
  const [year, month, day] = dateInput.split('-')

  return `${day}/${month}/${year}` // dd/MM/yyyy
}

/**
 * Formatea una fecha en formato compacto con mes abreviado dd-MMM-yyyy
 *
 * ⚠️ USAR ESTA FUNCIÓN para mostrar fechas compactas con mes en texto
 * ⚠️ NO USA Date OBJECTS - Evita timezone shift completamente
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @returns Fecha en formato dd-MMM-yyyy (ej: "16-feb-2023")
 *
 * @example
 * ```ts
 * formatDateCompact("2023-02-16")
 * // → "16-feb-2023"
 *
 * formatDateCompact("2023-02-16T12:00:00")
 * // → "16-feb-2023"
 * ```
 */
export function formatDateCompact(dateString: string): string {
  if (!dateString) return ''

  // Extraer YYYY-MM-DD sin conversión de timezone (NO usa new Date)
  const dateInput = formatDateForInput(dateString)
  const [year, month, day] = dateInput.split('-')

  // Mapeo directo de mes a abreviación en español
  const monthNames = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ]
  const monthAbbr = monthNames[parseInt(month) - 1]

  return `${day}-${monthAbbr}-${year}` // dd-MMM-yyyy
}

/**
 * Formatea una fecha con hora completa para mostrar en la UI
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @returns Fecha y hora formateada en español colombiano
 *
 * @example
 * ```ts
 * formatDateTimeForDisplay("2025-10-23T14:30:00")
 * // → "23 de octubre de 2025, 02:30 p.m."
 * ```
 */
export function formatDateTimeForDisplay(dateString: string): string {
  if (!dateString) return ''

  return new Date(dateString).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  })
}

export function formatDateTimeWithSeconds(dateString: string): string {
  if (!dateString) return ''

  return new Date(dateString).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Bogota',
  })
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (para inputs date)
 *
 * ⚠️ CRÍTICO: NO usar new Date().toISOString().split('T')[0]
 * porque toISOString() convierte a UTC y puede cambiar el día
 * en zonas horarias negativas como Colombia (UTC-5).
 *
 * @returns Fecha de hoy en formato YYYY-MM-DD en zona horaria local
 *
 * @example
 * ```ts
 * // Hoy es 24 octubre 2025, 10:00 PM en Colombia
 * getTodayDateString()
 * // → "2025-10-24" ✅ (correcto)
 *
 * // ❌ NUNCA usar:
 * new Date().toISOString().split('T')[0]
 * // → "2025-10-25" (incorrecto, suma 1 día por UTC)
 * ```
 */
export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Convierte string YYYY-MM-DD o Date object a formato ISO preservando zona horaria LOCAL
 *
 * ⚠️ CRÍTICO: Esta función PARSEA el string directamente sin crear Date object
 * para evitar conversiones de timezone que cambian el día.
 *
 * @param input - String en formato YYYY-MM-DD del input date, o Date object
 * @returns String ISO con fecha local y hora del mediodía
 *
 * @example
 * ```ts
 * // ✅ CORRECTO - Desde input date
 * const inputValue = '2025-10-28' // Del input type="date"
 * formatDateToISO(inputValue)
 * // → "2025-10-28T12:00:00" (preserva el día exacto)
 *
 * // ✅ CORRECTO - Fecha actual
 * formatDateToISO(getTodayDateString())
 * // → "2025-10-28T12:00:00"
 *
 * // ❌ EVITAR - Pasar Date object (puede tener timezone issues)
 * formatDateToISO(new Date('2025-10-28'))
 * // → Puede fallar en ciertas horas del día
 * ```
 */
export function formatDateToISO(input: string | Date): string {
  // Si es string YYYY-MM-DD, usarlo directamente (PREFERIDO)
  if (typeof input === 'string') {
    // Validar formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return `${input}T12:00:00`
    }

    // Si es un string ISO completo, extraer solo la fecha
    const match = input.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) {
      return `${match[1]}T12:00:00`
    }
  }

  // Fallback: Si es Date object, extraer componentes en timezone local
  const date = typeof input === 'string' ? new Date(input) : input
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}T12:00:00`
}

/**
 * Convierte una fecha de la DB a formato YYYY-MM-DD (para inputs date)
 * SIN problemas de timezone - extrae directamente de la cadena ISO
 *
 * @param dateString - Fecha en formato ISO o timestamp de la DB
 * @returns Fecha en formato YYYY-MM-DD
 *
 * @example
 * ```ts
 * formatDateForInput("2025-10-23T12:00:00")
 * // → "2025-10-23"
 * formatDateForInput("2025-10-24T00:00:00Z")
 * // → "2025-10-24"  (sin restar días por timezone)
 * ```
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return ''

  // Si la fecha ya está en formato YYYY-MM-DD, retornarla tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  // Extraer fecha de la cadena ISO sin conversión de timezone
  // "2025-10-24T00:00:00Z" -> "2025-10-24"
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) {
    return match[1]
  }

  // Fallback: usar Date solo si no hay otra opción
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Calcula la diferencia en días entre dos fechas
 *
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Número de días de diferencia (positivo o negativo)
 *
 * @example
 * ```ts
 * getDaysDifference("2025-10-23", "2025-10-20")
 * // → 3
 * ```
 */
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d1.getTime() - d2.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Valida si una fecha es válida
 *
 * @param dateString - Fecha a validar
 * @returns true si la fecha es válida, false si no
 *
 * @example
 * ```ts
 * isValidDate("2025-10-23") // → true
 * isValidDate("2025-13-45") // → false
 * isValidDate("invalid")     // → false
 * ```
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Formatea una fecha relativa (hace X días, hace X meses, etc.)
 *
 * @param dateString - Fecha a formatear
 * @returns Texto relativo (ej: "hace 2 días", "hace 1 mes")
 *
 * @example
 * ```ts
 * formatRelativeDate("2025-10-21") // Hoy es 23 oct
 * // → "hace 2 días"
 * ```
 */
export function formatRelativeDate(dateString: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffYear > 0) return `hace ${diffYear} ${diffYear === 1 ? 'año' : 'años'}`
  if (diffMonth > 0)
    return `hace ${diffMonth} ${diffMonth === 1 ? 'mes' : 'meses'}`
  if (diffDay > 0) return `hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`
  if (diffHour > 0)
    return `hace ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
  if (diffMin > 0)
    return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`

  return 'hace un momento'
}

/**
 * Calcula la edad actual a partir de una fecha de nacimiento
 *
 * @param birthDateString - Fecha de nacimiento en formato ISO o YYYY-MM-DD
 * @returns Edad en años completos
 *
 * @example
 * ```ts
 * calculateAge("1995-03-18") // Hoy es 26 nov 2025
 * // → 30
 *
 * calculateAge("2000-12-31T12:00:00")
 * // → 24
 * ```
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0

  // Extraer fecha en formato YYYY-MM-DD sin timezone issues
  const dateInput = formatDateForInput(birthDateString)
  const [year, month, day] = dateInput.split('-').map(Number)

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1 // getMonth() es 0-indexado
  const currentDay = today.getDate()

  // Calcular edad base
  let age = currentYear - year

  // Ajustar si aún no cumplió años este año
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age--
  }

  return age
}
