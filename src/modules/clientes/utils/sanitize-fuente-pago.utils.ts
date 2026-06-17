import { sanitizeDate, sanitizeString } from '@/lib/utils/sanitize.utils'

type CrearFuentePagoShape = {
  negociacion_id: string
  tipo: string
  monto_aprobado: number
  capital_para_cierre?: number
  entidad?: string | null
  entidad_financiera_id?: string | null
  numero_referencia?: string | null
  permite_multiples_abonos?: boolean
}

type ActualizarFuentePagoShape = {
  monto_aprobado?: number
  capital_para_cierre?: number | null
  monto_recibido?: number
  entidad?: string | null
  entidad_financiera_id?: string | null
  numero_referencia?: string | null
  fecha_acta?: string | null
  carta_asignacion_url?: string | null
  estado?: 'Activa' | 'Inactiva'
  fecha_completado?: string | null
}

function sanitizeNumber(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return undefined
  }

  return Number.isFinite(value) ? value : undefined
}

function sanitizeRequiredNumber(value: number, fallback = 0): number {
  return sanitizeNumber(value) ?? fallback
}

export function sanitizeCrearFuentePagoServiceDTO<
  T extends CrearFuentePagoShape,
>(datos: T): T {
  return {
    ...datos,
    negociacion_id: sanitizeString(datos.negociacion_id) || '',
    tipo: sanitizeString(datos.tipo) || '',
    monto_aprobado: sanitizeRequiredNumber(datos.monto_aprobado),
    capital_para_cierre: sanitizeNumber(datos.capital_para_cierre),
    entidad: sanitizeString(datos.entidad) ?? undefined,
    entidad_financiera_id:
      sanitizeString(datos.entidad_financiera_id) ?? undefined,
    numero_referencia: sanitizeString(datos.numero_referencia) ?? undefined,
    permite_multiples_abonos:
      typeof datos.permite_multiples_abonos === 'boolean'
        ? datos.permite_multiples_abonos
        : undefined,
  }
}

export function sanitizeActualizarFuentePagoServiceDTO<
  T extends ActualizarFuentePagoShape,
>(datos: T): T {
  return {
    ...datos,
    monto_aprobado:
      datos.monto_aprobado !== undefined
        ? sanitizeNumber(datos.monto_aprobado)
        : undefined,
    capital_para_cierre:
      datos.capital_para_cierre !== undefined
        ? sanitizeNumber(datos.capital_para_cierre)
        : undefined,
    monto_recibido:
      datos.monto_recibido !== undefined
        ? sanitizeNumber(datos.monto_recibido)
        : undefined,
    entidad:
      datos.entidad !== undefined
        ? (sanitizeString(datos.entidad) ?? undefined)
        : undefined,
    entidad_financiera_id:
      datos.entidad_financiera_id !== undefined
        ? (sanitizeString(datos.entidad_financiera_id) ?? undefined)
        : undefined,
    numero_referencia:
      datos.numero_referencia !== undefined
        ? (sanitizeString(datos.numero_referencia) ?? undefined)
        : undefined,
    fecha_acta:
      datos.fecha_acta !== undefined
        ? (sanitizeDate(datos.fecha_acta) ?? undefined)
        : undefined,
    carta_asignacion_url:
      datos.carta_asignacion_url !== undefined
        ? (sanitizeString(datos.carta_asignacion_url) ?? undefined)
        : undefined,
    fecha_completado:
      datos.fecha_completado !== undefined
        ? (sanitizeDate(datos.fecha_completado) ?? undefined)
        : undefined,
  }
}

export function sanitizeMontoRecibido(value: number): number {
  return sanitizeRequiredNumber(value)
}
