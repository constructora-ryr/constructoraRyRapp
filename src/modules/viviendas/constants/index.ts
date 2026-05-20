import type {
  OpcionRecargo,
  PasoFormulario,
  TipoVivienda,
  ViviendaEstado,
  ViviendaVista,
} from '../types'

/**
 * Constantes del módulo Viviendas
 */

// ============================================
// VALORES POR DEFECTO
// ============================================

export const VIVIENDA_DEFAULTS = {
  ESTADO_INICIAL: 'Disponible' as ViviendaEstado,
  GASTOS_NOTARIALES: 5_000_000,
  RECARGO_ESQUINERA_DEFAULT: 0,
  VISTA_INICIAL: 'grid' as ViviendaVista,
  ITEMS_POR_PAGINA: 12,
  TIPO_VIVIENDA_DEFAULT: 'Regular' as TipoVivienda,
}

// ============================================
// RECARGOS DISPONIBLES
// ============================================

export const OPCIONES_RECARGO: OpcionRecargo[] = [
  {
    label: '$5.000.000',
    value: 5_000_000,
    tipo: 'esquinera_5M',
  },
  {
    label: '$10.000.000',
    value: 10_000_000,
    tipo: 'esquinera_10M',
  },
]

// ============================================
// ESTADOS DE VIVIENDA
// ============================================

export const VIVIENDA_ESTADOS = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Asignada', label: 'Asignada' },
  { value: 'Entregada', label: 'Entregada' },
] as const

// ============================================
// LÍMITES Y VALIDACIONES
// ============================================

export const VIVIENDA_LIMITES = {
  MATRICULA_MIN: 7, // Mínimo: 123-456
  MATRICULA_MAX: 20, // Máximo flexible para formatos largos
  NOMENCLATURA_MIN: 5,
  NOMENCLATURA_MAX: 150,
  AREA_MIN: 1,
  AREA_MAX: 10000,
  AREA_DECIMALES: 2, // Máximo 2 decimales
  VALOR_BASE_MIN: 1_000_000,
  VALOR_BASE_MAX: 1_000_000_000,
  LINDERO_MIN: 10,
  LINDERO_MAX: 500,
}

// ============================================
// EXPRESIONES REGULARES
// ============================================

export const REGEX_PATTERNS = {
  // Linderos: letras, números, espacios, puntos, comas, guiones, paréntesis, #, °, /, comillas
  LINDERO: /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ.,\-()#°/"']+$/,

  // Matrícula: formato "050-123456" (solo números y guiones)
  MATRICULA: /^[0-9\-]+$/,

  // Nomenclatura: formato "Calle 4A Sur # 4 - 05" (letras, números, #, -, espacios, puntos, comas, paréntesis, grado)
  NOMENCLATURA: /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ#.,\-()°]+$/,

  // Área: números con hasta 2 decimales (punto como separador)
  AREA: /^\d+(\.\d{1,2})?$/,

  // Valor base: solo números enteros (sin decimales ni puntos ni comas)
  VALOR_BASE: /^\d+$/,
}

// ============================================
// ESTADOS
// ============================================

export const ESTADO_COLORS: Record<ViviendaEstado, string> = {
  Disponible:
    'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
  Asignada: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
  Entregada:
    'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300',
  Propietario:
    'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300',
}

export const ESTADO_LABELS: Record<ViviendaEstado, string> = {
  Disponible: 'Disponible',
  Asignada: 'Asignada',
  Entregada: 'Entregada',
  Propietario: 'Propietario',
}

export const ESTADO_ICONS: Record<ViviendaEstado, string> = {
  Disponible: 'Home',
  Asignada: 'Clock',
  Entregada: 'CheckCircle',
  Propietario: 'CheckCircle',
}

// ============================================
// TIPOS DE VIVIENDA
// ============================================

export const TIPO_VIVIENDA_OPTIONS: { value: TipoVivienda; label: string }[] = [
  { value: 'Regular', label: 'Regular' },
  { value: 'Irregular', label: 'Irregular' },
]

export const TIPO_VIVIENDA_COLORS: Record<TipoVivienda, string> = {
  Regular: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
  Irregular:
    'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
}

// ============================================
// PASOS DEL FORMULARIO
// ============================================

export const PASOS_FORMULARIO: {
  id: PasoFormulario
  label: string
  descripcion: string
  icono: string
}[] = [
  {
    id: 'ubicacion',
    label: 'Ubicación',
    descripcion: 'Selecciona proyecto, manzana y vivienda',
    icono: 'MapPin',
  },
  {
    id: 'linderos',
    label: 'Linderos',
    descripcion: 'Define los límites de la vivienda',
    icono: 'Compass',
  },
  {
    id: 'legal',
    label: 'Información Legal',
    descripcion: 'Datos catastrales y documentos',
    icono: 'FileText',
  },
  {
    id: 'financiero',
    label: 'Información Financiera',
    descripcion: 'Valor base y recargos',
    icono: 'DollarSign',
  },
  {
    id: 'resumen',
    label: 'Resumen',
    descripcion: 'Revisa la información antes de guardar',
    icono: 'CheckCircle',
  },
]

// ============================================
// FORMATO DE MONEDA
// ============================================

export const FORMATO_MONEDA = {
  locale: 'es-CO',
  currency: 'COP',
  options: {
    style: 'currency' as const,
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
}

// ============================================
// TEXTOS Y LABELS
// ============================================

export const LABELS = {
  // Ubicación
  PROYECTO: 'Proyecto',
  MANZANA: 'Manzana',
  VIVIENDA_NUMERO: 'Número de Vivienda',
  VIVIENDAS_DISPONIBLES: 'Viviendas Disponibles',

  // Linderos
  LINDERO_NORTE: 'Lindero Norte',
  LINDERO_SUR: 'Lindero Sur',
  LINDERO_ORIENTE: 'Lindero Oriente',
  LINDERO_OCCIDENTE: 'Lindero Occidente',

  // Legal
  MATRICULA: 'Matrícula Inmobiliaria',
  NOMENCLATURA: 'Nomenclatura',
  AREA_LOTE: 'Área del Lote',
  AREA_CONSTRUIDA: 'Área Construida',
  TIPO_VIVIENDA: 'Tipo de Vivienda',
  CERTIFICADO: 'Certificado de Tradición y Libertad (Opcional)',

  // Financiero
  VALOR_BASE: 'Valor Base de la Casa',
  CASA_ESQUINERA: '¿Casa Esquinera? (Aplica Recargo)',
  SELECCIONAR_RECARGO: 'Selecciona el Recargo',
  GASTOS_NOTARIALES: 'Gastos Notariales (Recargo Obligatorio)',
  RECARGO_ESQUINERA: 'Recargo por Casa Esquinera',
  VALOR_TOTAL: 'Valor Total de la Vivienda',
}

export const PLACEHOLDERS = {
  PROYECTO: 'Selecciona un proyecto',
  MANZANA: 'Selecciona una manzana',
  LINDERO: 'Ej: Por el Norte con la Calle 123',
  MATRICULA: 'Ej: 373-123456',
  NOMENCLATURA: 'Ej: Calle 4A Sur # 4 - 05',
  AREA: 'Ej: 61.00',
  VALOR: 'Ej: 150000000',
  RECARGO: 'Selecciona el monto del recargo',
}

export const MENSAJES = {
  CARGANDO_PROYECTOS: 'Cargando proyectos...',
  CARGANDO_MANZANAS: 'Cargando manzanas...',
  SIN_PROYECTOS: 'No hay proyectos disponibles',
  SIN_MANZANAS: 'No hay manzanas disponibles',
  SIN_MANZANAS_DISPONIBLES: 'No hay manzanas con viviendas disponibles',
  ULTIMA_VIVIENDA: '(Última disponible)',
  EXITO_CREAR: 'Vivienda creada exitosamente',
  EXITO_ACTUALIZAR: 'Vivienda actualizada exitosamente',
  ERROR_CREAR: 'Error al crear la vivienda',
  ERROR_ACTUALIZAR: 'Error al actualizar la vivienda',
  ERROR_CARGAR: 'Error al cargar los datos',
  CONFIRMAR_ELIMINAR: '¿Estás seguro de eliminar esta vivienda?',
}

// ============================================
// ANIMACIONES
// ============================================

export const ANIMATION_CONFIG = {
  stagger: 0.1,
  duration: 0.3,
  stepTransition: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
}

// ============================================
// ARCHIVOS PERMITIDOS
// ============================================

export const ARCHIVO_CONFIG = {
  TIPOS_PERMITIDOS: ['application/pdf'],
  TIPOS_PERMITIDOS_LABELS: ['PDF'],
  TAMANO_MAX: 10 * 1024 * 1024, // 10MB
  TAMANO_MAX_LABEL: '10MB',
}
