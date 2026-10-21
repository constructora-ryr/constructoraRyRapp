/** Estilos compartidos de los visores de archivo (abonos, documentos) */

export const visorArchivoStyles = {
  // Sin backdrop-blur: es el mayor causante de lag al scrollear
  overlay: 'fixed inset-0 z-[9999] bg-slate-950/75',
  // Mobile: pantalla completa; desktop: margen con esquinas redondeadas
  modal:
    'fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 md:inset-6 md:rounded-2xl',

  header: {
    // El degradado lo pone cada visor
    container:
      'relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden bg-gradient-to-r px-4 py-3.5 sm:px-6',
    glow: 'pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl',
    left: 'relative flex min-w-0 flex-1 items-center gap-3',
    iconWrap:
      'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-white ring-1 ring-white/30',
    title:
      'truncate text-lg font-bold tabular-nums text-white drop-shadow-sm sm:text-xl',
    subtitle: 'truncate text-sm text-white/80',
    actions: 'relative flex flex-shrink-0 flex-wrap items-center gap-2',
    btnClose:
      'flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white transition-all hover:bg-white/30',
  },

  // Botones de acción del encabezado (los usa cada visor)
  accion: {
    btn: 'inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/30 disabled:opacity-50',
    btnDanger:
      'inline-flex items-center gap-1.5 rounded-xl border border-red-300/40 bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-600/90',
    label: 'hidden sm:inline',
    insignia:
      'inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-white/40 bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white',
  },

  // Mobile: columna con scroll (archivo arriba, datos abajo); desktop: fila
  body: 'flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden',

  // Panel lateral de datos
  sidebar: {
    container:
      'w-full flex-shrink-0 space-y-4 border-t border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-900 md:w-[22rem] md:overflow-y-auto md:border-l md:border-t-0',
    sectionTitle:
      'mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400',
    card: 'rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60',
    row: 'flex items-center gap-3 py-2',
    rowIcon:
      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
    rowLabel:
      'text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
    rowValue: 'text-sm font-semibold text-slate-900 dark:text-white',
    divider: 'border-t border-slate-100 dark:border-slate-700/60',
  },
} as const
