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
}

/**
 * Registra un abono llamando al API Route POST /api/abonos/registrar.
 * La validación completa se hace en el servidor.
 *
 * @returns La respuesta JSON con { abono: {...} }
 */
export async function registrarAbonoApi(
  payload: RegistrarAbonoPayload
): Promise<{
  abono: Record<string, unknown>
  negociacion_completada?: boolean
  cliente_nombre?: string | null
}> {
  const response = await fetch('/api/abonos/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Error al registrar el pago')
  }

  return response.json()
}
