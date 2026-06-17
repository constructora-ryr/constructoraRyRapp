import { supabase } from '@/lib/supabase/client'
import type { TipoFuentePago } from '@/modules/clientes/types'
import {
  sanitizeActualizarFuentePagoServiceDTO,
  sanitizeCrearFuentePagoServiceDTO,
  sanitizeMontoRecibido,
} from '@/modules/clientes/utils/sanitize-fuente-pago.utils'
export type { TipoFuentePago }

// ============================================================
// DTOs
// ============================================================

export interface CrearFuentePagoDTO {
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  /** Para créditos: capital sin intereses. Se guarda en capital_para_cierre */
  capital_para_cierre?: number
  entidad?: string // nombre legible (nunca UUID)
  entidad_financiera_id?: string // opcional: ID resuelto por el caller
  numero_referencia?: string
  fecha_acta?: string
  permite_multiples_abonos?: boolean
}

export interface ActualizarFuentePagoDTO {
  monto_aprobado?: number
  capital_para_cierre?: number | null
  monto_recibido?: number
  entidad?: string
  entidad_financiera_id?: string
  numero_referencia?: string
  carta_asignacion_url?: string
  estado?: 'Activa' | 'Inactiva'
  fecha_completado?: string
}

export interface FuentePago {
  id: string
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  /** Para créditos: el capital sin intereses. Para otras fuentes: igual a monto_aprobado */
  capital_para_cierre: number | null
  mora_total_recibida?: number
  monto_recibido: number
  saldo_pendiente: number
  porcentaje_completado: number
  entidad: string | null
  entidad_financiera_id?: string | null
  numero_referencia: string | null
  permite_multiples_abonos: boolean
  carta_asignacion_url: string | null
  estado: 'Activa' | 'Inactiva'
  estado_fuente: string | null
  fecha_completado: string | null
  fecha_creacion: string
  fecha_actualizacion: string
}

type FuentePagoConEntidadRow = Omit<FuentePago, 'entidad'> & {
  entidad_display?: string | null
}

// ============================================================
// COLUMNS SELECCIONADAS (tabla base, sin vista)
// ============================================================

const BASE_COLUMNS = `
  id, negociacion_id, tipo, entidad, entidad_financiera_id,
  monto_aprobado, monto_recibido, saldo_pendiente, porcentaje_completado,
  numero_referencia, fecha_acta, permite_multiples_abonos, carta_asignacion_url,
  estado, estado_fuente, fecha_completado, fecha_creacion, fecha_actualizacion
`.trim()

// ============================================================
// SERVICE
// ============================================================

class FuentesPagoService {
  /** Crear fuente de pago */
  async crearFuentePago(datos: CrearFuentePagoDTO): Promise<FuentePago> {
    const datosSanitizados = sanitizeCrearFuentePagoServiceDTO(datos)

    // Resolver tipo_fuente_id (FK NOT NULL)
    const { data: tipoFuente, error: tipoError } = await supabase
      .from('tipos_fuentes_pago')
      .select('id, permite_multiples_abonos')
      .eq('nombre', datosSanitizados.tipo)
      .single()

    if (tipoError || !tipoFuente) {
      throw new Error(
        `Tipo de fuente de pago no encontrado: ${datosSanitizados.tipo}`
      )
    }

    // Resolver entidad_financiera_id si no viene del caller pero sí el nombre
    let entidadFinancieraId = datosSanitizados.entidad_financiera_id ?? null
    if (!entidadFinancieraId && datosSanitizados.entidad) {
      const { data: ef } = await supabase
        .from('entidades_financieras')
        .select('id')
        .eq('nombre', datosSanitizados.entidad)
        .maybeSingle()
      entidadFinancieraId = ef?.id ?? null
    }

    const { data, error } = await supabase
      .from('fuentes_pago')
      .insert({
        negociacion_id: datosSanitizados.negociacion_id,
        tipo: datosSanitizados.tipo,
        tipo_fuente_id: tipoFuente.id,
        monto_aprobado: datosSanitizados.monto_aprobado,
        monto_recibido: 0,
        entidad: datosSanitizados.entidad ?? null,
        entidad_financiera_id: entidadFinancieraId,
        numero_referencia: datosSanitizados.numero_referencia ?? null,
        fecha_acta: datosSanitizados.fecha_acta ?? null,
        permite_multiples_abonos:
          datosSanitizados.permite_multiples_abonos ??
          tipoFuente.permite_multiples_abonos ??
          false,
        capital_para_cierre: datosSanitizados.capital_para_cierre ?? null,
        estado: 'Activa',
        estado_fuente: 'activa',
      })
      .select(BASE_COLUMNS)
      .single()

    if (error) throw error
    return data as unknown as FuentePago
  }

  /**
   * Obtener fuentes activas de una negociación.
   * Usa la vista fuentes_pago_con_entidad para que entidad siempre sea
   * el nombre legible (via JOIN con entidades_financieras), nunca un UUID.
   */
  async obtenerFuentesPagoNegociacion(
    negociacionId: string
  ): Promise<FuentePago[]> {
    const { data, error } = await supabase
      .from('fuentes_pago_con_entidad')
      .select(
        `
        id, negociacion_id, tipo, entidad_display, entidad_financiera_id,
        monto_aprobado, capital_para_cierre, monto_recibido, saldo_pendiente, porcentaje_completado,
        numero_referencia, permite_multiples_abonos, carta_asignacion_url,
        estado, estado_fuente, fecha_completado, fecha_creacion, fecha_actualizacion
      `
      )
      .eq('negociacion_id', negociacionId)
      .eq('estado_fuente', 'activa')
      .order('fecha_creacion', { ascending: true })

    if (error) throw error

    return ((data ?? []) as FuentePagoConEntidadRow[]).map(row => ({
      ...row,
      entidad: row.entidad_display ?? null,
    })) as FuentePago[]
  }

  /** Obtener fuente de pago por ID */
  async obtenerFuentePago(id: string): Promise<FuentePago | null> {
    const { data, error } = await supabase
      .from('fuentes_pago_con_entidad')
      .select(
        `
        id, negociacion_id, tipo, entidad_display, entidad_financiera_id,
        monto_aprobado, capital_para_cierre, monto_recibido, saldo_pendiente, porcentaje_completado,
        numero_referencia, permite_multiples_abonos, carta_asignacion_url,
        estado, estado_fuente, fecha_completado, fecha_creacion, fecha_actualizacion
      `
      )
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    const row = data as FuentePagoConEntidadRow
    return { ...row, entidad: row.entidad_display ?? null } as FuentePago
  }

  /** Actualizar fuente de pago */
  async actualizarFuentePago(
    id: string,
    datos: ActualizarFuentePagoDTO
  ): Promise<FuentePago> {
    const datosSanitizados = sanitizeActualizarFuentePagoServiceDTO(datos)

    // Validar balance si se cambia algún monto que afecta total_fuentes_pago
    const cambiaMontoFinanciero =
      datosSanitizados.monto_aprobado !== undefined ||
      'capital_para_cierre' in datosSanitizados

    if (cambiaMontoFinanciero) {
      await this.validarBalanceNegociacion(id, datosSanitizados)
    }

    const { data, error } = await supabase
      .from('fuentes_pago')
      .update(datosSanitizados)
      .eq('id', id)
      .select(BASE_COLUMNS)
      .single()

    if (error) throw error
    return data as unknown as FuentePago
  }

  /**
   * Valida que cambiar el monto de una fuente no rompa el balance de la negociación.
   * total_fuentes_pago = SUM(COALESCE(capital_para_cierre, monto_aprobado)) debe
   * seguir igualando negociaciones.valor_total_pagar después del cambio.
   */
  private async validarBalanceNegociacion(
    fuenteId: string,
    datos: Pick<
      ActualizarFuentePagoDTO,
      'monto_aprobado' | 'capital_para_cierre'
    >
  ): Promise<void> {
    // 1. Obtener fuente actual + negociación
    const { data: fuenteActual, error: errFuente } = await supabase
      .from('fuentes_pago')
      .select('negociacion_id, capital_para_cierre, monto_aprobado')
      .eq('id', fuenteId)
      .single()

    if (errFuente || !fuenteActual) return

    const { data: negociacion, error: errNeg } = await supabase
      .from('negociaciones')
      .select('valor_total_pagar')
      .eq('id', fuenteActual.negociacion_id)
      .single()

    if (errNeg || !negociacion) return

    // 2. Obtener todas las demás fuentes activas
    const { data: otrasFuentes, error: errOtras } = await supabase
      .from('fuentes_pago')
      .select('capital_para_cierre, monto_aprobado')
      .eq('negociacion_id', fuenteActual.negociacion_id)
      .eq('estado', 'Activa')
      .neq('id', fuenteId)

    if (errOtras || !otrasFuentes) return

    // 3. Calcular capital efectivo de esta fuente después del cambio
    // Misma lógica que el trigger: COALESCE(capital_para_cierre, monto_aprobado)
    const nuevoCapitalParaCierre =
      'capital_para_cierre' in datos
        ? datos.capital_para_cierre
        : fuenteActual.capital_para_cierre
    const nuevoMontoAprobado =
      datos.monto_aprobado ?? Number(fuenteActual.monto_aprobado)
    const capitalEfectivoNuevo = nuevoCapitalParaCierre ?? nuevoMontoAprobado

    // 4. Calcular nuevo total de la negociación
    const sumaOtras = otrasFuentes.reduce(
      (sum, f) => sum + Number(f.capital_para_cierre ?? f.monto_aprobado ?? 0),
      0
    )
    const nuevoTotal = sumaOtras + capitalEfectivoNuevo
    const valorEsperado = Number(negociacion.valor_total_pagar)
    const diferencia = Math.abs(nuevoTotal - valorEsperado)

    if (diferencia > 1) {
      const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO')
      throw new Error(
        `El cambio rompería el balance financiero de la negociación. ` +
          `Nuevo total de fuentes: ${fmt(nuevoTotal)} ≠ ` +
          `Valor de la negociación: ${fmt(valorEsperado)} ` +
          `(diferencia: ${fmt(nuevoTotal - valorEsperado)}). ` +
          `Ajuste las demás fuentes antes de modificar este monto.`
      )
    }
  }

  /** Registrar monto recibido (abono) */
  async registrarMontoRecibido(id: string, monto: number): Promise<FuentePago> {
    const fuente = await this.obtenerFuentePago(id)
    if (!fuente) throw new Error('Fuente de pago no encontrada')

    const montoSanitizado = sanitizeMontoRecibido(monto)
    const nuevoTotal = fuente.monto_recibido + montoSanitizado

    if (nuevoTotal > fuente.monto_aprobado) {
      throw new Error('El monto recibido excede el monto aprobado')
    }

    if (!fuente.permite_multiples_abonos && fuente.monto_recibido > 0) {
      throw new Error('Esta fuente de pago no permite múltiples abonos')
    }

    return this.actualizarFuentePago(id, { monto_recibido: nuevoTotal })
  }

  /**
   * Inactivar fuente de pago (soft delete).
   * No se puede inactivar si ya recibió dinero.
   */
  async inactivarFuentePago(
    id: string,
    razon: string,
    reemplazadaPor?: string
  ): Promise<void> {
    const fuente = await this.obtenerFuentePago(id)
    if (!fuente) throw new Error('Fuente de pago no encontrada')

    if (fuente.monto_recibido > 0) {
      throw new Error(
        `No se puede eliminar una fuente que ya recibió $${fuente.monto_recibido.toLocaleString('es-CO')}. ` +
          `Debe permanecer activa para conservar el historial de abonos.`
      )
    }

    const { error } = await supabase
      .from('fuentes_pago')
      .update({
        estado: 'Inactiva',
        estado_fuente: reemplazadaPor ? 'reemplazada' : 'inactiva',
        razon_inactivacion: razon,
        fecha_inactivacion: new Date().toISOString(),
        reemplazada_por: reemplazadaPor ?? null,
      })
      .eq('id', id)

    if (error) throw error
  }

  /** Eliminar permanentemente. Solo si no tiene dinero recibido. */
  async eliminarFuentePago(id: string): Promise<void> {
    const fuente = await this.obtenerFuentePago(id)
    if (!fuente) throw new Error('Fuente de pago no encontrada')

    if (fuente.monto_recibido > 0) {
      throw new Error(
        `PROHIBIDO: No se puede eliminar una fuente con $${fuente.monto_recibido.toLocaleString('es-CO')} recibidos.`
      )
    }

    const { error } = await supabase.from('fuentes_pago').delete().eq('id', id)

    if (error) {
      throw new Error(
        error.message.includes('PROHIBIDO')
          ? 'No se puede eliminar esta fuente porque ya ha recibido dinero'
          : error.message
      )
    }
  }

  /** Calcular totales de todas las fuentes activas de una negociación */
  async calcularTotales(negociacionId: string): Promise<{
    total_aprobado: number
    total_recibido: number
    saldo_pendiente: number
    porcentaje_completado: number
  }> {
    const fuentes = await this.obtenerFuentesPagoNegociacion(negociacionId)

    const total_aprobado = fuentes.reduce((s, f) => s + f.monto_aprobado, 0)
    const total_recibido = fuentes.reduce((s, f) => s + f.monto_recibido, 0)

    return {
      total_aprobado,
      total_recibido,
      saldo_pendiente: total_aprobado - total_recibido,
      porcentaje_completado:
        total_aprobado > 0 ? (total_recibido / total_aprobado) * 100 : 0,
    }
  }

  /**
   * Verificar si el cierre financiero está completo.
   *
   * Usa COALESCE(capital_para_cierre, monto_aprobado) para que los créditos
   * contribuyan con su capital (no con capital+intereses) al total de financiación.
   * Evita que los intereses inflen el total por encima del valor de la vivienda.
   */
  async verificarCierreFinancieroCompleto(
    negociacionId: string,
    valorTotal: number
  ): Promise<boolean> {
    const fuentes = await this.obtenerFuentesPagoNegociacion(negociacionId)
    const total_para_cierre = fuentes.reduce(
      (sum, f) => sum + (f.capital_para_cierre ?? f.monto_aprobado),
      0
    )
    return total_para_cierre >= valorTotal
  }
}

export const fuentesPagoService = new FuentesPagoService()
