/**
 * Estilos de las modales de pago (registrar y editar abono).
 *
 * El color sale del token configurado para cada tipo de fuente en
 * /admin/fuentes-pago. Todas las clases son strings literales completos:
 * Tailwind JIT purga las que se arman con variables.
 */

export type ColorScheme = {
  /** Degradado del encabezado y del botón principal */
  gradient: string
  /** Color sólido (barra de progreso, puntos) */
  solid: string
  /** Texto de acento, con modo oscuro */
  text: string
  /** Tarjeta suave del color (fondo + anillo) */
  soft: string
  /** Sombra del botón principal */
  shadow: string
  /** Foco de inputs */
  focus: string
  /** Foco de un contenedor con input dentro */
  focusWithin: string
}

const ESQUEMAS: Record<string, ColorScheme> = {
  blue: {
    gradient: 'from-blue-600 via-indigo-600 to-blue-700',
    solid: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    soft: 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-500/30',
    shadow: 'shadow-blue-500/30',
    focus:
      'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400',
    focusWithin:
      'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:border-blue-400',
  },
  indigo: {
    gradient: 'from-indigo-600 via-blue-600 to-indigo-700',
    solid: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    soft: 'bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:ring-indigo-500/30',
    shadow: 'shadow-indigo-500/30',
    focus:
      'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:border-indigo-400',
    focusWithin:
      'focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:focus-within:border-indigo-400',
  },
  purple: {
    gradient: 'from-violet-600 via-purple-600 to-violet-700',
    solid: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    soft: 'bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/30',
    shadow: 'shadow-violet-500/30',
    focus:
      'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:focus:border-violet-400',
    focusWithin:
      'focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 dark:focus-within:border-violet-400',
  },
  pink: {
    gradient: 'from-pink-600 via-rose-600 to-pink-700',
    solid: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
    soft: 'bg-pink-50 ring-1 ring-pink-200 dark:bg-pink-500/10 dark:ring-pink-500/30',
    shadow: 'shadow-pink-500/30',
    focus:
      'focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:border-pink-400',
    focusWithin:
      'focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500/20 dark:focus-within:border-pink-400',
  },
  emerald: {
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    solid: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    soft: 'bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30',
    shadow: 'shadow-emerald-500/30',
    focus:
      'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:border-emerald-400',
    focusWithin:
      'focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:focus-within:border-emerald-400',
  },
  green: {
    gradient: 'from-green-600 via-emerald-600 to-green-700',
    solid: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    soft: 'bg-green-50 ring-1 ring-green-200 dark:bg-green-500/10 dark:ring-green-500/30',
    shadow: 'shadow-green-500/30',
    focus:
      'focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:focus:border-green-400',
    focusWithin:
      'focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 dark:focus-within:border-green-400',
  },
  cyan: {
    gradient: 'from-cyan-600 via-blue-600 to-cyan-700',
    solid: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    soft: 'bg-cyan-50 ring-1 ring-cyan-200 dark:bg-cyan-500/10 dark:ring-cyan-500/30',
    shadow: 'shadow-cyan-500/30',
    focus:
      'focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:focus:border-cyan-400',
    focusWithin:
      'focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 dark:focus-within:border-cyan-400',
  },
  orange: {
    gradient: 'from-orange-600 via-amber-600 to-orange-700',
    solid: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    soft: 'bg-orange-50 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:ring-orange-500/30',
    shadow: 'shadow-orange-500/30',
    focus:
      'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400',
    focusWithin:
      'focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 dark:focus-within:border-orange-400',
  },
  red: {
    gradient: 'from-red-600 via-rose-600 to-red-700',
    solid: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    soft: 'bg-red-50 ring-1 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/30',
    shadow: 'shadow-red-500/30',
    focus:
      'focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:focus:border-red-400',
    focusWithin:
      'focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 dark:focus-within:border-red-400',
  },
  yellow: {
    gradient: 'from-yellow-600 via-amber-600 to-yellow-700',
    solid: 'bg-yellow-500',
    text: 'text-yellow-600 dark:text-yellow-400',
    soft: 'bg-yellow-50 ring-1 ring-yellow-200 dark:bg-yellow-500/10 dark:ring-yellow-500/30',
    shadow: 'shadow-yellow-500/30',
    focus:
      'focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 dark:focus:border-yellow-400',
    focusWithin:
      'focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 dark:focus-within:border-yellow-400',
  },
}

/** Color por defecto de cada tipo de fuente cuando no se usa la config de BD */
const TOKEN_POR_TIPO: Record<string, string> = {
  'Cuota Inicial': 'emerald',
  'Crédito Hipotecario': 'blue',
  'Subsidio Mi Casa Ya': 'purple',
  'Subsidio Caja Compensación': 'pink',
  'Crédito con la Constructora': 'purple',
  Leasing: 'cyan',
}

export function getColorSchemeByToken(colorToken: string): ColorScheme {
  return ESQUEMAS[colorToken] ?? ESQUEMAS.emerald
}

export function getColorScheme(tipo: string): ColorScheme {
  return getColorSchemeByToken(TOKEN_POR_TIPO[tipo] ?? 'emerald')
}

export function getModalStyles(scheme: ColorScheme) {
  const inputBase =
    'w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 dark:bg-gray-800/80 dark:text-white dark:placeholder:text-gray-500'
  return {
    dialogContent:
      'flex max-h-[92vh] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 sm:max-w-[560px] dark:bg-gray-900',
    body: 'min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5',
    label:
      'mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100',
    hint: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
    opcional: 'text-xs font-normal text-gray-500 dark:text-gray-400',
    input: `${inputBase} border-gray-200 dark:border-gray-700 ${scheme.focus}`,
    inputError: `${inputBase} border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-red-600`,
    error:
      'mt-1 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400',
    header: {
      container: `relative flex-shrink-0 overflow-hidden bg-gradient-to-br ${scheme.gradient} px-4 py-4 sm:px-5`,
      iconWrapper:
        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-xl',
      chip: 'rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/30',
    },
    footer: {
      container:
        'flex flex-shrink-0 gap-3 border-t border-gray-200 px-4 py-3 sm:px-5 dark:border-gray-800',
      cancelButton:
        'h-11 flex-1 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
      submit: `inline-flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${scheme.gradient} text-sm font-semibold text-white shadow-lg ${scheme.shadow} transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`,
    },
  }
}

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
