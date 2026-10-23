/**
 * 🎨 ESTILOS CENTRALIZADOS - SELECCIÓN DE CLIENTE
 *
 * Sistema de diseño premium con glassmorphism para la vista de selección de cliente.
 * Inspirado en el diseño moderno de la lista de abonos.
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes vibrantes (blue→indigo→purple, orange→amber)
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Shadows premium con tints de color
 */

export const seleccionClienteStyles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6',
  },

  // 🎨 HEADER HERO
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-800 dark:via-purple-900 dark:to-indigo-900 p-6 shadow-2xl shadow-violet-500/20',
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
    subtitle: 'text-violet-100 dark:text-violet-200 text-xs',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
  },

  // 📊 MÉTRICAS (4 cards)
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    card: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-lg hover:shadow-2xl transition-all duration-300',
    cardGlow:
      'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center gap-3',
    iconCircle:
      'w-8 h-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0',
    icon: 'w-4 h-4 text-white',
    textGroup: 'flex-1 min-w-0',
    value: 'text-base font-bold text-gray-900 dark:text-gray-100 leading-tight',
    label: 'text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium',
  },

  // 🔍 BÚSQUEDA + FILTROS
  search: {
    container:
      'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl shadow-violet-500/10 space-y-3',
    // Fila 1: input principal
    inputWrapper: 'relative',
    iconLeft:
      'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    input:
      'w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    clearButton:
      'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer',
    clearIcon: 'w-3 h-3 text-gray-600 dark:text-gray-400',
    // Fila 2: controles (proyecto + ordenar)
    controlsRow: 'flex flex-wrap items-center gap-2',
    controlGroup: 'flex items-center gap-1.5 flex-1 min-w-0',
    controlIcon: 'w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0',
    selectWrapper: 'relative flex-1 min-w-0',
    select:
      'w-full appearance-none pl-3 pr-6 py-1.5 bg-white dark:bg-gray-900/60 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all',
    selectActive:
      'border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300',
    selectIcon:
      'absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none',
    divider: 'w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0',
    // Footer
    footer:
      'flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/70',
    resultCount: 'text-xs text-gray-500 dark:text-gray-400 font-medium',
    resumenLine: 'hidden lg:flex items-center gap-1.5 text-xs',
    resumenSep: 'text-gray-300 dark:text-gray-600 mx-0.5',
  },

  // 💳 CLIENTE ROW (lista compacta)
  card: {
    container:
      'group flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors duration-150 cursor-pointer',
    avatarCircle:
      'w-9 h-9 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center shadow-sm self-center',
    avatarInitials: 'text-white text-xs font-bold leading-none',
    clienteInfo: 'flex-1 min-w-0',
    clienteNombre:
      'text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight',
    clienteCC: 'text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5',
    clienteUbicacion:
      'flex items-center gap-1 mt-0.5 text-xs text-gray-500 dark:text-gray-400 min-w-0',
    ubicacionSep: 'text-gray-300 dark:text-gray-600 text-xs mx-0.5',
    badgeIcon: 'w-3 h-3 flex-shrink-0',
    progressWrapper: 'hidden sm:flex items-center gap-2 flex-shrink-0 w-40',
    progressBar:
      'flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    progressFill:
      'h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full',
    progressPercent:
      'text-xs font-bold text-violet-600 dark:text-violet-400 w-7 text-right tabular-nums',
    financieroSection: 'hidden lg:flex items-center gap-4 flex-shrink-0',
    metricGroup: 'text-right w-32',
    metricLabel: 'text-xs text-gray-400 dark:text-gray-500',
    metricValue: 'text-xs font-bold tabular-nums',
    arrowIcon:
      'w-4 h-4 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all flex-shrink-0',
  },

  // 🎭 EMPTY STATE
  empty: {
    container: 'text-center py-16',
    iconWrapper: 'relative inline-block mb-6',
    iconCircle:
      'w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center mx-auto',
    icon: 'w-12 h-12 text-violet-500 dark:text-violet-400',
    iconGlow: 'absolute inset-0 blur-3xl bg-violet-500/20 rounded-full',
    title: 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2',
    description: 'text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto',
  },

  // ⏳ LOADING STATE
  loading: {
    container: 'space-y-6',
    headerSkeleton:
      'h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl animate-pulse',
    metricsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    metricSkeleton:
      'h-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    searchSkeleton:
      'h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
    cardSkeleton:
      'h-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse',
  },

  // 🎨 GRADIENTES Y COLORES
  gradients: {
    primary: 'from-violet-600 via-purple-600 to-indigo-600',
    secondary: 'from-orange-500 to-amber-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-orange-600 to-amber-600',
    danger: 'from-red-500 to-rose-600',
    muted: 'from-gray-500 to-slate-600',
  },
}

/**
 * 🎨 Colores para iconos de métricas
 */
export const metricasIconColors = {
  clientes: {
    gradient: 'from-violet-500 to-purple-600',
    textGradient: 'from-violet-600 via-purple-600 to-indigo-600',
    glowColor: 'from-violet-500/20 to-purple-500/20',
  },
  abonado: {
    gradient: 'from-green-500 to-emerald-600',
    textGradient:
      'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
    glowColor: 'from-green-500/20 to-emerald-500/20',
  },
  ventas: {
    gradient: 'from-purple-500 to-pink-600',
    textGradient: 'from-purple-600 via-pink-600 to-rose-600',
    glowColor: 'from-purple-500/20 to-pink-500/20',
  },
  pendiente: {
    gradient: 'from-orange-500 to-amber-600',
    textGradient:
      'from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-amber-800',
    glowColor: 'from-orange-500/20 to-amber-500/20',
  },
}

/**
 * 🎨 Colores para avatares de clientes (basado en iniciales)
 */
export const avatarGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-green-500 to-emerald-600',
  'from-red-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-yellow-500 to-orange-600',
  'from-teal-500 to-cyan-600',
]

/**
 * 🎯 Función helper para obtener gradient de avatar basado en nombre
 */
export const getAvatarGradient = (nombre: string): string => {
  const index = nombre.charCodeAt(0) % avatarGradients.length
  return avatarGradients[index]
}
