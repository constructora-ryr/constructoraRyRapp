// =====================================================
// SERVICIO: Registro de Abonos (API Route)
// =====================================================

export interface RegistrarAbonoPayload {
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  mora_incluida?: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  notas: string | null
  comprobante_path: string
  es_overpayment?: boolean
}

/**
 * El servidor respondió y no guardó el pago (validación o error de BD).
 * A diferencia de un corte de red, aquí es seguro borrar el comprobante subido.
 */
export class PagoRechazadoError extends Error {}

export interface RegistrarAbonoRespuesta {
  abono: Record<string, unknown>
  negociacion_completada?: boolean
  cliente_nombre?: string | null
  /** Saldo de la fuente después del pago */
  saldo_fuente?: number | null
}

/**
 * Registra un abono llamando al API Route POST /api/abonos/registrar.
 * La validación completa se hace en el servidor (RPC registrar_abono).
 */
export async function registrarAbonoApi(
  payload: RegistrarAbonoPayload
): Promise<RegistrarAbonoRespuesta> {
  const response = await fetch('/api/abonos/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new PagoRechazadoError(err.error || 'Error al registrar el pago')
  }

  return response.json()
}
