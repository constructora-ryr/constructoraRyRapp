/**
 * Estilos para DescuentoModal
 * Modal para aplicar/modificar descuento en negociación
 */

export const descuentoModalStyles = {
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm',
  container:
    'relative w-full max-w-lg mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900',

  // Header
  header: {
    container:
      'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 px-5 py-4',
    title: 'text-lg font-bold text-white',
    subtitle: 'mt-0.5 text-xs text-cyan-100',
    closeButton:
      'absolute right-3 top-3 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white',
  },

  // Body
  body: {
    container: 'space-y-4 px-5 py-4',
    label: 'mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400',
    input:
      'w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-cyan-400',
    select:
      'w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-cyan-400',
    textarea:
      'w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-cyan-400',
    error: 'mt-1 text-xs font-medium text-red-500 dark:text-red-400',
  },

  // Preview financiero
  preview: {
    container:
      'rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50',
    row: 'flex items-center justify-between py-1',
    label: 'text-xs text-gray-500 dark:text-gray-400',
    value: 'text-sm font-bold tabular-nums text-gray-900 dark:text-white',
    valueDanger:
      'text-sm font-bold tabular-nums text-red-600 dark:text-red-400',
    valueSuccess:
      'text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400',
    separator:
      'my-1 border-t border-dashed border-gray-200 dark:border-gray-700',
  },

  // Footer
  footer: {
    container:
      'flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700/50',
    cancelButton:
      'rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800',
    submitButton:
      'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50',
    removeButton:
      'mr-auto inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40',
  },
} as const
