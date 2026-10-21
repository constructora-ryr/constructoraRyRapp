/**
 * Identidad visual de roles y estados de usuario (listado, tarjetas de filtro).
 * Mismo formato que @/shared/config/estados.colors: badge + degradado + texto.
 */

import {
  Ban,
  Briefcase,
  Calculator,
  HardHat,
  MailQuestion,
  ShieldCheck,
  UserCheck,
  UserX,
  type LucideIcon,
} from 'lucide-react'

import type { EstadoUsuario, Rol, Usuario } from '../types'
import { esPendiente } from '../types'

export interface UsuarioVisual {
  label: string
  icon: LucideIcon
  /** Badge: fondo suave, texto y anillo */
  badge: string
  /** Degradado para avatar / cuadro del ícono (bg-gradient-to-br + estas clases) */
  gradient: string
  /** Color del número en tarjetas */
  text: string
  /** Tarjeta de filtro seleccionada */
  selected: string
}

const tono = {
  rose: {
    badge:
      'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
    gradient: 'from-rose-500 to-red-600',
    text: 'text-rose-600 dark:text-rose-400',
    selected:
      'border-rose-400 bg-rose-50/80 ring-2 ring-rose-400/40 dark:border-rose-500/60 dark:bg-rose-500/10',
  },
  violet: {
    badge:
      'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
    gradient: 'from-violet-500 to-purple-600',
    text: 'text-violet-600 dark:text-violet-400',
    selected:
      'border-violet-400 bg-violet-50/80 ring-2 ring-violet-400/40 dark:border-violet-500/60 dark:bg-violet-500/10',
  },
  sky: {
    badge:
      'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
    gradient: 'from-sky-500 to-blue-600',
    text: 'text-sky-600 dark:text-sky-400',
    selected:
      'border-sky-400 bg-sky-50/80 ring-2 ring-sky-400/40 dark:border-sky-500/60 dark:bg-sky-500/10',
  },
  amber: {
    badge:
      'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
    gradient: 'from-amber-400 to-orange-500',
    text: 'text-amber-600 dark:text-amber-400',
    selected:
      'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/40 dark:border-amber-500/60 dark:bg-amber-500/10',
  },
  emerald: {
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
    gradient: 'from-emerald-500 to-green-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    selected:
      'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-400/40 dark:border-emerald-500/60 dark:bg-emerald-500/10',
  },
  slate: {
    badge:
      'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20',
    gradient: 'from-slate-500 to-slate-700',
    text: 'text-slate-600 dark:text-slate-300',
    selected:
      'border-slate-400 bg-slate-100/80 ring-2 ring-slate-400/40 dark:border-slate-500/60 dark:bg-slate-500/10',
  },
} as const

/** Clave = usuarios.rol en BD */
export const ROL_VISUAL: Record<Rol, UsuarioVisual> = {
  Administrador: { label: 'Administrador', icon: ShieldCheck, ...tono.rose },
  Gerencia: { label: 'Gerencia', icon: Briefcase, ...tono.violet },
  Contabilidad: { label: 'Contabilidad', icon: Calculator, ...tono.sky },
  'Administrador de Obra': {
    label: 'Admin de obra',
    icon: HardHat,
    ...tono.amber,
  },
}

/** Estado visible: el de BD, salvo invitados que aún no han entrado */
export type EstadoUsuarioVisible = EstadoUsuario | 'Pendiente'

export const ESTADO_USUARIO_VISUAL: Record<
  EstadoUsuarioVisible,
  UsuarioVisual
> = {
  Activo: { label: 'Activo', icon: UserCheck, ...tono.emerald },
  Pendiente: {
    label: 'Invitación pendiente',
    icon: MailQuestion,
    ...tono.amber,
  },
  Inactivo: { label: 'Inactivo', icon: UserX, ...tono.slate },
  Bloqueado: { label: 'Bloqueado', icon: Ban, ...tono.rose },
}

export function estadoVisibleUsuario(
  u: Pick<Usuario, 'estado' | 'ultimo_login' | 'debe_cambiar_password'>
): EstadoUsuarioVisible {
  if (u.estado === 'Activo' && esPendiente(u)) return 'Pendiente'
  return u.estado
}

export const rolVisual = (rol: Rol) =>
  ROL_VISUAL[rol] ?? ROL_VISUAL['Administrador de Obra']

/** Visto en los últimos 10 minutos → punto verde "en línea" */
export function estaEnLinea(ultimoAcceso: string | null) {
  if (!ultimoAcceso) return false
  return Date.now() - new Date(ultimoAcceso).getTime() < 10 * 60 * 1000
}
