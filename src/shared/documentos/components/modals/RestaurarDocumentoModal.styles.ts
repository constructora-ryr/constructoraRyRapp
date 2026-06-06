import { type ModuleName } from '@/shared/config/module-themes'

const THEME_COLORS = {
  proyectos: {
    gradient: 'from-green-600 via-emerald-600 to-teal-600',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-900/50',
    text: 'text-green-600 dark:text-green-400',
    textDark: 'text-green-900 dark:text-green-300',
    hover: 'hover:from-green-700 hover:via-emerald-700 hover:to-teal-700',
  },
  viviendas: {
    gradient: 'from-orange-600 via-amber-600 to-yellow-600',
    bgLight: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-900/50',
    text: 'text-orange-600 dark:text-orange-400',
    textDark: 'text-orange-900 dark:text-orange-300',
    hover: 'hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700',
  },
  clientes: {
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    bgLight: 'bg-cyan-50 dark:bg-cyan-900/20',
    border: 'border-cyan-200 dark:border-cyan-900/50',
    text: 'text-cyan-600 dark:text-cyan-400',
    textDark: 'text-cyan-900 dark:text-cyan-300',
    hover: 'hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700',
  },
  negociaciones: {
    gradient: 'from-pink-600 via-purple-600 to-indigo-600',
    bgLight: 'bg-pink-50 dark:bg-pink-900/20',
    border: 'border-pink-200 dark:border-pink-900/50',
    text: 'text-pink-600 dark:text-pink-400',
    textDark: 'text-pink-900 dark:text-pink-300',
    hover: 'hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700',
  },
  abonos: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-900/50',
    text: 'text-blue-600 dark:text-blue-400',
    textDark: 'text-blue-900 dark:text-blue-300',
    hover: 'hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700',
  },
  documentos: {
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-900/50',
    text: 'text-red-600 dark:text-red-400',
    textDark: 'text-red-900 dark:text-red-300',
    hover: 'hover:from-red-700 hover:via-rose-700 hover:to-pink-700',
  },
  auditorias: {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-900/50',
    text: 'text-blue-600 dark:text-blue-400',
    textDark: 'text-blue-900 dark:text-blue-300',
    hover: 'hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700',
  },
  renuncias: {
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-900/50',
    text: 'text-red-600 dark:text-red-400',
    textDark: 'text-red-900 dark:text-red-300',
    hover: 'hover:from-red-700 hover:via-rose-700 hover:to-pink-700',
  },
  usuarios: {
    gradient: 'from-indigo-600 via-purple-600 to-fuchsia-600',
    bgLight: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-900/50',
    text: 'text-indigo-600 dark:text-indigo-400',
    textDark: 'text-indigo-900 dark:text-indigo-300',
    hover: 'hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700',
  },
  papelera: {
    gradient: 'from-slate-600 via-zinc-600 to-stone-600',
    bgLight: 'bg-slate-50 dark:bg-slate-900/20',
    border: 'border-slate-200 dark:border-slate-900/50',
    text: 'text-slate-600 dark:text-slate-400',
    textDark: 'text-slate-900 dark:text-slate-300',
    hover: 'hover:from-slate-700 hover:via-zinc-700 hover:to-stone-700',
  },
}

export const getRestaurarDocumentoModalStyles = (
  moduleName: ModuleName = 'proyectos'
) => {
  const colors = THEME_COLORS[moduleName] || THEME_COLORS.proyectos

  return {
    overlay: {
      container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
      backdrop: 'absolute inset-0 bg-black/60 backdrop-blur-sm',
    },
    modal: {
      container:
        'relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden',
    },
    header: {
      container: `bg-gradient-to-r ${colors.gradient} px-4 py-3`,
      content: 'flex items-center gap-3',
      icon: 'w-6 h-6 text-white',
      title: 'text-lg font-bold text-white',
      closeButton:
        'absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed',
    },
    content: {
      container: 'p-5 space-y-4',
      warningBox: `flex items-start gap-3 p-3 rounded-lg ${colors.bgLight} ${colors.border} border`,
      warningIcon: `w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`,
      warningTitle: `text-sm font-semibold ${colors.textDark}`,
      documentBox:
        'flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700',
      label:
        'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5',
      documentTitle: 'text-sm font-bold text-gray-900 dark:text-white',
      infoBox:
        'p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50',
      checkIcon: 'text-sm flex-shrink-0',
      infoText: 'text-xs text-blue-900 dark:text-blue-100',
    },
    footer: {
      container:
        'flex items-center justify-end gap-3 px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700',
      cancelButton:
        'px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
      confirmButton: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${colors.gradient} ${colors.hover} transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`,
    },
  } as const
}
