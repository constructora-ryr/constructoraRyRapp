/**
 * Estilos de Asignar vivienda (también los usa Traslado de vivienda para las
 * fuentes de pago). Paleta del módulo Clientes: cyan → blue → indigo.
 * Textos de 12 px como mínimo y con contraste legible en claro y oscuro.
 */

export const styles = {
  // ──────────────────────────────
  // FORM / FIELDS
  // ──────────────────────────────
  field: {
    label:
      'block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5',
    labelSr: 'sr-only',
    labelWithIcon:
      'flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5',
    labelIcon: 'w-3.5 h-3.5',
    input:
      'w-full bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all',
    inputMono:
      'w-full bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm font-[family-name:var(--font-jakarta)] tabular-nums placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all',
    select:
      'w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white',
    textarea:
      'w-full bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none',
    error:
      'text-red-600 dark:text-red-400 text-xs flex items-center gap-1 mt-1.5',
    hint: 'text-xs text-gray-500 dark:text-gray-400 mt-1',
    prefix:
      'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-mono pointer-events-none select-none',
    inputWithPrefix: 'pl-6',
    grid2: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    grid3: 'grid grid-cols-3 gap-2',
    selectWrapper: 'relative',
    selectArrow:
      'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    row: 'flex items-center justify-between py-3',
    divider: 'border-t border-gray-200 dark:border-gray-700 my-4',
  },

  // ──────────────────────────────
  // SWITCH
  // ──────────────────────────────
  switch: {
    track: (on: boolean) =>
      `relative w-10 h-5 rounded-full transition-colors duration-200 ${on ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30' : 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'} shrink-0`,
    thumb: (on: boolean) =>
      `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`,
  },

  // ──────────────────────────────
  // SECCIÓN ② — FUENTES
  // ──────────────────────────────
  fuentes: {
    fuenteContent: 'space-y-3',
  },

  // ──────────────────────────────
  // MISC
  // ──────────────────────────────
  datoBadge:
    'text-[11px] font-semibold border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-md ml-1.5',
  charCounter: 'text-xs text-gray-500 dark:text-gray-400 text-right mt-0.5',
} as const
