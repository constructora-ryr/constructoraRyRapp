/**
 * Estilos centralizados para la vista de listado de abonos.
 * Todos los strings de Tailwind > 80 chars viven aquí.
 */

export const abonosListaStyles = {
  // ─── Contenedor ────────────────────────────────────────────────────────────
  page: 'min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900',
  content: 'mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8',

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    wrapper:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 shadow-2xl shadow-violet-500/20 dark:from-violet-700 dark:via-purple-700 dark:to-indigo-800',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    iconCircle:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm',
    badge:
      'inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md',
    btn: 'inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30',
  },

  // ─── Métricas ──────────────────────────────────────────────────────────────
  metricas: {
    grid: 'grid grid-cols-2 gap-3 lg:grid-cols-4',
    card: 'group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80',
    cardGlow:
      'absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
    iconCircle:
      'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30',
    value:
      'truncate bg-gradient-to-br from-violet-600 to-purple-700 bg-clip-text text-xl font-bold text-transparent',
    label: 'mt-0.5 text-xs font-medium text-gray-600 dark:text-gray-400',
  },

  // ─── Filtros sticky ────────────────────────────────────────────────────────
  filtros: {
    container:
      'sticky top-4 z-40 rounded-xl border border-gray-200/50 bg-white/90 p-4 shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90',
    searchWrapper: 'relative flex-1',
    searchIcon:
      'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500',
    searchInput:
      'w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-900/50',
    select:
      'rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-900/50',
    pillActivo:
      'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700',
    pillAnulado:
      'bg-red-100 text-red-700 ring-1 ring-red-300 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-700',
    pillRenunciado:
      'bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-700',
    pillOff: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
    limpiarBtn:
      'text-xs font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300',
  },

  // ─── Tabla ────────────────────────────────────────────────────────────────
  tabla: {
    wrapper:
      'overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
    thead:
      'border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60',
    th: 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
    thRight:
      'px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400',
    tbody: '',
  },

  // ─── Fila ─────────────────────────────────────────────────────────────────
  fila: {
    base: 'cursor-pointer border-l-[3px] border-b border-b-gray-100 transition-colors dark:border-b-gray-800',
    activo:
      'border-l-emerald-500 hover:bg-violet-50/40 dark:hover:bg-violet-950/10',
    anulado: 'border-l-red-400 opacity-60 hover:opacity-75 dark:bg-red-950/5',
    renuncia:
      'border-l-amber-400 bg-amber-50/30 hover:bg-amber-50/60 dark:bg-amber-950/10 dark:hover:bg-amber-950/20',
    reciboBadge:
      'inline-flex items-center rounded-md border border-violet-300/70 px-2 py-0.5 font-mono text-xs font-semibold text-violet-600 dark:border-violet-700/60 dark:text-violet-400',
    fecha: 'mt-1.5 text-xs text-gray-400 dark:text-gray-500',
    clienteNombre:
      'font-semibold leading-tight text-gray-900 dark:text-gray-100',
    clienteNombreAnulado:
      'font-semibold leading-tight text-gray-400 dark:text-gray-500',
    clienteCC: 'mt-0.5 text-xs text-gray-400 dark:text-gray-500',
    viviendaNombre:
      'font-medium leading-tight text-gray-800 dark:text-gray-200',
    viviendaNombreAnulado:
      'font-medium leading-tight text-gray-400 dark:text-gray-500',
    fuentePill:
      'inline-flex items-center rounded border border-slate-200 px-1.5 py-px text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400',
    metodoCell: 'px-4 py-3',
    metodoBadge:
      'inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400',
    montoActivo:
      'font-mono text-base font-bold tabular-nums text-violet-700 dark:text-violet-400',
    montoAnuladoLabel:
      'block text-[10px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400',
    montoAnulado:
      'font-mono font-bold tabular-nums text-gray-300 line-through dark:text-gray-600',
    montoRenunciaLabel:
      'block text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400',
    montoRenuncia:
      'font-mono font-bold tabular-nums text-gray-500 dark:text-gray-400',
    actionBtn:
      'inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition-colors dark:bg-gray-700/50',
    editBtn:
      'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
    anularBtn:
      'hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400',
  },

  // ─── Paginación ────────────────────────────────────────────────────────────
  paginacion: {
    wrapper:
      'flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700',
    info: 'text-xs text-gray-500 dark:text-gray-400',
    infoHighlight: 'font-semibold text-gray-700 dark:text-gray-300',
    sizeSelect:
      'rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
    navBtn:
      'inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
    pageBtn:
      'min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
    pageBtnActive: 'bg-violet-600 text-white shadow-sm',
    pageBtnInactive:
      'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
    ellipsis: 'px-1 text-xs text-gray-400 dark:text-gray-600',
  },
} as const
