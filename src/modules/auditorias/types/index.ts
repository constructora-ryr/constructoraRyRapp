// =====================================================
// TIPOS PARA MÓDULO DE AUDITORÍAS
// =====================================================

/**
 * Registro de auditoría completo (desde DB)
 */
export interface AuditoriaRegistro {
  id: string
  tabla: string
  accion: AccionAuditoria
  registroId: string
  usuarioId: string | null
  usuarioEmail: string
  usuarioNombres: string | null
  usuarioRol: string | null
  fechaEvento: string
  ipAddress: string | null
  userAgent: string | null
  datosAnteriores: Record<string, unknown> | null
  datosNuevos: Record<string, unknown> | null
  cambiosEspecificos: Record<string, CambioDetalle> | null
  metadata: Record<string, unknown>
  modulo: string | null
}

/**
 * Alias para compatibilidad con audit.service.ts
 */
export type AuditLogRecord = AuditoriaRegistro

/**
 * Detalle de un cambio específico en un campo
 */
export interface CambioDetalle {
  antes: unknown
  despues: unknown
}

/**
 * Props comunes para todos los renderers de auditoría
 */
export interface RendererAuditoriaProps {
  metadata?: Record<string, unknown>
  datosNuevos?: Record<string, unknown> | null
  datosAnteriores?: Record<string, unknown> | null
}

/**
 * Tipos de acción en auditoría
 */
export type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE' | 'ANULAR'

/**
 * Módulos de la aplicación
 */
export type ModuloAplicacion =
  | 'proyectos'
  | 'viviendas'
  | 'clientes'
  | 'negociaciones'
  | 'abonos'
  | 'documentos'
  | 'usuarios'
  | 'renuncias'

/**
 * Vista de visualización
 */
export type VistaAuditoria = 'tabla' | 'timeline' | 'cambios'

/**
 * Filtros de auditoría
 */
export interface FiltrosAuditoria {
  busqueda: string // Búsqueda por email, tabla, registro_id
  modulo?: ModuloAplicacion
  accion?: AccionAuditoria
  fechaDesde?: string
  fechaHasta?: string
  usuarioId?: string
  tabla?: string
}

/**
 * Resumen de actividad por módulo
 */
export interface ResumenModulo {
  modulo: string
  totalEventos: number
  usuariosActivos: number
  totalCreaciones: number
  totalActualizaciones: number
  totalEliminaciones: number
  ultimoEvento: string
  primerEvento: string
}

/**
 * Actividad de usuario
 */
export interface ActividadUsuario {
  id: string
  tabla: string
  accion: AccionAuditoria
  fechaEvento: string
  registroId: string
  modulo: string | null
  metadata: Record<string, unknown>
}

/**
 * Eliminación masiva detectada
 */
export interface EliminacionMasiva {
  fecha: string
  usuarioEmail: string
  tabla: string
  totalEliminaciones: number
}

/**
 * Estado del módulo de auditorías
 */
export interface AuditoriasState {
  registros: AuditoriaRegistro[]
  resumenModulos: ResumenModulo[]
  eliminacionesMasivas: EliminacionMasiva[]
  registroSeleccionado?: AuditoriaRegistro
  cargando: boolean
  error?: string
  filtros: FiltrosAuditoria
  vista: VistaAuditoria
  paginaActual: number
  totalRegistros: number
  registrosPorPagina: number
}

/**
 * Estadísticas generales de auditoría
 */
export interface EstadisticasAuditoria {
  totalEventos: number
  eventosHoy: number
  eventosSemana: number
  eventosMes: number
  usuariosActivos: number
  moduloMasActivo: string
  accionMasComun: AccionAuditoria
  eliminacionesTotales: number
}

/**
 * Parámetros para consultas de auditoría
 */
export interface ConsultaAuditoriaParams {
  tabla?: string
  registroId?: string
  usuarioId?: string
  modulo?: ModuloAplicacion
  accion?: AccionAuditoria
  fechaDesde?: string
  fechaHasta?: string
  limite?: number
  offset?: number
}

/**
 * Resultado paginado de auditorías
 */
export interface ResultadoPaginado<T> {
  datos: T[]
  total: number
  pagina: number
  totalPaginas: number
}
