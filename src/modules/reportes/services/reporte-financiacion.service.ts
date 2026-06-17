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
        fecha_acta,
        entidad_financiera_id,
        entidades_financieras (
          id,
          nombre,
          tipo,
          codigo
        ),
        negociaciones (
          id,
          estado,
          clientes (
            id,
            nombre_completo,
            tipo_documento,
            numero_documento
          ),
          viviendas!negociaciones_vivienda_id_fkey (
            numero,
            manzanas ( nombre )
          )
        )
      `
      )
      .eq('estado_fuente', 'activa')

    if (error) {
      logger.error('Error obteniendo reporte de financiación:', error)
      throw new Error(`Error al cargar reporte: ${error.message}`)
    }

    const fuenteIds = (data ?? []).map(row => row.id)

    // Segunda query: solo el primer abono activo por fuente (fecha de desembolso).
    // Ordenado ASC para que el primer registro por fuente sea el más antiguo.
    const desembolsoMap = new Map<string, string>()
    if (fuenteIds.length > 0) {
      const { data: abonosData } = await supabase
        .from('abonos_historial')
        .select('fuente_pago_id, fecha_abono')
        .in('fuente_pago_id', fuenteIds)
        .eq('estado', 'Activo')
        .order('fecha_abono', { ascending: true })

      for (const abono of abonosData ?? []) {
        if (!desembolsoMap.has(abono.fuente_pago_id)) {
          desembolsoMap.set(abono.fuente_pago_id, abono.fecha_abono)
        }
      }
    }

    return this.agruparPorEntidad(data ?? [], desembolsoMap)
  }

  // ── Transformación y agrupación ─────────────────────────────────────────

  private agruparPorEntidad(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows: any[],
    desembolsoMap: Map<string, string>
  ): ReporteFinanciacionData {
    const ESTADOS_NEGOCIACION_VALIDOS = new Set(['Activa', 'Completada'])

    const MCY_SINTETICO = {
      id: 'micasaya-sintetico',
      nombre: 'Mi Casa Ya',
      tipo: 'Gobierno' as const,
      codigo: 'MCY',
    }

    const filas: FuentePagoConEntidadRow[] = rows
      .filter(
        row =>
          (row.entidades_financieras != null ||
            row.tipo === 'Subsidio Mi Casa Ya') &&
          row.negociaciones != null &&
          row.negociaciones.clientes != null &&
          ESTADOS_NEGOCIACION_VALIDOS.has(row.negociaciones.estado)
      )
      .map(row => {
        const manzana = row.negociaciones.viviendas?.manzanas?.nombre ?? ''
        const numero = row.negociaciones.viviendas?.numero ?? ''
        const viviendaLabel = manzana && numero ? `${manzana}${numero}` : null
        const entidad = row.entidades_financieras ?? MCY_SINTETICO
        const fechaDesembolso = desembolsoMap.get(row.id) ?? null
        return {
          fuenteId: row.id,
          negociacionId: row.negociaciones.id,
          clienteId: row.negociaciones.clientes.id,
          clienteNombre: row.negociaciones.clientes.nombre_completo ?? '',
          clienteTipoDocumento: row.negociaciones.clientes.tipo_documento ?? '',
          clienteDocumento: row.negociaciones.clientes.numero_documento ?? '',
          tipoFuente: row.tipo,
          montoAprobado: row.monto_aprobado ?? 0,
          numeroReferencia: row.numero_referencia ?? null,
          fechaActa: row.fecha_acta ?? null,
          estadoNegociacion: row.negociaciones.estado,
          entidadId: entidad.id,
          entidadNombre: entidad.nombre,
          entidadTipo: entidad.tipo,
          entidadCodigo: entidad.codigo,
          viviendaLabel,
          desembolso: {
            desembolsado: fechaDesembolso !== null,
            fechaDesembolso,
          },
        }
      })

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
        clienteTipoDocumento: fila.clienteTipoDocumento,
        clienteDocumento: fila.clienteDocumento,
        tipoFuente: fila.tipoFuente,
        montoAprobado: fila.montoAprobado,
        numeroReferencia: fila.numeroReferencia,
        fechaActa: fila.fechaActa,
        estadoNegociacion: fila.estadoNegociacion,
        viviendaLabel: fila.viviendaLabel,
        desembolso: fila.desembolso,
      })
    }

    const entidades = Array.from(mapa.values()).map(e => ({
      ...e,
      totalClientesUnicos: new Set(e.clientes.map(c => c.clienteId)).size,
      porcentajeDelTotal:
        montoTotal > 0 ? (e.montoTotalAprobado / montoTotal) * 100 : 0,
      clientes: [...e.clientes].sort(sortByVivienda),
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

function sortByVivienda(
  a: { viviendaLabel: string | null },
  b: { viviendaLabel: string | null }
): number {
  if (!a.viviendaLabel && !b.viviendaLabel) return 0
  if (!a.viviendaLabel) return 1
  if (!b.viviendaLabel) return -1

  const matchA = a.viviendaLabel.match(/^([A-Za-záéíóúÁÉÍÓÚ]+)(\d+)$/)
  const matchB = b.viviendaLabel.match(/^([A-Za-záéíóúÁÉÍÓÚ]+)(\d+)$/)

  if (!matchA || !matchB)
    return a.viviendaLabel.localeCompare(b.viviendaLabel, 'es')

  const letterCmp = matchA[1].localeCompare(matchB[1], 'es')
  if (letterCmp !== 0) return letterCmp
  return parseInt(matchA[2], 10) - parseInt(matchB[2], 10)
}
