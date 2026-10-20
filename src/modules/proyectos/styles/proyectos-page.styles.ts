/**
 * 🎨 ESTILOS CENTRALIZADOS - PROYECTOS (VISTA PRINCIPAL)
 *
 * Sistema de diseño compacto premium con glassmorphism.
 * Color principal: Verde/Esmeralda/Teal (para diferenciar de otros módulos)
 *
 * Características:
 * - Glassmorphism con backdrop-blur-xl
 * - Gradientes vibrantes verde/esmeralda/teal
 * - Animaciones fluidas con Framer Motion
 * - Responsive design (mobile, tablet, desktop)
 * - Dark mode compatible
 * - Vista compacta optimizada (30% menos espacio vertical)
 *
 * Basado en: ESTANDAR-DISENO-VISUAL-MODULOS.md
 * Referencia: Módulo de Viviendas (compacto)
 */

export const proyectosPageStyles = {
  // 🎯 CONTENEDOR PRINCIPAL
  container: {
    page: 'min-h-screen bg-gradient-to-br from-slate-50 via-green-50/60 to-emerald-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950',
    content: 'max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-5',
  },

  // 🎨 HEADER HERO (compacto)
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800 p-6 shadow-2xl shadow-green-500/20',
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
    subtitle: 'text-green-100 dark:text-green-200 text-xs',
    buttonGroup: 'flex items-center gap-2',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
    badgeIcon: 'w-3.5 h-3.5',
    button:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg',
    buttonIcon: 'w-4 h-4',
  },

  // 📊 MÉTRICAS (3 cards - compactas y simplificadas)
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
    card: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-lg hover:shadow-2xl transition-all duration-300',
    cardGlowGreen:
      'absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    cardGlowTeal:
      'absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    cardGlowBlue:
      'absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    cardGlowPurple:
      'absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center gap-3',
    iconCircleGreen:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/40',
    iconCircleTeal:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/40',
    iconCircleBlue:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/40',
    iconCirclePurple:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md shadow-purple-500/40',
    icon: 'w-4 h-4 text-white',
    textGroup: 'flex-1',
    valueGreen:
      'text-lg font-bold bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent',
    valueTeal:
      'text-lg font-bold bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent',
    valueBlue:
      'text-lg font-bold bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent',
    valuePurple:
      'text-lg font-bold bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent',
    label: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-medium',
  },

  // 🔍 FILTROS (diseño premium con pills)
  filtros: {
    container:
      'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-2xl shadow-green-500/10',

    // Fila principal híbrida (búsqueda + pills)
    mainRow: 'flex flex-col xl:flex-row xl:items-center gap-3',

    // Barra de búsqueda
    searchBar: 'flex-1 min-w-[250px]',
    searchWrapper: 'relative',
    searchIcon:
      'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none',
    searchInput:
      'w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500',
    searchClearButton:
      'absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors',

    // Pills de estado
    pillsSection:
      'flex items-center gap-3 overflow-x-auto pb-1 xl:pb-0 hide-scrollbar',
    pillsLabel: 'flex items-center gap-1.5 shrink-0 hidden md:flex',
    pillsContainer: 'flex items-center gap-2 flex-wrap',
    pill: 'group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700/50 border-2 border-transparent text-gray-700 dark:text-gray-300 text-xs font-medium transition-all hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer',
    pillActive:
      'group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-green-400 dark:border-green-600 text-white text-xs font-semibold shadow-lg shadow-green-500/30 cursor-pointer',
    pillIcon: 'flex items-center',
    pillLabel: 'leading-none',
    pillCheck:
      'w-4 h-4 flex items-center justify-center rounded-full bg-white/30 text-white text-xs font-bold',

    // Footer
    footer:
      'flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700',
    resultCount: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
    clearButton:
      'inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors cursor-pointer rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20',
    clearIcon: 'w-4 h-4',

    // Legacy (eliminados pero mantenidos para compatibilidad)
    grid: 'flex items-center gap-2',
    selectWrapper: 'relative',
    label: 'sr-only',
    select:
      'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-sm min-w-[180px]',
  },

  // 🎬 ANIMACIONES (Framer Motion)
  animations: {
    container: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.15 },
    },
    header: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.15 },
    },
    metricas: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.15 },
    },
    metricaCard: {
      whileHover: { scale: 1.02, y: -4 },
      transition: { type: 'spring' as const, stiffness: 300 },
    },
    filtros: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.15 },
    },
    button: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
    },
    clearButton: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
    },
  },
}
