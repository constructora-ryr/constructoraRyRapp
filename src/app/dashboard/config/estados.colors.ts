/**
 * Colores semánticos de estado para el dashboard.
 *
 * Alineados con los módulos de origen para que un estado tenga el mismo
 * color en toda la app:
 * - Viviendas → ViviendasFiltrosPremium (Disponible verde, Asignada azul,
 *   Escriturada violeta, Saldada cian)
 * - Clientes  → estado-badge (Interesado azul, Activo verde, Inactivo gris)
 */

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
  propietarios: { label: 'Propietarios', hex: '#06b6d4', bg: 'bg-cyan-500' },
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
