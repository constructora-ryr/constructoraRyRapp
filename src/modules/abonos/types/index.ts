// =====================================================
// TIPOS: Módulo de Abonos
// =====================================================

/**
 * Métodos de pago disponibles
 */
export type MetodoPago =
  | 'Transferencia'
  | 'Efectivo'
  | 'Cheque'
  | 'Consignación'
  | 'PSE'
  | 'Tarjeta de Crédito'
  | 'Tarjeta de Débito'

/**
 * Tipos de fuentes de pago — importado desde módulo clientes (fuente única de verdad)
 */
import type { TipoFuentePago } from '@/modules/clientes/types/fuentes-pago'
export type { TipoFuentePago }

/**
 * Estado de un abono individual
 */
export type EstadoAbono = 'Activo' | 'Anulado'

/**
 * Estados de negociación
 */
export type EstadoNegociacion =
  | 'En Proceso'
  | 'Cierre Financiero'
  | 'Activa'
  | 'Completada'
  | 'Cancelada'
  | 'Renuncia'

// =====================================================
// ENTIDADES DE BASE DE DATOS
// =====================================================

/**
 * Registro individual de un abono
 */
export interface AbonoHistorial {
  id: string
  numero_recibo: string
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  fecha_abono: string
  metodo_pago: MetodoPago
  numero_referencia?: string
  comprobante_url?: string
  notas?: string
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_registro?: string
  // ── Campos de anulación (migración 023) ──────────────
  estado: EstadoAbono
  motivo_categoria?: MotivoAnulacion | null
  motivo_detalle?: string | null
  anulado_por_id?: string | null
  anulado_por_nombre?: string | null
  fecha_anulacion?: string | null
  // ── Campo de traslado (migración 020) ──────────────
  trasladado_desde_negociacion_id?: string | null
  // ── Campo extendido (join fuentes_pago) ──────────────
  fuente_tipo?: string
}

/**
 * Fuente de pago con información completa
 */
export interface FuentePago {
  id: string
  negociacion_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number
  porcentaje_completado: number
  capital_para_cierre?: number | null
  entidad?: string
  numero_referencia?: string
  fecha_aprobacion?: string
  estado: string
  permite_multiples_abonos: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

/**
 * Negociación con información básica (campos REALES de la DB)
 */
export interface Negociacion {
  id: string
  cliente_id: string
  vivienda_id: string
  estado: EstadoNegociacion
  valor_negociado: number
  descuento_aplicado?: number
  valor_total?: number // Campo calculado: valor_negociado - descuento
  valor_total_pagar?: number // Obligación real: incluye gastos + recargos
  total_fuentes_pago?: number // Campo calculado
  total_abonado?: number // Campo calculado
  saldo_pendiente?: number // Campo calculado (usa valor_total_pagar)
  porcentaje_pagado?: number // Campo calculado (usa valor_total_pagar)
  fecha_negociacion?: string
  fecha_completada?: string
  notas?: string
  fecha_creacion: string
  fecha_actualizacion: string
}

/**
 * Cliente (info básica - campos REALES de la DB)
 */
export interface Cliente {
  id: string
  nombres: string
  apellidos: string
  numero_documento: string // ✅ Campo REAL (no "cedula")
  telefono?: string
  email?: string
  ciudad?: string
}

/**
 * Vivienda (info básica - campos REALES de la DB)
 */
export interface Vivienda {
  id: string
  numero: string
  manzana_id: string // ✅ Campo REAL (UUID, no "manzana")
  precio: number // ✅ Campo REAL (no "precio_base")
  area: number // ✅ Campo REAL
  tipo_vivienda?: string // ✅ Campo REAL (no "tipo")
}

/**
 * Proyecto (info básica)
 */
export interface Proyecto {
  id: string
  nombre: string
  ubicacion?: string
}

/**
 * Manzana (info básica)
 */
export interface Manzana {
  id: string
  nombre: string
  proyecto_id: string
}

// =====================================================
// TIPOS COMPUESTOS (para queries complejos)
// =====================================================

/**
 * Fuente de pago con historial de abonos
 */
export interface FuentePagoConAbonos extends FuentePago {
  abonos: AbonoHistorial[]
}

/**
 * Vivienda extendida con información de manzana
 */
export interface ViviendaConManzana extends Vivienda {
  manzana?: Manzana
}

/**
 * Negociación con toda la información necesaria
 */
export interface NegociacionConAbonos extends Negociacion {
  cliente: Cliente
  vivienda: ViviendaConManzana
  proyecto: Proyecto
  fuentes_pago: FuentePagoConAbonos[]
}

// =====================================================

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

/**
 * DTO para crear un nuevo abono
 */
export interface CrearAbonoDTO {
  negociacion_id: string
  fuente_pago_id: string
  monto: number
  fecha_abono: string // ISO string
  metodo_pago: MetodoPago
  /** Porción del monto que corresponde a mora (no cotiza para monto_recibido del principal) */
  mora_incluida?: number
  numero_referencia?: string
  comprobante_url?: string
  notas?: string
}

// =====================================================
// MODO DE REGISTRO
// =====================================================

/**
 * Modo de registro de pago:
 * - 'abono': El cliente realiza un pago parcial (ej: Cuota Inicial)
 * - 'desembolso': Una entidad transfiere el total aprobado de una sola vez
 *
 * Discriminado por `fuente.permite_multiples_abonos` — NO hardcodea nombres.
 */
export type ModoRegistro = 'abono' | 'desembolso'

/**
 * Determina el modo a partir de la fuente de pago.
 * `permite_multiples_abonos = true` → abono parcial (cliente paga en cuotas)
 * `permite_multiples_abonos = false` → desembolso único (banco/gobierno gira el total)
 */
export function getModoRegistro(
  fuente: Pick<FuentePago, 'permite_multiples_abonos'>
): ModoRegistro {
  return fuente.permite_multiples_abonos ? 'abono' : 'desembolso'
}

/**
 * DTO para filtrar abonos
 */
export interface FiltrosAbonos {
  negociacion_id?: string
  fuente_pago_id?: string
  cliente_id?: string
  proyecto_id?: string
  fecha_desde?: string
  fecha_hasta?: string
  metodo_pago?: MetodoPago
}

// =====================================================
// ESTADÍSTICAS Y RESÚMENES
// =====================================================

/**
 * Estadísticas de abonos
 */
export interface EstadisticasAbonos {
  total_abonos: number
  monto_total_abonado: number
  promedio_por_abono: number
  abonos_por_metodo: Record<MetodoPago, number>
  ultima_actualizacion: string
}

/**
 * Resumen de una fuente de pago
 */
export interface ResumenFuentePago {
  fuente_pago_id: string
  tipo: TipoFuentePago
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number
  porcentaje_completado: number
  cantidad_abonos: number
  ultimo_abono?: {
    fecha: string
    monto: number
    metodo: MetodoPago
  }
}

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Opciones para métodos de pago (para selects)
 */
export const METODOS_PAGO_OPTIONS: { value: MetodoPago; label: string }[] = [
  { value: 'Transferencia', label: 'Transferencia Bancaria' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Consignación', label: 'Consignación' },
  { value: 'PSE', label: 'PSE' },
  { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
  { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
]

// =====================================================
// ANULACIÓN DE ABONOS
// =====================================================

/**
 * Motivos de anulación predefinidos. Sincronizado con CHECK constraint de BD.
 */
export const MOTIVOS_ANULACION = [
  'Error en el monto',
  'Pago duplicado',
  'Comprobante inválido',
  'Error en la fecha',
  'Solicitud del cliente',
  'Otro',
] as const

export type MotivoAnulacion = (typeof MOTIVOS_ANULACION)[number]

/**
 * Payload para anular un abono. Enviado al endpoint PATCH /api/abonos/anular
 */
export interface AnularAbonoPayload {
  abono_id: string
  motivo_categoria: MotivoAnulacion
  /** Detalle libre — obligatorio cuando motivo_categoria = 'Otro' */
  motivo_detalle?: string
}

/**
 * Labels legibles para tipos de fuente
 */
export const TIPO_FUENTE_LABELS: Record<TipoFuentePago, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
}
