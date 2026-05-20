/**
 * Tipos del m�dulo Viviendas
 */

// ============================================
// TIPOS PRINCIPALES
// ============================================

export interface Vivienda {
  id: string
  manzana_id: string
  numero: string
  estado: ViviendaEstado

  // Linderos
  lindero_norte?: string
  lindero_sur?: string
  lindero_oriente?: string
  lindero_occidente?: string

  // Informaci�n Legal
  matricula_inmobiliaria?: string
  nomenclatura?: string
  area_lote?: number // m�
  area_construida?: number // m�
  tipo_vivienda?: TipoVivienda
  certificado_tradicion_url?: string // URL en Supabase Storage

  // Informaci�n Financiera
  valor_base: number
  es_esquinera: boolean
  recargo_esquinera: number
  gastos_notariales: number
  valor_total: number // Calculado autom�ticamente en DB
  valor_negociado?: number // Precio negociado (base real para c�lculo de saldo)

  // Asignaci�n de Cliente
  cliente_id?: string
  negociacion_id?: string // ? NUEVO (2025-10-22): FK a negociaciones
  fecha_asignacion?: string
  fecha_pago_completo?: string
  fecha_entrega?: string // ? NUEVO (2025-10-22): Requerida cuando estado='Entregada'

  // Relaciones
  manzanas?: {
    nombre: string
    proyecto_id: string
    proyectos?: {
      nombre: string
    }
  }
  clientes?: {
    id: string
    nombre_completo: string
    telefono?: string
    email?: string
  }

  // C�lculos de Abonos (desde vista o join)
  total_abonado?: number
  saldo_pendiente?: number
  porcentaje_pagado?: number
  cantidad_abonos?: number

  // Metadata
  fecha_creacion: Date
  fecha_actualizacion: Date
}

export interface Linderos {
  norte: string
  sur: string
  oriente: string
  occidente: string
}

export interface InformacionLegal {
  matricula_inmobiliaria: string
  nomenclatura: string
  area_lote: number
  area_construida: number
  tipo_vivienda: TipoVivienda
  certificado_tradicion_file?: File // Archivo a subir
  certificado_tradicion_url?: string // URL despu�s de subir
}

export interface ResumenFinanciero {
  valor_base: number
  gastos_notariales: number
  recargo_esquinera: number
  valor_total: number
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface Manzana {
  id: string
  proyecto_id: string
  nombre: string
  numero_viviendas: number
  fecha_creacion: Date
}

export interface ManzanaConDisponibilidad extends Manzana {
  total_viviendas: number
  viviendas_creadas: number
  viviendas_disponibles: number
  tiene_disponibles: boolean
}

export interface Proyecto {
  id: string
  nombre: string
  estado: string
}

export interface ConfiguracionRecargo {
  id: string
  tipo: TipoRecargo
  nombre: string
  valor: number
  descripcion?: string
  activo: boolean
}

// ============================================
// FORMULARIO
// ============================================

export interface ViviendaFormData {
  // Paso 1: Selecci�n de ubicaci�n
  proyecto_id: string
  manzana_id: string
  numero: string

  // Paso 2: Linderos
  lindero_norte: string
  lindero_sur: string
  lindero_oriente: string
  lindero_occidente: string

  // Paso 3: Informaci�n Legal
  matricula_inmobiliaria: string
  nomenclatura: string
  area_lote: number
  area_construida: number
  tipo_vivienda: TipoVivienda
  certificado_tradicion_file?: File

  // Paso 4: Informaci�n Financiera
  valor_base: number
  es_esquinera: boolean
  recargo_esquinera: number
}

// ============================================
// ENUMS Y CONSTANTES
// ============================================

/**
 * ? VERIFICADO en: docs/DATABASE-SCHEMA-REFERENCE.md
 * CHECK constraint: viviendas_estado_check (3 estados)
 *
 * CAMBIOS (2025-10-22):
 * ? ELIMINADOS: 'Pagada'
 * ? ACTUALIZADOS: 'Reservada' ? 'Asignada', 'Vendida' ? 'Entregada'
 */
export type ViviendaEstado =
  | 'Disponible'
  | 'Asignada'
  | 'Entregada'
  | 'Propietario'

export type TipoVivienda = 'Regular' | 'Irregular'

export type TipoRecargo = 'esquinera_5M' | 'esquinera_10M' | 'gastos_notariales'

// ============================================
// FILTROS Y VISTAS
// ============================================

export interface ViviendaFiltros {
  search?: string
  proyecto_id?: string
  manzana_id?: string
  estado?: ViviendaEstado
  tipo_vivienda?: TipoVivienda
  es_esquinera?: boolean
}

export interface FiltrosViviendas {
  search: string
  proyecto_id: string
  manzana_id?: string
  estado: string
}

export type ViviendaVista = 'grid' | 'list' | 'table'

// ============================================
// PASOS DEL FORMULARIO
// ============================================

export type PasoFormulario =
  | 'ubicacion'
  | 'linderos'
  | 'legal'
  | 'financiero'
  | 'resumen'

export interface EstadoFormulario {
  paso_actual: PasoFormulario
  pasos_completados: PasoFormulario[]
  datos: Partial<ViviendaFormData>
  errores: Record<string, string>
  es_valido: boolean
}

// ============================================
// RESPUESTAS DE API
// ============================================

export interface ViviendaResponse {
  success: boolean
  data?: Vivienda
  error?: string
}

export interface ViviendasListResponse {
  success: boolean
  data?: Vivienda[]
  error?: string
}

export interface ManzanasDisponiblesResponse {
  success: boolean
  data?: ManzanaConDisponibilidad[]
  error?: string
}

export interface ProyectosResponse {
  success: boolean
  data?: Proyecto[]
  error?: string
}

export interface ConfiguracionRecargosResponse {
  success: boolean
  data?: ConfiguracionRecargo[]
  error?: string
}

// ============================================
// UTILIDADES
// ============================================

export interface OpcionRecargo {
  label: string
  value: number
  tipo: TipoRecargo
}
