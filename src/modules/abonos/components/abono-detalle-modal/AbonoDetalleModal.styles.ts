/**
 * Estilos propios del visor de abonos. La carcasa (overlay, encabezado,
 * cuerpo) y la vista previa son compartidas: @/shared/components/visor-archivo
 */
export const abonoDetalleStyles = {
  // Degradado del encabezado cuando el abono está anulado
  headerAnulado: 'from-red-700 via-red-600 to-rose-600',

  // Panel derecho: información
  sidebar: {
    container:
      'w-full flex-shrink-0 space-y-4 border-t border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-900 md:w-[22rem] md:overflow-y-auto md:border-l md:border-t-0',
    sectionTitle:
      'mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500',
    card: 'rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60',
    cardLink:
      'group block rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-violet-500/50',
    // Monto destacado con el degradado de la fuente
    hero: 'relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg',
    heroMonto: 'text-3xl font-black tabular-nums tracking-tight',
    heroChip:
      'inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-[11px] font-bold ring-1 ring-white/30',
    row: 'flex items-center gap-3 py-2',
    rowIcon:
      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
    rowLabel:
      'text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500',
    rowValue: 'text-sm font-semibold text-slate-900 dark:text-white',
    rowValueSub: 'text-xs text-slate-500 dark:text-slate-400',
    divider: 'border-t border-slate-100 dark:border-slate-700/60',
    copyBtn:
      'ml-auto flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200',
    avatar:
      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm',
    chipVivienda:
      'inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20',
    footer:
      'flex items-center gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-400 dark:border-slate-700 dark:text-slate-500',
  },
} as const
