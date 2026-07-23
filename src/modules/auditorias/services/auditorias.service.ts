import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { logger } from '@/lib/utils/logger'

import type {
  AccionAuditoria,
  ActividadUsuario,
  AuditoriaRegistro,
  CambioDetalle,
  ConsultaAuditoriaParams,
  EliminacionMasiva,
  EstadisticasAuditoria,
  ResultadoPaginado,
  ResumenModulo,
} from '../types'

/**
 * Servicio para consultar auditorías desde la base de datos
 * Solo lectura (INSERT se hace desde auditService)
 */
class AuditoriasService {
  /**
   * Obtener registros de auditoría con filtros y paginación
   */
  async obtenerAuditorias(
    params: ConsultaAuditoriaParams = {}
  ): Promise<ResultadoPaginado<AuditoriaRegistro>> {
    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('fecha_evento', { ascending: false })

    // Aplicar filtros
    if (params.tabla) {
      query = query.eq('tabla', params.tabla)
    }
    if (params.registroId) {
      query = query.eq('registro_id', params.registroId)
    }
    if (params.usuarioId) {
      query = query.eq('usuario_id', params.usuarioId)
    }
    if (params.modulo) {
      query = query.eq('modulo', params.modulo)
    }
    if (params.accion) {
      query = query.eq('accion', params.accion)
    }
    if (params.fechaDesde) {
      query = query.gte('fecha_evento', params.fechaDesde)
    }
    if (params.fechaHasta) {
      query = query.lte('fecha_evento', params.fechaHasta)
    }

    // Paginación
    const limite = params.limite || 50
    const offset = params.offset || 0
    query = query.range(offset, offset + limite - 1)

    const { data, error, count } = await query

    if (error) {
      logger.error('Error al obtener auditorías:', error)
      throw new Error(`Error al obtener auditorías: ${error.message}`)
    }

    const total = count || 0
    const totalPaginas = Math.ceil(total / limite)
    const paginaActual = Math.floor(offset / limite) + 1

    return {
      datos: (data || []).map(this.transformarAuditoriaDeDB),
      total,
      pagina: paginaActual,
      totalPaginas,
    }
  }

  /**
   * Obtener historial de un registro específico usando RPC
   */
  async obtenerHistorialRegistro(
    tabla: string,
    registroId: string,
    limite = 100
  ): Promise<AuditoriaRegistro[]> {
    const { data, error } = await supabase.rpc('obtener_historial_registro', {
      p_tabla: tabla,
      p_registro_id: registroId,
      p_limit: limite,
    })

    if (error) {
      logger.error('Error al obtener historial:', error)
      throw new Error(`Error al obtener historial: ${error.message}`)
    }

    return (data || []).map(item => ({
      id: item.id,
      tabla,
      accion: item.accion as AccionAuditoria,
      registroId,
      usuarioId: null,
      usuarioEmail: item.usuario_email,
      usuarioRol: item.usuario_rol ?? null,
      usuarioNombres: null,
      fechaEvento: item.fecha_evento,
      ipAddress: null,
      userAgent: null,
      datosAnteriores: null,
      datosNuevos: null,
      cambiosEspecificos: (item.cambios_especificos ?? null) as Record<
        string,
        CambioDetalle
      > | null,
      metadata: (item.metadata ?? {}) as Record<string, unknown>,
      modulo: null,
    }))
  }

  /**
   * Obtener actividad de un usuario usando RPC
   */
  async obtenerActividadUsuario(
    usuarioId: string,
    dias = 30,
    limite = 100
  ): Promise<ActividadUsuario[]> {
    const { data, error } = await supabase.rpc('obtener_actividad_usuario', {
      p_usuario_id: usuarioId,
      p_dias: dias,
      p_limit: limite,
    })

    if (error) {
      logger.error('Error al obtener actividad de usuario:', error)
      throw new Error(`Error al obtener actividad de usuario: ${error.message}`)
    }

    return (data || []).map(item => ({
      id: item.id,
      tabla: item.tabla,
      accion: item.accion as AccionAuditoria,
      fechaEvento: item.fecha_evento,
      registroId: item.registro_id,
      modulo: item.modulo ?? null,
      metadata: (item.metadata ?? {}) as Record<string, unknown>,
    }))
  }

  /**
   * Detectar eliminaciones masivas usando RPC
   */
  async detectarEliminacionesMasivas(
    dias = 7,
    umbral = 5
  ): Promise<EliminacionMasiva[]> {
    const { data, error } = await supabase.rpc(
      'detectar_eliminaciones_masivas',
      {
        p_dias: dias,
        p_umbral: umbral,
      }
    )

    if (error) {
      logger.error('Error al detectar eliminaciones masivas:', error)
      throw new Error(
        `Error al detectar eliminaciones masivas: ${error.message}`
      )
    }

    return (data || []).map(item => ({
      fecha: item.fecha ?? '',
      usuarioEmail: item.usuario_email ?? '',
      tabla: item.tabla ?? '',
      totalEliminaciones: item.total_eliminaciones ?? 0,
    }))
  }

  /**
   * Obtener resumen por módulo usando vista
   */
  async obtenerResumenModulos(): Promise<ResumenModulo[]> {
    const { data, error } = await supabase
      .from('v_auditoria_por_modulo')
      .select('*')
      .order('total_eventos', { ascending: false })

    if (error) {
      logger.error('Error al obtener resumen por módulos:', error)
      throw new Error(`Error al obtener resumen de seguridad: ${error.message}`)
    }

    return (data || []).map(item => ({
      modulo: item.modulo ?? '',
      totalEventos: item.total_eventos ?? 0,
      usuariosActivos: item.usuarios_activos ?? 0,
      totalCreaciones: item.total_creaciones ?? 0,
      totalActualizaciones: item.total_actualizaciones ?? 0,
      totalEliminaciones: item.total_eliminaciones ?? 0,
      ultimoEvento: item.ultimo_evento ?? '',
      primerEvento: item.primer_evento ?? '',
    }))
  }

  /**
   * Obtener estadísticas generales (4 queries paralelas)
   */
  async obtenerEstadisticas(): Promise<EstadisticasAuditoria> {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const [
      { count: totalEventos },
      { count: eventosHoy },
      { count: eliminacionesTotales },
      { data: usuariosData },
    ] = await Promise.all([
      supabase.from('audit_log').select('*', { count: 'exact', head: true }),
      supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_evento', hoy.toISOString()),
      supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('accion', 'DELETE'),
      supabase
        .from('audit_log')
        .select('usuario_id')
        .not('usuario_id', 'is', null)
        .limit(500),
    ])

    const usuariosActivos = new Set((usuariosData || []).map(u => u.usuario_id))
      .size

    return {
      totalEventos: totalEventos || 0,
      eventosHoy: eventosHoy || 0,
      eventosSemana: 0,
      eventosMes: 0,
      usuariosActivos,
      moduloMasActivo: 'N/A',
      accionMasComun: 'CREATE',
      eliminacionesTotales: eliminacionesTotales || 0,
    }
  }

  /**
   * Buscar auditorías por texto (email, tabla, etc.)
   */
  async buscarAuditorias(
    texto: string,
    limite = 50
  ): Promise<AuditoriaRegistro[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .or(
        `usuario_email.ilike.%${texto}%,tabla.ilike.%${texto}%,registro_id.ilike.%${texto}%`
      )
      .order('fecha_evento', { ascending: false })
      .limit(limite)

    if (error) {
      logger.error('Error al buscar auditorías:', error)
      throw new Error(`Error al buscar auditorías: ${error.message}`)
    }

    return (data || []).map(this.transformarAuditoriaDeDB)
  }

  /**
   * Transformar datos de DB a formato de aplicación
   */
  private transformarAuditoriaDeDB(
    data: Database['public']['Tables']['audit_log']['Row']
  ): AuditoriaRegistro {
    return {
      id: data.id,
      tabla: data.tabla,
      accion: data.accion as AccionAuditoria,
      registroId: data.registro_id,
      usuarioId: data.usuario_id,
      usuarioEmail: data.usuario_email,
      usuarioNombres: data.usuario_nombres ?? null,
      usuarioRol: data.usuario_rol,
      fechaEvento: data.fecha_evento,
      ipAddress: (data.ip_address as string | null) ?? null,
      userAgent: data.user_agent,
      datosAnteriores: (data.datos_anteriores ?? null) as Record<
        string,
        unknown
      > | null,
      datosNuevos: (data.datos_nuevos ?? null) as Record<
        string,
        unknown
      > | null,
      cambiosEspecificos: (data.cambios_especificos ?? null) as Record<
        string,
        CambioDetalle
      > | null,
      metadata: (data.metadata ?? {}) as Record<string, unknown>,
      modulo: data.modulo,
    }
  }
}

export const auditoriasService = new AuditoriasService()
