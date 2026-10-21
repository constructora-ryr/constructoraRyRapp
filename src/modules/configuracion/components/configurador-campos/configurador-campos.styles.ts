/**
 * Estilos: Configurador de Campos Dinámicos
 *
 * Sistema de estilos centralizado para el módulo de configuración.
 * Basado en estándar compacto de Proyectos.
 *
 * @version 1.0 - Diseño Compacto Premium
 */

export const configuradorStyles = {
  // ============================================
  // PÁGINA PRINCIPAL
  // ============================================
  page: {
    container:
      'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 py-6 px-4 sm:px-6 lg:px-8',
    content: 'max-w-7xl mx-auto space-y-4',
  },

  // ============================================
  // HEADER (COMPACTO - ESTÁNDAR PROYECTOS)
  // ============================================
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 p-6 shadow-2xl shadow-blue-500/20',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',
    iconContainer:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    icon: 'w-6 h-6 text-white',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-blue-100 dark:text-blue-200 text-xs',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
  },

  // ============================================
  // CARD DE TIPO DE FUENTE
  // ============================================
  tipoCard: {
    container:
      'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300',
    gradient:
      'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    content: 'relative z-10 flex items-center gap-4',
    iconContainer:
      'w-12 h-12 rounded-lg flex items-center justify-center shadow-lg',
    icon: 'w-6 h-6 text-white',
    info: 'flex-1 min-w-0',
    name: 'text-base font-bold text-gray-900 dark:text-white mb-0.5',
    description: 'text-xs text-gray-600 dark:text-gray-400',
    badge: 'px-2 py-1 rounded-md text-xs font-semibold',
    button:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105',
  },

  // ============================================
  // MODAL CONFIGURADOR
  // ============================================
  modal: {
    overlay:
      'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4',
    container:
      'relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl',
    header: {
      container: 'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
      gradient: 'bg-gradient-to-r',
      title: 'text-lg font-bold text-gray-900 dark:text-white',
      subtitle: 'text-xs text-gray-600 dark:text-gray-400 mt-0.5',
      closeButton:
        'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
    },
    body: {
      container:
        'overflow-y-auto max-h-[calc(85vh-160px)] bg-gray-50 dark:bg-gray-900',
      content: 'p-4 space-y-3',
      empty: 'py-12 text-center',
      emptyIcon: 'w-16 h-16 mx-auto mb-4 text-gray-400',
      emptyText: 'text-sm text-gray-600 dark:text-gray-400',
    },
    footer: {
      container:
        'px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between gap-3',
      buttonPrimary:
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105 shadow-lg',
      buttonSecondary:
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all',
      buttonAdd:
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg',
    },
  },

  // ============================================
  // CAMPO ITEM (ARRASTRABLE)
  // ============================================
  campoItem: {
    container:
      'group relative rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all',
    containerDragging: 'opacity-50 scale-95',
    dragHandle:
      'flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors',
    dragIcon: 'w-5 h-5 text-gray-400',
    content: 'flex-1 min-w-0',
    header: 'flex items-center gap-2 mb-1',
    orden:
      'flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-lg',
    nombre: 'text-sm font-bold text-gray-900 dark:text-white',
    required:
      'px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    details: 'flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400',
    tipo: 'px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 font-mono text-[10px]',
    actions: 'flex items-center gap-1',
    button: 'p-1.5 rounded-lg transition-colors',
    buttonEdit:
      'hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    buttonDelete:
      'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400',
  },

  // ============================================
  // MODAL EDITOR DE CAMPO
  // ============================================
  editor: {
    container:
      'relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl',
    form: 'space-y-3',
    field: 'space-y-1.5',
    label: 'block text-xs font-bold text-gray-700 dark:text-gray-300',
    required: 'text-red-500 ml-1',
    input:
      'w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all',
    select:
      'w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all',
    textarea:
      'w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none',
    checkbox:
      'w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500/20',
    error:
      'flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    errorIcon: 'w-3.5 h-3.5 text-red-600 dark:text-red-400 flex-shrink-0',
    errorText: 'text-xs font-medium text-red-700 dark:text-red-300',
    help: 'text-xs text-gray-500 dark:text-gray-400',
  },

  // ============================================
  // ESTADOS
  // ============================================
  error: {
    container:
      'p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    icon: 'w-5 h-5 text-red-600 dark:text-red-400',
    title: 'text-sm font-bold text-red-900 dark:text-red-100',
    message: 'text-xs text-red-700 dark:text-red-300 mt-1',
  },
}
