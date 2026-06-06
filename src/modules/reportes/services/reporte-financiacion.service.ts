import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  EntidadFinancieraResumen,
  FuentePagoConEntidadRow,
  ReporteFinanciacionData,
} from '../types'

class ReporteFinanciacionService {
  /**
   * Obtiene todas las fuentes de pago activas que tienen entidad_financiera_id,
   * con los datos del cliente y la negociación asociados.
   * Retorna los datos ya agrupados y calculados para el reporte.
   */
  async obtenerReporteFinanciacion(): Promise<ReporteFinanciacionData> {
    const { data, error } = await supabase
      .from('fuentes_pago')
      .select(
        `
        id,
        tipo,
        monto_aprobado,
        numero_referencia,
        entidad_financiera_id,
        entidades_financieras!inner (
          id,
          nombre,
          tipo,
          codigo
        ),
        negociaciones!inner (
          id,
          estado,
          clientes!inner (
            id,
            nombre_completo,
            numero_documento
          )
        )
      `
      )
      .eq('estado_fuente', 'activa')
      .not('entidad_financiera_id', 'is', null)
      .in('negociaciones.estado', ['Activa', 'Completada'])

    if (error) {
      logger.error('Error obteniendo reporte de financiación:', error)
      throw new Error(`Error al cargar reporte: ${error.message}`)
    }

    return this.agruparPorEntidad(data ?? [])
  }

  // ── Transformación y agrupación ─────────────────────────────────────────

  private agruparPorEntidad(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows: any[]
  ): ReporteFinanciacionData {
    const filas: FuentePagoConEntidadRow[] = rows.map(row => ({
      fuenteId: row.id,
      negociacionId: row.negociaciones.id,
      clienteId: row.negociaciones.clientes.id,
      clienteNombre: row.negociaciones.clientes.nombre_completo ?? '',
      clienteDocumento: row.negociaciones.clientes.numero_documento ?? '',
      tipoFuente: row.tipo,
      montoAprobado: row.monto_aprobado ?? 0,
      numeroReferencia: row.numero_referencia ?? null,
      estadoNegociacion: row.negociaciones.estado,
      entidadId: row.entidades_financieras.id,
      entidadNombre: row.entidades_financieras.nombre,
      entidadTipo: row.entidades_financieras.tipo,
      entidadCodigo: row.entidades_financieras.codigo,
    }))

    const montoTotal = filas.reduce((sum, f) => sum + f.montoAprobado, 0)

    const mapa = new Map<string, EntidadFinancieraResumen>()

    for (const fila of filas) {
      if (!mapa.has(fila.entidadId)) {
        mapa.set(fila.entidadId, {
          id: fila.entidadId,
          nombre: fila.entidadNombre,
          tipo: fila.entidadTipo,
          codigo: fila.entidadCodigo,
          totalNegociaciones: 0,
          totalClientesUnicos: 0,
          montoTotalAprobado: 0,
          porcentajeDelTotal: 0,
          clientes: [],
        })
      }

      const entidad = mapa.get(fila.entidadId)
      if (!entidad) continue
      entidad.totalNegociaciones += 1
      entidad.montoTotalAprobado += fila.montoAprobado
      entidad.clientes.push({
        negociacionId: fila.negociacionId,
        clienteId: fila.clienteId,
        clienteNombre: fila.clienteNombre,
        clienteDocumento: fila.clienteDocumento,
        tipoFuente: fila.tipoFuente,
        montoAprobado: fila.montoAprobado,
        numeroReferencia: fila.numeroReferencia,
        estadoNegociacion: fila.estadoNegociacion,
      })
    }

    const entidades = Array.from(mapa.values()).map(e => ({
      ...e,
      totalClientesUnicos: new Set(e.clientes.map(c => c.clienteId)).size,
      porcentajeDelTotal:
        montoTotal > 0 ? (e.montoTotalAprobado / montoTotal) * 100 : 0,
    }))

    entidades.sort((a, b) => b.montoTotalAprobado - a.montoTotalAprobado)

    return {
      entidades,
      totalFuentesConEntidad: filas.length,
      montoTotalAprobado: montoTotal,
      totalClientesFinanciados: new Set(filas.map(f => f.clienteId)).size,
    }
  }
}

export const reporteFinanciacionService = new ReporteFinanciacionService()
