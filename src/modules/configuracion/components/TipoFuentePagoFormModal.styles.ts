/**
 * Estilos: TipoFuentePagoFormModal
 */

export const tipoFuentePagoFormModalStyles = {
  backdrop: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  backdropOverlay: 'absolute inset-0 bg-black/60 backdrop-blur-sm',

  modal:
    'relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden',

  header: {
    container:
      'flex-shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl',
    left: 'flex items-center gap-3',
    preview:
      'h-10 w-10 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/30 flex-shrink-0',
    title: 'text-lg font-bold text-white leading-tight',
    subtitle: 'text-xs text-white/70 mt-0.5 leading-tight',
    closeButton:
      'p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 flex-shrink-0',
    closeIcon: 'w-5 h-5 text-white',
  },

  form: {
    container: 'flex flex-col flex-1 min-h-0',
    scrollBody: 'flex-1 overflow-y-auto p-6 space-y-6',
    section: 'space-y-4',
    sectionTitle:
      'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
  },

  input: {
    container: 'space-y-1.5',
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
    required: 'text-red-500',
    hint: 'ml-2 text-xs text-gray-400',
    field:
      'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 outline-none text-sm',
    fieldMono:
      'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 font-mono outline-none text-sm',
    textarea:
      'w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 resize-none outline-none text-sm',
    error:
      'mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1',
    errorIcon: 'w-3.5 h-3.5 flex-shrink-0',
  },

  checkbox: {
    container:
      'flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer',
    field:
      'w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 flex-shrink-0',
    fieldActive:
      'w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/20 flex-shrink-0',
    labelContainer: 'flex-1 min-w-0',
    label: 'text-sm font-medium text-gray-900 dark:text-white',
    description: 'text-xs text-gray-500 dark:text-gray-400',
  },

  grid: {
    twoColumns: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
    threeColumns: 'grid grid-cols-1 sm:grid-cols-3 gap-3',
  },

  colorPicker: {
    wrapper: 'flex flex-wrap gap-2.5 mt-2',
    swatch: (selected: boolean) =>
      `h-8 w-8 rounded-full transition-all duration-150 ${
        selected
          ? 'ring-[3px] ring-offset-2 ring-gray-700 dark:ring-white scale-110 shadow-md'
          : 'opacity-60 hover:opacity-90 hover:scale-105'
      }`,
  },

  iconPicker: {
    wrapper: 'grid grid-cols-5 gap-2 mt-2',
    item: (selected: boolean) =>
      `flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all duration-150 ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/40'
      }`,
    label: 'text-[10px] font-medium leading-tight text-center',
  },

  preview: {
    wrapper:
      'flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 px-4 py-3 mt-3',
    iconWrap:
      'h-10 w-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0',
    name: 'text-sm font-semibold text-gray-900 dark:text-white',
    meta: 'text-xs mt-0.5',
  },

  divider: 'border-t border-gray-100 dark:border-gray-800',

  infoBox:
    'rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/30 px-4 py-3',

  actions: {
    container:
      'flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800',
    cancelButton:
      'px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50',
    submitButton:
      'px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm',
    icon: 'w-4 h-4',
    iconSpin: 'w-4 h-4 animate-spin',
  },
} as const
