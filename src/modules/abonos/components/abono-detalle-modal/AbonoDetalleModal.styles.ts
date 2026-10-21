export const abonoDetalleStyles = {
  // Overlay — sin backdrop-blur: es el mayor causante de lag al scrollear
  // (obliga al GPU a re-renderizar toda la app en cada frame de scroll)
  overlay: 'fixed inset-0 z-[9999] bg-slate-950/75',

  // Contenedor del modal
  // Mobile: full-screen (sin margen, sin rounded — el PDF necesita todo el espacio)
  // Desktop: inset-6 con rounded-2xl — muestra el backdrop alrededor (patrón modal moderno)
  modal:
    'fixed inset-0 md:inset-6 z-[10000] flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl md:rounded-2xl',

  // ─── Header ──────────────────────────────────────────────────────────────
  // El degradado (color de la fuente o rojo si está anulado) se agrega en el componente
  header: {
    container:
      'relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 overflow-hidden bg-gradient-to-r px-4 py-3.5 sm:px-6',
    anulado: 'from-red-700 via-red-600 to-rose-600',
    glow: 'pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl',
    left: 'relative flex min-w-0 flex-1 items-center gap-3',
    iconWrap:
      'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30',
    title:
      'truncate text-lg font-bold tabular-nums text-white drop-shadow-sm sm:text-xl',
    subtitle: 'truncate text-sm text-white/80',
    badgeEstado:
      'inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white',
    actions: 'relative flex flex-shrink-0 flex-wrap items-center gap-2',
    btn: 'inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/30 disabled:opacity-50',
    btnLabel: 'hidden sm:inline',
    btnDanger:
      'inline-flex items-center gap-1.5 rounded-xl border border-red-300/40 bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-600/90',
    btnClose:
      'flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white transition-all hover:bg-white/30',
    nav: 'flex items-center gap-0.5 rounded-xl border border-white/30 bg-white/10 p-0.5',
    navBtn:
      'flex h-7 w-7 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent',
    navLabel:
      'min-w-[4.5rem] px-1 text-center text-[11px] font-semibold tabular-nums text-white/90',
  },

  // ─── Layout split ─────────────────────────────────────────────────────────
  // Mobile: flex-col con scroll (comprobante arriba, datos abajo)
  // Desktop: flex-row (comprobante izquierda, panel derecho fijo)
  body: 'flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden',

  // Panel izquierdo: comprobante — lightbox
  preview: {
    container:
      'relative min-h-[55vh] flex-shrink-0 overflow-hidden bg-slate-950 md:min-h-0 md:flex-1 md:flex-shrink',
    // Retícula de puntos sutil sobre el fondo oscuro
    grid: 'pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:22px_22px]',
    iframe: 'absolute inset-0 h-full w-full border-0 bg-white',
    // Imagen: margen para que respire y espacio abajo para la barra
    imgWrapper: 'absolute inset-4 bottom-20 touch-none',
    placeholder:
      'absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center',
    placeholderIcon:
      'flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-slate-700',
    errorIcon:
      'flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/30',
    placeholderTitle: 'text-base font-semibold text-slate-200',
    placeholderSub: 'max-w-xs text-xs text-slate-400',
    errorBtnPrimary:
      'inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:brightness-110',
    errorBtn:
      'inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700',
    // Barra de herramientas flotante (vidrio oscuro)
    toolbar:
      'absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-white/10 bg-slate-900/80 p-1 shadow-2xl backdrop-blur-md',
    toolBtn:
      'flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent',
    toolSep: 'mx-1 h-5 w-px bg-white/15',
  },

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
