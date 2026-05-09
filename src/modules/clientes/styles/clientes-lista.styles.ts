/**
 * 🎨 ESTILOS CENTRALIZADOS - LISTA DE CLIENTES
 *
 * Sistema de diseño premium con glassmorphism para la vista de lista de clientes.
 * Identidad visual: Cyan→Blue (consistente con sidebar y detalle)
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes cyan→blue→indigo (identidad del módulo)
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Shadows premium con cyan tints
 */

export const clientesListaStyles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',
  },

  // 🎨 HEADER HERO (COMPACTO - CYAN/BLUE)
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 p-6 shadow-2xl shadow-cyan-500/20',
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
    subtitle: 'text-cyan-100 dark:text-cyan-200 text-xs',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
    button:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg',
  },

  // 🎈 FAB (Floating Action Button - Superior derecho)
  fab: {
    container: 'fixed top-6 right-6 z-50',
    button:
      'group relative overflow-hidden flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-600/60 hover:scale-110 transition-all duration-300',
    buttonGlow:
      'absolute inset-0 bg-gradient-to-r from-cyan-400 to-indigo-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity',
    buttonContent: 'relative z-10 flex items-center gap-2',
    icon: 'w-5 h-5',
    text: 'text-sm font-bold',
  },

  // 📊 MÉTRICAS (4 cards - COMPACTAS)
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

  // 🔍 FILTROS (COMPACTOS)
  filtros: {
    container:
      'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl shadow-cyan-500/10',
    grid: 'grid grid-cols-1 md:grid-cols-3 gap-3 mb-3',

    // Input de búsqueda (compacto)
    searchWrapper: 'relative',
    searchIconLeft:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    searchInput:
      'w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    clearButton:
      'absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer',
    clearIcon: 'w-3 h-3 text-gray-600 dark:text-gray-400',

    // Filtros de estado (radio buttons)
    estadoGroup: 'flex flex-wrap gap-2',
    estadoButton:
      'px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium cursor-pointer hover:scale-105',
    estadoButtonInactive:
      'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-cyan-400 dark:hover:border-cyan-600',
    estadoButtonActive:
      'border-cyan-500 dark:border-cyan-600 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30',

    // Select de origen (compacto)
    selectWrapper: 'relative',
    selectIconLeft:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    select:
      'w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-sm appearance-none cursor-pointer',
    selectIconRight:
      'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',

    // Footer (compacto)
    footer:
      'flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700',
    resultCount:
      'flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium',
    resultCountIcon: 'w-3.5 h-3.5',
    clearFiltersButton:
      'text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer',
  },

  // 💳 CLIENTE CARD (Modernizada)
  clienteCard: {
    // Container principal
    container:
      'group relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300',
    glow: 'absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300',

    // Header
    header: 'relative p-5 pb-4',
    headerActions: 'flex items-start justify-end gap-1.5 mb-3',
    actionButton:
      'p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all',
    actionIcon: 'w-4 h-4',

    // Avatar y título
    avatarSection: 'flex items-start gap-4 mb-3',
    avatar:
      'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
    avatarIcon: 'w-6 h-6 text-white',
    titleGroup: 'flex-1 min-w-0',
    nombre: 'text-lg font-bold text-gray-900 dark:text-white mb-1 truncate',
    documento: 'text-xs text-gray-500 dark:text-gray-400',

    // Badge estado
    badgeActivo:
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-md shadow-green-500/30',
    badgeInteresado:
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-500/30',
    badgeInactivo:
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-gray-500 to-slate-500 text-white text-xs font-bold shadow-md shadow-gray-500/30',

    // Sección vivienda
    viviendaSection:
      'mb-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200/50 dark:border-green-700/50 p-4',
    viviendaHeader:
      'flex items-center gap-2 mb-3 text-xs font-bold text-green-700 dark:text-green-400',
    viviendaIcon: 'w-4 h-4',
    viviendaInfo: 'space-y-2 text-sm',
    viviendaRow: 'flex items-center gap-2 text-gray-700 dark:text-gray-300',
    viviendaRowIcon: 'w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400',
    viviendaRowBetween: 'flex items-center justify-between',
    viviendaValor: 'font-bold text-green-600 dark:text-green-400 text-sm',

    // Progreso de pago
    progresoSection:
      'mb-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-2 border-purple-200/50 dark:border-purple-700/50 p-4',
    progresoHeader: 'flex items-center justify-between mb-3',
    progresoTitle:
      'flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400',
    progresoIcon: 'w-4 h-4',
    progresoPorcentaje:
      'text-2xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent',
    progresoBar:
      'mb-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
    progresoFill:
      'h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 transition-all duration-700 shadow-lg shadow-purple-500/50',
    progresoDetalle: 'space-y-1 text-xs',
    progresoDetalleRow: 'flex justify-between text-gray-700 dark:text-gray-300',
    progresoDetalleLabel: '',
    progresoDetalleValue: 'font-bold',
    progresoDetalleRestante: 'font-bold text-orange-600 dark:text-orange-400',

    // Footer info
    footer:
      'space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3 text-xs text-gray-500 dark:text-gray-400',
    footerRow: 'flex items-center justify-between',
    footerItem: 'flex items-center gap-1.5',
    footerIcon: 'w-3.5 h-3.5',

    // Skeleton
    skeleton:
      'animate-pulse rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
  },
}

/**
 * 🎨 Colores para iconos de métricas (identidad purple→violet)
 */
export const metricasClientesColors = {
  total: {
    gradient: 'from-cyan-500 to-blue-600',
    textGradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    glowColor: 'from-cyan-500/20 to-blue-500/20',
  },
  interesados: {
    gradient: 'from-blue-500 to-cyan-600',
    textGradient: 'from-blue-600 via-cyan-600 to-sky-600',
    glowColor: 'from-blue-500/20 to-cyan-500/20',
  },
  activos: {
    gradient: 'from-green-500 to-emerald-600',
    textGradient: 'from-green-600 via-emerald-600 to-teal-600',
    glowColor: 'from-green-500/20 to-emerald-500/20',
  },
  inactivos: {
    gradient: 'from-gray-500 to-slate-600',
    textGradient: 'from-gray-600 via-slate-600 to-zinc-600',
    glowColor: 'from-gray-500/20 to-slate-500/20',
  },
  renunciaron: {
    gradient: 'from-red-500 to-rose-600',
    textGradient: 'from-red-600 via-rose-600 to-pink-600',
    glowColor: 'from-red-500/20 to-rose-500/20',
  },
  propietarios: {
    gradient: 'from-amber-500 to-orange-600',
    textGradient: 'from-amber-600 via-orange-600 to-yellow-600',
    glowColor: 'from-amber-500/20 to-orange-500/20',
  },
}
