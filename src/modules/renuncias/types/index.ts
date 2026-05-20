// =====================================================
// TIPOS: Módulo de Renuncias
// =====================================================

/**
 * Estados de una renuncia (migración 024).
 * Solo 2 estados — no existe 'Cancelada'.
 */
export type EstadoRenuncia = 'Pendiente Devolución' | 'Cerrada'

/**
 * Métodos de devolución disponibles.
 */
export const METODOS_DEVOLUCION = [
  'Transferencia Bancaria',
  'Cheque',
  'Efectivo',
  'Consignación',
] as const

export type MetodoDevolucion = (typeof METODOS_DEVOLUCION)[number]

// =====================================================
// FILA PLANA DE LA VISTA v_renuncias_completas
// =====================================================

/** Fila tal como viene de la vista SQL v_renuncias_completas */
export interface RenunciaCompletaRow {
  id: string
  consecutivo: string
  negociacion_id: string | null
  vivienda_id: string
  cliente_id: string
  motivo: string
  fecha_renuncia: string
  estado: string
  monto_a_devolver: number
  requiere_devolucion: boolean
  retencion_monto: number
  retencion_motivo: string | null
  vivienda_valor_snapshot: number | null
  vivienda_datos_snapshot: Record<string, unknown> | null
  cliente_datos_snapshot: Record<string, unknown> | null
  negociacion_datos_snapshot: Record<string, unknown> | null
  abonos_snapshot: Record<string, unknown> | null
  fecha_devolucion: string | null
  comprobante_devolucion_url: string | null
  metodo_devolucion: string | null
  numero_comprobante: string | null
  notas_cierre: string | null
  fecha_cierre: string | null
  usuario_registro: string | null
  usuario_cierre: string | null
  formulario_renuncia_url: string | null
  fecha_creacion: string | null
  fecha_actualizacion: string | null
  // Campos de la vista (joins)
  cliente_nombre: string
  cliente_documento: string
  cliente_telefono: string | null
  cliente_tipo_documento: string
  vivienda_numero: string
  manzana_nombre: string
  proyecto_id: string
  proyecto_nombre: string
  negociacion_valor_total: number | null
  negociacion_valor_total_pagar: number | null
  dias_desde_renuncia: number
}

// =====================================================
// ESTRUCTURA ANIDADA PARA COMPONENTES
// =====================================================

export interface RenunciaConInfo {
  id: string
  consecutivo: string
  negociacion_id: string | null
  vivienda_id: string
  cliente_id: string
  motivo: string
  fecha_renuncia: string
  estado: EstadoRenuncia
  monto_a_devolver: number
  requiere_devolucion: boolean
  retencion_monto: number
  retencion_motivo: string | null
  notas_cierre: string | null
  // Devolución
  fecha_devolucion: string | null
  comprobante_devolucion_url: string | null
  metodo_devolucion: string | null
  numero_comprobante: string | null
  // Formulario de renuncia
  formulario_renuncia_url: string | null
  // Snapshots
  vivienda_valor_snapshot: number | null
  vivienda_datos_snapshot: Record<string, unknown> | null
  cliente_datos_snapshot: Record<string, unknown> | null
  negociacion_datos_snapshot: Record<string, unknown> | null
  abonos_snapshot: Record<string, unknown> | null
  // Cierre
  fecha_cierre: string | null
  usuario_registro: string | null
  usuario_cierre: string | null
  // Auditoría
  fecha_creacion: string | null
  fecha_actualizacion: string | null
  // Relaciones (de la vista)
  cliente: {
    id: string
    nombre: string
    documento: string
    tipo_documento: string
    telefono: string | null
  }
  vivienda: {
    id: string
    numero: string
    manzana: string
  }
  proyecto: {
    id: string
    nombre: string
  }
  negociacion: {
    id: string | null
    valor_total: number | null
    valor_total_pagar: number | null
  }
  dias_desde_renuncia: number
}

// =====================================================
// DTOs
// =====================================================

/** Payload para registrar renuncia (llama al RPC) */
export interface RegistrarRenunciaDTO {
  negociacion_id: string
  motivo: string
  retencion_monto?: number
  retencion_motivo?: string
  notas?: string
}

/** Payload para procesar devolución */
export interface ProcesarDevolucionDTO {
  fecha_devolucion: string
  metodo_devolucion: MetodoDevolucion
  numero_comprobante?: string
  comprobante_devolucion_url?: string
  notas_cierre?: string
}

// =====================================================
// FILTROS
// =====================================================

export interface FiltrosRenuncias {
  busqueda?: string
  estado?: EstadoRenuncia | 'todos'
  proyecto_id?: string
}

// =====================================================
// MÉTRICAS
// =====================================================

export interface MetricasRenuncias {
  total: number
  pendientes: number
  cerradas: number
  totalDevuelto: number
  totalRetenido: number
}

// =====================================================
// VALIDACIÓN PRE-RENUNCIA
// =====================================================

export interface ValidacionRenuncia {
  puede_renunciar: boolean
  motivo_bloqueo?: string
  negociacion: {
    id: string
    estado: string
    cliente_nombre: string
    vivienda_numero: string
    manzana_nombre: string
    proyecto_nombre: string
  }
  total_abonado: number
  fuentes_con_desembolso: string[]
}

// =====================================================
// CONSTANTES
// =====================================================

export const ESTADOS_RENUNCIA: Record<
  EstadoRenuncia,
  { label: string; color: string }
> = {
  'Pendiente Devolución': {
    label: 'Pendiente Devolución',
    color: 'yellow',
  },
  Cerrada: {
    label: 'Cerrada',
    color: 'green',
  },
}

// =====================================================
// EXPEDIENTE
// =====================================================

export interface TimelineHito {
  label: string
  fecha: string
  icono: string
  completado: boolean
}

export interface ResumenFinanciero {
  valorNegociado: number
  totalAbonado: number
  saldoPendiente: number
  porcentajePagado: number
  descuento: {
    tipo: string
    porcentaje: number
    monto: number
    motivo: string
  } | null
  retencion: { monto: number; motivo: string } | null
  montoADevolver: number
}

export interface AbonoExpediente {
  id: string
  numero_recibo: string | null
  fecha_abono: string
  monto: number
  metodo_pago: string | null
  numero_referencia: string | null
  comprobante_url: string | null
  estado: string
  fuente_tipo: string
  fuente_entidad: string | null
}

export interface FuenteExpediente {
  tipo: string
  entidad: string | null
  monto_aprobado: number
  monto_recibido: number
  estado: string
  fecha_resolucion: string | null
  fecha_completado: string | null
}

export interface ViviendaDetalle {
  tipo_vivienda: string | null
  area_construida: number | null
  area_lote: number | null
  matricula_inmobiliaria: string | null
  es_esquinera: boolean | null
}

export interface ExpedienteData {
  renuncia: RenunciaConInfo
  abonos: AbonoExpediente[]
  negociacion: {
    fecha_negociacion: string | null
    valor_negociado: number | null
    descuento_aplicado: number | null
    tipo_descuento: string | null
    porcentaje_descuento: number | null
    motivo_descuento: string | null
    promesa_compraventa_url: string | null
    promesa_firmada_url: string | null
  }
  viviendaDetalle: ViviendaDetalle | null
  timeline: TimelineHito[]
  resumenFinanciero: ResumenFinanciero
  fuentes: FuenteExpediente[]
  duracionDias: number
}
