/**
 * Servicio de Historial de Cliente
 * Consulta eventos de audit_log relacionados con un cliente específico
 * a través de la RPC obtener_historial_cliente (SECURITY DEFINER).
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type { EventoHistorialCliente } from '../types/historial.types'

// Campos técnicos de negociaciones que no aportan valor al historial visual.
// Un UPDATE que solo toca estos campos se descarta antes de mostrar.
const CAMPOS_TECNICOS_NEGOCIACIONES = new Set([
  'version_lock',
  'fecha_actualizacion',
  'total_fuentes_pago',
  'total_abonado',
  'porcentaje_pagado',
  'porcentaje_completado',
  'saldo_pendiente',
  'valor_total_pagar',
  'valor_total',
  'version_actual',
  'updated_at',
])

class HistorialClienteService {
  /**
   * Obtener historial completo de un cliente.
   *
   * Usa la RPC `obtener_historial_cliente` (SECURITY DEFINER):
   * - 1 round-trip en lugar de 6+1 queries paralelas anteriores.
   * - El control de acceso se aplica en la función SQL:
   *     Administrador → acceso total
   *     Otros roles   → necesitan permiso RBAC clientes.ver_historial
   * - Si el usuario no tiene permiso la RPC retorna [] silenciosamente
   *   (la UI lo interpreta igual que "sin eventos todavía").
   *   El tab ya debería estar oculto para ese caso, pero es defensa en profundidad.
   *
   * @param clienteId - UUID del cliente
   * @param limit     - Máximo de eventos a retornar (default 200)
   */
  async obtenerHistorial(
    clienteId: string,
    limit = 200
  ): Promise<EventoHistorialCliente[]> {
    try {
      // ── PASO 1: Obtener eventos via RPC (1 round-trip) ──────────────
      const { data: eventosRaw, error: rpcError } = await (
        supabase.rpc as (
          fn: string,
          args?: Record<string, unknown>
        ) => ReturnType<typeof supabase.rpc>
      )('obtener_historial_cliente', {
        p_cliente_id: clienteId,
        p_limit: limit,
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      const eventos = (eventosRaw ?? []) as Array<{
        id: string
        tabla: string
        accion: string
        registro_id: string
        fecha_evento: string
        usuario_id: string | null
        usuario_email: string | null
        usuario_nombres: string | null
        datos_anteriores: Record<string, unknown> | null
        datos_nuevos: Record<string, unknown> | null
        cambios_especificos: Record<string, unknown> | null
        metadata: Record<string, unknown> | null
        modulo: string | null
      }>

      // ── PASO 2: Filtrar UPDATEs de negociaciones con solo campos técnicos ─
      const eventosFiltrados = eventos.filter(evento => {
        if (evento.tabla !== 'negociaciones') return true
        if (evento.accion !== 'UPDATE') return true
        if (!evento.cambios_especificos) return true
        const camposModificados = Object.keys(evento.cambios_especificos)
        return camposModificados.some(
          c => !CAMPOS_TECNICOS_NEGOCIACIONES.has(c)
        )
      })

      if (eventosFiltrados.length === 0) return []

      // ── PASO 3: Enriquecer con datos de usuarios (1 round-trip) ─────
      const usuarioIds = [
        ...new Set(
          eventosFiltrados
            .map(e => e.usuario_id)
            .filter((id): id is string => Boolean(id))
        ),
      ]

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id,email,nombres,apellidos,rol')
        .in('id', usuarioIds)

      const usuariosMap = new Map((usuarios ?? []).map(u => [u.id, u]))

      // ── PASO 4: Mapear al tipo EventoHistorialCliente ────────────────
      return eventosFiltrados.map(evento => {
        const usuario = usuariosMap.get(evento.usuario_id ?? '')
        const nombreCompleto = usuario
          ? [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ') ||
            null
          : null

        return {
          id: evento.id,
          tabla: evento.tabla,
          accion: evento.accion,
          registro_id: evento.registro_id,
          fecha_evento: evento.fecha_evento,
          // Prioridad: (1) tabla usuarios JOIN, (2) columnas audit_log, (3) 'Sistema'
          usuario_email:
            usuario?.email ||
            (typeof evento.usuario_email === 'string' &&
            evento.usuario_email &&
            !evento.usuario_email.includes('@backfill')
              ? evento.usuario_email
              : null) ||
            'Sistema',
          usuario_nombres:
            nombreCompleto ||
            (typeof evento.usuario_nombres === 'string'
              ? evento.usuario_nombres
              : null),
          usuario_rol: usuario?.rol ?? null,
          datos_anteriores: evento.datos_anteriores,
          datos_nuevos: evento.datos_nuevos,
          cambios_especificos: evento.cambios_especificos,
          metadata: evento.metadata,
          modulo: evento.modulo,
        }
      }) as unknown as EventoHistorialCliente[]
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '❌ [CLIENTES] Error obteniendo historial del cliente:',
        mensaje,
        error
      )
      return []
    }
  }

  /**
   * ✅ REFACTORIZADO: Obtener eventos por tipo de tabla
   * Útil para filtros en la UI
   *
   * @param clienteId - ID del cliente
   * @param tabla - Tipo de tabla ('clientes' | 'negociaciones' | 'abonos_historial' | etc)
   * @param limit - Número máximo de eventos
   */
  async obtenerEventosPorTipo(
    clienteId: string,
    tabla: string,
    limit = 50
  ): Promise<EventoHistorialCliente[]> {
    try {
      let query = supabase
        .from('audit_log')
        .select(
          'id,tabla,accion,registro_id,fecha_evento,usuario_id,usuario_email,usuario_nombres,datos_anteriores,datos_nuevos,cambios_especificos,metadata,modulo'
        )
        .eq('tabla', tabla)

      if (tabla === 'clientes') {
        query = query.eq('registro_id', clienteId)
      } else {
        query = query.contains('metadata', { cliente_id: clienteId })
      }

      const { data: eventos, error } = await query
        .order('fecha_evento', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Obtener usuarios
      const usuarioIds = [
        ...new Set(
          (eventos || [])
            .map(e => e.usuario_id)
            .filter((id): id is string => Boolean(id))
        ),
      ]
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id,email,nombres,rol')
        .in('id', usuarioIds)

      const usuariosMap = new Map((usuarios || []).map(u => [u.id, u]))

      return (eventos || []).map(evento => {
        const usuario = usuariosMap.get(evento.usuario_id ?? '')
        return {
          id: evento.id,
          tabla: evento.tabla,
          accion: evento.accion,
          registro_id: evento.registro_id,
          fecha_evento: evento.fecha_evento,
          usuario_email: usuario?.email || 'Sistema',
          usuario_nombres: usuario?.nombres || null,
          usuario_rol: usuario?.rol || null,
          datos_anteriores: evento.datos_anteriores,
          datos_nuevos: evento.datos_nuevos,
          cambios_especificos: evento.cambios_especificos,
          metadata: evento.metadata,
          modulo: evento.modulo,
        }
      }) as unknown as EventoHistorialCliente[]
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '❌ [CLIENTES] Error obteniendo eventos por tipo:',
        mensaje,
        error
      )
      return []
    }
  }

  /**
   * Obtener estadísticas de actividad del cliente
   *
   * @param clienteId - ID del cliente
   * @returns Resumen de actividad
   */
  async obtenerEstadisticasActividad(clienteId: string) {
    try {
      const eventos = await this.obtenerHistorial(clienteId, 1000) // Sin límite para stats

      const stats = {
        total_eventos: eventos.length,
        eventos_por_tipo: {
          clientes: eventos.filter(e => e.tabla === 'clientes').length,
          negociaciones: eventos.filter(e => e.tabla === 'negociaciones')
            .length,
          abonos: eventos.filter(e => e.tabla === 'abonos_historial').length,
          renuncias: eventos.filter(e => e.tabla === 'renuncias').length,
          intereses: eventos.filter(e => e.tabla === 'intereses').length,
          documentos: eventos.filter(e => e.tabla === 'documentos_cliente')
            .length,
        },
        eventos_por_accion: {
          creaciones: eventos.filter(e => e.accion === 'CREATE').length,
          actualizaciones: eventos.filter(e => e.accion === 'UPDATE').length,
          eliminaciones: eventos.filter(e => e.accion === 'DELETE').length,
        },
        primer_evento: eventos[eventos.length - 1]?.fecha_evento || null,
        ultimo_evento: eventos[0]?.fecha_evento || null,
      }

      return stats
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '❌ [CLIENTES] Error obteniendo estadísticas:',
        mensaje,
        error
      )
      return null
    }
  }

  /**
   * Buscar eventos por término
   *
   * @param clienteId - ID del cliente
   * @param termino - Término de búsqueda
   * @returns Eventos que coincidan con el término
   */
  async buscarEventos(
    clienteId: string,
    termino: string
  ): Promise<EventoHistorialCliente[]> {
    try {
      const eventos = await this.obtenerHistorial(clienteId, 500)

      const terminoLower = termino.toLowerCase()

      return eventos.filter(evento => {
        // Buscar en usuario_email, usuario_nombres, metadata
        const textoEvento = JSON.stringify({
          usuario_email: evento.usuario_email,
          usuario_nombres: evento.usuario_nombres,
          metadata: evento.metadata,
          datos_nuevos: evento.datos_nuevos,
        }).toLowerCase()

        return textoEvento.includes(terminoLower)
      })
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('❌ [CLIENTES] Error buscando eventos:', mensaje, error)
      return []
    }
  }
  /**
   * Oculta un evento del historial (soft-hide vía API route).
   * Solo Administradores pueden llamarlo — el endpoint lo valida.
   */
  async ocultarEvento(eventoId: string): Promise<void> {
    const res = await fetch('/api/historial/ocultar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento_id: eventoId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(
        (body as { error?: string }).error ?? 'Error al ocultar evento'
      )
    }
  }
}

export const historialClienteService = new HistorialClienteService()
