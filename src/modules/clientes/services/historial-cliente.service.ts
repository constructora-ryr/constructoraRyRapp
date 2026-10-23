/**
 * Servicio de Historial de Cliente
 * Consulta los eventos de un cliente con la RPC obtener_historial_cliente
 * (audit_log) o, en vista previa, obtener_historial_cliente_v2 (tabla
 * `auditoria`, misma forma de salida). Ambas SECURITY DEFINER.
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

/** De dónde se lee el historial: la tabla actual o la nueva (vista previa) */
export type FuenteHistorial = 'audit_log' | 'auditoria'

const RPC_POR_FUENTE: Record<FuenteHistorial, string> = {
  audit_log: 'obtener_historial_cliente',
  auditoria: 'obtener_historial_cliente_v2',
}

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
    limit = 200,
    incluirOcultos = false,
    fuente: FuenteHistorial = 'audit_log'
  ): Promise<EventoHistorialCliente[]> {
    try {
      // ── PASO 1: Obtener eventos via RPC (1 round-trip) ──────────────
      const { data: eventosRaw, error: rpcError } = await (
        supabase.rpc as (
          fn: string,
          args?: Record<string, unknown>
        ) => ReturnType<typeof supabase.rpc>
      )(RPC_POR_FUENTE[fuente], {
        p_cliente_id: clienteId,
        p_limit: limit,
        p_incluir_ocultos: incluirOcultos,
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
        oculto: boolean
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
      // Por id y, si no coincide (p.ej. base restaurada), por correo
      const unicos = (valores: (string | null)[]) => [
        ...new Set(valores.filter((v): v is string => Boolean(v))),
      ]
      const usuarioIds = unicos(eventosFiltrados.map(e => e.usuario_id))
      const correos = unicos(eventosFiltrados.map(e => e.usuario_email))

      const filtros = [
        usuarioIds.length ? `id.in.(${usuarioIds.join(',')})` : null,
        correos.length
          ? `email.in.(${correos.map(c => `"${c}"`).join(',')})`
          : null,
      ].filter(Boolean)

      const { data: usuarios } = filtros.length
        ? await supabase
            .from('usuarios')
            .select('id,email,nombres,apellidos,rol')
            .or(filtros.join(','))
        : { data: [] }

      const porId = new Map((usuarios ?? []).map(u => [u.id, u]))
      const porCorreo = new Map((usuarios ?? []).map(u => [u.email, u]))

      // ── PASO 4: Mapear al tipo EventoHistorialCliente ────────────────
      return eventosFiltrados.map(evento => {
        const usuario =
          porId.get(evento.usuario_id ?? '') ??
          porCorreo.get(evento.usuario_email ?? '')
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
          oculto: evento.oculto ?? false,
        }
      }) as unknown as EventoHistorialCliente[]
    } catch (error) {
      logger.error(
        '❌ [CLIENTES] Error obteniendo historial del cliente:',
        error
      )
      // Se propaga para que la pestaña muestre el error (no "sin eventos")
      throw error
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

  /**
   * Restaura un evento oculto para que vuelva a aparecer en el historial.
   * Solo Administradores pueden llamarlo — el endpoint lo valida.
   */
  async restaurarEvento(eventoId: string): Promise<void> {
    const res = await fetch('/api/historial/restaurar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento_id: eventoId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(
        (body as { error?: string }).error ?? 'Error al restaurar evento'
      )
    }
  }
}

export const historialClienteService = new HistorialClienteService()
