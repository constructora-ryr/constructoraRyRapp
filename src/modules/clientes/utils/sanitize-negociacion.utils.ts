import { sanitizeDate, sanitizeString } from '@/lib/utils/sanitize.utils'

import type { EstadoNegociacion } from '../types'

interface ParametrosCreditoDTO {
  capital: number
  tasaMensual: number
  numCuotas: number
  fechaInicio: Date | string
  tasaMoraDiaria?: number
}

export interface CrearFuentePagoDTO {
  tipo: string
  monto_aprobado: number
  entidad?: string
  entidad_financiera_id?: string
  numero_referencia?: string
  carta_asignacion_url?: string
  capital_para_cierre?: number
  parametrosCredito?: ParametrosCreditoDTO
  permite_multiples_abonos?: boolean
}

export interface CrearNegociacionDTO {
  cliente_id: string
  vivienda_id: string
  valor_negociado: number
  descuento_aplicado?: number
  tipo_descuento?: string
  motivo_descuento?: string
  valor_escritura_publica?: number
  notas?: string
  fecha_negociacion?: string
  fuentes_pago?: CrearFuentePagoDTO[]
}

export interface ActualizarNegociacionDTO {
  estado?: EstadoNegociacion
  valor_negociado?: number
  descuento_aplicado?: number
  /** null limpia el campo en BD (quitar descuento) */
  tipo_descuento?: string | null
  /** null limpia el campo en BD (quitar descuento) */
  motivo_descuento?: string | null
  valor_escritura_publica?: number
  fecha_completada?: string
  notas?: string
}

export interface ActualizarFuentePagoDTO {
  id?: string
  tipo: string
  monto_aprobado: number
  entidad?: string | null
  entidad_financiera_id?: string | null
  numero_referencia?: string | null
  detalles?: string | null
  permite_multiples_abonos?: boolean
}

function sanitizeNumber(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return undefined
  }

  return Number.isFinite(value) ? value : undefined
}

function sanitizeRequiredNumber(value: number, fallback = 0): number {
  const sanitized = sanitizeNumber(value)
  return sanitized ?? fallback
}

function sanitizeDateLike(
  value: Date | string | null | undefined
): Date | string | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value
  }

  return sanitizeDate(value) ?? undefined
}

export function sanitizeCrearFuentePagoDTO(
  datos: CrearFuentePagoDTO
): CrearFuentePagoDTO {
  const sanitized: CrearFuentePagoDTO = {
    tipo: sanitizeString(datos.tipo) || '',
    monto_aprobado: sanitizeRequiredNumber(datos.monto_aprobado),
    entidad: sanitizeString(datos.entidad) ?? undefined,
    entidad_financiera_id:
      sanitizeString(datos.entidad_financiera_id) ?? undefined,
    numero_referencia: sanitizeString(datos.numero_referencia) ?? undefined,
    carta_asignacion_url:
      sanitizeString(datos.carta_asignacion_url) ?? undefined,
    capital_para_cierre: sanitizeNumber(datos.capital_para_cierre),
    permite_multiples_abonos:
      typeof datos.permite_multiples_abonos === 'boolean'
        ? datos.permite_multiples_abonos
        : undefined,
  }

  if (datos.parametrosCredito) {
    sanitized.parametrosCredito = {
      capital: sanitizeRequiredNumber(datos.parametrosCredito.capital),
      tasaMensual: sanitizeRequiredNumber(datos.parametrosCredito.tasaMensual),
      numCuotas: sanitizeRequiredNumber(datos.parametrosCredito.numCuotas),
      fechaInicio:
        sanitizeDateLike(datos.parametrosCredito.fechaInicio) ??
        datos.parametrosCredito.fechaInicio,
      tasaMoraDiaria: sanitizeNumber(datos.parametrosCredito.tasaMoraDiaria),
    }
  }

  return sanitized
}

export function sanitizeCrearNegociacionDTO(
  datos: CrearNegociacionDTO
): CrearNegociacionDTO {
  return {
    cliente_id: sanitizeString(datos.cliente_id) || '',
    vivienda_id: sanitizeString(datos.vivienda_id) || '',
    valor_negociado: sanitizeRequiredNumber(datos.valor_negociado),
    descuento_aplicado: sanitizeNumber(datos.descuento_aplicado),
    tipo_descuento: sanitizeString(datos.tipo_descuento) ?? undefined,
    motivo_descuento: sanitizeString(datos.motivo_descuento) ?? undefined,
    valor_escritura_publica: sanitizeNumber(datos.valor_escritura_publica),
    notas: sanitizeString(datos.notas) ?? undefined,
    fecha_negociacion: sanitizeDate(datos.fecha_negociacion) ?? undefined,
    fuentes_pago: datos.fuentes_pago?.map(sanitizeCrearFuentePagoDTO),
  }
}

export function sanitizeActualizarNegociacionDTO(
  datos: ActualizarNegociacionDTO
): ActualizarNegociacionDTO {
  const sanitized: ActualizarNegociacionDTO = {}

  if (datos.estado !== undefined) sanitized.estado = datos.estado
  if (datos.valor_negociado !== undefined) {
    sanitized.valor_negociado = sanitizeNumber(datos.valor_negociado)
  }
  if (datos.descuento_aplicado !== undefined) {
    sanitized.descuento_aplicado = sanitizeNumber(datos.descuento_aplicado)
  }
  if (datos.tipo_descuento !== undefined) {
    // null explícito limpia el campo en BD; string vacío también queda null
    sanitized.tipo_descuento = sanitizeString(datos.tipo_descuento) ?? null
  }
  if (datos.motivo_descuento !== undefined) {
    sanitized.motivo_descuento = sanitizeString(datos.motivo_descuento) ?? null
  }
  if (datos.valor_escritura_publica !== undefined) {
    sanitized.valor_escritura_publica = sanitizeNumber(
      datos.valor_escritura_publica
    )
  }
  if (datos.fecha_completada !== undefined) {
    sanitized.fecha_completada =
      sanitizeDate(datos.fecha_completada) ?? undefined
  }
  if (datos.notas !== undefined) {
    sanitized.notas = sanitizeString(datos.notas) ?? undefined
  }

  return sanitized
}

export function sanitizeActualizarFuentePagoDTO(
  datos: ActualizarFuentePagoDTO
): ActualizarFuentePagoDTO {
  return {
    id: sanitizeString(datos.id) ?? undefined,
    tipo: sanitizeString(datos.tipo) || '',
    monto_aprobado: sanitizeRequiredNumber(datos.monto_aprobado),
    entidad: sanitizeString(datos.entidad) ?? undefined,
    numero_referencia: sanitizeString(datos.numero_referencia) ?? undefined,
    detalles: sanitizeString(datos.detalles) ?? undefined,
    permite_multiples_abonos:
      typeof datos.permite_multiples_abonos === 'boolean'
        ? datos.permite_multiples_abonos
        : undefined,
  }
}
