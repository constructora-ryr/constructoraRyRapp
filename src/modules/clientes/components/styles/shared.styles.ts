// ============================================
// ESTILOS COMPARTIDOS: Componentes Globales del Módulo Clientes
// ============================================

/**
 * ⭐ DESIGN SYSTEM - CLIENTES
 *
 * Estilos reutilizables para todo el módulo:
 * - Modales
 * - Cards
 * - Botones
 * - Inputs
 * - Badges
 */

// ===================
// MODALES (Base)
// ===================

export const sharedModalStyles = {
  // Overlay backdrop
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm',

  // Contenedor del modal
  container: {
    small:
      'relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900',
    medium:
      'relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900',
    large:
      'relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900',
    xlarge:
      'relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900',
  },

  // Header con gradiente
  header: {
    wrapper:
      'sticky top-0 z-10 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800 px-8 py-6',
    content: 'flex items-center justify-between',
    titleSection: 'flex items-center gap-4',
    iconContainer:
      'flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30',
    iconSmall:
      'flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-sm text-white/80',
    closeButton:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:rotate-90',
  },

  // Contenido scrolleable
  content:
    'max-h-[60vh] overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800',

  // Footer con botones
  footer: {
    wrapper:
      'sticky bottom-0 z-10 border-t border-gray-200 bg-white px-8 py-5 dark:border-gray-800 dark:bg-gray-900',
    content: 'flex items-center justify-end gap-3',
  },
}

// ===================
// BOTONES
// ===================

export const sharedButtonStyles = {
  // Botón cancelar/secundario
  secondary:
    'rounded-xl border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',

  // Botón primario (gradiente cyan/azul)
  primary:
    'rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50',

  // Botón primario alternativo (cyan/indigo)
  primaryViolet:
    'flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5',

  // Botón peligro (rojo)
  danger:
    'flex items-center gap-2 rounded-xl border-2 border-red-300 px-5 py-2.5 font-medium text-red-700 transition-all hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20',

  // Botón outline
  outline:
    'rounded-xl border-2 border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',

  // Botón icono
  icon: 'rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',

  // Botón con loading
  loading: 'cursor-wait opacity-75',
}

// ===================
// CARDS
// ===================

export const sharedCardStyles = {
  // Card base
  base: 'rounded-xl border-2 bg-white p-6 shadow-sm transition-all dark:bg-gray-900',

  // Card interactiva (hover)
  interactive:
    'rounded-xl border-2 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer dark:bg-gray-900',

  // Variantes de color
  purple: 'border-purple-200 dark:border-purple-700',
  blue: 'border-blue-200 dark:border-blue-700',
  green: 'border-green-200 dark:border-green-700',
  yellow: 'border-yellow-200 dark:border-yellow-700',
  red: 'border-red-200 dark:border-red-700',
  gray: 'border-gray-200 dark:border-gray-700',

  // Card con gradiente de fondo
  gradientPurple:
    'rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20',
  gradientBlue:
    'rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-cyan-900/20',

  // Card info (con borde coloreado)
  info: 'rounded-xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30',
  warning:
    'rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/30',
  error:
    'rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30',
  success:
    'rounded-xl border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30',
}

// ===================
// INPUTS
// ===================

export const sharedInputStyles = {
  // Label
  label: 'mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300',

  // Input base
  base: 'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500',

  // Select
  select:
    'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white',

  // Textarea
  textarea:
    'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 resize-none',

  // Estados
  error:
    'border-red-300 focus:border-red-500 focus:ring-red-500/10 dark:border-red-700',
  disabled: 'cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-800',

  // Error message
  errorMessage: 'mt-1 text-sm text-red-600 dark:text-red-400',
}

// ===================
// BADGES / TAGS
// ===================

export const sharedBadgeStyles = {
  // Base
  base: 'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',

  // Variantes
  purple:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  yellow:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',

  // Con tamaño grande
  large: 'px-3 py-1 text-sm',
}

// ===================
// ALERTS / NOTIFICATIONS
// ===================

export const sharedAlertStyles = {
  base: 'rounded-lg border-2 p-4 flex items-start gap-3',

  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  warning:
    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  success:
    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',

  icon: 'flex-shrink-0',
  content: 'flex-1',
  title: 'font-semibold mb-1',
  message: 'text-sm',
}

// ===================
// ESTADOS VACÍOS
// ===================

export const sharedEmptyStateStyles = {
  container:
    'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-800/50',
  icon: 'mb-4 h-16 w-16 text-gray-400',
  title: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',
  description: 'text-sm text-gray-500 dark:text-gray-400',
}

// ===================
// AVATARES
// ===================

export const sharedAvatarStyles = {
  // Contenedor
  container:
    'relative inline-flex items-center justify-center overflow-hidden rounded-full',

  // Tamaños
  small: 'h-8 w-8',
  medium: 'h-12 w-12',
  large: 'h-16 w-16',
  xlarge: 'h-24 w-24',

  // Imagen
  image: 'h-full w-full object-cover',

  // Iniciales
  initials: 'font-semibold text-white',

  // Badge online
  badge:
    'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900',
}

// ===================
// UTILIDADES
// ===================

export const sharedUtilityStyles = {
  // Divider
  divider: 'my-6 border-t border-gray-200 dark:border-gray-800',

  // Scrollbar personalizada
  scrollbar:
    'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800',

  // Backdrop blur
  backdropBlur: 'backdrop-blur-sm',

  // Transición suave
  transition: 'transition-all duration-200 ease-in-out',
}
