/**
 * Styles: EntidadFinancieraFormModal
 *
 * Estilos centralizados para el modal de entidades financieras.
 * Todos los strings de Tailwind > 80 caracteres deben estar aquí.
 */

import type { EntidadColor } from '../types/entidades-financieras.types'

// =====================================================
// ESTRUCTURA DEL MODAL
// =====================================================

export const entidadFinancieraModalStyles = {
  // Backdrop
  backdrop: 'fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm',

  // Container principal
  container:
    'fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto',

  // Modal card
  modal:
    'relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',

  // Header
  header: {
    container:
      'relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 px-6 py-4 rounded-t-2xl',
    content: 'relative z-10 flex items-center justify-between',
    icon: 'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    iconSvg: 'w-6 h-6 text-white',
    title: 'text-xl font-bold text-white',
    subtitle: 'text-blue-100 text-sm',
    closeButton:
      'w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors',
    closeIcon: 'w-5 h-5 text-white',
  },

  // Form
  form: {
    container: 'p-6 space-y-6 max-h-[70vh] overflow-y-auto',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    gridFullWidth: 'md:col-span-2',
  },

  // Inputs
  input: {
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
    labelHint: 'text-xs text-gray-500',
    inputBase:
      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
    inputWithIcon:
      'w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
    icon: 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400',
    iconTop: 'absolute left-3 top-3 w-4 h-4 text-gray-400',
    error: 'text-red-500 text-xs mt-1',
    relative: 'relative',
  },

  // Textarea
  textarea: {
    base: 'w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none',
  },

  // Select
  select: {
    base: 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
    withIcon:
      'flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
  },

  // Color picker
  colorPicker: {
    container: 'flex items-center gap-2',
    icon: 'w-4 h-4 text-gray-400',
    preview: 'w-8 h-8 rounded-lg shadow-lg',
  },

  // Checkbox
  checkbox: {
    label: 'flex items-center gap-2 cursor-pointer',
    input: 'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
    text: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  },

  // Fuentes aplicables section (Grid Compacto)
  fuentesAplicables: {
    description: 'text-xs text-gray-500 dark:text-gray-400 mb-2',
    loadingBox:
      'p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-xs text-gray-500 dark:text-gray-400',
    emptyBox:
      'p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-200',
    listContainer:
      'max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 grid grid-cols-2 gap-1.5',
    listItem:
      'flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer rounded-md border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all',
    checkboxInput:
      'w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0',
    itemContent: 'flex-1 min-w-0',
    itemTitle: 'text-xs font-medium text-gray-900 dark:text-white truncate',
    itemSubtitle: 'text-[10px] text-gray-500 dark:text-gray-400 truncate',
    checkIcon: 'w-4 h-4 text-green-500 flex-shrink-0',
    counterSuccess:
      'text-xs text-green-600 dark:text-green-400 mt-2 font-medium',
    counterEmpty: 'text-xs text-gray-500 dark:text-gray-400 mt-2',
  },

  // Footer
  footer: {
    container:
      'flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700',
    cancelButton:
      'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors',
    submitButton:
      'px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
  },
} as const

// =====================================================
// COLOR PREVIEW MAP
// =====================================================

export const colorClasses: Record<EntidadColor, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  cyan: 'bg-cyan-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  gray: 'bg-gray-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  slate: 'bg-slate-500',
  lime: 'bg-lime-500',
  rose: 'bg-rose-500',
}

// =====================================================
// ANIMATIONS (Framer Motion)
// =====================================================

export const entidadFinancieraModalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { type: 'spring', duration: 0.5 },
  },
} as const
