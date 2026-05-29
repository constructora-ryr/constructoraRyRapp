/**
 * Sistema de Diseño Global - Constructora RyR
 *
 * Principios:
 * - Compacto pero usable (min 32px touch targets)
 * - Tipografía escalada coherentemente
 * - Espaciados consistentes (sistema 4px base)
 * - Profesional y eficiente
 */

export const designSystem = {
  // ============================================
  // ESPACIADOS (Base 4px)
  // ============================================
  spacing: {
    xs: 'gap-2', // 8px
    sm: 'gap-3', // 12px
    md: 'gap-4', // 16px
    lg: 'gap-6', // 24px
    xl: 'gap-8', // 32px
  },

  padding: {
    xs: 'p-2', // 8px
    sm: 'p-3', // 12px
    md: 'p-4', // 16px
    lg: 'p-5', // 20px
    xl: 'p-6', // 24px
  },

  // ============================================
  // TIPOGRAFÍA
  // ============================================
  typography: {
    // Headings
    h1: 'text-2xl font-semibold tracking-tight', // Páginas principales
    h2: 'text-xl font-semibold', // Secciones importantes
    h3: 'text-lg font-medium', // Subsecciones
    h4: 'text-base font-medium', // Cards/Componentes

    // Body
    body: 'text-sm', // Texto normal
    bodyLarge: 'text-base', // Texto destacado
    bodySmall: 'text-xs', // Texto secundario

    // Labels
    label: 'text-xs font-medium', // Form labels
    caption: 'text-[10px]', // Hints, metadata

    // Special
    code: 'font-mono text-xs',
    link: 'text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
  },

  // ============================================
  // COLORES (Uso con dark mode)
  // ============================================
  colors: {
    // Backgrounds
    bgPrimary: 'bg-white dark:bg-gray-950',
    bgSecondary: 'bg-gray-50 dark:bg-gray-900',
    bgTertiary: 'bg-gray-100 dark:bg-gray-800',

    // Borders
    border: 'border-gray-200 dark:border-gray-800',
    borderLight: 'border-gray-100 dark:border-gray-900',

    // Text
    textPrimary: 'text-gray-900 dark:text-white',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    textTertiary: 'text-gray-500 dark:text-gray-500',

    // States
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  },

  // ============================================
  // BOTONES
  // ============================================
  button: {
    // Tamaños
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',

    // Variantes
    primary:
      'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100',
    secondary:
      'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
    ghost:
      'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',

    // Base común
    base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  },

  // ============================================
  // INPUTS Y FORMULARIOS
  // ============================================
  input: {
    base: 'w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
    error: 'border-red-500 dark:border-red-600 ring-2 ring-red-500/10',
    success: 'border-green-500 dark:border-green-600 ring-2 ring-green-500/10',
    disabled:
      'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed',

    label: 'text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5',
    hint: 'text-[10px] text-gray-500 dark:text-gray-400 mt-1',
    errorText: 'text-[10px] text-red-600 dark:text-red-400 mt-1',
  },

  // ============================================
  // CARDS
  // ============================================
  card: {
    base: 'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800',
    hover: 'hover:border-gray-300 dark:hover:border-gray-700 transition-colors',
    padding: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    },
  },

  // ============================================
  // TABLAS
  // ============================================
  table: {
    wrapper: 'overflow-x-auto',
    base: 'w-full text-sm',

    // Header
    thead: 'bg-gray-50 dark:bg-gray-900',
    th: 'px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider',

    // Body
    tbody: 'divide-y divide-gray-100 dark:divide-gray-800',
    tr: 'hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors',
    td: 'px-4 py-3 text-sm text-gray-900 dark:text-white',
  },

  // ============================================
  // BADGES Y ESTADOS
  // ============================================
  badge: {
    base: 'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium',
    success:
      'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    error: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    warning:
      'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },

  // ============================================
  // LAYOUTS
  // ============================================
  layout: {
    // Contenedores principales
    container: 'container mx-auto px-4 py-4 max-w-7xl',
    section: 'space-y-4',

    // Grids comunes
    grid: {
      two: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      three: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      four: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
    },

    // Headers de página
    pageHeader: {
      container: 'mb-4',
      title: 'text-2xl font-semibold text-gray-900 dark:text-white',
      subtitle: 'text-xs text-gray-500 dark:text-gray-400 mt-1',
      actions: 'flex items-center gap-2 mt-3',
    },
  },

  // ============================================
  // ICONOS
  // ============================================
  icon: {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  },

  // ============================================
  // ANIMACIONES
  // ============================================
  animation: {
    transition: 'transition-all duration-200',
    hover: 'hover:scale-105 transition-transform duration-200',
    fadeIn: 'animate-in fade-in duration-200',
  },
}

// Helper para combinar clases con el sistema de diseño
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Exports con nombres específicos para mayor claridad
export const {
  spacing,
  padding,
  typography,
  colors,
  button,
  input,
  card,
  table,
  badge,
  layout,
  icon,
  animation,
} = designSystem

export default designSystem
