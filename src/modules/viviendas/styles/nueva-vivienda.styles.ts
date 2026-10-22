/**
 * Estilos para Nueva Vivienda
 * ✅ Estándar compacto
 * ✅ Paleta: Naranja/Ámbar (Viviendas)
 * ✅ Modo oscuro completo
 */

export const nuevaViviendaStyles = {
  // ==================== CONTENEDOR PRINCIPAL ====================
  container: {
    page: 'min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/30 dark:from-gray-950 dark:via-orange-950/20 dark:to-amber-950/20',
    content: 'container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4',
  },

  // ==================== HEADER CON BREADCRUMBS ====================
  header: {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-yellow-800 p-6 shadow-2xl shadow-orange-500/20',
    pattern:
      'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
    content: 'relative z-10',

    // Breadcrumbs
    breadcrumbs:
      'flex items-center gap-2 mb-4 text-xs text-orange-100 dark:text-orange-200',
    breadcrumbItem: 'hover:text-white transition-colors cursor-pointer',
    breadcrumbSeparator: 'text-orange-300 dark:text-orange-400',
    breadcrumbCurrent: 'text-white font-medium',

    // Título
    titleRow: 'flex items-center justify-between',
    titleLeft: 'flex items-center gap-3',
    icon: 'w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center',
    iconSvg: 'w-6 h-6 text-white',
    titleContent: 'space-y-0.5',
    title: 'text-2xl font-bold text-white',
    subtitle: 'text-orange-100 dark:text-orange-200 text-xs',

    // Botones
    actions: 'flex items-center gap-2',
    cancelButton:
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all shadow-lg',
  },

  // ==================== STEPPER HORIZONTAL ====================
  stepper: {
    container:
      'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-orange-500/10', // ← p-3 (más compacto), sin sticky
    list: 'flex items-center justify-between gap-2',

    step: {
      container: 'flex flex-col items-center flex-1 relative',
      iconWrapper: 'relative flex items-center justify-center',
      iconCircle:
        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
      iconCircleCompleted:
        'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30',
      iconCircleActive:
        'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30',
      iconCircleInactive:
        'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700',
      icon: 'w-5 h-5',
      checkIcon: 'w-5 h-5',

      label: 'mt-2 text-xs font-medium text-center transition-colors',
      labelCompleted: 'text-green-600 dark:text-green-400',
      labelActive: 'text-orange-600 dark:text-orange-400',
      labelInactive: 'text-gray-500 dark:text-gray-400',

      // Conector (línea entre pasos) - EN EL CONTAINER, NO EN ICONWRAPPER
      connector: 'absolute top-5 left-1/2 w-full h-0.5 -z-10 hidden sm:block',
      connectorCompleted: 'bg-gradient-to-r from-green-500 to-emerald-500',
      connectorInactive: 'bg-gray-200 dark:bg-gray-700',
    },
  },

  // ==================== CONTENEDOR DE CONTENIDO ====================
  content: {
    container:
      'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-xl min-h-[300px]', // ← p-3, min-h-[300px] (ultra compacto)

    // Layout de 1 columna (sidebar eliminado para evitar scroll)
    formColumn: 'space-y-3', // ← space-y-3 (más compacto)
  },

  // ==================== CAMPOS DE FORMULARIO ====================
  field: {
    container: 'space-y-1.5', // ← space-y-1.5 (más compacto)
    label: 'block text-xs font-semibold text-gray-700 dark:text-gray-300', // ← text-xs (más compacto)
    required: 'text-red-500',

    inputWrapper: 'relative',
    // z-10: el <select> de FormSelect va después en el DOM y su fondo lo tapaba
    inputIcon:
      'absolute left-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none',
    input:
      'w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm', // ← py-2, rounded-lg, focus:ring-2 (más compacto)
    inputError: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',

    select:
      'w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm appearance-none cursor-pointer', // ← py-2, rounded-lg (más compacto)

    textarea:
      'w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none text-sm resize-none min-h-[90px]', // ← py-2, min-h-[90px] (rows=3)

    error:
      'flex items-center gap-2 mt-1 text-red-600 dark:text-red-400 text-xs font-medium',
    errorIcon: 'w-3.5 h-3.5',

    hint: 'flex items-center gap-2 mt-1 text-amber-600 dark:text-amber-400 text-xs',
    hintIcon: 'w-3.5 h-3.5',
  },

  // ==================== PREVIEW SIDEBAR ====================
  preview: {
    container: 'sticky top-20 space-y-3', // ← top-20, space-y-3 (más compacto)

    card: 'backdrop-blur-xl bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200/50 dark:border-orange-800/50 p-3 shadow-lg', // ← p-3 (más compacto)

    header:
      'flex items-center gap-2 mb-3 pb-3 border-b border-orange-200 dark:border-orange-800',
    headerIcon:
      'w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30',
    headerIconSvg: 'w-4 h-4 text-white',
    headerTitle: 'text-sm font-bold text-orange-900 dark:text-orange-100',

    content: 'space-y-3',
    item: 'flex items-start gap-3',
    itemIcon:
      'w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5',
    itemContent: 'flex-1 min-w-0',
    itemLabel: 'text-xs font-medium text-gray-600 dark:text-gray-400',
    itemValue: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
    itemEmpty: 'text-sm text-gray-400 dark:text-gray-500 italic',
  },

  // ==================== BOTONES DE NAVEGACIÓN ====================
  navigation: {
    container:
      'backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-3 shadow-2xl shadow-orange-500/10', // ← p-3 (más compacto), sin sticky (se aplica inline)
    content: 'flex items-center justify-between',

    backButton:
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
    backIcon: 'w-4 h-4',

    nextButton:
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed',
    nextIcon: 'w-4 h-4',

    submitButton:
      'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
    submitIcon: 'w-4 h-4',

    stepIndicator: 'text-xs text-gray-600 dark:text-gray-400 font-medium',
  },

  // ==================== GRID DE LINDEROS ====================
  linderos: {
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-2', // ← gap-2 (ultra compacto)
  },

  // ==================== ANIMACIONES ====================
  animations: {
    container: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
    },
    step: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.2 },
    },
  },
}
