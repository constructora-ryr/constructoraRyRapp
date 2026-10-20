/**
 * Colores semánticos de estado (dashboard, tablas y listados).
 *
 * Alineados con los módulos de origen para que un estado tenga el mismo
 * color en toda la app:
 * - Viviendas → ViviendasFiltrosPremium (Disponible verde, Asignada azul,
 *   Escriturada violeta, Saldada cian)
 * - Clientes  → estado-badge (Interesado azul, Activo verde, Inactivo gris)
 */

import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  Star,
  UserCheck,
  UserMinus,
  UserX,
  type LucideIcon,
} from 'lucide-react'

export interface EstadoColor {
  label: string
  /** Hex para SVG */
  hex: string
  /** Clase de fondo para dots y barras */
  bg: string
}

export const VIVIENDA_ESTADO_COLORS = {
  disponibles: { label: 'Disponibles', hex: '#10b981', bg: 'bg-emerald-500' },
  asignadas: { label: 'Asignadas', hex: '#3b82f6', bg: 'bg-blue-500' },
  entregadas: { label: 'Escrituradas', hex: '#8b5cf6', bg: 'bg-violet-500' },
  propietario: { label: 'Saldadas', hex: '#06b6d4', bg: 'bg-cyan-500' },
} as const satisfies Record<string, EstadoColor>

export const CLIENTE_ESTADO_COLORS = {
  activos: { label: 'Activos', hex: '#10b981', bg: 'bg-emerald-500' },
  interesados: { label: 'Interesados', hex: '#3b82f6', bg: 'bg-blue-500' },
  // Dorado: se distingue del verde de Activos (validado: ΔE 20.8; el cian
  // se confundía con Inactivos en daltonismo, ΔE 4.6)
  propietarios: { label: 'Propietarios', hex: '#f59e0b', bg: 'bg-amber-500' },
  inactivos: { label: 'Inactivos', hex: '#94a3b8', bg: 'bg-slate-400' },
  renunciaron: { label: 'Renunciaron', hex: '#f43f5e', bg: 'bg-rose-500' },
} as const satisfies Record<string, EstadoColor>

export const PROYECTO_ESTADO_COLORS = {
  enEjecucion: { label: 'en ejecución', hex: '#10b981', bg: 'bg-emerald-500' },
  enPlanificacion: {
    label: 'en planificación',
    hex: '#0ea5e9',
    bg: 'bg-sky-500',
  },
  pausados: { label: 'pausado', hex: '#f43f5e', bg: 'bg-rose-500' },
  completados: { label: 'finalizado', hex: '#94a3b8', bg: 'bg-slate-400' },
} as const satisfies Record<string, EstadoColor>

// ─────────────────────────────────────────────────────────────────────────────
// Badges por valor de estado (tablas y listados)
// Mismo matiz que los colores de arriba: fondo suave + texto + anillo
// ─────────────────────────────────────────────────────────────────────────────

export interface EstadoBadge {
  label: string
  /** Punto de color (identidad del estado) */
  dot: string
  /** Badge: fondo suave, texto y anillo */
  badge: string
  /** Ícono del estado (badges, tarjetas de filtro, avatar) */
  icon: LucideIcon
  /** Degradado para cuadros de ícono (bg-gradient-to-br + estas clases) */
  gradient: string
  /** Color de texto para conteos/valores destacados */
  text: string
  /** Estado seleccionado en tarjetas de filtro: anillo + fondo tintado */
  selected: string
  /** Rellenar el ícono (la estrella de Propietario se ve mejor sólida) */
  iconFilled?: boolean
}

const badge = {
  emerald:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-400/20',
  amber:
    'bg-amber-50 text-amber-700 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  violet:
    'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  slate:
    'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
} as const

const acento = {
  emerald: {
    gradient: 'from-emerald-500 to-green-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    selected:
      'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-400/40 dark:border-emerald-500/60 dark:bg-emerald-500/10',
  },
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    text: 'text-blue-600 dark:text-blue-400',
    selected:
      'border-blue-400 bg-blue-50/80 ring-2 ring-blue-400/40 dark:border-blue-500/60 dark:bg-blue-500/10',
  },
  cyan: {
    gradient: 'from-cyan-500 to-teal-600',
    text: 'text-cyan-600 dark:text-cyan-400',
    selected:
      'border-cyan-400 bg-cyan-50/80 ring-2 ring-cyan-400/40 dark:border-cyan-500/60 dark:bg-cyan-500/10',
  },
  amber: {
    gradient: 'from-amber-400 to-orange-500',
    text: 'text-amber-600 dark:text-amber-400',
    selected:
      'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/40 dark:border-amber-500/60 dark:bg-amber-500/10',
  },
  violet: {
    gradient: 'from-violet-500 to-purple-600',
    text: 'text-violet-600 dark:text-violet-400',
    selected:
      'border-violet-400 bg-violet-50/80 ring-2 ring-violet-400/40 dark:border-violet-500/60 dark:bg-violet-500/10',
  },
  slate: {
    gradient: 'from-slate-500 to-slate-700',
    text: 'text-slate-600 dark:text-slate-300',
    selected:
      'border-slate-400 bg-slate-100/80 ring-2 ring-slate-400/40 dark:border-slate-500/60 dark:bg-slate-500/10',
  },
  rose: {
    gradient: 'from-rose-500 to-red-600',
    text: 'text-rose-600 dark:text-rose-400',
    selected:
      'border-rose-400 bg-rose-50/80 ring-2 ring-rose-400/40 dark:border-rose-500/60 dark:bg-rose-500/10',
  },
} as const

/** Clave = valor de clientes.estado en BD */
export const CLIENTE_ESTADO_BADGE: Record<string, EstadoBadge> = {
  Activo: {
    label: 'Activo',
    dot: CLIENTE_ESTADO_COLORS.activos.bg,
    badge: badge.emerald,
    icon: UserCheck,
    ...acento.emerald,
  },
  Interesado: {
    label: 'Interesado',
    dot: CLIENTE_ESTADO_COLORS.interesados.bg,
    badge: badge.blue,
    icon: Heart,
    ...acento.blue,
  },
  Propietario: {
    label: 'Propietario',
    dot: CLIENTE_ESTADO_COLORS.propietarios.bg,
    badge: badge.amber,
    icon: Star,
    iconFilled: true,
    ...acento.amber,
  },
  Inactivo: {
    label: 'Inactivo',
    dot: CLIENTE_ESTADO_COLORS.inactivos.bg,
    badge: badge.slate,
    icon: UserX,
    ...acento.slate,
  },
  Renunció: {
    label: 'Renunció',
    dot: CLIENTE_ESTADO_COLORS.renunciaron.bg,
    badge: badge.rose,
    icon: UserMinus,
    ...acento.rose,
  },
}

/** Clave = valor de viviendas.estado en BD */
export const VIVIENDA_ESTADO_BADGE: Record<string, EstadoBadge> = {
  Disponible: {
    label: 'Disponible',
    dot: VIVIENDA_ESTADO_COLORS.disponibles.bg,
    badge: badge.emerald,
    icon: Home,
    ...acento.emerald,
  },
  Asignada: {
    label: 'Asignada',
    dot: VIVIENDA_ESTADO_COLORS.asignadas.bg,
    badge: badge.blue,
    icon: Clock,
    ...acento.blue,
  },
  Entregada: {
    label: 'Escriturada',
    dot: VIVIENDA_ESTADO_COLORS.entregadas.bg,
    badge: badge.violet,
    icon: BadgeCheck,
    ...acento.violet,
  },
  Propietario: {
    label: 'Saldada',
    dot: VIVIENDA_ESTADO_COLORS.propietario.bg,
    badge: badge.cyan,
    icon: CheckCircle2,
    ...acento.cyan,
  },
}
