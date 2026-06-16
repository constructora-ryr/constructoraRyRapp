/**
 * Estilos paramétricos para Accordion Wizard
 * Usa SOLO strings completos de Tailwind (JIT-safe, sin interpolación dinámica)
 * Colores del módulo vienen de moduleThemes.classes (pre-built)
 */

import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

// ============================================================
// MAPAS DE CLASES COMPLETAS POR MÓDULO (Tailwind JIT-safe)
// ============================================================

const PAGE_BG: Record<string, string> = {
  proyectos:
    'min-h-screen bg-gradient-to-br from-gray-50 via-green-50/20 to-emerald-50/20 dark:from-gray-950 dark:via-green-950/10 dark:to-emerald-950/10',
  viviendas:
    'min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-amber-50/20 dark:from-gray-950 dark:via-orange-950/10 dark:to-amber-950/10',
  clientes:
    'min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/20 to-blue-50/20 dark:from-gray-950 dark:via-cyan-950/10 dark:to-blue-950/10',
  negociaciones:
    'min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/20 to-purple-50/20 dark:from-gray-950 dark:via-pink-950/10 dark:to-purple-950/10',
  abonos:
    'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-indigo-950/10',
  documentos:
    'min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-rose-50/20 dark:from-gray-950 dark:via-red-950/10 dark:to-rose-950/10',
  auditorias:
    'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-indigo-950/10',
}

const SECTION_ACTIVE: Record<string, string> = {
  proyectos:
    'border-green-300 dark:border-green-700 border-l-4 border-l-green-500 bg-white dark:bg-gray-900 shadow-lg shadow-green-500/5',
  viviendas:
    'border-orange-300 dark:border-orange-700 border-l-4 border-l-orange-500 bg-white dark:bg-gray-900 shadow-lg shadow-orange-500/5',
  clientes:
    'border-cyan-300 dark:border-cyan-700 border-l-4 border-l-cyan-500 bg-white dark:bg-gray-900 shadow-lg shadow-cyan-500/5',
  negociaciones:
    'border-pink-300 dark:border-pink-700 border-l-4 border-l-pink-500 bg-white dark:bg-gray-900 shadow-lg shadow-pink-500/5',
  abonos:
    'border-blue-300 dark:border-blue-700 border-l-4 border-l-blue-500 bg-white dark:bg-gray-900 shadow-lg shadow-blue-500/5',
  documentos:
    'border-red-300 dark:border-red-700 border-l-4 border-l-red-500 bg-white dark:bg-gray-900 shadow-lg shadow-red-500/5',
  auditorias:
    'border-blue-300 dark:border-blue-700 border-l-4 border-l-blue-500 bg-white dark:bg-gray-900 shadow-lg shadow-blue-500/5',
}

const STEP_CIRCLE_ACTIVE: Record<string, string> = {
  proyectos:
    'w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center',
  viviendas:
    'w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center',
  clientes:
    'w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center',
  negociaciones:
    'w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center',
  abonos:
    'w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center',
  documentos:
    'w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center',
  auditorias:
    'w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center',
}

const STEP_NUMBER_ACTIVE: Record<string, string> = {
  proyectos: 'text-sm font-bold text-green-600 dark:text-green-400',
  viviendas: 'text-sm font-bold text-orange-600 dark:text-orange-400',
  clientes: 'text-sm font-bold text-cyan-600 dark:text-cyan-400',
  negociaciones: 'text-sm font-bold text-pink-600 dark:text-pink-400',
  abonos: 'text-sm font-bold text-blue-600 dark:text-blue-400',
  documentos: 'text-sm font-bold text-red-600 dark:text-red-400',
  auditorias: 'text-sm font-bold text-blue-600 dark:text-blue-400',
}

const FIELD_LABEL_VALID: Record<string, string> = {
  proyectos: 'peer-valid:text-green-600 dark:peer-valid:text-green-400',
  viviendas: 'peer-valid:text-orange-600 dark:peer-valid:text-orange-400',
  clientes: 'peer-valid:text-cyan-600 dark:peer-valid:text-cyan-400',
  negociaciones: 'peer-valid:text-pink-600 dark:peer-valid:text-pink-400',
  abonos: 'peer-valid:text-blue-600 dark:peer-valid:text-blue-400',
  documentos: 'peer-valid:text-red-600 dark:peer-valid:text-red-400',
  auditorias: 'peer-valid:text-blue-600 dark:peer-valid:text-blue-400',
}

const FIELD_FOCUS: Record<string, string> = {
  proyectos:
    'focus:border-green-500 focus:shadow-[0_0_0_3px] focus:shadow-green-500/15',
  viviendas:
    'focus:border-orange-500 focus:shadow-[0_0_0_3px] focus:shadow-orange-500/15',
  clientes:
    'focus:border-cyan-500 focus:shadow-[0_0_0_3px] focus:shadow-cyan-500/15',
  negociaciones:
    'focus:border-pink-500 focus:shadow-[0_0_0_3px] focus:shadow-pink-500/15',
  abonos:
    'focus:border-blue-500 focus:shadow-[0_0_0_3px] focus:shadow-blue-500/15',
  documentos:
    'focus:border-red-500 focus:shadow-[0_0_0_3px] focus:shadow-red-500/15',
  auditorias:
    'focus:border-blue-500 focus:shadow-[0_0_0_3px] focus:shadow-blue-500/15',
}

const DOT_ACTIVE: Record<string, string> = {
  proyectos: 'bg-green-500 w-6 rounded-full',
  viviendas: 'bg-orange-500 w-6 rounded-full',
  clientes: 'bg-cyan-500 w-6 rounded-full',
  negociaciones: 'bg-pink-500 w-6 rounded-full',
  abonos: 'bg-blue-500 w-6 rounded-full',
  documentos: 'bg-red-500 w-6 rounded-full',
  auditorias: 'bg-blue-500 w-6 rounded-full',
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

export const getAccordionWizardStyles = (moduleName: ModuleName) => {
  const theme = moduleThemes[moduleName]
  const fallback = 'proyectos'

  return {
    page: {
      container: PAGE_BG[moduleName] ?? PAGE_BG[fallback],
      content: 'max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-3',
    },
    breadcrumbs: {
      container: 'flex items-center justify-between gap-2 text-sm mb-6',
      crumbs: 'flex items-center gap-2',
      link: 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors',
      separator: 'text-gray-300 dark:text-gray-600',
      current: `${theme.classes.text.primary} font-medium`,
      cancel:
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
    },
    section: {
      base: 'rounded-2xl border-2 transition-all duration-200',
      completed:
        'border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500 bg-white dark:bg-gray-900 hover:shadow-md cursor-pointer px-6 py-4',
      active: `rounded-2xl border-2 overflow-hidden ${SECTION_ACTIVE[moduleName] ?? SECTION_ACTIVE[fallback]}`,
      pending:
        'border-gray-200 dark:border-gray-800 border-l-4 border-l-gray-300 dark:border-l-gray-600 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 opacity-50',
    },
    stepCircle: {
      completed:
        'w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center',
      active: STEP_CIRCLE_ACTIVE[moduleName] ?? STEP_CIRCLE_ACTIVE[fallback],
      pending:
        'w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center',
    },
    stepNumber: {
      active: STEP_NUMBER_ACTIVE[moduleName] ?? STEP_NUMBER_ACTIVE[fallback],
      pending: 'text-sm font-medium text-gray-400 dark:text-gray-500',
    },
    progressBar: {
      track: 'h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden',
      fill: `h-full bg-gradient-to-r ${theme.classes.gradient.primary} rounded-full`,
    },
    field: {
      inputBase:
        'w-full px-4 pt-5 pb-2 rounded-xl border-2 text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-transparent transition-all duration-200 focus:outline-none',
      inputFocus: FIELD_FOCUS[moduleName] ?? FIELD_FOCUS[fallback],
      inputError:
        'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px] focus:shadow-red-500/15',
      labelFloated: theme.classes.text.primary,
      labelValid: FIELD_LABEL_VALID[moduleName] ?? FIELD_LABEL_VALID[fallback],
    },
    navigation: {
      container:
        'flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800',
      backButton:
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
      nextButton: `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${theme.classes.gradient.primary} shadow-md ${theme.classes.shadow} hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`,
      submitButton:
        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-500/20 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
      dot: 'h-2 rounded-full transition-all duration-300',
      dotCompleted: 'w-2 bg-green-500',
      dotActive: DOT_ACTIVE[moduleName] ?? DOT_ACTIVE[fallback],
      dotPending: 'w-2 bg-gray-300 dark:bg-gray-600',
    },
    editButton: `${theme.classes.text.primary} text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity`,
  } as const
}
