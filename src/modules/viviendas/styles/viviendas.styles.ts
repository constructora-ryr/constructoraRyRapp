/**
 * 🎨 ESTILOS CENTRALIZADOS - VIVIENDAS
 *
 * Sistema de diseño premium con glassmorphism basado en el módulo de Abonos.
 * Color principal: Naranja/Ámbar (para diferenciar de otros módulos)
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes vibrantes (naranja→ámbar→amarillo)
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Shadows premium con tints de color
 */

export const viviendasStyles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',
  },

  // 🎨 HEADER HERO (compacto)
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800 p-6 shadow-2xl shadow-orange-500/20',
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
    subtitle: 'text-orange-100 dark:text-orange-200 text-xs',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
    buttonGroup: 'flex items-center gap-2',
    button:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg',
  },

  // 📊 MÉTRICAS (5 cards - compactas)
  metricas: {
    grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3',
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

  // 🔍 FILTROS (compactos en una línea)
  filtros: {
    container:
      'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-orange-500/10',
    searchWrapper: 'relative flex-1',
    searchIcon:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    searchInput:
      'w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    grid: 'flex items-center gap-2',
    selectWrapper: 'relative',
    label: 'sr-only',
    select:
      'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm min-w-[180px]',
    footer:
      'flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700',
    resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
    clearButton:
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20',
  },

  // 💳 LISTA DE VIVIENDAS (las cards individuales NO se tocan)
  lista: {
    container: 'space-y-4',
    grid: 'grid grid-cols-1 gap-4',
  },

  // 🎭 EMPTY STATE
  empty: {
    container: 'text-center py-16',
    iconWrapper: 'relative inline-block mb-6',
    iconCircle:
      'w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 flex items-center justify-center mx-auto',
    icon: 'w-12 h-12 text-orange-500 dark:text-orange-400',
    iconGlow: 'absolute inset-0 blur-3xl bg-orange-500/20 rounded-full',
    title: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description:
      'text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6',
    button:
      'inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/30',
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

  // 🎭 MODAL (si aplica - mantener modal de eliminación)
  modal: {
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
    container: 'fixed inset-0 flex items-center justify-center z-50 p-4',
    content: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full',
    header: 'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    body: 'px-6 py-4',
    footer:
      'px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3',
  },

  // 🗑️ MODAL DE ELIMINACIÓN
  deleteModal: {
    warning:
      'rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3',
    warningText: 'text-sm text-orange-800 dark:text-orange-200',
    actions: 'flex items-center justify-end gap-3',
    cancelButton:
      'px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    deleteButton:
      'px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30',
  },
}

/**
 * 🎨 Colores para iconos de métricas (Viviendas)
 */
export const metricasIconColors = {
  total: {
    gradient: 'from-orange-500 to-amber-600',
    textGradient: 'from-orange-600 via-amber-600 to-yellow-600',
    glowColor: 'from-orange-500/20 to-amber-500/20',
  },
  disponibles: {
    gradient: 'from-green-500 to-emerald-600',
    textGradient: 'from-green-600 via-emerald-600 to-teal-600',
    glowColor: 'from-green-500/20 to-emerald-500/20',
  },
  asignadas: {
    gradient: 'from-blue-500 to-indigo-600',
    textGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    glowColor: 'from-blue-500/20 to-indigo-500/20',
  },
  entregadas: {
    gradient: 'from-purple-500 to-pink-600',
    textGradient: 'from-purple-600 via-pink-600 to-rose-600',
    glowColor: 'from-purple-500/20 to-pink-500/20',
  },
}
