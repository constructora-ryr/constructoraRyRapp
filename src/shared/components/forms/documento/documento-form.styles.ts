/** Clases compartidas por las secciones del formulario de documento */

export const documentoFormStyles = {
  etiqueta:
    'mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300',
  campo:
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:bg-slate-900/60 dark:text-white dark:disabled:bg-slate-800',
  campoNormal: 'border-slate-200 dark:border-slate-700',
  campoError: 'border-rose-400 focus:ring-rose-200 dark:border-rose-500/60',
  ayuda: 'mt-1 text-xs text-slate-500 dark:text-slate-400',
  error:
    'mt-1 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400',
} as const
