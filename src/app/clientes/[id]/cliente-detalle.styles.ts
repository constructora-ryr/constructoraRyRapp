/**
 * Estilos centralizados para Cliente Detalle
 * Sistema de diseño moderno con glassmorphism y animaciones
 * Color principal: Cyan/Blue (consistente con módulo clientes)
 */

// Header con gradiente y glassmorphism
export const headerClasses = {
  container:
    'relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 p-4 shadow-2xl shadow-cyan-500/20',
  backgroundPattern: 'absolute inset-0 opacity-10',
  breadcrumb:
    'relative z-10 mb-2 flex items-center gap-1.5 text-xs text-white/80',
  breadcrumbIcon: 'h-3 w-3',
  breadcrumbCurrent: 'font-semibold text-white',
  contentWrapper:
    'relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
  leftSection: 'flex items-start gap-3',
  iconContainer:
    'rounded-xl bg-white/20 p-2.5 backdrop-blur-xl transition-transform hover:scale-105 flex-shrink-0',
  icon: 'h-6 w-6 text-white',
  titleSection: 'space-y-0.5 min-w-0',
  title: 'text-base font-bold text-white sm:text-xl',
  location: 'flex items-center gap-1.5 text-sm text-white/90',
  locationIcon: 'h-3.5 w-3.5',
  actionsContainer:
    'flex items-center gap-2 self-end sm:self-auto sm:flex-shrink-0',
  actionButton:
    'inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all hover:bg-white/30 hover:scale-105',
  deleteButton:
    'inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all hover:bg-red-500 hover:border-red-600',
  statusBadge:
    'mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-xl',
  statusDot: 'h-1.5 w-1.5 rounded-full',
  statusText: 'text-xs font-medium text-white',
}

// Barra de progreso mejorada
export const progressClasses = {
  container:
    'rounded-xl border border-gray-200 bg-white/80 p-3 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80',
  header: 'mb-2.5 flex items-center justify-between',
  leftSection: 'flex items-center gap-2.5',
  iconContainer: 'rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-1.5',
  icon: 'h-4 w-4 text-white',
  titleSection: 'space-y-0.5',
  title: 'text-sm font-semibold text-gray-900 dark:text-white',
  subtitle: 'text-xs text-gray-600 dark:text-gray-400',
  rightSection: 'text-right',
  percentage: 'text-xl font-bold text-cyan-600 dark:text-cyan-400',
  percentageLabel: 'text-xs text-gray-600 dark:text-gray-400',
  bar: 'relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
  barFill:
    'h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-1500',
  shimmer:
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
  milestones: 'mt-2.5 grid grid-cols-4 gap-3',
  milestone: 'text-center',
  milestoneValue: 'mb-0.5 text-lg font-bold text-gray-900 dark:text-white',
  milestoneLabel: 'text-xs text-gray-600 dark:text-gray-400',
}

// Tabs mejorados (PILLS MODERNAS - MÁS VISIBLES)
export const tabsClasses = {
  container: 'mb-4',
  nav: 'flex gap-3',
  tab: 'relative px-4 py-2.5 text-sm font-semibold transition-all rounded-lg cursor-pointer',
  tabActive:
    'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30',
  tabInactive:
    'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
  tabContent: 'flex items-center gap-2',
  tabIcon: 'h-4 w-4',
  tabBadge: 'ml-1.5 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold',
  tabUnderline: '',
}

// Info Cards
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

// Empty State
export const emptyStateClasses = {
  container: 'flex flex-col items-center justify-center py-10 text-center',
  icon: 'mb-3 h-12 w-12 text-gray-400 dark:text-gray-600',
  title: 'mb-1.5 text-base font-semibold text-gray-900 dark:text-gray-100',
  description: 'mb-4 text-xs text-gray-600 dark:text-gray-400',
  button:
    'inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700',
}

// Warning State
export const warningStateClasses = {
  container:
    'rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800/30 dark:bg-amber-900/10',
  header: 'mb-3 flex items-center gap-2.5',
  icon: 'h-5 w-5 text-amber-600 dark:text-amber-400',
  title: 'text-base font-bold text-amber-900 dark:text-amber-100',
  description: 'mb-3 text-xs text-amber-800 dark:text-amber-200',
  list: 'mb-3 space-y-1.5',
  listItem:
    'flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-200',
  listIcon: 'mt-0.5 text-amber-600 dark:text-amber-400',
  button:
    'inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700',
}

// Gradientes por tipo (CYAN/BLUE/INDIGO - consistente con módulo)
export const gradients = {
  cliente: 'from-cyan-500 to-blue-600',
  contacto: 'from-blue-500 to-indigo-600',
  ubicacion: 'from-indigo-500 to-purple-600',
  adicional: 'from-cyan-600 to-blue-700',
  intereses: 'from-rose-500 to-red-600',
  documentos: 'from-emerald-500 to-teal-600',
  negociaciones: 'from-amber-500 to-orange-600',
  actividad: 'from-cyan-500 to-blue-600',
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
