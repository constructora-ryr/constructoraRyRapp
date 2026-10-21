// ============================================
// ESTILOS CENTRALIZADOS: Formulario Cliente Modern
// ============================================

/**
 * ⭐ SISTEMA DE ESTILOS CENTRALIZADOS
 *
 * Beneficios:
 * - Reutilización: Estilos compartidos entre componentes
 * - Mantenibilidad: Cambios en un solo lugar
 * - Legibilidad: Componentes más limpios
 * - Consistencia: Design system unificado
 */

// ===================
// MODAL & CONTENEDOR
// ===================

export const modalStyles = {
  overlay:
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm',

  container:
    'relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900',

  scrollArea:
    'max-h-[70vh] overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800',
}

// ===================
// HEADER
// ===================

export const headerStyles = {
  wrapper:
    'sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-purple-700 to-violet-600 px-8 py-6',

  content: 'flex items-center justify-between',

  titleSection: 'flex items-center gap-4',

  iconContainer:
    'flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30',

  icon: 'text-white',

  titleWrapper: 'flex flex-col',

  title: 'text-2xl font-bold text-white',

  subtitle: 'text-sm text-white/80',

  closeButton:
    'group rounded-lg p-2 text-white/80 transition-all hover:bg-white/20 hover:text-white hover:rotate-90',

  closeIcon: 'transition-transform duration-200',
}

// ===================
// FORMULARIO
// ===================

export const formStyles = {
  sectionTitle:
    'mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white',

  sectionIcon: 'text-purple-600 dark:text-purple-400',

  grid: 'grid grid-cols-1 gap-6 md:grid-cols-2',

  gridFull: 'grid grid-cols-1 gap-6',
}

// ===================
// INPUTS
// ===================

export const inputStyles = {
  label: 'mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300',

  required: 'text-red-500',

  // Input base (text, email, tel, number)
  base: 'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500',

  // Select
  select:
    'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white',

  // Textarea
  textarea:
    'w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-all placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 resize-none',

  // Input con error
  error: 'border-red-300 dark:border-red-700',

  errorMessage: 'mt-1 text-sm text-red-600 dark:text-red-400',

  // Input deshabilitado
  disabled: 'cursor-not-allowed opacity-60 bg-gray-100 dark:bg-gray-800',
}

// ===================
// RADIO BUTTONS (Tipo de Cliente)
// ===================

export const radioStyles = {
  wrapper: 'flex gap-4',

  option:
    'group relative flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all',

  optionDefault:
    'border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600',

  optionSelected:
    'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20 dark:border-purple-500 dark:bg-purple-900/20',

  iconWrapper:
    'flex h-10 w-10 items-center justify-center rounded-lg transition-all',

  iconDefault: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',

  iconSelected: 'bg-purple-500 text-white dark:bg-purple-600',

  labelWrapper: 'flex-1',

  label: 'font-semibold text-gray-900 dark:text-white',

  description: 'text-xs text-gray-500 dark:text-gray-400',

  radioInput:
    'h-5 w-5 border-2 border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:border-gray-600',
}

// ===================
// CÉDULA UPLOAD
// ===================

export const cedulaUploadStyles = {
  container:
    'rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800/50',

  uploadedContainer:
    'rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20',

  iconWrapper:
    'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30',

  icon: 'text-purple-600 dark:text-purple-400',

  title: 'mb-1 font-semibold text-gray-900 dark:text-white',

  description: 'mb-3 text-xs text-gray-500 dark:text-gray-400',

  button:
    'mx-auto flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-all hover:bg-purple-700',

  // Vista de archivo subido
  filePreview: 'flex items-center gap-3',

  fileIcon: 'text-purple-600 dark:text-purple-400',

  fileInfo: 'flex-1 text-left',

  fileName: 'font-semibold text-purple-900 dark:text-purple-100',

  fileSize: 'text-xs text-purple-600 dark:text-purple-400',

  deleteButton:
    'rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
}

// ===================
// BOTONES (Footer)
// ===================

export const buttonStyles = {
  // Botón cancelar
  cancel:
    'flex items-center gap-1.5 rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',

  // Botón borrador
  draft:
    'rounded-lg border-2 border-gray-300 px-5 py-2 font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',

  // Botón preview
  preview:
    'flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2 font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5',

  // Botón submit principal
  primary:
    'group flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2 font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',

  // Icono del botón (con animación)
  icon: 'transition-transform group-hover:translate-x-0.5',
}

// ===================
// FOOTER
// ===================

export const footerStyles = {
  wrapper:
    'sticky bottom-0 z-10 border-t border-gray-200 bg-white px-8 py-4 dark:border-gray-800 dark:bg-gray-900',

  content: 'flex items-center justify-between gap-4',

  leftSection: 'flex gap-3',

  rightSection: 'flex gap-3',
}

// ===================
// UTILIDADES
// ===================

export const utilityStyles = {
  // Badge/Tag
  badge:
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',

  badgePurple:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',

  badgeGreen:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',

  badgeRed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',

  // Divider
  divider: 'my-6 border-t border-gray-200 dark:border-gray-800',
}
