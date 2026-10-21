/**
 * Utilidades puras para el visor de documentos.
 * Sin dependencias de React.
 */

import { formatearEntidad } from './formatear-entidad'

/**
 * Humaniza nombres de campos del metadata para presentación
 */
export function humanizarCampoMetadata(key: string): string {
  const mapeo: Record<string, string> = {
    tipo_fuente: 'Tipo de Fuente',
    entidad: 'Entidad Financiera',
    monto_aprobado: 'Monto Aprobado',
    vivienda: 'Vivienda',
    subido_desde: 'Origen',
    numero_resolucion: 'Número de Resolución',
    fecha_resolucion: 'Fecha de Resolución',
    reemplazo: 'Archivo Reemplazado',
    version_anterior: 'Versión Anterior',
    archivo_anterior: 'Archivo Anterior',
    justificacion_reemplazo: 'Justificación',
  }
  return (
    mapeo[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  )
}

/**
 * Formatea el valor de un campo de metadata para presentación
 */
export function formatearValorMetadata(
  key: string,
  value: unknown,
  metadata?: Record<string, unknown>
): string {
  // Caso especial: Entidad vacía — inferir del tipo de fuente
  if (
    key === 'entidad' &&
    (value === null || value === undefined || value === '')
  ) {
    if (metadata?.tipo_fuente === 'Subsidio Mi Casa Ya') return 'Mi Casa Ya'
    if (metadata?.tipo_fuente === 'Subsidio Caja Compensación')
      return 'Caja Compensación'
    if (metadata?.tipo_fuente === 'Crédito Hipotecario')
      return 'Entidad Bancaria'
    return 'No especifica'
  }

  // Formatear entidad financiera con formato de título
  if (key === 'entidad' && value) {
    return formatearEntidad(String(value))
  }

  if (value === null || value === undefined || value === '') {
    return 'No especifica'
  }

  // Objeto complejo
  if (typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    if (key === 'reemplazo') {
      const archivo =
        obj.archivo_anterior || obj.nombreArchivo || 'archivo anterior'
      const version = obj.version_anterior || obj.version || '?'
      return `${archivo} (v${version})`
    }
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return '[Objeto complejo]'
    }
  }

  // Monto en pesos colombianos
  if (key === 'monto_aprobado' && typeof value === 'number') {
    return `$${value.toLocaleString('es-CO')}`
  }

  // Origen de carga
  if (key === 'subido_desde') {
    const origenes: Record<string, string> = {
      asignacion_vivienda: 'Asignación de Vivienda',
      negociacion: 'Negociación',
      documentos: 'Módulo de Documentos',
    }
    return origenes[String(value)] || String(value)
  }

  // Fecha de resolución
  if (key === 'fecha_resolucion' && value) {
    try {
      const fecha = new Date(String(value))
      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return String(value)
    }
  }

  return String(value)
}

/** Campos internos de metadata que no se muestran en el visor */
const CAMPOS_METADATA_OCULTOS = new Set([
  'fuente_pago_id',
  'reemplazo',
  'version_anterior',
  'archivo_anterior',
  'justificacion_reemplazo',
  'requisito_config_id',
  'tipo_documento_sistema',
  'auto_check_identidad',
  'alcance',
  'tipo_fuente',
  'entidad',
  'entidad_fuente',
  'nivel_validacion',
  'fuentes_aplicables',
])

/** Entradas de metadata visibles para el usuario (sin internas ni vacías) */
export function entradasMetadataVisibles(
  metadata: Record<string, unknown> | null | undefined
): [string, unknown][] {
  if (!metadata) return []
  return Object.entries(metadata).filter(
    ([key, value]) =>
      !CAMPOS_METADATA_OCULTOS.has(key) && value !== null && value !== undefined
  )
}

/** Días hasta una fecha (negativo si ya pasó); null si no es válida */
export function diasHasta(fecha: string | null | undefined): number | null {
  if (!fecha) return null
  const t = new Date(fecha).getTime()
  if (isNaN(t)) return null
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24))
}
