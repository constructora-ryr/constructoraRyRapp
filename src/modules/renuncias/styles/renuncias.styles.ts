/**
 * 🎨 ESTILOS CENTRALIZADOS - RENUNCIAS
 *
 * Basado en el estándar compacto (viviendas).
 * Color principal: Rojo/Rosa/Pink
 */

export const renunciasStyles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',
  },

  // 🎨 HEADER HERO
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800 p-6 shadow-2xl shadow-red-500/20',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    topRow: 'flex items-center justify-between',
    titleGroup: 'flex items-center gap-3',
    iconCircle:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    titleWrapper: 'space-y-0.5',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-red-100 dark:text-red-200 text-xs',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
    buttonGroup: 'flex items-center gap-2',
    button:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg',
  },

  // 📊 MÉTRICAS
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    card: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-lg hover:shadow-2xl transition-all duration-300',
    cardGlow:
      'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center gap-3',
    iconCircle: 'w-8 h-8 rounded-lg flex items-center justify-center shadow-md',
    icon: 'w-4 h-4 text-white',
    textGroup: 'flex-1',
    value: 'text-lg font-bold bg-gradient-to-br bg-clip-text text-transparent',
    label: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium',
  },

  // 🔍 FILTROS
  filtros: {
    container:
      'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-red-500/10',
    searchWrapper: 'relative flex-1',
    searchIcon:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    searchInput:
      'w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    grid: 'flex items-center gap-2',
    label: 'sr-only',
    select:
      'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm min-w-[180px]',
    footer:
      'flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700',
    resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
    clearButton:
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20',
  },

  // 📋 LISTA
  lista: {
    container: 'space-y-4',
    grid: 'grid grid-cols-1 gap-4',
  },

  // 💳 CARD
  card: {
    container:
      'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300',
    borderPendiente: 'border-l-4 border-l-yellow-500',
    borderCerrada: 'border-l-4 border-l-green-500',
    topRow: 'flex items-start justify-between gap-3',
    clienteNombre: 'text-sm font-bold text-gray-900 dark:text-white',
    clienteDocumento: 'text-xs text-gray-500 dark:text-gray-400',
    badge: {
      pendiente:
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium',
      cerrada:
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium',
    },
    infoGrid: 'grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3',
    infoItem: 'flex flex-col',
    infoLabel: 'text-xs text-gray-500 dark:text-gray-400',
    infoValue: 'text-sm font-semibold text-gray-900 dark:text-white',
    montoDevolver: 'text-sm font-bold text-red-600 dark:text-red-400',
    motivoTruncado:
      'text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1',
    actions:
      'flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700',
    actionButton:
      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
    actionPrimary:
      'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30',
    actionSecondary:
      'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
  },

  // 🎭 EMPTY STATE
  empty: {
    container: 'text-center py-16',
    iconWrapper: 'relative inline-block mb-6',
    iconCircle:
      'w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/10 to-rose-500/10 flex items-center justify-center mx-auto',
    icon: 'w-12 h-12 text-red-500 dark:text-red-400',
    title: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description:
      'text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6',
  },

  // ⏳ LOADING STATE
  loading: {
    container: 'space-y-6',
    headerSkeleton:
      'h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl animate-pulse',
    metricsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    metricSkeleton:
      'h-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    filtrosSkeleton:
      'h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    cardSkeleton:
      'h-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
  },
}

/** Colores para iconos de métricas */
export const metricasIconColors = {
  total: {
    bg: 'bg-gradient-to-br from-red-500 to-rose-600',
    shadow: 'shadow-red-500/50',
    value:
      'from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800',
    glow: 'from-red-500/20 to-rose-500/20',
  },
  pendientes: {
    bg: 'bg-gradient-to-br from-yellow-500 to-amber-600',
    shadow: 'shadow-yellow-500/50',
    value: 'from-yellow-600 via-amber-600 to-orange-600',
    glow: 'from-yellow-500/20 to-amber-500/20',
  },
  cerradas: {
    bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    shadow: 'shadow-green-500/50',
    value:
      'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
    glow: 'from-green-500/20 to-emerald-500/20',
  },
  devuelto: {
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/50',
    value:
      'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800',
    glow: 'from-blue-500/20 to-indigo-500/20',
  },
}
