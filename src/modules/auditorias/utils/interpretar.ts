/**
 * Qué pasó realmente en un evento: una edición puede ser un reemplazo de
 * archivo, un envío a la papelera, una restauración o una anulación.
 * De esto salen la frase, la etiqueta y el color.
 */

import { ACCIONES, infoTabla } from '../config/presentacion'
import type { EventoAuditoria } from '../types'

export type Suceso =
  | 'creado'
  | 'editado'
  | 'eliminado'
  | 'reemplazo'
  | 'papelera'
  | 'restaurado'
  | 'anulado'

interface Interpretacion {
  suceso: Suceso
  /** "reemplazó el archivo de", "editó", … */
  verbo: string
  label: string
  badge: string
  punto: string
  /** Degradado del encabezado del detalle */
  degradado: string
}

const TONOS = {
  violeta: {
    badge:
      'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
    punto: 'bg-violet-500',
    degradado: 'from-violet-600 via-purple-600 to-fuchsia-600',
  },
  rojo: {
    badge: ACCIONES.ELIMINAR.badge,
    punto: ACCIONES.ELIMINAR.punto,
    degradado: 'from-red-600 via-rose-600 to-pink-600',
  },
  verde: {
    badge: ACCIONES.CREAR.badge,
    punto: ACCIONES.CREAR.punto,
    degradado: 'from-emerald-600 via-green-600 to-teal-600',
  },
  ambar: {
    badge: ACCIONES.EDITAR.badge,
    punto: ACCIONES.EDITAR.punto,
    degradado: 'from-amber-500 via-orange-500 to-orange-600',
  },
}

const minus = (v: unknown) => String(v ?? '').toLowerCase()

export interface DatosReemplazo {
  fecha?: string
  motivo?: string
  archivo_original?: string
  archivo_nuevo?: string
  tamano_original?: number
  tamano_nuevo?: number
  backup_path?: string
}

/** Datos del reemplazo si esta edición fue un reemplazo de archivo */
export function datosReemplazo(e: EventoAuditoria): DatosReemplazo | null {
  const meta = e.cambios?.metadata
  if (!meta) return null
  const despues = (meta.despues as { reemplazo?: DatosReemplazo } | null)
    ?.reemplazo
  const antes = (meta.antes as { reemplazo?: DatosReemplazo } | null)?.reemplazo
  if (!despues || despues.fecha === antes?.fecha) return null
  return despues
}

function suceso(e: EventoAuditoria): Suceso {
  if (e.accion === 'CREAR') return 'creado'
  if (e.accion === 'ELIMINAR') return 'eliminado'
  if (datosReemplazo(e)) return 'reemplazo'
  const estado = e.cambios?.estado
  if (estado) {
    const antes = minus(estado.antes)
    const despues = minus(estado.despues)
    if (despues === 'eliminado') return 'papelera'
    if (antes === 'eliminado') return 'restaurado'
    if (despues === 'anulado') return 'anulado'
  }
  return 'editado'
}

export function interpretar(e: EventoAuditoria): Interpretacion {
  const s = suceso(e)
  const objeto = infoTabla(e.tabla).nombre
  switch (s) {
    case 'reemplazo':
      return {
        suceso: s,
        verbo: `reemplazó el archivo de ${objeto}`,
        label: 'Reemplazo de archivo',
        ...TONOS.violeta,
      }
    case 'papelera':
      return {
        suceso: s,
        verbo: `envió a la papelera ${objeto}`,
        label: 'Enviado a la papelera',
        ...TONOS.rojo,
      }
    case 'restaurado':
      return {
        suceso: s,
        verbo: `restauró ${objeto}`,
        label: 'Restaurado',
        ...TONOS.verde,
      }
    case 'anulado':
      return {
        suceso: s,
        verbo: `anuló ${objeto}`,
        label: 'Anulación',
        ...TONOS.rojo,
      }
    case 'creado':
      return {
        suceso: s,
        verbo: `${ACCIONES.CREAR.verbo} ${objeto}`,
        label: ACCIONES.CREAR.label,
        ...TONOS.verde,
      }
    case 'eliminado':
      // En el sistema anterior "eliminar" a veces era enviar a la papelera
      return e.origen === 'historico'
        ? {
            suceso: s,
            verbo: `${ACCIONES.ELIMINAR.verbo} ${objeto}`,
            label: ACCIONES.ELIMINAR.label,
            ...TONOS.rojo,
          }
        : {
            suceso: s,
            verbo: `eliminó definitivamente ${objeto}`,
            label: 'Eliminación definitiva',
            ...TONOS.rojo,
          }
    default:
      return {
        suceso: s,
        verbo: `${ACCIONES.EDITAR.verbo} ${objeto}`,
        label: ACCIONES.EDITAR.label,
        ...TONOS.ambar,
      }
  }
}
