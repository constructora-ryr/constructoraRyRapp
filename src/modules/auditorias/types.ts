/**
 * Tipos del módulo Auditoría (tabla `auditoria`, escrita solo por triggers).
 */

export type AccionAuditoria = 'CREAR' | 'EDITAR' | 'ELIMINAR'

export type OrigenAuditoria = 'app' | 'servidor' | 'sistema' | 'historico'

export interface CambioCampo {
  antes: unknown
  despues: unknown
}

export interface EventoAuditoria {
  id: number
  fecha: string
  usuario_id: string | null
  usuario_nombre: string | null
  usuario_email: string | null
  origen: OrigenAuditoria
  tabla: string
  registro_id: string | null
  accion: AccionAuditoria
  /** Solo en EDITAR: campo → { antes, despues } */
  cambios: Record<string, CambioCampo> | null
  /** CREAR / ELIMINAR: la fila completa */
  datos: Record<string, unknown> | null
  etiqueta: string | null
  cliente_id: string | null
}

export type RangoFechas = 'hoy' | '7d' | '30d' | 'todo'

export interface FiltrosAuditoria {
  usuarioId: string | null
  /** Grupo de tablas (ver GRUPOS en config) */
  grupo: string | null
  accion: AccionAuditoria | null
  rango: RangoFechas
  busqueda: string
}

export interface EventoSeguridad {
  id: string
  tipo: string
  usuario_email: string
  ip_address: string | null
  user_agent: string | null
  fecha_evento: string
  metadata: Record<string, unknown> | null
}
