/** Clases compartidas por las secciones de Mi perfil */
export const estilos = {
  tarjeta:
    'rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60',
  cabecera: 'border-b border-slate-100 px-5 py-4 dark:border-slate-700/60',
  titulo: 'text-base font-semibold text-slate-900 dark:text-white',
  subtitulo: 'mt-0.5 text-sm text-slate-500 dark:text-slate-400',
  etiqueta:
    'mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300',
  campo:
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-slate-600 dark:disabled:bg-slate-900/30',
  botonPrincipal:
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
  botonSecundario:
    'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
} as const
