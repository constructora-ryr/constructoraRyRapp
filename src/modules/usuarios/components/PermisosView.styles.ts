/**
 * PermisosView.styles.ts — Identidad visual de la matriz de permisos.
 * Cada módulo usa el mismo color que su página en la app (Proyectos verde,
 * Viviendas naranja, Clientes cian, Abonos violeta, …).
 */

import {
  Activity,
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Handshake,
  Home,
  Settings2,
  Shield,
  Trash2,
  UserCog,
  UserMinus,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface ModuloVisual {
  icon: LucideIcon
  /** Degradado del cuadro del ícono (bg-gradient-to-br + estas clases) */
  gradient: string
  /** Barra de acento a la izquierda del encabezado del módulo */
  accent: string
}

export const MODULO_VISUAL: Record<string, ModuloVisual> = {
  proyectos: {
    icon: Building2,
    gradient: 'from-green-500 to-emerald-600',
    accent: 'bg-green-500',
  },
  viviendas: {
    icon: Home,
    gradient: 'from-orange-500 to-amber-500',
    accent: 'bg-orange-500',
  },
  clientes: {
    icon: Users,
    gradient: 'from-cyan-500 to-blue-600',
    accent: 'bg-cyan-500',
  },
  negociaciones: {
    icon: Handshake,
    gradient: 'from-pink-500 to-purple-600',
    accent: 'bg-pink-500',
  },
  abonos: {
    icon: CreditCard,
    gradient: 'from-violet-500 to-fuchsia-600',
    accent: 'bg-violet-500',
  },
  documentos: {
    icon: FileText,
    gradient: 'from-red-500 to-rose-600',
    accent: 'bg-red-500',
  },
  renuncias: {
    icon: UserMinus,
    gradient: 'from-rose-500 to-red-600',
    accent: 'bg-rose-500',
  },
  usuarios: {
    icon: UserCog,
    gradient: 'from-indigo-500 to-sky-500',
    accent: 'bg-indigo-500',
  },
  auditorias: {
    icon: Activity,
    gradient: 'from-teal-500 to-cyan-600',
    accent: 'bg-teal-500',
  },
  reportes: {
    icon: BarChart3,
    gradient: 'from-sky-500 to-blue-600',
    accent: 'bg-sky-500',
  },
  administracion: {
    icon: Settings2,
    gradient: 'from-slate-500 to-slate-700',
    accent: 'bg-slate-500',
  },
  papelera: {
    icon: Trash2,
    gradient: 'from-slate-500 to-slate-700',
    accent: 'bg-slate-500',
  },
}

export const moduloVisual = (modulo: string): ModuloVisual =>
  MODULO_VISUAL[modulo] ?? {
    icon: Shield,
    gradient: 'from-slate-500 to-slate-700',
    accent: 'bg-slate-400',
  }

/** Interruptor de permiso por rol: encendido con el degradado del rol */
export const toggleStyles = {
  base: 'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-400 disabled:cursor-wait',
  on: 'bg-gradient-to-br text-white shadow-sm hover:scale-110 hover:shadow-md',
  off: 'border-2 border-dashed border-slate-200 text-slate-300 hover:scale-110 hover:border-slate-300 hover:text-slate-400 dark:border-slate-600 dark:text-slate-600 dark:hover:border-slate-500',
  admin:
    'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-400 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
} as const
