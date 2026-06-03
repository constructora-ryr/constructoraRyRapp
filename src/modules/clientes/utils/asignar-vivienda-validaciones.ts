/**
 * Helpers de validación pre-submit para el formulario Asignar Vivienda.
 * Extraídos del hook para ser testeable de forma aislada.
 */

export type EstadoVivienda =
  | 'Disponible'
  | 'Asignada'
  | 'Reservada'
  | 'No Disponible'

export type EstadoNegociacion =
  | 'Activa'
  | 'Suspendida'
  | 'Cancelada'
  | 'Finalizada'

export interface ValidacionViviendaResult {
  ok: boolean
  error?: string
}

export interface ValidacionNegociacionResult {
  ok: boolean
  error?: string
}

/**
 * Valida que la vivienda esté disponible para asignación.
 */
export function validarViviendaDisponible(
  estado: EstadoVivienda | null | undefined
): ValidacionViviendaResult {
  if (!estado) {
    return {
      ok: false,
      error: 'No se pudo verificar el estado de la vivienda. Intenta de nuevo.',
    }
  }
  if (estado !== 'Disponible') {
    return {
      ok: false,
      error: `La vivienda ya no está disponible (estado: ${estado}). Regresa al paso 1 y selecciona otra.`,
    }
  }
  return { ok: true }
}

/**
 * Valida que el cliente no tenga una negociación activa o suspendida.
 */
export function validarSinNegociacionActiva(
  negociacionExistente: { id: string } | null | undefined
): ValidacionNegociacionResult {
  if (negociacionExistente) {
    return {
      ok: false,
      error:
        'Este cliente ya tiene una negociación activa. Cancela o completa la existente antes de crear una nueva.',
    }
  }
  return { ok: true }
}
