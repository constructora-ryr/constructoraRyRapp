/**
 * Colores del cargador por módulo: degradado del ícono (clases completas
 * para que Tailwind las detecte) y los dos tonos del anillo (hex, para el
 * conic-gradient).
 */

import type { ModuleName } from '@/shared/config/module-themes'

export type TemaCarga = ModuleName | 'app'

interface ColoresCarga {
  gradient: string
  sombra: string
  anillo: [string, string]
}

export const COLORES_CARGA: Record<TemaCarga, ColoresCarga> = {
  app: {
    gradient: 'from-indigo-600 via-violet-600 to-purple-600',
    sombra: 'shadow-indigo-500/40',
    anillo: ['#6366F1', '#A855F7'],
  },
  clientes: {
    gradient:
      'from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800',
    sombra: 'shadow-cyan-500/40',
    anillo: ['#06B6D4', '#6366F1'],
  },
  proyectos: {
    gradient:
      'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
    sombra: 'shadow-green-500/40',
    anillo: ['#22C55E', '#14B8A6'],
  },
  viviendas: {
    gradient: 'from-orange-600 via-amber-600 to-yellow-500',
    sombra: 'shadow-orange-500/40',
    anillo: ['#F97316', '#EAB308'],
  },
  abonos: {
    gradient:
      'from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-700 dark:via-purple-800 dark:to-fuchsia-900',
    sombra: 'shadow-violet-500/40',
    anillo: ['#8B5CF6', '#D946EF'],
  },
  negociaciones: {
    gradient: 'from-pink-600 via-fuchsia-600 to-purple-600',
    sombra: 'shadow-pink-500/40',
    anillo: ['#EC4899', '#A855F7'],
  },
  documentos: {
    gradient: 'from-sky-600 via-blue-600 to-indigo-600',
    sombra: 'shadow-sky-500/40',
    anillo: ['#0EA5E9', '#6366F1'],
  },
  usuarios: {
    gradient: 'from-indigo-600 via-blue-600 to-sky-500',
    sombra: 'shadow-indigo-500/40',
    anillo: ['#6366F1', '#0EA5E9'],
  },
  auditorias: {
    gradient: 'from-indigo-600 via-purple-600 to-violet-600',
    sombra: 'shadow-indigo-500/40',
    anillo: ['#6366F1', '#8B5CF6'],
  },
  renuncias: {
    gradient:
      'from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800',
    sombra: 'shadow-rose-500/40',
    anillo: ['#EF4444', '#EC4899'],
  },
  papelera: {
    gradient: 'from-slate-600 via-slate-700 to-zinc-700',
    sombra: 'shadow-slate-500/40',
    anillo: ['#64748B', '#334155'],
  },
}
