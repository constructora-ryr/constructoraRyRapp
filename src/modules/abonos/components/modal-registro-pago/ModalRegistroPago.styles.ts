/**
 * Estilos centralizados para ModalRegistroPago.
 *
 * REGLA CRÍTICA: Todas las clases de color son strings literales completos.
 * NUNCA usar template literals con variables JS para construir clases Tailwind
 * (serían purgadas en producción por el JIT compiler).
 */
import type { ModoRegistro } from '../../types'

// ─────────────────────────────────────────────────────────────────────────────
// Tipo de esquema de color
// ─────────────────────────────────────────────────────────────────────────────

export type ColorScheme = {
  /** Gradiente header/botones: 'from-X via-Y to-Z' */
  gradient: string
  /** Gradiente hover del botón de submit del modo abono: 'hover:from-X ...' */
  gradientHover: string
  /** Fondo light para card de desembolso y cards seleccionados */
  bgLight: string
  /** Borde del item seleccionado (método, fuente activa) */
  borderSelected: string
  /** Texto de acento (valor numérico, icono) con dark mode incluido */
  textAccent: string
  /** Clases completas para el card de desembolso (bg + border) */
  desembolsoCard: string
  /** Badge del header en modo abono */
  headerBadgeAbono: string
  /** Badge del header en modo desembolso */
  headerBadgeDesembolso: string
  /** Clase de fondo para el ícono del método seleccionado */
  metodoBg: string
  /** Focus border del input (color dinámico según fuente) */
  inputFocusBorder: string
  /** Focus ring del input */
  inputFocusRing: string
  /** Focus-within para wrapper del campo monto */
  inputFocusWithin: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapa de esquemas por tipo de fuente (strings literales estáticos)
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_SCHEMES: Record<string, ColorScheme> = {
  // emerald/teal — igual que el botón de la tarjeta
  'Cuota Inicial': {
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    gradientHover:
      'hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800',
    bgLight: 'bg-emerald-500/10 dark:bg-emerald-500/10',
    borderSelected: 'border-emerald-500',
    textAccent: 'text-emerald-600 dark:text-emerald-400',
    desembolsoCard:
      'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso:
      'bg-emerald-900/40 border border-emerald-400/40 text-white/90',
    metodoBg: 'bg-emerald-500',
    inputFocusBorder: 'focus:border-emerald-500 dark:focus:border-emerald-400',
    inputFocusRing: 'focus:ring-2 focus:ring-emerald-500/20',
    inputFocusWithin:
      'focus-within:border-emerald-500 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20',
  },
  // blue/indigo — igual que el botón de la tarjeta
  'Crédito Hipotecario': {
    gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    gradientHover: 'hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800',
    bgLight: 'bg-blue-500/10 dark:bg-blue-500/10',
    borderSelected: 'border-blue-500',
    textAccent: 'text-blue-600 dark:text-blue-400',
    desembolsoCard:
      'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso:
      'bg-blue-900/40 border border-blue-400/40 text-white/90',
    metodoBg: 'bg-blue-500',
    inputFocusBorder: 'focus:border-blue-500 dark:focus:border-blue-400',
    inputFocusRing: 'focus:ring-2 focus:ring-blue-500/20',
    inputFocusWithin:
      'focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20',
  },
  // violet/purple — igual que el botón de la tarjeta
  'Subsidio Mi Casa Ya': {
    gradient: 'from-violet-600 via-purple-600 to-violet-700',
    gradientHover:
      'hover:from-violet-700 hover:via-purple-700 hover:to-violet-800',
    bgLight: 'bg-violet-500/10 dark:bg-violet-500/10',
    borderSelected: 'border-violet-500',
    textAccent: 'text-violet-600 dark:text-violet-400',
    desembolsoCard:
      'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso:
      'bg-violet-900/40 border border-violet-400/40 text-white/90',
    metodoBg: 'bg-violet-500',
    inputFocusBorder: 'focus:border-violet-500 dark:focus:border-violet-400',
    inputFocusRing: 'focus:ring-2 focus:ring-violet-500/20',
    inputFocusWithin:
      'focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20',
  },
  // pink/rose — igual que el botón de la tarjeta
  'Subsidio Caja Compensación': {
    gradient: 'from-pink-600 via-rose-600 to-pink-700',
    gradientHover: 'hover:from-pink-700 hover:via-rose-700 hover:to-pink-800',
    bgLight: 'bg-pink-500/10 dark:bg-pink-500/10',
    borderSelected: 'border-pink-500',
    textAccent: 'text-pink-600 dark:text-pink-400',
    desembolsoCard:
      'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso:
      'bg-pink-900/40 border border-pink-400/40 text-white/90',
    metodoBg: 'bg-pink-500',
    inputFocusBorder: 'focus:border-pink-500 dark:focus:border-pink-400',
    inputFocusRing: 'focus:ring-2 focus:ring-pink-500/20',
    inputFocusWithin:
      'focus-within:border-pink-500 dark:focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-500/20',
  },
  // violet/purple — igual que el botón de la tarjeta
  'Crédito con la Constructora': {
    gradient: 'from-violet-600 via-purple-600 to-violet-700',
    gradientHover:
      'hover:from-violet-700 hover:via-purple-700 hover:to-violet-800',
    bgLight: 'bg-violet-500/10 dark:bg-violet-500/10',
    borderSelected: 'border-violet-500',
    textAccent: 'text-violet-600 dark:text-violet-400',
    desembolsoCard:
      'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso:
      'bg-violet-900/40 border border-violet-400/40 text-white/90',
    metodoBg: 'bg-violet-500',
    inputFocusBorder: 'focus:border-violet-500 dark:focus:border-violet-400',
    inputFocusRing: 'focus:ring-2 focus:ring-violet-500/20',
    inputFocusWithin:
      'focus-within:border-violet-500 dark:focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20',
  },
  // cyan/blue — igual que el botón de la tarjeta
  Leasing: {
    gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
    gradientHover: 'hover:from-cyan-700 hover:via-blue-700 hover:to-cyan-800',
    bgLight: 'bg-cyan-500/10 dark:bg-cyan-500/10',
    borderSelected: 'border-cyan-500',
    textAccent: 'text-cyan-600 dark:text-cyan-400',
    desembolsoCard:
      'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700',
    headerBadgeAbono: 'bg-white/20 border border-white/30 text-white',
    headerBadgeDesembolso:
      'bg-cyan-900/40 border border-cyan-400/40 text-white/90',
    metodoBg: 'bg-cyan-500',
    inputFocusBorder: 'focus:border-cyan-500 dark:focus:border-cyan-400',
    inputFocusRing: 'focus:ring-2 focus:ring-cyan-500/20',
    inputFocusWithin:
      'focus-within:border-cyan-500 dark:focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20',
  },
}

const DEFAULT_SCHEME = COLOR_SCHEMES['Cuota Inicial']

export function getColorScheme(tipo: string): ColorScheme {
  return COLOR_SCHEMES[tipo] ?? DEFAULT_SCHEME
}

// ─────────────────────────────────────────────────────────────────────────────
// Estilos generados del modal
// ─────────────────────────────────────────────────────────────────────────────

export function getModalStyles(scheme: ColorScheme, modo: ModoRegistro) {
  return {
    dialogContent:
      'sm:max-w-[560px] max-h-[90vh] p-0 gap-0 border-0 bg-white dark:bg-gray-900 overflow-hidden rounded-2xl flex flex-col',
    body: 'px-5 py-4 space-y-4 flex-1 min-h-0 overflow-y-auto',
    label:
      'text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1.5',
    input: `w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white ${scheme.inputFocusBorder} ${scheme.inputFocusRing} transition-all text-sm outline-none`,
    inputError:
      'w-full px-4 py-2.5 border-2 border-red-400 dark:border-red-600 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-400/20 transition-all text-sm outline-none',
    header: {
      container: `relative overflow-hidden bg-gradient-to-br ${scheme.gradient} px-5 py-4`,
      badge: `text-[10px] font-semibold px-2 py-0.5 rounded-full ${modo === 'desembolso' ? scheme.headerBadgeDesembolso : scheme.headerBadgeAbono}`,
      iconWrapper:
        'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0',
      infoCard:
        'bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 mt-3',
      selBtnActive:
        'text-xs px-2.5 py-1 rounded-lg bg-white/30 border border-white/60 text-white font-semibold',
      selBtnInactive:
        'text-xs px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all',
    },
    footer: {
      container:
        'flex gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0',
      cancelButton:
        'flex-1 h-11 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
      submitAbono: `flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${scheme.gradient} ${scheme.gradientHover} shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all`,
      submitDesembolso: `flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${scheme.gradient} ${scheme.gradientHover} shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all`,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────

export const METODO_PAGO_GRADIENTE: Record<string, string> = {
  Efectivo: 'from-green-500 to-emerald-500',
  Transferencia: 'from-blue-500 to-cyan-500',
  Cheque: 'from-purple-500 to-pink-500',
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
