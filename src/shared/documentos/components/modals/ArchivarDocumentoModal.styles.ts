/**
 * ============================================
 * STYLES: ArchivarDocumentoModal
 * ============================================
 * Clases de Tailwind centralizadas
 */

import { type ModuleName, moduleThemes } from '@/shared/config/module-themes'

export const getArchivarDocumentoModalStyles = (
  moduleName: ModuleName = 'proyectos'
) => {
  const theme = moduleThemes[moduleName]

  return {
    // ✅ Responsive: p-2 móvil, p-4 tablet+
    overlay: 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4',
    backdrop: 'absolute inset-0 bg-black/60 backdrop-blur-sm',

    modal: {
      // ✅ Responsive: full width móvil, max-w-lg desktop
      container:
        'relative w-full max-w-full sm:max-w-lg rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden',
    },

    header: {
      // ✅ Theming dinámico + compactación estándar
      container: `relative overflow-hidden bg-gradient-to-r ${theme.classes.gradient.background} dark:${theme.classes.gradient.backgroundDark} px-4 sm:px-6 py-3 sm:py-4`,
      pattern:
        'absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black,transparent)]',
      content: 'relative z-10 flex items-center justify-between gap-2',
      iconWrapper:
        'flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md',
      icon: 'h-4 w-4 sm:h-5 sm:w-5 text-white',
      textWrapper: 'flex items-center gap-2 sm:gap-3 flex-1 min-w-0',
      title: 'text-base sm:text-lg font-bold text-white truncate',
      subtitle: 'text-xs text-white/80 hidden sm:block',
      closeButton:
        'rounded-lg p-1.5 sm:p-2 text-white/80 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 flex-shrink-0',
    },

    content: {
      // ✅ Padding responsive
      container:
        'p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto',

      infoBox: {
        wrapper:
          'rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-3 sm:p-4',
        label: 'text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1',
        value:
          'text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words',
        warning:
          'text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5',
        warningIcon: 'w-3.5 h-3.5 flex-shrink-0',
      },

      form: {
        field: 'space-y-2',
        label:
          'block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300',
        required: 'text-red-500',
        // ✅ Focus con color del módulo
        select: `w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg
                 ${theme.classes.input.focusBorder} ${theme.classes.input.focusRing} transition-all text-sm
                 text-gray-900 dark:text-white disabled:opacity-50`,
        textarea: `w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg
                   ${theme.classes.input.focusBorder} ${theme.classes.input.focusRing} transition-all resize-none text-sm
                   text-gray-900 dark:text-white placeholder:text-gray-400 disabled:opacity-50`,
      },

      alert: {
        wrapper:
          'flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50',
        icon: 'w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0',
        text: 'text-xs text-blue-900 dark:text-blue-100',
      },

      error: {
        wrapper:
          'flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50',
        icon: 'w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0',
        text: 'text-xs text-red-900 dark:text-red-100',
      },
    },

    footer: {
      // ✅ Footer responsive con stack vertical en móvil
      container:
        'flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900/50',
      cancelButton:
        'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50 order-2 sm:order-1',
      // ✅ Botón con gradiente del módulo
      confirmButton: `px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${theme.classes.gradient.background}
                      ${theme.classes.gradient.hover} rounded-lg transition-all shadow-lg
                      disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2`,
    },
  } as const
}
