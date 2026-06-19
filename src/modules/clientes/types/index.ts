/**
 * Tipos TypeScript para el Módulo de Clientes y Negociaciones
 * Sistema desacoplado: Cliente → Negociación → Vivienda
 */

// =====================================================
// ENUMS
// =====================================================

export type TipoDocumento = 'CC' | 'CE' | 'TI' | 'NIT' | 'PP' | 'PEP'

/**
 * ✅ VERIFICADO en: docs/DATABASE-SCHEMA-REFERENCE.md
 * Estado civil del cliente
 */
export type EstadoCivil =
  | 'Soltero(a)'
  | 'Casado(a)'
  | 'Unión libre'
  | 'Viudo(a)'

/**
 * ✅ VERIFICADO en: docs/DATABASE-SCHEMA-REFERENCE.md
 * CHECK constraint: clientes_estado_check (5 estados)
 */
export type EstadoCliente =
  | 'Interesado'
  | 'Activo'
  | 'En Proceso de Renuncia' // ⭐ NUEVO (2025-10-22)
  | 'Inactivo'
  | 'Propietario' // ⭐ NUEVO (2025-10-22)
  | 'Renunció' // Legacy state (clients who completed renunciation process)

export type EstadoInteres = 'Activo' | 'Descartado' | 'Convertido'

/**
 * Origen del cliente/interés
 * Cómo llegó el cliente a la constructora
 */
export type OrigenCliente =
  | 'WhatsApp'
  | 'Email'
  | 'Teléfono'
  | 'Visita Presencial'
  | 'Referido'
  | 'Redes Sociales'
  | 'Página Web'
  | 'Otro'

/**
 * ✅ VERIFICADO en: docs/DATABASE-SCHEMA-REFERENCE.md
 * CHECK constraint: negociaciones_estado_check (4 estados)
 *
 * CAMBIOS (2025-10-22):
 * ❌ ELIMINADOS: 'En Proceso', 'Cierre Financiero', 'Cancelada', 'Renuncia'
 * ✅ NUEVOS: 'Suspendida', 'Cerrada por Renuncia'
 */
export type EstadoNegociacion =
  | 'Activa'
  | 'Suspendida' // ⭐ NUEVO
  | 'Cerrada por Renuncia' // ⭐ NUEVO (reemplaza 'Renuncia')
  | 'Cerrada por Traslado' // ⭐ Traslado de vivienda
  | 'Completada'

// Dinámico: los tipos reales se cargan desde tipos_fuentes_pago en BD.
// Las constantes de referencia están en @/modules/clientes/types/fuentes-pago
export type TipoFuentePago = string

export type EstadoFuentePago = 'Activa' | 'Inactiva'

export type EstadoProceso =
  | 'Pendiente'
  | 'En Proceso'
  | 'Completado'
  | 'Omitido'

// =====================================================
// INTERFACES PRINCIPALES
// =====================================================

export interface Cliente {
  id: string

  // Información Personal
  nombres: string
  apellidos: string
  nombre_completo: string
  tipo_documento: TipoDocumento
  numero_documento: string
  fecha_nacimiento?: string // ISO date string
  estado_civil?: EstadoCivil

  // Contacto
  telefono?: string
  telefono_alternativo?: string
  email?: string
  direccion?: string
  ciudad?: string
  departamento?: string

  // Estado
  estado: EstadoCliente

  // Documentos
  documento_identidad_url?: string
  documento_identidad_titulo?: string | null // Título personalizado para mostrar

  // Notas
  notas?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string

  // Relaciones opcionales (cuando se cargan)
  negociaciones?: Negociacion[]
  estadisticas?: ClienteEstadisticas
  intereses?: ClienteInteres[] // Intereses activos del cliente
}

export interface Negociacion {
  id: string

  // Relaciones
  cliente_id: string
  vivienda_id: string

  // Estado
  estado: EstadoNegociacion

  // Valores Financieros
  valor_negociado: number
  descuento_aplicado: number
  valor_total: number // calculado: valor_negociado - descuento_aplicado
  valor_total_pagar: number // obligación real: valor_total + gastos_notariales + recargo_esquinera

  // Totales (calculados por triggers)
  total_fuentes_pago: number
  total_abonado: number
  saldo_pendiente: number
  porcentaje_pagado: number

  // Fechas
  fecha_negociacion: string
  fecha_completada?: string // ⭐ NUEVO: Requerida cuando estado='Completada'

  // Documentos
  promesa_compraventa_url?: string
  promesa_firmada_url?: string
  evidencia_envio_correo_url?: string
  escritura_url?: string
  otros_documentos?: Record<string, string> // JSON flexible

  // Notas
  notas?: string

  // Traslado de vivienda
  negociacion_origen_id?: string
  traslado_destino_id?: string
  motivo_traslado?: string
  autorizado_por?: string
  fecha_traslado?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string

  // Relaciones opcionales (cuando se cargan)
  clientes?: Cliente
  viviendas?: {
    id: string
    numero: string
    tipo_vivienda?: string
    valor_total: number
    manzanas?: {
      nombre: string
      proyectos?: {
        nombre: string
      }
    }
  }
  fuentes_pago?: FuentePago[]
  procesos?: ProcesoNegociacion[]
}

export interface FuentePago {
  id: string

  // Relación
  negociacion_id: string

  // Tipo
  tipo: TipoFuentePago

  // Montos
  monto_aprobado: number
  monto_recibido: number
  saldo_pendiente: number // calculado
  porcentaje_completado: number // calculado

  // Detalles específicos
  entidad?: string // Banco o Caja de Compensación
  numero_referencia?: string // Radicado/Referencia

  // Comportamiento
  permite_multiples_abonos: boolean

  // Documentos
  carta_aprobacion_url?: string
  carta_asignacion_url?: string

  // Estado
  estado: EstadoFuentePago
  fecha_completado?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface ProcesoNegociacion {
  id: string

  // Relación
  negociacion_id: string

  // Información
  nombre: string
  descripcion?: string
  orden: number

  // Configuración
  es_obligatorio: boolean
  permite_omitir: boolean

  // Estado
  estado: EstadoProceso

  // Dependencias
  depende_de?: string[] // Array de IDs de procesos previos

  // Documentos
  documentos_requeridos?: string[] // ['promesa_pendiente', 'evidencia_correo']
  documentos_urls?: Record<string, string> // { "promesa_pendiente": "url..." }

  // Fechas
  fecha_inicio?: string
  fecha_completado?: string
  fecha_limite?: string

  // Notas
  notas?: string
  motivo_omision?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_completo?: string
}

export interface PlantillaProceso {
  id: string

  nombre: string
  descripcion?: string

  // Pasos del proceso (JSON)
  pasos: PasoPlantilla[]

  // Estado
  activo: boolean
  es_predeterminado: boolean

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_creacion?: string
}

export interface PasoPlantilla {
  orden: number
  nombre: string
  descripcion?: string
  obligatorio: boolean
  documentos?: string[]
  dependeDe?: number[] // Órdenes de pasos previos requeridos
}

// =====================================================
// CLIENTE INTERESES
// =====================================================

export interface ClienteInteres {
  id: string
  cliente_id: string
  proyecto_id: string
  vivienda_id?: string
  notas?: string
  estado: EstadoInteres
  motivo_descarte?: string
  fecha_interes: string
  fecha_actualizacion: string
  usuario_creacion?: string

  // Campos nuevos (agregados 2025-10-18)
  origen?: string // 'WhatsApp', 'Email', 'Visita Presencial', etc.
  prioridad?: string // 'Alta', 'Media', 'Baja'
  valor_estimado?: number
  fecha_ultimo_contacto?: string
  proximo_seguimiento?: string
  negociacion_id?: string
  fecha_conversion?: string

  // Relaciones opcionales (cuando se cargan desde vista)
  proyecto_nombre?: string
  proyecto_estado?: string // Corregido: la vista tiene proyecto_estado, no proyecto_ubicacion
  vivienda_numero?: string
  vivienda_valor?: number // Corregido: la vista tiene vivienda_valor, no vivienda_precio
  vivienda_estado?: string
  manzana_nombre?: string
}

// =====================================================
// ESTADÍSTICAS Y RESÚMENES
// =====================================================

export interface ClienteEstadisticas {
  total_negociaciones: number
  negociaciones_activas: number
  negociaciones_completadas: number
  ultima_negociacion?: string
}

export interface ClienteResumen extends Cliente {
  tiene_documento_identidad?: boolean // ⭐ Indica si tiene cédula/documento subido
  estadisticas: ClienteEstadisticas
  // ⭐ Datos de vivienda para clientes Activos (desde negociación activa)
  vivienda?: {
    nombre_proyecto?: string
    ubicacion_proyecto?: string
    nombre_manzana?: string
    numero_vivienda?: string
    valor_total?: number
    valor_total_pagar?: number
    total_abonado?: number
    saldo_pendiente?: number
  }
  // ⭐ Datos de interés para clientes Interesados
  interes?: {
    nombre_proyecto?: string
    nombre_manzana?: string
    numero_vivienda?: string
  }
}

export interface NegociacionCompleta extends Negociacion {
  cliente_nombre: string
  cliente_documento: string
  cliente_telefono?: string
  cliente_email?: string
  vivienda_numero: string
  manzana_nombre: string
  proyecto_nombre: string
}

// =====================================================
// RENUNCIAS (Migración 004 - 2025-10-22)
// =====================================================

/**
 * ✅ ACTUALIZADO: Migración 024 eliminó 'Cancelada'.
 * CHECK constraint: renuncias_estado_check (2 estados)
 * Tipos canónicos: src/modules/renuncias/types/index.ts
 */
export type EstadoRenuncia = 'Pendiente Devolución' | 'Cerrada'

export interface Renuncia {
  id: string

  // Relaciones (IDs duplicados para histórico)
  vivienda_id: string
  cliente_id: string
  negociacion_id: string

  // Información básica
  motivo: string
  fecha_renuncia: string
  estado: EstadoRenuncia

  // Información financiera (calculada automáticamente)
  monto_a_devolver: number // NOT NULL, calculado por trigger
  requiere_devolucion: boolean

  // Snapshot de datos al momento de la renuncia (JSON)
  vivienda_datos_snapshot?: Record<string, unknown> // { numero, manzana, proyecto, valor }
  cliente_datos_snapshot?: Record<string, unknown> // { nombre, documento, contacto }
  negociacion_datos_snapshot?: Record<string, unknown> // { valor_total, pagos_realizados }
  abonos_snapshot?: Record<string, unknown> // Lista de abonos realizados

  // Retención (migración 024)
  retencion_monto: number
  retencion_motivo?: string

  // Seguimiento de resolución
  fecha_devolucion?: string
  metodo_devolucion?: string
  numero_comprobante?: string
  comprobante_devolucion_url?: string

  // Cierre administrativo
  fecha_cierre?: string
  usuario_cierre?: string
  notas_cierre?: string

  // Auditoría
  fecha_creacion: string
  fecha_actualizacion: string
  usuario_registro?: string

  // Relaciones opcionales (cuando se cargan)
  clientes?: Cliente
  viviendas?: {
    id: string
    numero: string
    manzanas?: {
      nombre: string
      proyectos?: {
        nombre: string
      }
    }
  }
  negociaciones?: Negociacion
}

export const ESTADOS_RENUNCIA: Record<EstadoRenuncia, string> = {
  'Pendiente Devolución': 'Pendiente Devolución',
  Cerrada: 'Cerrada',
}

export const METODOS_DEVOLUCION = [
  'Transferencia Bancaria',
  'Cheque',
  'Efectivo',
  'Consignación',
] as const

export type MetodoDevolucion = (typeof METODOS_DEVOLUCION)[number]

// =====================================================
// DTOs (Data Transfer Objects)
// =====================================================

export interface CrearClienteDTO {
  // Información Personal
  nombres: string
  apellidos: string
  tipo_documento: TipoDocumento
  numero_documento: string
  fecha_nacimiento?: string
  estado_civil?: EstadoCivil

  // Contacto
  telefono?: string
  telefono_alternativo?: string
  email?: string
  direccion?: string
  ciudad?: string
  departamento?: string

  // Documentos
  documento_identidad_url?: string
  documento_identidad_titulo?: string | null // Título personalizado

  // Notas
  notas?: string

  // Interés inicial (opcional, para clientes Interesados)
  interes_inicial?: {
    proyecto_id: string
    vivienda_id?: string
    notas_interes?: string
  }
}

export interface ActualizarClienteDTO
  extends Omit<
    Partial<CrearClienteDTO>,
    | 'telefono'
    | 'telefono_alternativo'
    | 'email'
    | 'direccion'
    | 'notas'
    | 'fecha_nacimiento'
    | 'estado_civil'
  > {
  estado?: EstadoCliente
  documento_identidad_titulo?: string | null
  // Campos opcionales con null explícito para poder borrarlos desde edición
  telefono?: string | null
  telefono_alternativo?: string | null
  email?: string | null
  direccion?: string | null
  notas?: string | null
  fecha_nacimiento?: string | null
  estado_civil?: EstadoCivil | null
}

export interface CrearInteresDTO {
  cliente_id: string
  proyecto_id: string
  vivienda_id?: string
  valor_estimado?: number
  notas?: string
  origen?: string
  prioridad?: string
}

export interface ActualizarInteresDTO {
  estado?: EstadoInteres
  motivo_descarte?: string | null
  notas?: string
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

  /** Fecha real de la negociación (para migración de datos históricos). Si no se envía, usa NOW() en BD. */
  fecha_negociacion?: string

  // Fuentes de pago (se crean junto con la negociación) - OPCIONAL para retrocompatibilidad
  fuentes_pago?: CrearFuentePagoDTO[]

  // Documentos iniciales
  promesa_compraventa_url?: string
  evidencia_envio_correo_url?: string
}

export interface CrearFuentePagoDTO {
  tipo: TipoFuentePago
  monto_aprobado: number
  /**
   * Para créditos internos (genera_cuotas=true): capital sin intereses.
   * Es lo que cubre el precio de la vivienda. Los intereses son ganancia adicional.
   * Para otras fuentes: undefined (se usa monto_aprobado directamente).
   */
  capital_para_cierre?: number
  entidad?: string
  entidad_financiera_id?: string
  numero_referencia?: string
  fecha_acta?: string
  permite_multiples_abonos: boolean
  carta_aprobacion_url?: string
  carta_asignacion_url?: string
}

export interface ActualizarNegociacionDTO {
  estado?: EstadoNegociacion
  valor_negociado?: number
  descuento_aplicado?: number
  motivo_cancelacion?: string
  promesa_compraventa_url?: string
  promesa_firmada_url?: string
  evidencia_envio_correo_url?: string
  escritura_url?: string
  notas?: string
}

export interface CompletarProcesoDTO {
  documentos_urls?: Record<string, string>
  notas?: string
}

// DTOs para Renuncias → Migrados a src/modules/renuncias/types/index.ts
// Importar desde: import { RegistrarRenunciaDTO, ProcesarDevolucionDTO } from '@/modules/renuncias/types'

// =====================================================
// FILTROS Y BÚSQUEDA
// =====================================================

export interface FiltrosClientes {
  estado?: EstadoCliente[]
  busqueda?: string // Búsqueda por nombre, documento, teléfono, email
  fecha_desde?: string
  fecha_hasta?: string
}

export interface FiltrosNegociaciones {
  estado?: EstadoNegociacion[]
  cliente_id?: string
  vivienda_id?: string
  proyecto_id?: string
  fecha_desde?: string
  fecha_hasta?: string
  porcentaje_pagado_min?: number
  porcentaje_pagado_max?: number
}

// =====================================================
// CONSTANTES
// =====================================================

export const TIPOS_DOCUMENTO: Record<TipoDocumento, string> = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  TI: 'Tarjeta de Identidad',
  NIT: 'NIT',
  PP: 'Pasaporte',
  PEP: 'Permiso Especial de Permanencia',
}

export const ESTADOS_CIVILES: Record<EstadoCivil, string> = {
  'Soltero(a)': 'Soltero(a)',
  'Casado(a)': 'Casado(a)',
  'Unión libre': 'Unión libre',
  'Viudo(a)': 'Viudo(a)',
}

export const ESTADOS_CLIENTE: Record<EstadoCliente, string> = {
  Interesado: 'Interesado',
  Activo: 'Activo',
  'En Proceso de Renuncia': 'En Proceso de Renuncia',
  Renunció: 'Renunció', // ⭐ NUEVO (2025-12-11)
  Inactivo: 'Inactivo',
  Propietario: 'Propietario',
}

export const ESTADOS_INTERES: Record<EstadoInteres, string> = {
  Activo: 'Interés Vigente',
  Descartado: 'Ya no interesa',
  Convertido: 'Venta Concretada',
}

export const ESTADOS_NEGOCIACION: Record<EstadoNegociacion, string> = {
  Activa: 'Activa',
  Suspendida: 'Suspendida',
  'Cerrada por Renuncia': 'Cerrada por Renuncia',
  'Cerrada por Traslado': 'Cerrada por Traslado',
  Completada: 'Completada',
}

export const TIPOS_FUENTE_PAGO: Record<string, string> = {
  'Cuota Inicial': 'Cuota Inicial',
  'Crédito Hipotecario': 'Crédito Hipotecario',
  'Subsidio Mi Casa Ya': 'Subsidio Mi Casa Ya',
  'Subsidio Caja Compensación': 'Subsidio Caja Compensación',
}

// Bancos disponibles para Crédito Hipotecario
export const BANCOS_CREDITO_HIPOTECARIO = [
  'Bancolombia',
  'Banco de Bogotá',
  'Banco Agrario',
  'Fondo Nacional del Ahorro',
  'Banco BBVA',
  'Banco Caja Social',
  'Banco Popular',
  'Davivienda',
  'Banco de Occidente',
] as const

// Cajas de Compensación disponibles
export const CAJAS_COMPENSACION = ['Comfenalco', 'Comfandi'] as const

export type BancoCredito = (typeof BANCOS_CREDITO_HIPOTECARIO)[number]
export type CajaCompensacion = (typeof CAJAS_COMPENSACION)[number]
