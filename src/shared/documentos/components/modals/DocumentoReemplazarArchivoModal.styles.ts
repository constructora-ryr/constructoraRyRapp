/**
 * Estilos centralizados para DocumentoReemplazarArchivoModal
 * Cumple con regla de separación de responsabilidades
 * ✅ Theming dinámico por módulo
 */

import { type ModuleName } from '@/shared/config/module-themes'

// Configuración de colores por módulo
const THEME_COLORS = {
  proyectos: {
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    bg: 'bg-green-500',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900/50',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    textDark: 'text-green-900 dark:text-green-300',
    textMedium: 'text-green-800 dark:text-green-400',
    focusBorder: 'focus:border-green-500',
    focusRing: 'focus:ring-green-500/20',
    hover: 'hover:from-green-700 hover:via-emerald-700 hover:to-teal-700',
  },
  viviendas: {
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    bg: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900/50',
    bgLight: 'bg-orange-50 dark:bg-orange-900/20',
    textDark: 'text-orange-900 dark:text-orange-300',
    textMedium: 'text-orange-800 dark:text-orange-400',
    focusBorder: 'focus:border-orange-500',
    focusRing: 'focus:ring-orange-500/20',
    hover: 'hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700',
  },
  clientes: {
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    bg: 'bg-cyan-500',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-900/50',
    bgLight: 'bg-cyan-50 dark:bg-cyan-900/20',
    textDark: 'text-cyan-900 dark:text-cyan-300',
    textMedium: 'text-cyan-800 dark:text-cyan-400',
    focusBorder: 'focus:border-cyan-500',
    focusRing: 'focus:ring-cyan-500/20',
    hover: 'hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700',
  },
  negociaciones: {
    gradient: 'from-pink-600 via-purple-600 to-indigo-600',
    bg: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-900/50',
    bgLight: 'bg-pink-50 dark:bg-pink-900/20',
    textDark: 'text-pink-900 dark:text-pink-300',
    textMedium: 'text-pink-800 dark:text-pink-400',
    focusBorder: 'focus:border-pink-500',
    focusRing: 'focus:ring-pink-500/20',
    hover: 'hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700',
  },
  abonos: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    bg: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/50',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    textDark: 'text-blue-900 dark:text-blue-300',
    textMedium: 'text-blue-800 dark:text-blue-400',
    focusBorder: 'focus:border-blue-500',
    focusRing: 'focus:ring-blue-500/20',
    hover: 'hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700',
  },
  documentos: {
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    bg: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900/50',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    textDark: 'text-red-900 dark:text-red-300',
    textMedium: 'text-red-800 dark:text-red-400',
    focusBorder: 'focus:border-red-500',
    focusRing: 'focus:ring-red-500/20',
    hover: 'hover:from-red-700 hover:via-rose-700 hover:to-pink-700',
  },
  auditorias: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    bg: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/50',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    textDark: 'text-blue-900 dark:text-blue-300',
    textMedium: 'text-blue-800 dark:text-blue-400',
    focusBorder: 'focus:border-blue-500',
    focusRing: 'focus:ring-blue-500/20',
    hover: 'hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700',
  },
  renuncias: {
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    bg: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900/50',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    textDark: 'text-red-900 dark:text-red-300',
    textMedium: 'text-red-800 dark:text-red-400',
    focusBorder: 'focus:border-red-500',
    focusRing: 'focus:ring-red-500/20',
    hover: 'hover:from-red-700 hover:via-rose-700 hover:to-pink-700',
  },
  usuarios: {
    gradient: 'from-indigo-600 via-purple-600 to-fuchsia-600',
    bg: 'bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-900/50',
    bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
    textDark: 'text-indigo-900 dark:text-indigo-300',
    textMedium: 'text-indigo-800 dark:text-indigo-400',
    focusBorder: 'focus:border-indigo-500',
    focusRing: 'focus:ring-indigo-500/20',
    hover: 'hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700',
  },
  papelera: {
    gradient: 'from-slate-600 via-zinc-600 to-stone-600',
    bg: 'bg-slate-500',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-900/50',
    bgLight: 'bg-slate-50 dark:bg-slate-900/20',
    textDark: 'text-slate-900 dark:text-slate-300',
    textMedium: 'text-slate-800 dark:text-slate-400',
    focusBorder: 'focus:border-slate-500',
    focusRing: 'focus:ring-slate-500/20',
    hover: 'hover:from-slate-700 hover:via-zinc-700 hover:to-stone-700',
  },
}

export const getReemplazarArchivoModalStyles = (
  moduleName: ModuleName = 'proyectos'
) => {
  const colors = THEME_COLORS[moduleName] || THEME_COLORS.proyectos

  return {
    // Contenedor principal
    backdrop: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    backdropOverlay: 'absolute inset-0 bg-black/60 backdrop-blur-sm',
    modal:
      'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl',

    // Header con colores dinámicos
    header: {
      container: `sticky top-0 z-10 bg-gradient-to-r ${colors.gradient} px-4 py-3`,
      content: 'flex items-center justify-between',
      leftSection: 'flex items-center gap-2.5',
      icon: 'rounded-lg bg-white/20 p-1.5',
      title: 'text-base font-bold text-white flex items-center gap-2',
      badge: 'text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/20',
      subtitle: 'text-xs text-white/80',
      closeButton:
        'rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white disabled:opacity-50',
    },

    // Advertencia con colores dinámicos
    warning: {
      container: `mx-4 mt-3 rounded-lg border ${colors.border} ${colors.bgLight} p-3`,
      content: 'flex gap-2',
      icon: `flex-shrink-0 ${colors.text} mt-0.5`,
      title: `text-sm font-semibold ${colors.textDark}`,
      list: `mt-1.5 space-y-0.5 text-xs ${colors.textMedium}`,
    },

    // Formulario con colores dinámicos
    form: {
      container: 'p-4 space-y-3',
      label:
        'flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5',
      input: `w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs transition-all ${colors.focusBorder} ${colors.focusRing} disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900`,
      textarea: `w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs transition-all ${colors.focusBorder} ${colors.focusRing} disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 resize-none`,
      helperText: 'mt-1 text-[10px] text-gray-500',
    },

    // Archivo actual
    currentFile: {
      container: 'rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50',
      label:
        'flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5',
      filename: 'text-sm font-semibold text-gray-900 dark:text-white',
      size: 'text-xs text-gray-500 dark:text-gray-500 mt-1',
    },

    // Drag & Drop con colores dinámicos
    dragDrop: {
      containerBase:
        'relative rounded-lg border-2 border-dashed p-4 text-center transition-all',
      containerActive: `border-${moduleName === 'proyectos' ? 'green' : moduleName === 'clientes' ? 'cyan' : 'orange'}-500 ${colors.bgLight}`,
      containerInactive:
        'border-gray-300 hover:border-gray-400 dark:border-gray-700',
      containerDisabled: 'opacity-50 pointer-events-none',
      input:
        'absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed',
      content: 'flex flex-col items-center gap-1.5',
      iconWrapper: `rounded-full ${colors.bgLight.replace('dark:', '').trim()} p-2`,
      icon: colors.text,
      filename: 'text-xs font-medium text-gray-900 dark:text-white',
      fileSize: 'text-[10px] text-gray-500',
      changeButton: `text-[10px] ${colors.text} hover:opacity-70 mt-0.5`,
      emptyTitle: 'text-xs font-medium text-gray-900 dark:text-white',
      emptySubtitle: 'text-[10px] text-gray-500',
    },

    // Barra de progreso con colores dinámicos
    progress: {
      container: 'space-y-1.5',
      header: 'flex items-center justify-between text-xs',
      label: 'text-gray-600 dark:text-gray-400',
      percentage: `font-medium ${colors.text}`,
      bar: 'h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
      fill: `h-full bg-gradient-to-r ${colors.gradient}`,
    },

    // Botones con colores dinámicos
    buttons: {
      container:
        'flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200 dark:border-gray-700',
      cancel:
        'flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700',
      submit: `w-full rounded-lg bg-gradient-to-r ${colors.gradient} px-3 py-2 text-xs font-semibold text-white transition-all ${colors.hover} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5`,
      tooltipWrapper: 'flex-1 relative group',
    },

    // Tooltip
    tooltip: {
      container:
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-10',
      arrow:
        'absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700',
    },
  } as const
}

// Export para compatibilidad con código existente (default a proyectos)
export const reemplazarArchivoModalStyles =
  getReemplazarArchivoModalStyles('proyectos')
