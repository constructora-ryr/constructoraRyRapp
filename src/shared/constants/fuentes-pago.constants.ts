/**
 * Constantes centralizadas para Fuentes de Pago.
 *
 * ⚠️ REGLA: Usar SIEMPRE `codigo` (estable) para lógica y comparaciones.
 *    Nunca comparar con `nombre` (humano, editable en admin).
 *
 * Los códigos coinciden con la columna `codigo` de `tipos_fuentes_pago` en BD.
 */

// ─── Códigos estables de fuentes de pago ────────────────────────────────────

export const FUENTE_CODIGO = {
  CUOTA_INICIAL: 'cuota_inicial',
  CREDITO_HIPOTECARIO: 'credito_hipotecario',
  SUBSIDIO_MI_CASA_YA: 'subsidio_mi_casa_ya',
  SUBSIDIO_CAJA_COMPENSACION: 'subsidio_caja_compensacion',
  CREDITO_CONSTRUCTORA: 'credito_constructora',
} as const

export type FuenteCodigo = (typeof FUENTE_CODIGO)[keyof typeof FUENTE_CODIGO]

// ─── Puente nombre ↔ código (para migración gradual) ───────────────────────
// Mientras FuentePago solo expone `tipo` (nombre), este mapa permite resolverlo a código.
// Cuando el servicio exponga `tipo_codigo`, estas funciones seguirán funcionando.

const NOMBRE_A_CODIGO: Record<string, FuenteCodigo> = {
  'Cuota Inicial': FUENTE_CODIGO.CUOTA_INICIAL,
  'Crédito Hipotecario': FUENTE_CODIGO.CREDITO_HIPOTECARIO,
  'Subsidio Mi Casa Ya': FUENTE_CODIGO.SUBSIDIO_MI_CASA_YA,
  'Subsidio Caja Compensación': FUENTE_CODIGO.SUBSIDIO_CAJA_COMPENSACION,
  'Crédito con la Constructora': FUENTE_CODIGO.CREDITO_CONSTRUCTORA,
}

/** Convierte un nombre o código de fuente a su código estable. */
export const resolverCodigo = (
  nombreOCodigo?: string | null
): FuenteCodigo | undefined => {
  if (!nombreOCodigo) return undefined
  // Si ya es un código válido, retornarlo
  const codigos = Object.values(FUENTE_CODIGO) as string[]
  if (codigos.includes(nombreOCodigo)) return nombreOCodigo as FuenteCodigo
  // Si es un nombre, mapearlo
  return NOMBRE_A_CODIGO[nombreOCodigo]
}

// ─── Helpers de identificación (aceptan nombre O código) ────────────────────

/** ¿Es "Cuota Inicial"? (la fuente que permite múltiples abonos) */
export const esCuotaInicial = (nombreOCodigo?: string | null) =>
  resolverCodigo(nombreOCodigo) === FUENTE_CODIGO.CUOTA_INICIAL

/** ¿Es "Crédito con la Constructora"? (genera plan de cuotas) */
export const esCreditoConstructora = (nombreOCodigo?: string | null) =>
  resolverCodigo(nombreOCodigo) === FUENTE_CODIGO.CREDITO_CONSTRUCTORA

/** ¿Es un tipo de crédito hipotecario? (requiere entidad bancaria) */
export const esCreditoHipotecario = (nombreOCodigo?: string | null) =>
  resolverCodigo(nombreOCodigo) === FUENTE_CODIGO.CREDITO_HIPOTECARIO

/** ¿Es subsidio Mi Casa Ya? */
export const esSubsidioMiCasaYa = (nombreOCodigo?: string | null) =>
  resolverCodigo(nombreOCodigo) === FUENTE_CODIGO.SUBSIDIO_MI_CASA_YA

/** ¿Es subsidio de Caja de Compensación? */
export const esSubsidioCajaCompensacion = (nombreOCodigo?: string | null) =>
  resolverCodigo(nombreOCodigo) === FUENTE_CODIGO.SUBSIDIO_CAJA_COMPENSACION

/** ¿Requiere desembolso único? (todo lo que NO es cuota inicial) */
export const esDesembolsoUnico = (nombreOCodigo?: string | null) => {
  const codigo = resolverCodigo(nombreOCodigo)
  return !!codigo && codigo !== FUENTE_CODIGO.CUOTA_INICIAL
}

/**
 * ¿El desembolso debe ser exactamente igual al monto aprobado?
 * CH y subsidios: el banco/gobierno gira el 100% en un solo evento.
 * Excluye Crédito Constructora (tiene plan de cuotas) y Cuota Inicial (múltiples abonos).
 */
export const esDesembolsoExacto = (nombreOCodigo?: string | null) =>
  esDesembolsoUnico(nombreOCodigo) && !esCreditoConstructora(nombreOCodigo)

// ─── Labels contextuales según código ───────────────────────────────────────

interface LabelsContextuales {
  montoLabel: string // "Pactado" vs "Aprobado"
  recibidoLabel: string // "Pagado" vs "Desembolsado"
  pendienteLabel: string // "Por Pagar" vs "Pendiente"
  entidadFallback: string // Cuando no hay entidad: inferir texto
}

const LABELS_POR_DEFECTO: LabelsContextuales = {
  montoLabel: 'Aprobado',
  recibidoLabel: 'Desembolsado',
  pendienteLabel: 'Pendiente',
  entidadFallback: 'No especifica',
}

const LABELS_MAP: Partial<Record<FuenteCodigo, LabelsContextuales>> = {
  [FUENTE_CODIGO.CUOTA_INICIAL]: {
    montoLabel: 'Pactado',
    recibidoLabel: 'Pagado',
    pendienteLabel: 'Por Pagar',
    entidadFallback: 'No especifica',
  },
  [FUENTE_CODIGO.CREDITO_CONSTRUCTORA]: {
    montoLabel: 'Crédito total',
    recibidoLabel: 'Abonado',
    pendienteLabel: 'Saldo restante',
    entidadFallback: 'Constructora',
  },
  [FUENTE_CODIGO.SUBSIDIO_MI_CASA_YA]: {
    montoLabel: 'Aprobado',
    recibidoLabel: 'Desembolsado',
    pendienteLabel: 'Pendiente',
    entidadFallback: 'Mi Casa Ya',
  },
  [FUENTE_CODIGO.SUBSIDIO_CAJA_COMPENSACION]: {
    montoLabel: 'Aprobado',
    recibidoLabel: 'Desembolsado',
    pendienteLabel: 'Pendiente',
    entidadFallback: 'Caja Compensación',
  },
  [FUENTE_CODIGO.CREDITO_HIPOTECARIO]: {
    montoLabel: 'Aprobado',
    recibidoLabel: 'Desembolsado',
    pendienteLabel: 'Pendiente',
    entidadFallback: 'Entidad Bancaria',
  },
}

/**
 * Obtener labels contextuales según nombre o código de la fuente.
 * Sirve para mostrar "Pactado"/"Pagado" para Cuota Inicial
 * y "Aprobado"/"Desembolsado" para las demás.
 */
export const getLabelsContextuales = (
  nombreOCodigo?: string | null
): LabelsContextuales => {
  const codigo = resolverCodigo(nombreOCodigo)
  return LABELS_MAP[codigo as FuenteCodigo] ?? LABELS_POR_DEFECTO
}

// ─── Color token → Tailwind classes (UI mapping) ───────────────────────────

export interface FuenteColorClasses {
  barra: string
  badge: string
  texto: string
  accent: string
  glow: string
  bar: string
  icon: string
}

/**
 * Maps generic color tokens (from `tipos_fuentes_pago.color` in BD) to Tailwind classes.
 * New types added in admin automatically work if they use a token defined here.
 */
const COLOR_TOKEN_MAP: Record<string, FuenteColorClasses> = {
  blue: {
    barra: 'bg-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    texto: 'text-blue-600 dark:text-blue-400',
    accent: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59,130,246,0.28)',
    bar: 'from-blue-400 to-indigo-400',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  emerald: {
    barra: 'bg-emerald-500',
    badge:
      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    texto: 'text-emerald-600 dark:text-emerald-400',
    accent: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.28)',
    bar: 'from-emerald-400 to-teal-400',
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  green: {
    barra: 'bg-green-500',
    badge:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    texto: 'text-green-600 dark:text-green-400',
    accent: 'from-green-500 to-emerald-600',
    glow: 'rgba(34,197,94,0.28)',
    bar: 'from-green-400 to-emerald-400',
    icon: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
  purple: {
    barra: 'bg-purple-500',
    badge:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    texto: 'text-purple-600 dark:text-purple-400',
    accent: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.28)',
    bar: 'from-violet-400 to-purple-400',
    icon: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
  amber: {
    barra: 'bg-amber-500',
    badge:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    texto: 'text-amber-600 dark:text-amber-400',
    accent: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.28)',
    bar: 'from-amber-400 to-orange-400',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  orange: {
    barra: 'bg-orange-500',
    badge:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    texto: 'text-orange-600 dark:text-orange-400',
    accent: 'from-orange-500 to-red-600',
    glow: 'rgba(249,115,22,0.28)',
    bar: 'from-orange-400 to-red-400',
    icon: 'bg-gradient-to-br from-orange-500 to-red-600',
  },
  red: {
    barra: 'bg-red-500',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    texto: 'text-red-600 dark:text-red-400',
    accent: 'from-red-500 to-rose-600',
    glow: 'rgba(239,68,68,0.28)',
    bar: 'from-red-400 to-rose-400',
    icon: 'bg-gradient-to-br from-red-500 to-rose-600',
  },
  pink: {
    barra: 'bg-pink-500',
    badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    texto: 'text-pink-600 dark:text-pink-400',
    accent: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.28)',
    bar: 'from-pink-400 to-rose-400',
    icon: 'bg-gradient-to-br from-pink-500 to-rose-600',
  },
  indigo: {
    barra: 'bg-indigo-500',
    badge:
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    texto: 'text-indigo-600 dark:text-indigo-400',
    accent: 'from-indigo-500 to-purple-600',
    glow: 'rgba(99,102,241,0.28)',
    bar: 'from-indigo-400 to-purple-400',
    icon: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  },
  cyan: {
    barra: 'bg-cyan-500',
    badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
    texto: 'text-cyan-600 dark:text-cyan-400',
    accent: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.28)',
    bar: 'from-cyan-400 to-blue-400',
    icon: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
  yellow: {
    barra: 'bg-yellow-500',
    badge:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    texto: 'text-yellow-600 dark:text-yellow-400',
    accent: 'from-yellow-500 to-amber-600',
    glow: 'rgba(234,179,8,0.28)',
    bar: 'from-yellow-400 to-amber-400',
    icon: 'bg-gradient-to-br from-yellow-500 to-amber-600',
  },
  teal: {
    barra: 'bg-teal-500',
    badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    texto: 'text-teal-600 dark:text-teal-400',
    accent: 'from-teal-500 to-cyan-600',
    glow: 'rgba(20,184,166,0.28)',
    bar: 'from-teal-400 to-cyan-400',
    icon: 'bg-gradient-to-br from-teal-500 to-cyan-600',
  },
}

const COLOR_FALLBACK: FuenteColorClasses = {
  barra: 'bg-slate-500',
  badge: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300',
  texto: 'text-slate-600 dark:text-slate-400',
  accent: 'from-slate-500 to-gray-600',
  glow: 'rgba(100,116,139,0.22)',
  bar: 'from-slate-400 to-gray-400',
  icon: 'bg-gradient-to-br from-slate-500 to-gray-600',
}

/**
 * Get Tailwind color classes from a color token stored in `tipos_fuentes_pago.color`.
 * Falls back to neutral slate if the token is unknown.
 */
export const getFuenteColorClasses = (
  colorToken?: string | null
): FuenteColorClasses => COLOR_TOKEN_MAP[colorToken ?? ''] ?? COLOR_FALLBACK
