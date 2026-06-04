/**
 * ============================================
 * SISTEMA DE THEMING POR MÓDULO
 * ============================================
 *
 * Configuración centralizada de colores para cada módulo.
 * Permite reutilizar componentes con diferentes paletas de colores.
 *
 * USO:
 * ```tsx
 * import { moduleThemes } from '@/shared/config/module-themes'
 *
 * const theme = moduleThemes.proyectos
 * <button className={theme.button.primary}>Click</button>
 * ```
 */

export type ModuleName =
  | 'proyectos'
  | 'clientes'
  | 'viviendas'
  | 'auditorias'
  | 'negociaciones'
  | 'abonos'
  | 'documentos'
  | 'renuncias'
  | 'usuarios'
  | 'papelera'

export interface ModuleTheme {
  /** Nombre del módulo */
  name: string

  /** Colores principales */
  colors: {
    /** Color primario (ej: green-500) */
    primary: string
    /** Color secundario (ej: emerald-600) */
    secondary: string
    /** Color terciario (ej: teal-600) */
    tertiary: string
    /** Tono claro para fondos (ej: green-50) */
    light: string
    /** Tono oscuro para fondos dark mode (ej: green-900) */
    dark: string
  }

  /** Clases de Tailwind pre-construidas */
  classes: {
    /** Gradientes */
    gradient: {
      /** from-{primary} to-{secondary} */
      primary: string
      /** from-{primary} via-{secondary} to-{tertiary} */
      triple: string
      /** from-{light} to-{secondary}-light */
      background: string
      /** Dark mode background */
      backgroundDark: string
      /** Hover gradient */
      hover: string
    }

    /** Botones */
    button: {
      /** Botón primario con gradiente */
      primary: string
      /** Botón secundario outline */
      secondary: string
      /** Botón de hover */
      hover: string
    }

    /** Inputs */
    input: {
      /** focus:border-{primary}-500 */
      focusBorder: string
      /** focus:ring-{primary}-500/20 */
      focusRing: string
    }

    /** Bordes */
    border: {
      /** border-{primary}-200 */
      light: string
      /** border-{primary}-800 */
      dark: string
      /** Borde con hover */
      hover: string
    }

    /** Backgrounds */
    bg: {
      /** bg-{primary}-50 */
      light: string
      /** bg-{primary}-900/20 */
      dark: string
      /** Hover effect */
      hover: string
    }

    /** Focus rings */
    focus: {
      /** focus:ring-{primary}-500 */
      ring: string
      /** Dark mode focus ring */
      ringDark: string
    }

    /** Text colors */
    text: {
      /** text-{primary}-600 */
      primary: string
      /** text-{primary}-700 */
      secondary: string
      /** dark:text-{primary}-400 */
      dark: string
    }

    /** Badges */
    badge: {
      /** Badge primario bg-{primary}-600 */
      primary: string
      /** Badge secundario bg-{secondary}-600 */
      secondary: string
    }

    /** Shadows */
    shadow: string
  }
}

/** Configuración de temas por módulo */
export const moduleThemes: Record<ModuleName, ModuleTheme> = {
  /** 🏗️ PROYECTOS - Verde/Esmeralda/Teal */
  proyectos: {
    name: 'Proyectos',
    colors: {
      primary: 'green',
      secondary: 'emerald',
      tertiary: 'teal',
      light: 'green-50',
      dark: 'green-900',
    },
    classes: {
      gradient: {
        primary: 'from-green-600 to-emerald-600',
        triple: 'from-green-600 via-emerald-600 to-teal-600',
        background: 'from-green-500 via-emerald-500 to-teal-500',
        backgroundDark: 'from-green-600 via-emerald-600 to-teal-700',
        hover: 'hover:from-green-700 hover:via-emerald-700 hover:to-teal-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-green-300 bg-white text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-gray-700 dark:text-green-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-green-50 dark:hover:bg-green-900/20',
      },
      input: {
        focusBorder: 'focus:border-green-500',
        focusRing: 'focus:ring-2 focus:ring-green-500/20',
      },
      border: {
        light: 'border-green-200 dark:border-green-800',
        dark: 'border-green-800',
        hover: 'hover:border-green-400 dark:hover:border-green-500',
      },
      bg: {
        light: 'bg-green-50 dark:bg-green-900/20',
        dark: 'bg-green-900/20',
        hover: 'hover:bg-green-50 dark:hover:bg-green-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-green-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-green-400',
      },
      text: {
        primary: 'text-green-600 dark:text-green-400',
        secondary: 'text-green-700 dark:text-green-300',
        dark: 'dark:text-green-400',
      },
      badge: {
        primary: 'bg-green-600',
        secondary: 'bg-emerald-600',
      },
      shadow: 'shadow-green-500/10',
    },
  },

  /** 👥 CLIENTES - Cyan/Azul/Índigo */
  clientes: {
    name: 'Clientes',
    colors: {
      primary: 'cyan',
      secondary: 'blue',
      tertiary: 'indigo',
      light: 'cyan-50',
      dark: 'cyan-900',
    },
    classes: {
      gradient: {
        primary: 'from-cyan-600 to-blue-600',
        triple: 'from-cyan-600 via-blue-600 to-indigo-600',
        background: 'from-cyan-500 via-blue-500 to-indigo-500',
        backgroundDark: 'from-cyan-600 via-blue-600 to-indigo-700',
        hover: 'hover:from-cyan-700 hover:via-blue-700 hover:to-indigo-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-cyan-300 bg-white text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:bg-gray-700 dark:text-cyan-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
      },
      input: {
        focusBorder: 'focus:border-cyan-500',
        focusRing: 'focus:ring-2 focus:ring-cyan-500/20',
      },
      border: {
        light: 'border-cyan-200 dark:border-cyan-800',
        dark: 'border-cyan-800',
        hover: 'hover:border-cyan-400 dark:hover:border-cyan-500',
      },
      bg: {
        light: 'bg-cyan-50 dark:bg-cyan-900/20',
        dark: 'bg-cyan-900/20',
        hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-cyan-400',
      },
      text: {
        primary: 'text-cyan-600 dark:text-cyan-400',
        secondary: 'text-cyan-700 dark:text-cyan-300',
        dark: 'dark:text-cyan-400',
      },
      badge: {
        primary: 'bg-cyan-600',
        secondary: 'bg-blue-600',
      },
      shadow: 'shadow-cyan-500/10',
    },
  },

  /** 🏠 VIVIENDAS - Naranja/Ámbar/Amarillo */
  viviendas: {
    name: 'Viviendas',
    colors: {
      primary: 'orange',
      secondary: 'amber',
      tertiary: 'yellow',
      light: 'orange-50',
      dark: 'orange-900',
    },
    classes: {
      gradient: {
        primary: 'from-orange-600 to-amber-600',
        triple: 'from-orange-600 via-amber-600 to-yellow-600',
        background: 'from-orange-500 via-amber-500 to-yellow-500',
        backgroundDark: 'from-orange-600 via-amber-600 to-yellow-700',
        hover: 'hover:from-orange-700 hover:via-amber-700 hover:to-yellow-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-orange-300 bg-white text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:bg-gray-700 dark:text-orange-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20',
      },
      input: {
        focusBorder: 'focus:border-orange-500',
        focusRing: 'focus:ring-2 focus:ring-orange-500/20',
      },
      border: {
        light: 'border-orange-200 dark:border-orange-800',
        dark: 'border-orange-800',
        hover: 'hover:border-orange-400 dark:hover:border-orange-500',
      },
      bg: {
        light: 'bg-orange-50 dark:bg-orange-900/20',
        dark: 'bg-orange-900/20',
        hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-orange-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-orange-400',
      },
      text: {
        primary: 'text-orange-600 dark:text-orange-400',
        secondary: 'text-orange-700 dark:text-orange-300',
        dark: 'dark:text-orange-400',
      },
      badge: {
        primary: 'bg-orange-600',
        secondary: 'bg-amber-600',
      },
      shadow: 'shadow-orange-500/10',
    },
  },

  /** 📊 AUDITORÍAS - Teal/Cyan/Sky */
  auditorias: {
    name: 'Auditorías',
    colors: {
      primary: 'teal',
      secondary: 'cyan',
      tertiary: 'sky',
      light: 'teal-50',
      dark: 'teal-900',
    },
    classes: {
      gradient: {
        primary: 'from-teal-600 to-cyan-600',
        triple: 'from-teal-600 via-cyan-600 to-sky-600',
        background: 'from-teal-500 via-cyan-500 to-sky-500',
        backgroundDark: 'from-teal-600 via-cyan-600 to-sky-700',
        hover: 'hover:from-teal-700 hover:via-cyan-700 hover:to-sky-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-teal-300 bg-white text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:bg-gray-700 dark:text-teal-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/20',
      },
      input: {
        focusBorder: 'focus:border-teal-500',
        focusRing: 'focus:ring-2 focus:ring-teal-500/20',
      },
      border: {
        light: 'border-teal-200 dark:border-teal-800',
        dark: 'border-teal-800',
        hover: 'hover:border-teal-400 dark:hover:border-teal-500',
      },
      bg: {
        light: 'bg-teal-50 dark:bg-teal-900/20',
        dark: 'bg-teal-900/20',
        hover: 'hover:bg-teal-50 dark:hover:bg-teal-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-teal-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-teal-400',
      },
      text: {
        primary: 'text-teal-600 dark:text-teal-400',
        secondary: 'text-teal-700 dark:text-teal-300',
        dark: 'dark:text-teal-400',
      },
      badge: {
        primary: 'bg-teal-600',
        secondary: 'bg-cyan-600',
      },
      shadow: 'shadow-teal-500/10',
    },
  },

  /** 💰 NEGOCIACIONES - Rosa/Púrpura/Índigo */
  negociaciones: {
    name: 'Negociaciones',
    colors: {
      primary: 'pink',
      secondary: 'purple',
      tertiary: 'indigo',
      light: 'pink-50',
      dark: 'pink-900',
    },
    classes: {
      gradient: {
        primary: 'from-pink-600 to-purple-600',
        triple: 'from-pink-600 via-purple-600 to-indigo-600',
        background: 'from-pink-500 via-purple-500 to-indigo-500',
        backgroundDark: 'from-pink-600 via-purple-600 to-indigo-700',
        hover: 'hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-pink-300 bg-white text-pink-700 hover:bg-pink-50 dark:border-pink-700 dark:bg-gray-700 dark:text-pink-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
      },
      input: {
        focusBorder: 'focus:border-pink-500',
        focusRing: 'focus:ring-2 focus:ring-pink-500/20',
      },
      border: {
        light: 'border-pink-200 dark:border-pink-800',
        dark: 'border-pink-800',
        hover: 'hover:border-pink-400 dark:hover:border-pink-500',
      },
      bg: {
        light: 'bg-pink-50 dark:bg-pink-900/20',
        dark: 'bg-pink-900/20',
        hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-pink-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-pink-400',
      },
      text: {
        primary: 'text-pink-600 dark:text-pink-400',
        secondary: 'text-pink-700 dark:text-pink-300',
        dark: 'dark:text-pink-400',
      },
      badge: {
        primary: 'bg-pink-600',
        secondary: 'bg-purple-600',
      },
      shadow: 'shadow-pink-500/10',
    },
  },

  /** 💳 ABONOS - Violet/Púrpura/Índigo */
  abonos: {
    name: 'Abonos',
    colors: {
      primary: 'violet',
      secondary: 'purple',
      tertiary: 'indigo',
      light: 'violet-50',
      dark: 'violet-900',
    },
    classes: {
      gradient: {
        primary: 'from-violet-600 to-purple-600',
        triple: 'from-violet-600 via-purple-600 to-indigo-600',
        background: 'from-violet-500 via-purple-500 to-indigo-500',
        backgroundDark: 'from-violet-600 via-purple-600 to-indigo-700',
        hover: 'hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-violet-300 bg-white text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:bg-gray-700 dark:text-violet-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/20',
      },
      input: {
        focusBorder: 'focus:border-violet-500',
        focusRing: 'focus:ring-2 focus:ring-violet-500/20',
      },
      border: {
        light: 'border-violet-200 dark:border-violet-800',
        dark: 'border-violet-800',
        hover: 'hover:border-violet-400 dark:hover:border-violet-500',
      },
      bg: {
        light: 'bg-violet-50 dark:bg-violet-900/20',
        dark: 'bg-violet-900/20',
        hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-violet-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-violet-400',
      },
      text: {
        primary: 'text-violet-600 dark:text-violet-400',
        secondary: 'text-violet-700 dark:text-violet-300',
        dark: 'dark:text-violet-400',
      },
      badge: {
        primary: 'bg-violet-600',
        secondary: 'bg-purple-600',
      },
      shadow: 'shadow-violet-500/10',
    },
  },

  /** 📄 DOCUMENTOS - Rojo/Rosa/Pink */
  documentos: {
    name: 'Documentos',
    colors: {
      primary: 'red',
      secondary: 'rose',
      tertiary: 'pink',
      light: 'red-50',
      dark: 'red-900',
    },
    classes: {
      gradient: {
        primary: 'from-red-600 to-rose-600',
        triple: 'from-red-600 via-rose-600 to-pink-600',
        background: 'from-red-500 via-rose-500 to-pink-500',
        backgroundDark: 'from-red-600 via-rose-600 to-pink-700',
        hover: 'hover:from-red-700 hover:via-rose-700 hover:to-pink-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-700 dark:text-red-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      },
      input: {
        focusBorder: 'focus:border-red-500',
        focusRing: 'focus:ring-2 focus:ring-red-500/20',
      },
      border: {
        light: 'border-red-200 dark:border-red-800',
        dark: 'border-red-800',
        hover: 'hover:border-red-400 dark:hover:border-red-500',
      },
      bg: {
        light: 'bg-red-50 dark:bg-red-900/20',
        dark: 'bg-red-900/20',
        hover: 'hover:bg-red-50 dark:hover:bg-red-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-red-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-red-400',
      },
      text: {
        primary: 'text-red-600 dark:text-red-400',
        secondary: 'text-red-700 dark:text-red-300',
        dark: 'dark:text-red-400',
      },
      badge: {
        primary: 'bg-red-600',
        secondary: 'bg-rose-600',
      },
      shadow: 'shadow-red-500/10',
    },
  },

  /** 🚫 RENUNCIAS - Rojo/Rosa/Pink (degradado cálido) */
  renuncias: {
    name: 'Renuncias',
    colors: {
      primary: 'red',
      secondary: 'rose',
      tertiary: 'pink',
      light: 'red-50',
      dark: 'red-900',
    },
    classes: {
      gradient: {
        primary: 'from-red-600 to-rose-600',
        triple: 'from-red-600 via-rose-600 to-pink-600',
        background: 'from-red-500 via-rose-500 to-pink-500',
        backgroundDark: 'from-red-600 via-rose-600 to-pink-700',
        hover: 'hover:from-red-700 hover:via-rose-700 hover:to-pink-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-gray-700 dark:text-red-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      },
      input: {
        focusBorder: 'focus:border-red-500',
        focusRing: 'focus:ring-2 focus:ring-red-500/20',
      },
      border: {
        light: 'border-red-200 dark:border-red-800',
        dark: 'border-red-800',
        hover: 'hover:border-red-400 dark:hover:border-red-500',
      },
      bg: {
        light: 'bg-red-50 dark:bg-red-900/20',
        dark: 'bg-red-900/20',
        hover: 'hover:bg-red-50 dark:hover:bg-red-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-red-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-red-400',
      },
      text: {
        primary: 'text-red-600 dark:text-red-400',
        secondary: 'text-red-700 dark:text-red-300',
        dark: 'dark:text-red-400',
      },
      badge: {
        primary: 'bg-red-600',
        secondary: 'bg-rose-600',
      },
      shadow: 'shadow-red-500/10',
    },
  },

  /** 👤 USUARIOS - Índigo/Púrpura/Fuchsia */
  usuarios: {
    name: 'Usuarios',
    colors: {
      primary: 'indigo',
      secondary: 'purple',
      tertiary: 'fuchsia',
      light: 'indigo-50',
      dark: 'indigo-900',
    },
    classes: {
      gradient: {
        primary: 'from-indigo-600 to-purple-600',
        triple: 'from-indigo-600 via-purple-600 to-fuchsia-600',
        background: 'from-indigo-500 via-purple-500 to-fuchsia-500',
        backgroundDark: 'from-indigo-600 via-purple-600 to-fuchsia-700',
        hover:
          'hover:from-indigo-700 hover:via-purple-700 hover:to-fuchsia-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-gray-700 dark:text-indigo-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
      },
      input: {
        focusBorder: 'focus:border-indigo-500',
        focusRing: 'focus:ring-2 focus:ring-indigo-500/20',
      },
      border: {
        light: 'border-indigo-200 dark:border-indigo-800',
        dark: 'border-indigo-800',
        hover: 'hover:border-indigo-400 dark:hover:border-indigo-500',
      },
      bg: {
        light: 'bg-indigo-50 dark:bg-indigo-900/20',
        dark: 'bg-indigo-900/20',
        hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-indigo-400',
      },
      text: {
        primary: 'text-indigo-600 dark:text-indigo-400',
        secondary: 'text-indigo-700 dark:text-indigo-300',
        dark: 'dark:text-indigo-400',
      },
      badge: {
        primary: 'bg-indigo-600',
        secondary: 'bg-purple-600',
      },
      shadow: 'shadow-indigo-500/10',
    },
  },

  /** 🗑️ PAPELERA - Slate/Zinc/Stone */
  papelera: {
    name: 'Papelera',
    colors: {
      primary: 'slate',
      secondary: 'zinc',
      tertiary: 'stone',
      light: 'slate-50',
      dark: 'slate-900',
    },
    classes: {
      gradient: {
        primary: 'from-slate-600 to-zinc-600',
        triple: 'from-slate-500 via-zinc-600 to-stone-600',
        background: 'from-slate-500 via-zinc-500 to-stone-500',
        backgroundDark: 'from-slate-600 via-zinc-600 to-stone-700',
        hover: 'hover:from-slate-700 hover:via-zinc-700 hover:to-stone-700',
      },
      button: {
        primary:
          'bg-gradient-to-r from-slate-600 to-zinc-600 hover:from-slate-700 hover:to-zinc-700 text-white shadow-md hover:shadow-lg transition-all',
        secondary:
          'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-gray-600',
        hover: 'hover:bg-slate-50 dark:hover:bg-slate-900/20',
      },
      input: {
        focusBorder: 'focus:border-slate-500',
        focusRing: 'focus:ring-2 focus:ring-slate-500/20',
      },
      border: {
        light: 'border-slate-200 dark:border-slate-800',
        dark: 'border-slate-800',
        hover: 'hover:border-slate-400 dark:hover:border-slate-500',
      },
      bg: {
        light: 'bg-slate-50 dark:bg-slate-900/20',
        dark: 'bg-slate-900/20',
        hover: 'hover:bg-slate-50 dark:hover:bg-slate-900/30',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-slate-500 focus:border-transparent',
        ringDark: 'dark:focus:ring-slate-400',
      },
      text: {
        primary: 'text-slate-600 dark:text-slate-400',
        secondary: 'text-slate-700 dark:text-slate-300',
        dark: 'dark:text-slate-400',
      },
      badge: {
        primary: 'bg-slate-600',
        secondary: 'bg-zinc-600',
      },
      shadow: 'shadow-slate-500/10',
    },
  },
}

/**
 * Helper para obtener el tema de un módulo
 */
export function getModuleTheme(module: ModuleName): ModuleTheme {
  return moduleThemes[module]
}

/**
 * Helper para construir clases dinámicamente con el tema
 */
export function buildThemeClass(
  module: ModuleName,
  ...classKeys: string[]
): string {
  // Aquí podrías implementar lógica para acceder a clases anidadas si lo necesitas
  void getModuleTheme(module)
  return classKeys.join(' ')
}
