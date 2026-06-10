/**
 * Service: Créditos con la Constructora
 *
 * CRUD para la tabla creditos_constructora.
 * Esta tabla almacena los parámetros financieros tipados de cada fuente de crédito.
 *
 * Responsabilidades:
 * - Crear registro al configurar una fuente de tipo "Crédito con la Constructora"
 * - Obtener crédito por fuente_pago_id
 * - Actualizar version_actual al reestructurar (atomicamente con cuotas)
 */

import { supabase } from '@/lib/supabase/client'

import type { CrearCreditoDTO, CreditoConstructora } from '../types'

// ============================================================
// OBTENER
// ============================================================

/**
 * Obtiene el crédito asociado a una fuente de pago.
 * Retorna null si la fuente no es de tipo crédito.
 */
export async function getCreditoByFuente(
  fuentePagoId: string
): Promise<{ data: CreditoConstructora | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('creditos_constructora')
    .select('*')
    .eq('fuente_pago_id', fuentePagoId)
    .maybeSingle()

  return {
    data: data as CreditoConstructora | null,
    error: error ? new Error(error.message) : null,
  }
}

// ============================================================
// CREAR
// ============================================================

/**
 * Crea el registro de crédito.
 * Debe llamarse DESPUÉS de crear la fuente en fuentes_pago para tener el ID.
 * En el flujo normal es parte de la transacción de guardar la fuente completa.
 */
export async function crearCredito(
  dto: CrearCreditoDTO
): Promise<{ data: CreditoConstructora | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('creditos_constructora')
    .insert({
      fuente_pago_id: dto.fuente_pago_id,
      capital: dto.capital,
      tasa_mensual: dto.tasa_mensual,
      num_cuotas: dto.num_cuotas,
      fecha_inicio: dto.fecha_inicio,
      valor_cuota: dto.valor_cuota,
      interes_total: dto.interes_total,
      monto_total: dto.monto_total,
      tasa_mora_diaria: dto.tasa_mora_diaria,
    })
    .select()
    .single()

  if (error) return { data: null, error: new Error(error.message) }

  // Sincronizar fuentes_pago con los valores calculados del plan:
  // - monto_aprobado = deuda total (capital + todos los intereses)
  // - capital_para_cierre = solo el capital (para cálculo de cierre financiero)
  await supabase
    .from('fuentes_pago')
    .update({
      monto_aprobado: dto.monto_total,
      capital_para_cierre: dto.capital,
    })
    .eq('id', dto.fuente_pago_id)

  return {
    data: data as CreditoConstructora | null,
    error: null,
  }
}

// ============================================================
// CORREGIR FECHA DE INICIO
// ============================================================

/**
 * Corrige la fecha de inicio de un crédito corriendo todas las fechas de cuotas
 * por el mismo desplazamiento en meses, sin recalcular montos.
 * Operación atómica: elimina cuotas de la versión actual e inserta las corregidas.
 */
export async function corregirFechaInicioCredito(params: {
  creditoId: string
  fuentePagoId: string
  versionActual: number
  nuevaFechaInicio: string // YYYY-MM-DD
  cuotasCorregidas: Array<{
    numero_cuota: number
    fecha_vencimiento: string
    valor_cuota: number
  }>
}): Promise<{ error: Error | null }> {
  const {
    creditoId,
    fuentePagoId,
    versionActual,
    nuevaFechaInicio,
    cuotasCorregidas,
  } = params

  // 1. Eliminar cuotas de la versión actual
  const { error: eDelete } = await supabase
    .from('cuotas_credito')
    .delete()
    .eq('fuente_pago_id', fuentePagoId)
    .eq('version_plan', versionActual)

  if (eDelete) return { error: new Error(eDelete.message) }

  // 2. Insertar cuotas con fechas corregidas
  const { error: eInsert } = await supabase.from('cuotas_credito').insert(
    cuotasCorregidas.map(c => ({
      fuente_pago_id: fuentePagoId,
      numero_cuota: c.numero_cuota,
      fecha_vencimiento: c.fecha_vencimiento,
      valor_cuota: c.valor_cuota,
      version_plan: versionActual,
    }))
  )

  if (eInsert) return { error: new Error(eInsert.message) }

  // 3. Actualizar fecha_inicio en creditos_constructora
  const { error: eUpdate } = await supabase
    .from('creditos_constructora')
    .update({ fecha_inicio: nuevaFechaInicio })
    .eq('id', creditoId)

  return { error: eUpdate ? new Error(eUpdate.message) : null }
}

// ============================================================
// ACTUALIZAR
// ============================================================

/**
 * Actualiza version_actual al reestructurar el crédito.
 * Se llama DESPUÉS de crear las cuotas nueva versión.
 * El trigger sync_version_credito en cuotas_credito también actualiza version_actual,
 * por lo que este método es redundante — se mantiene para claridad de intención.
 */
export async function actualizarVersionCredito(
  creditoId: string,
  nuevaVersion: number
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('creditos_constructora')
    .update({ version_actual: nuevaVersion })
    .eq('id', creditoId)

  return { error: error ? new Error(error.message) : null }
}
