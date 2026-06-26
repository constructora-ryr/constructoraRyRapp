/**
 * Estilos centralizados para Vivienda Detalle
 * Sistema de diseño moderno con glassmorphism y animaciones
 * Tema: Naranja/Ámbar (siguiendo diseño del módulo de Viviendas)
 */

// Header con gradiente naranja/ámbar y glassmorphism
export const headerClasses = {
  container:
    'relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800 p-4 shadow-2xl shadow-orange-500/20',
  backgroundPattern: 'absolute inset-0 opacity-10',
  breadcrumb:
    'relative z-10 mb-2 flex items-center gap-1.5 text-xs text-white/80',
  breadcrumbIcon: 'h-3 w-3',
  breadcrumbCurrent: 'font-semibold text-white',
  contentWrapper: 'relative z-10 flex items-start justify-between',
  leftSection: 'flex items-center gap-3',
  iconContainer:
    'rounded-xl bg-white/20 p-2.5 backdrop-blur-xl transition-transform hover:scale-105',
  icon: 'h-6 w-6 text-white',
  titleSection: 'space-y-0.5',
  title: 'text-xl font-bold text-white',
  location: 'flex items-center gap-1.5 text-sm text-white/90',
  locationIcon: 'h-3.5 w-3.5',
  actionsContainer: 'flex items-center gap-2',
  actionButton:
    'inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all hover:bg-white/30 hover:scale-105',
  deleteButton:
    'inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all hover:bg-red-500 hover:border-red-600',
  statusBadge:
    'mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-xl',
  statusDot: 'h-1.5 w-1.5 rounded-full',
  statusText: 'text-xs font-medium text-white',
}

// Tabs mejorados (PILLS MODERNAS - tema naranja/ámbar)
export const tabsClasses = {
  container: 'mb-4',
  nav: 'flex gap-3',
  tab: 'relative px-4 py-2.5 text-sm font-semibold transition-all rounded-lg cursor-pointer',
  tabActive:
    'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30',
  tabInactive:
    'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
  tabContent: 'flex items-center gap-2',
  tabIcon: 'h-4 w-4',
  tabBadge: 'ml-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold',
  tabUnderline: '',
}

// Stats Cards mejorados (tema naranja/ámbar)
export const statsCardClasses = {
  container: 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4',
  card: 'group relative overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-3 shadow-md backdrop-blur-sm transition-all hover:border-orange-400 hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800/80',
  gradientOverlay:
    'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5',
  header: 'relative mb-2.5 flex items-center justify-between',
  iconWrapper:
    'rounded-lg p-2 shadow-md transition-transform group-hover:rotate-12',
  icon: 'h-5 w-5 text-white',
  trend: 'flex items-center gap-1 text-xs',
  trendIcon: 'h-3 w-3',
  trendUp: 'text-green-600 dark:text-green-400',
  trendDown: 'text-red-600 dark:text-red-400',
  content: 'relative',
  label: 'mb-0.5 text-xs font-medium text-gray-600 dark:text-gray-400',
  value: 'text-xl font-bold text-gray-900 dark:text-white',
  progressBar:
    'mt-2.5 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  progressFill: 'h-full transition-all duration-1000',
}

// Barra de progreso mejorada (tema naranja/ámbar)
export const progressClasses = {
  container:
    'rounded-xl border border-gray-200 bg-white/80 p-3 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80',
  header: 'mb-2.5 flex items-center justify-between',
  leftSection: 'flex items-center gap-2.5',
  iconContainer:
    'rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 p-1.5',
  icon: 'h-4 w-4 text-white',
  titleSection: 'space-y-0.5',
  title: 'text-sm font-semibold text-gray-900 dark:text-white',
  subtitle: 'text-xs text-gray-600 dark:text-gray-400',
  rightSection: 'text-right',
  percentage: 'text-xl font-bold text-orange-600 dark:text-orange-400',
  percentageLabel: 'text-xs text-gray-600 dark:text-gray-400',
  bar: 'relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  barFill:
    'h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 transition-all duration-1500',
  shimmer:
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
  milestones: 'mt-2.5 grid grid-cols-4 gap-3',
  milestone: 'text-center',
  milestoneValue: 'mb-0.5 text-lg font-bold text-gray-900 dark:text-white',
  milestoneLabel: 'text-xs text-gray-600 dark:text-gray-400',
}

// Info Cards (tema naranja/ámbar)
export const infoCardClasses = {
  card: 'group rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-2.5 shadow-md transition-all hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900',
  header: 'mb-2 flex items-center gap-2',
  iconContainer: 'rounded-lg bg-gradient-to-br p-1.5',
  icon: 'h-4 w-4 text-white',
  title: 'text-sm font-semibold text-gray-900 dark:text-white',
  content: 'space-y-1.5 text-sm text-gray-700 dark:text-gray-300',
  row: 'flex items-center gap-1.5 text-xs',
  rowIcon: 'h-3.5 w-3.5 text-gray-400',
  label: 'text-xs text-gray-600 dark:text-gray-400',
  value: 'text-sm font-semibold text-gray-900 dark:text-white',
}

// Gradientes por tipo (tema naranja/ámbar - consistente con módulo viviendas)
export const gradients = {
  valor: 'from-orange-500 to-amber-600',
  estado: 'from-amber-500 to-yellow-600',
  pagos: 'from-yellow-500 to-orange-600',
  detalles: 'from-orange-600 to-amber-700',
  ubicacion: 'from-amber-500 to-yellow-600',
  proyecto: 'from-orange-500 to-amber-600',
  nomenclatura: 'from-yellow-600 to-orange-700',
  linderos: 'from-amber-600 to-yellow-700',
}

// Animaciones Framer Motion
export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  hoverLift: {
    whileHover: { y: -8, scale: 1.02 },
  },
  hoverScale: {
    whileHover: { scale: 1.05 },
  },
  hoverRotate: {
    whileHover: { rotate: 360 },
    transition: { duration: 0.6 },
  },
  statusPulse: {
    animate: { scale: [1, 1.05, 1] },
    transition: { repeat: Infinity, duration: 2 },
  },
}
