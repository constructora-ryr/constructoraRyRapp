/**
 * ============================================
 * ESTILOS: Configuración de Requisitos
 * ============================================
 * Estilos centralizados para el módulo de administración
 * de requisitos de fuentes de pago.
 */

export const requisitosConfigStyles = {
  // ============================================
  // CONTENEDOR PRINCIPAL
  // ============================================
  container: {
    page: 'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/30 py-6',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4',
  },

  // ============================================
  // HEADER (COMPACTO)
  // ============================================
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 p-6 shadow-2xl shadow-blue-500/20',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10 flex items-center justify-between',
    iconBox:
      'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-blue-600/20',
    icon: 'w-6 h-6 text-white',
    textContainer: 'space-y-0.5',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-blue-100 dark:text-blue-200 text-xs',
    badge:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium',
  },

  // ============================================
  // MÉTRICAS (4 CARDS COMPACTAS)
  // ============================================
  metricas: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
    card: 'group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-lg hover:shadow-2xl transition-all duration-300',
    cardHover: 'hover:scale-[1.02] hover:translate-y-[-4px]',
    cardGradient:
      'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
    iconBox: 'w-10 h-10 rounded-lg flex items-center justify-center shadow-lg',
    icon: 'w-5 h-5 text-white',
    value: 'text-xl font-bold bg-clip-text text-transparent',
    label: 'text-xs font-medium mt-0.5',
  },

  // ============================================
  // SELECTOR DE TIPO DE FUENTE (COMPACTO)
  // ============================================
  selector: {
    container:
      'sticky top-4 z-40 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-blue-500/10',
    label: 'text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block',
    grid: 'flex gap-2 flex-wrap',
    button:
      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105',
    buttonActive:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800 text-white shadow-lg shadow-blue-500/30',
    buttonInactive:
      'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
  },

  // ============================================
  // LISTA DE REQUISITOS
  // ============================================
  lista: {
    container:
      'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-4 shadow-xl',
    header:
      'flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700',
    title: 'text-lg font-bold text-gray-900 dark:text-white',
    btnAgregar:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200',
    empty: 'text-center py-12 px-4',
    emptyText: 'text-gray-500 dark:text-gray-400 mb-2 text-sm',
    emptyHint: 'text-xs text-gray-400 dark:text-gray-500',
    grid: 'space-y-3',
  },

  // ============================================
  // CARD DE REQUISITO (COMPACTO)
  // ============================================
  card: {
    container:
      'group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 shadow-sm hover:shadow-lg',
    dragHandle:
      'cursor-move text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
    header: 'flex items-start gap-3 mb-3',
    ordenBadge:
      'flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md',
    content: 'flex-1 min-w-0',
    titulo:
      'text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-1',
    descripcion: 'text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2',
    metadataGrid: 'flex flex-wrap gap-2 mb-3',
    badge:
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
    actions:
      'flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700',
    btnIcon:
      'p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200',
  },

  // ============================================
  // FORMULARIO (COMPACTO)
  // ============================================
  form: {
    container:
      'mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800',
    title: 'text-sm font-bold text-gray-900 dark:text-white mb-3',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-3 mb-4',
    fieldFull: 'col-span-1 md:col-span-2',
    label: 'block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1',
    input:
      'w-full px-3 py-2 bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all',
    textarea:
      'w-full px-3 py-2 bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none',
    select:
      'w-full px-3 py-2 bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all',
    actions:
      'flex items-center gap-2 justify-end pt-3 border-t border-gray-200 dark:border-gray-700',
    btnPrimary:
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg transition-all duration-200',
    btnSecondary:
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200',
  },

  // ============================================
  // BADGES DE NIVEL DE VALIDACIÓN
  // ============================================
  nivelValidacion: {
    DOCUMENTO_OBLIGATORIO: {
      container:
        'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
    },
    DOCUMENTO_OPCIONAL: {
      container:
        'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    SOLO_CONFIRMACION: {
      container:
        'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
    },
  },

  // ============================================
  // ESTADOS DE CARGA
  // ============================================
} as const
