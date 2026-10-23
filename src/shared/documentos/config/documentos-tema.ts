/**
 * Tema de color del sistema de documentos según el módulo que lo muestra.
 * Mismos degradados que el encabezado de cada módulo (Clientes cian→índigo,
 * Proyectos verde→teal, Viviendas naranja→ámbar), en lugar de colores fijos.
 */

import type { ModuleName } from '@/shared/config/module-themes'

export interface TemaDocumentos {
  /** Degradado fuerte: pestaña activa, botón principal, encabezado de tabla */
  gradient: string
  /** Sombra del botón principal */
  sombra: string
  /** Fondo suave + texto (chips, hover) */
  suave: string
  /** Texto de acento */
  texto: string
  /** Anillo de foco */
  foco: string
}

const TEMA_CLIENTES: TemaDocumentos = {
  gradient:
    'from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800',
  sombra: 'shadow-cyan-500/25',
  suave:
    'bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-400/20',
  texto: 'text-cyan-700 dark:text-cyan-300',
  foco: 'focus:border-cyan-400 focus:ring-cyan-200 dark:focus:ring-cyan-900',
}

const TEMAS: Partial<Record<ModuleName, TemaDocumentos>> = {
  clientes: TEMA_CLIENTES,
  proyectos: {
    gradient:
      'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
    sombra: 'shadow-green-500/25',
    suave:
      'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
    texto: 'text-green-700 dark:text-green-300',
    foco: 'focus:border-green-400 focus:ring-green-200 dark:focus:ring-green-900',
  },
  viviendas: {
    gradient:
      'from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-amber-800',
    sombra: 'shadow-orange-500/25',
    suave:
      'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20',
    texto: 'text-orange-700 dark:text-orange-300',
    foco: 'focus:border-orange-400 focus:ring-orange-200 dark:focus:ring-orange-900',
  },
}

export const temaDocumentos = (moduleName?: ModuleName): TemaDocumentos =>
  (moduleName && TEMAS[moduleName]) || TEMA_CLIENTES
