/**
 * Clases de Tailwind CSS reutilizables para toda la aplicación
 */

// Contenedores
export const containers = {
  page: 'container mx-auto px-4 sm:px-6 lg:px-8 py-6',
  section: 'w-full max-w-7xl mx-auto',
  card: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
  cardGlass:
    'backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50',
  modal:
    'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden',
}

// Botones
export const buttons = {
  base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
  secondary:
    'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg',
  ghost:
    'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
  outline:
    'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  icon: 'p-2',
}

// Inputs
export const inputs = {
  base: 'w-full rounded-lg border bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
  default:
    'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5',
  helperText: 'mt-1.5 text-sm text-gray-500 dark:text-gray-400',
  errorText: 'mt-1.5 text-sm text-red-600 dark:text-red-400',
}

// Badges
export const badges = {
  base: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
}

// Typography
export const typography = {
  h1: 'text-4xl font-bold text-gray-900 dark:text-white',
  h2: 'text-3xl font-bold text-gray-900 dark:text-white',
  h3: 'text-2xl font-semibold text-gray-900 dark:text-white',
  h4: 'text-xl font-semibold text-gray-900 dark:text-white',
  h5: 'text-lg font-medium text-gray-900 dark:text-white',
  h6: 'text-base font-medium text-gray-900 dark:text-white',
  body: 'text-base text-gray-700 dark:text-gray-300',
  bodyLarge: 'text-lg text-gray-700 dark:text-gray-300',
  bodySmall: 'text-sm text-gray-600 dark:text-gray-400',
  caption: 'text-xs text-gray-500 dark:text-gray-500',
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  link: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline',
}

// Loading States
export const loading = {
  pulse: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
  skeleton:
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
}

// Dividers
export const dividers = {
  horizontal: 'w-full h-px bg-gray-200 dark:bg-gray-700',
  vertical: 'h-full w-px bg-gray-200 dark:bg-gray-700',
  withText: 'relative flex items-center',
  text: 'px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900',
}

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  none: 'shadow-none',
}

// Overlays
export const overlays = {
  backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40',
  modal: 'fixed inset-0 flex items-center justify-center p-4 z-50',
  drawer: 'fixed inset-y-0 flex z-50',
}

// Transitions
export const transitions = {
  all: 'transition-all duration-200',
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  opacity: 'transition-opacity duration-200',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-300',
}

// Grid
export const grid = {
  cols1: 'grid grid-cols-1 gap-4',
  cols2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  cols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  autoFit: 'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4',
  autoFill: 'grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4',
}

// Flex
export const flex = {
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-center justify-start',
  end: 'flex items-center justify-end',
  col: 'flex flex-col',
  colCenter: 'flex flex-col items-center justify-center',
  wrap: 'flex flex-wrap',
}

// States
export const states = {
  disabled: 'opacity-50 cursor-not-allowed',
  readonly: 'bg-gray-50 dark:bg-gray-900 cursor-default',
  focus: 'ring-2 ring-blue-500 ring-offset-2',
  error: 'ring-2 ring-red-500 ring-offset-2',
  success: 'ring-2 ring-green-500 ring-offset-2',
}

// Scrollbar
export const scrollbar = {
  default:
    'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800',
  hidden: 'scrollbar-none',
}

// Efectos Glassmorphism
export const glass = {
  card: 'backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20',
  strong:
    'backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/30',
  subtle:
    'backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/10 dark:border-gray-700/10',
}
