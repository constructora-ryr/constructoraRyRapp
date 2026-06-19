/**
 * Tipos para el Historial de Cliente
 * Sistema de auditoría humanizado para mostrar en timeline
 */

import type { LucideIcon } from 'lucide-react'

/**
 * Evento raw de audit_log relacionado con un cliente
 */
export interface EventoHistorialCliente {
  id: string
  tabla: string
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'ANULAR'
  registro_id: string
  fecha_evento: string
  usuario_email: string
  usuario_nombres: string | null
  usuario_rol: string | null
  datos_anteriores: Record<string, unknown> | null
  datos_nuevos: Record<string, unknown> | null
  cambios_especificos: Record<
    string,
    { antes: unknown; despues: unknown }
  > | null
  metadata: Record<string, unknown>
  modulo: string | null
  oculto?: boolean
}

/**
 * Evento humanizado para mostrar en UI
 * Convierte datos raw de audit_log en información legible
 */
export interface EventoHistorialHumanizado {
  id: string
  tipo: TipoEventoHistorial
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'ANULAR' // Tipo genérico de acción
  tabla: string // Nombre de la tabla en audit_log (para filtrado por categoría)
  titulo: string
  descripcion: string
  fecha: string
  usuario: {
    id?: string
    email: string
    nombres: string | null
    rol: string | null
  }
  icono: LucideIcon
  color: ColorEvento
  detalles?: DetalleEvento[]
  metadata?: Record<string, unknown>
  datosAnteriores?: Record<string, unknown> | null
  datosNuevos?: Record<string, unknown> | null
  modulo?: string
  oculto?: boolean
}

/**
 * Tipos de eventos del historial
 */
export type TipoEventoHistorial =
  // Cliente
  | 'cliente_creado'
  | 'cliente_actualizado'
  | 'cliente_eliminado'
  | 'cliente_estado_cambiado'
  // Negociación
  | 'negociacion_creada'
  | 'negociacion_actualizada'
  | 'negociacion_estado_cambiada'
  | 'negociacion_completada'
  | 'traslado_vivienda'
  | 'negociacion_traslado_interna' // Negociación nueva creada como parte de un traslado — se oculta en la UI
  | 'negociacion_cerrada_traslado' // Negociación vieja cerrada por traslado — se muestra con campos humanizados
  // Abono
  | 'abono_registrado'
  | 'abono_editado'
  | 'abono_anulado'
  // Renuncia
  | 'renuncia_creada'
  | 'renuncia_aprobada'
  | 'renuncia_rechazada'
  | 'renuncia_devolucion_procesada'
  // Interés
  | 'interes_registrado'
  // Notas manuales
  | 'nota_manual'
  | 'interes_actualizado'
  | 'interes_descartado'
  // Documento
  | 'documento_subido'
  | 'documento_actualizado'
  | 'documento_eliminado'
  // Otros
  | 'evento_generico'

/**
 * Colores para cada tipo de evento
 */
export type ColorEvento =
  | 'blue' // Información general
  | 'green' // Creación, aprobación, éxito
  | 'yellow' // Actualización, cambio
  | 'red' // Eliminación, rechazo, error
  | 'purple' // Notas manuales
  | 'amber' // Notas importantes (distinto del yellow de actualizaciones)
  | 'cyan' // Documentos
  | 'orange' // Advertencias, descartes
  | 'gray' // Otros

/**
 * Detalle de un campo modificado (para UPDATE)
 */
export interface DetalleEvento {
  campo: string
  etiqueta: string
  valorAnterior: unknown
  valorNuevo: unknown
  tipo?: 'texto' | 'numero' | 'fecha' | 'booleano' | 'enum'
}

/**
 * Filtros para el historial
 */
export interface FiltrosHistorial {
  tipo?: TipoEventoHistorial[]
  tabla?: string[]
  accion?: ('CREATE' | 'UPDATE' | 'DELETE')[]
  fecha_desde?: string
  fecha_hasta?: string
  busqueda?: string
  usuario?: string
}

/**
 * Estadísticas de actividad del cliente
 */
export interface EstadisticasHistorial {
  total_eventos: number
  eventos_por_tipo: {
    clientes: number
    negociaciones: number
    abonos: number
    renuncias: number
    intereses: number
    documentos: number
  }
  eventos_por_accion: {
    creaciones: number
    actualizaciones: number
    eliminaciones: number
  }
  primer_evento: string | null
  ultimo_evento: string | null
}

/**
 * Agrupación de eventos por fecha
 */
export interface GrupoEventosPorFecha {
  fecha: string // YYYY-MM-DD
  fechaFormateada: string // "Hoy", "Ayer", "15 de noviembre de 2025"
  eventos: EventoHistorialHumanizado[]
  total: number
}
