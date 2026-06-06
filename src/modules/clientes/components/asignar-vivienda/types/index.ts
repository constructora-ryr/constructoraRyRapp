/**
 * Tipos para Asignar Vivienda a Cliente
 */

import type { TipoFuentePago } from '@/modules/clientes/types'
import type { ValorCampo } from '@/modules/configuracion/types/campos-dinamicos.types'
import type { ParametrosCredito } from '@/modules/fuentes-pago/types'

export interface FuentePagoConfig {
  tipo: TipoFuentePago
  /** ✅ V2: Objeto dinámico con todos los valores de campos configurables */
  campos: Record<string, ValorCampo>
  /** Documentos (mantener sistema existente) */
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
  permite_multiples_abonos?: boolean

  /** Crédito con la constructora: parámetros de amortización */
  parametrosCredito?: ParametrosCredito
  /** Crédito con la constructora: capital sin intereses, para cierre financiero */
  capital_para_cierre?: number

  /** FK normalizada a entidades_financieras — se puebla al seleccionar del combobox */
  entidad_financiera_id?: string

  /** @deprecated Legacy fields - mantener por compatibilidad, pero usar `campos` para nuevos */
  monto_aprobado?: number
  entidad?: string
  numero_referencia?: string
}

export interface FuentePagoErrores {
  monto_aprobado?: string
  entidad?: string
  numero_referencia?: string
}

export interface FuentePagoConfiguracion {
  tipo: TipoFuentePago
  enabled: boolean
  config: FuentePagoConfig | null
}

export interface ProyectoBasico {
  id: string
  nombre: string
  estado?: string
}

export interface ViviendaDetalle {
  id: string
  numero: string
  manzana_id: string
  manzana_nombre?: string
  valor_total: number
  valor_base?: number
  gastos_notariales?: number
  es_esquinera?: boolean
  recargo_esquinera?: number
  estado: string
}

export interface FormDataAsignacion {
  proyectoSeleccionado: string
  viviendaId: string
  valorNegociado: number
  aplicar_descuento?: boolean
  descuentoAplicado: number
  tipo_descuento?: string
  motivo_descuento?: string
  valor_escritura_publica?: number
  notas: string
}

export type StepNumber = 1 | 2 | 3
