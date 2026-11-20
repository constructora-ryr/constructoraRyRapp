/**
 * Helpers de validación pre-submit para el formulario Asignar Vivienda.
 * Extraídos del hook para ser testeable de forma aislada.
 */

import type {
  CampoConfig,
  TipoFuentePagoConCampos,
  ValorCampo,
} from '@/modules/configuracion/types/campos-dinamicos.types'

import type { FuentePagoConfiguracion } from '../components/asignar-vivienda/types'

import { obtenerMontoParaCierre } from './fuentes-pago-campos.utils'

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

// ──────────────────────────────────────────────────────────────
// Fuentes de pago (paso 2)
// ──────────────────────────────────────────────────────────────

/** Valor de un campo; entidad y referencia también viven en campos legados */
function valorCampo(
  config: FuentePagoConfiguracion['config'],
  campo: CampoConfig
): ValorCampo | undefined {
  if (!config) return undefined
  const valor = config.campos?.[campo.nombre]
  if (valor !== undefined && valor !== null && valor !== '') return valor
  if (campo.rol === 'entidad')
    return config.entidad || config.entidad_financiera_id
  if (campo.rol === 'referencia') return config.numero_referencia
  return valor
}

function estaVacio(valor: ValorCampo | undefined, campo: CampoConfig) {
  if (valor === undefined || valor === null) return true
  if (typeof valor === 'string') return valor.trim() === ''
  if (campo.tipo === 'number' || campo.tipo === 'currency')
    return !(Number(valor) > 0)
  return false
}

/**
 * Qué le falta a cada fuente en uso: el monto y los campos que su tipo
 * marca como obligatorios (entidad, referencia, fecha del acta…). Devuelve
 * un mensaje por tipo de fuente; sin problemas, un objeto vacío.
 */
export function erroresDeFuentes(
  fuentes: FuentePagoConfiguracion[],
  tipos: TipoFuentePagoConCampos[]
): Record<string, string> {
  const errores: Record<string, string> = {}
  for (const fuente of fuentes) {
    if (!fuente.enabled) continue
    const tipo = tipos.find(t => t.nombre === fuente.tipo)
    const campos = tipo?.configuracion_campos?.campos ?? []

    // Crédito con la constructora: su formulario propio fija el monto
    if (tipo?.logica_negocio?.genera_cuotas) {
      if (!fuente.config || !((fuente.config.monto_aprobado ?? 0) > 0))
        errores[fuente.tipo] = 'Completa el monto y las condiciones del crédito'
      continue
    }

    if (!(obtenerMontoParaCierre(fuente.config, tipo, campos) > 0)) {
      errores[fuente.tipo] = 'Indica el monto de esta fuente'
      continue
    }

    const faltan = campos.filter(
      c =>
        c.requerido &&
        c.rol !== 'monto' &&
        c.tipo !== 'checkbox' &&
        estaVacio(valorCampo(fuente.config, c), c)
    )
    if (faltan.length > 0)
      errores[fuente.tipo] = `Falta: ${faltan.map(c => c.label).join(', ')}`
  }
  return errores
}

/**
 * Por qué no se puede pasar del paso de fuentes; vacío si se puede.
 * Sobrar dinero sí está permitido: el excedente se devuelve al cliente.
 */
export function problemasPasoFuentes({
  fuentesEnUso,
  diferencia,
  valorTotal,
  errores,
  formatear,
}: {
  fuentesEnUso: number
  /** valorTotal − total de las fuentes (positivo = falta) */
  diferencia: number
  valorTotal: number
  errores: Record<string, string>
  formatear: (valor: number) => string
}): string[] {
  if (fuentesEnUso === 0) return ['Agrega al menos una fuente de pago.']
  const problemas: string[] = []
  if (diferencia > 0)
    problemas.push(
      `Faltan ${formatear(diferencia)} para cubrir el total de ${formatear(valorTotal)}. Agrega otra fuente o ajusta los montos.`
    )
  const conError = Object.keys(errores)
  if (conError.length === 1)
    problemas.push(
      `Completa la fuente ${conError[0]} (${errores[conError[0]]}).`
    )
  else if (conError.length > 1)
    problemas.push(
      `Completa las fuentes marcadas en rojo (${conError.join(', ')}).`
    )
  return problemas
}

// ──────────────────────────────────────────────────────────────
// Vivienda y valores (paso 1)
// ──────────────────────────────────────────────────────────────

export interface ProblemaCampo {
  /** Campo del formulario donde se marca el error */
  campo:
    | 'vivienda_id'
    | 'valor_negociado'
    | 'valor_escritura_publica'
    | 'descuento_aplicado'
    | 'tipo_descuento'
    | 'motivo_descuento'
    | 'fecha_negociacion'
  mensaje: string
}

/**
 * Qué impide pasar del paso de vivienda y valores. Se calcula completo
 * (no se detiene en el primer error) para mostrar todo de una vez.
 */
export function problemasPaso1(d: {
  viviendaId: string | null | undefined
  valorBase: number
  valorEscritura: number | null | undefined
  aplicarDescuento: boolean
  descuento: number
  tipoDescuento?: string | null
  motivoDescuento?: string | null
  /** 'YYYY-MM-DD' */
  fechaNegociacion?: string | null
  /** Hoy en Colombia, 'YYYY-MM-DD' */
  hoy: string
}): ProblemaCampo[] {
  const p: ProblemaCampo[] = []
  if (!d.viviendaId) {
    p.push({
      campo: 'vivienda_id',
      mensaje: 'Elige la vivienda que se va a asignar.',
    })
  } else if (!(d.valorBase > 0)) {
    p.push({
      campo: 'valor_negociado',
      mensaje:
        'La casa elegida no tiene valor registrado. Corrígelo en Viviendas antes de asignarla.',
    })
  }
  if (d.viviendaId && !((d.valorEscritura ?? 0) > 0)) {
    p.push({
      campo: 'valor_escritura_publica',
      mensaje: 'Indica el valor que figura en la escritura.',
    })
  }
  if (d.aplicarDescuento) {
    if (!(d.descuento > 0))
      p.push({
        campo: 'descuento_aplicado',
        mensaje: 'Indica el monto del descuento.',
      })
    else if (d.valorBase > 0 && d.descuento >= d.valorBase)
      p.push({
        campo: 'descuento_aplicado',
        mensaje:
          'El descuento no puede igualar ni superar el valor de la casa.',
      })
    if (!d.tipoDescuento)
      p.push({
        campo: 'tipo_descuento',
        mensaje: 'Elige el tipo de descuento.',
      })
    if ((d.motivoDescuento?.trim().length ?? 0) < 10)
      p.push({
        campo: 'motivo_descuento',
        mensaje: 'Explica el motivo del descuento (mínimo 10 caracteres).',
      })
  }
  if (d.fechaNegociacion && d.fechaNegociacion.slice(0, 10) > d.hoy) {
    p.push({
      campo: 'fecha_negociacion',
      mensaje: 'La fecha de la negociación no puede ser futura.',
    })
  }
  return p
}
