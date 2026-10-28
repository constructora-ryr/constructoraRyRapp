import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  ClienteEnEntidad,
  EntidadFinancieraResumen,
  ReporteFinanciacionData,
  TipoEntidadFinanciera,
} from '../types'
import { categoriaDe, estadoDesembolso } from '../utils/reportes.utils'

const ESTADOS_NEGOCIACION_VALIDOS = new Set(['Activa', 'Completada'])

/** Mi Casa Ya no tiene entidad_financiera_id: se agrupa en una propia */
const MCY_SINTETICO = {
  id: 'micasaya-sintetico',
  nombre: 'Mi Casa Ya',
  tipo: 'Gobierno' as const,
}

interface FilaFuente {
  id: string
  tipo: string
  monto_aprobado: number | null
  monto_recibido: number | null
  numero_referencia: string | null
  fecha_acta: string | null
  entidades_financieras: {
    id: string
    nombre: string
    tipo: TipoEntidadFinanciera
  } | null
  negociaciones: {
    id: string
    estado: string
    clientes: {
      id: string
      nombre_completo: string | null
      tipo_documento: string | null
      numero_documento: string | null
    } | null
    viviendas: {
      numero: string | null
      manzanas: { nombre: string } | null
    } | null
  } | null
}

class ReporteFinanciacionService {
  /**
   * Fuentes de pago activas con entidad financiera (o Mi Casa Ya), con su
   * cliente y vivienda, agrupadas por entidad. Lo desembolsado sale de
   * fuentes_pago.monto_recibido, que suma los abonos de la fuente: así un
   * crédito girado en dos partes cuenta como parcial y no como completo.
   */
  async obtenerReporteFinanciacion(): Promise<ReporteFinanciacionData> {
    const { data, error } = await supabase
      .from('fuentes_pago')
      .select(
        `
        id,
        tipo,
        monto_aprobado,
        monto_recibido,
        numero_referencia,
        fecha_acta,
        entidades_financieras ( id, nombre, tipo ),
        negociaciones (
          id,
          estado,
          clientes ( id, nombre_completo, tipo_documento, numero_documento ),
          viviendas!negociaciones_vivienda_id_fkey (
            numero,
            manzanas ( nombre )
          )
        )
      `
      )
      .eq('estado_fuente', 'activa')
      .or('entidad_financiera_id.not.is.null,tipo.eq.Subsidio Mi Casa Ya')

    if (error) {
      logger.error('Error obteniendo reporte de financiación:', error)
      throw new Error(`Error al cargar reporte: ${error.message}`)
    }

    const filas = (data ?? []) as unknown as FilaFuente[]
    const primerDesembolso = await this.primerDesembolsoPorFuente(
      filas.map(f => f.id)
    )
    return this.agruparPorEntidad(filas, primerDesembolso)
  }

  /** Fecha del primer abono activo de cada fuente */
  private async primerDesembolsoPorFuente(
    fuenteIds: string[]
  ): Promise<Map<string, string>> {
    const mapa = new Map<string, string>()
    if (fuenteIds.length === 0) return mapa

    const { data } = await supabase
      .from('abonos_historial')
      .select('fuente_pago_id, fecha_abono')
      .in('fuente_pago_id', fuenteIds)
      .eq('estado', 'Activo')
      .order('fecha_abono', { ascending: true })

    for (const abono of data ?? []) {
      if (!mapa.has(abono.fuente_pago_id)) {
        mapa.set(abono.fuente_pago_id, abono.fecha_abono)
      }
    }
    return mapa
  }

  private agruparPorEntidad(
    filas: FilaFuente[],
    primerDesembolso: Map<string, string>
  ): ReporteFinanciacionData {
    const mapa = new Map<
      string,
      Omit<
        EntidadFinancieraResumen,
        'totalClientesUnicos' | 'tipoFuente' | 'fuentesPendientes'
      >
    >()

    for (const fila of filas) {
      const negociacion = fila.negociaciones
      const cliente = negociacion?.clientes
      if (!negociacion || !cliente) continue
      if (!ESTADOS_NEGOCIACION_VALIDOS.has(negociacion.estado)) continue
      if (!fila.entidades_financieras && fila.tipo !== 'Subsidio Mi Casa Ya')
        continue

      const entidad = fila.entidades_financieras ?? MCY_SINTETICO
      if (!mapa.has(entidad.id)) {
        mapa.set(entidad.id, {
          id: entidad.id,
          nombre: entidad.nombre,
          tipo: entidad.tipo,
          categoria: categoriaDe(entidad.tipo),
          montoTotalAprobado: 0,
          totalDesembolsado: 0,
          totalPendiente: 0,
          clientes: [],
        })
      }

      const aprobado = Number(fila.monto_aprobado ?? 0)
      const recibido = Math.min(aprobado, Number(fila.monto_recibido ?? 0))
      const manzana = negociacion.viviendas?.manzanas?.nombre ?? ''
      const numero = negociacion.viviendas?.numero ?? ''

      const grupo = mapa.get(entidad.id)
      if (!grupo) continue
      grupo.montoTotalAprobado += aprobado
      grupo.totalDesembolsado += recibido
      grupo.totalPendiente += aprobado - recibido
      grupo.clientes.push({
        fuenteId: fila.id,
        negociacionId: negociacion.id,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre_completo ?? '',
        clienteTipoDocumento: cliente.tipo_documento ?? '',
        clienteDocumento: cliente.numero_documento ?? '',
        tipoFuente: fila.tipo,
        montoAprobado: aprobado,
        montoRecibido: recibido,
        saldoPendiente: aprobado - recibido,
        numeroReferencia: fila.numero_referencia,
        fechaActa: fila.fecha_acta,
        estadoNegociacion: negociacion.estado,
        viviendaLabel: manzana && numero ? `${manzana}${numero}` : null,
        fechaDesembolso: primerDesembolso.get(fila.id) ?? null,
        estadoDesembolso: estadoDesembolso(aprobado, recibido),
      })
    }

    const entidades: EntidadFinancieraResumen[] = Array.from(mapa.values())
      .map(e => ({
        ...e,
        tipoFuente: tipoMasComun(e.clientes),
        totalClientesUnicos: new Set(e.clientes.map(c => c.clienteId)).size,
        fuentesPendientes: e.clientes.filter(
          c => c.estadoDesembolso !== 'desembolsado'
        ).length,
        clientes: [...e.clientes].sort(porVivienda),
      }))
      .sort((a, b) => b.montoTotalAprobado - a.montoTotalAprobado)

    const todas = entidades.flatMap(e => e.clientes)
    return {
      entidades,
      resumen: {
        montoAprobado: sumar(entidades, e => e.montoTotalAprobado),
        desembolsado: sumar(entidades, e => e.totalDesembolsado),
        pendiente: sumar(entidades, e => e.totalPendiente),
        clientes: new Set(todas.map(c => c.clienteId)).size,
        clientesPendientes: new Set(
          todas
            .filter(c => c.estadoDesembolso !== 'desembolsado')
            .map(c => c.clienteId)
        ).size,
      },
    }
  }
}

export const reporteFinanciacionService = new ReporteFinanciacionService()

function sumar<T>(lista: T[], valor: (item: T) => number): number {
  return lista.reduce((s, item) => s + valor(item), 0)
}

function tipoMasComun(clientes: ClienteEnEntidad[]): string {
  const conteo = new Map<string, number>()
  for (const c of clientes)
    conteo.set(c.tipoFuente, (conteo.get(c.tipoFuente) ?? 0) + 1)
  return [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

/** A1, A2, A10, B1… (manzana alfabética, número de casa numérico) */
function porVivienda(
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

  const letra = matchA[1].localeCompare(matchB[1], 'es')
  if (letra !== 0) return letra
  return parseInt(matchA[2], 10) - parseInt(matchB[2], 10)
}
