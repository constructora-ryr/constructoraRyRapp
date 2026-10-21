// ============================================
// TYPES: Documentos de Proyecto - Sistema Flexible
// ============================================

import {
  File,
  FileArchive,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon,
} from 'lucide-react'

export type EstadoDocumento = 'activo' | 'archivado' | 'eliminado'

/**
 * Tipo genérico para registros de cualquier tabla de documentos
 * (documentos_proyecto, documentos_vivienda, documentos_cliente)
 * Usado internamente en servicios genéricos para evitar casts `as any`
 */
export interface DocumentoRegistroComun {
  id: string
  documento_padre_id: string | null
  version: number
  es_version_actual: boolean
  estado: string
  titulo: string
  descripcion: string | null
  categoria_id: string | null
  nombre_archivo: string
  nombre_original: string
  tamano_bytes: number
  tipo_mime: string
  url_storage: string
  metadata: Record<string, unknown> | null
  fecha_documento: string | null
  fecha_vencimiento: string | null
  es_importante: boolean
  subido_por: string | null
  fecha_creacion: string
  fecha_actualizacion: string
  // Optional fields specific to certain entity tables
  es_documento_identidad?: boolean | null
  es_escritura_vivienda?: boolean | null
  es_contrato_promesa?: boolean | null
  fuente_pago_relacionada?: string | null
  tipo_documento?: string | null
  requisito_config_id?: string | null
  // Dynamic entity ID fields (proyecto_id, vivienda_id, cliente_id)
  [key: string]: unknown
}

// ============================================
// Sistema de Estados de Versión - PROFESIONAL
// ============================================

/**
 * Estados posibles de una versión de documento
 * - valida: Versión correcta y confiable (por defecto)
 * - erronea: Versión incorrecta que debe corregirse
 * - obsoleta: Versión antigua ya no aplicable
 * - supersedida: Reemplazada por nueva versión
 */
export type EstadoVersion = 'valida' | 'erronea' | 'obsoleta' | 'supersedida'

/**
 * Motivos predefinidos para marcar versión como errónea
 */
export const MOTIVOS_VERSION_ERRONEA = {
  DOCUMENTO_INCORRECTO: 'Se subió el documento equivocado',
  DATOS_ERRONEOS: 'El documento contiene datos incorrectos',
  VERSION_DESACTUALIZADA: 'Información desactualizada o desfasada',
  ARCHIVO_CORRUPTO: 'Archivo dañado o ilegible',
  FORMATO_INVALIDO: 'Formato de archivo incorrecto',
  DUPLICADO_ACCIDENTAL: 'Versión duplicada por error',
  OTRO: 'Otro motivo (especificar en descripción)',
} as const

/**
 * Motivos predefinidos para marcar versión como obsoleta
 */
export const MOTIVOS_VERSION_OBSOLETA = {
  CAMBIO_NORMATIVA: 'Cambio en normativa o regulación',
  ACTUALIZACION_PROCESO: 'Actualización de proceso interno',
  REVISION_TECNICA: 'Revisión técnica obligatoria',
  VENCIMIENTO: 'Documento vencido',
  SUSTITUIDO: 'Sustituido por versión más reciente',
  YA_NO_APLICA: 'Ya no es aplicable al proyecto',
  OTRO: 'Otro motivo (especificar en descripción)',
} as const

// ============================================
// Categorías Personalizadas - Sistema Flexible Multi-Módulo
// ============================================

export type ModuloDocumento = 'proyectos' | 'clientes' | 'viviendas'

export interface CategoriaDocumento {
  id: string
  user_id: string
  nombre: string
  descripcion?: string
  color: string // blue, green, red, purple, yellow, etc.
  icono: string // Nombre del ícono de Lucide
  orden: number

  // Sistema flexible multi-módulo
  es_global: boolean // true = disponible en TODOS los módulos
  /** Categoría base que usan los flujos automáticos (no se elimina) */
  es_sistema?: boolean
  modulos_permitidos: ModuloDocumento[] // ["proyectos"], ["clientes","viviendas"], etc.

  fecha_creacion: string
}

export interface CategoriaFormData {
  nombre: string
  descripcion?: string
  color: string
  icono: string

  // Nuevos campos para sistema flexible
  esGlobal?: boolean
  modulosPermitidos?: ModuloDocumento[]
}

// Categorías sugeridas por defecto (opcionales)
export const CATEGORIAS_SUGERIDAS = [
  {
    nombre: 'Licencias y Permisos',
    descripcion: 'Documentos legales y autorizaciones',
    color: 'blue',
    icono: 'FileCheck',
  },
  {
    nombre: 'Planos',
    descripcion: 'Planos técnicos y arquitectónicos',
    color: 'purple',
    icono: 'Drafting',
  },
  {
    nombre: 'Contratos',
    descripcion: 'Contratos y acuerdos',
    color: 'green',
    icono: 'FileSignature',
  },
  {
    nombre: 'Facturas',
    descripcion: 'Comprobantes y facturas',
    color: 'yellow',
    icono: 'Receipt',
  },
  {
    nombre: 'Fotografías',
    descripcion: 'Registro fotográfico del proyecto',
    color: 'pink',
    icono: 'Camera',
  },
  {
    nombre: 'Informes',
    descripcion: 'Informes técnicos y reportes',
    color: 'indigo',
    icono: 'FileText',
  },
] as const

// Colores disponibles para categorías
export const COLORES_CATEGORIA = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'red', label: 'Rojo', class: 'bg-red-500' },
  { value: 'purple', label: 'Púrpura', class: 'bg-purple-500' },
  { value: 'yellow', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' },
  { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
  { value: 'teal', label: 'Verde azulado', class: 'bg-teal-500' },
  { value: 'cyan', label: 'Cian', class: 'bg-cyan-500' },
  { value: 'gray', label: 'Gris', class: 'bg-gray-500' },
] as const

// ============================================
// Documentos
// ============================================
export interface DocumentoProyecto {
  id: string
  proyecto_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  nombre_archivo: string
  nombre_original: string
  tamano_bytes: number
  tipo_mime: string
  url_storage: string
  etiquetas?: string[]
  version: number
  es_version_actual: boolean
  documento_padre_id?: string
  estado: EstadoDocumento
  metadata?: Record<string, unknown>
  subido_por: string
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante: boolean
  anclado_at?: string | null
  fecha_creacion: string
  fecha_actualizacion: string

  // Motivo de archivado
  motivo_categoria?: string
  motivo_detalle?: string

  // Campos de identidad (documentos_cliente)
  es_documento_identidad?: boolean | null

  // Sistema de Estados de Versión
  estado_version?: EstadoVersion
  motivo_estado?: string
  version_corrige_a?: string

  // Relaciones opcionales (cuando se cargan con join)
  categoria?: CategoriaDocumento
  usuario?: {
    id: string
    nombres: string
    apellidos: string
    email: string
  }
}

export interface DocumentoFormData {
  proyecto_id: string
  categoria_id?: string
  titulo: string
  descripcion?: string
  archivo: File
  etiquetas?: string[]
  fecha_documento?: string
  fecha_vencimiento?: string
  es_importante?: boolean
  metadata?: Record<string, unknown>
}

// Tipos MIME permitidos
export const MIME_TYPES_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
  'application/dwg',
  'image/vnd.dwg',
] as const

// Helper para formatear tamaño de archivo
export function formatFileSize(bytes: number): string {
  // Validación robusta para evitar crash con String.repeat(-1)
  if (bytes == null || bytes <= 0 || isNaN(bytes) || !isFinite(bytes))
    return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const sizeIndex = Math.max(0, Math.min(i, sizes.length - 1))
  return (
    Math.round((bytes / Math.pow(k, sizeIndex)) * 100) / 100 +
    ' ' +
    sizes[sizeIndex]
  )
}

// Helper para obtener extensión de archivo
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

// Helper para validar tipo de archivo
export function isValidFileType(type: string): boolean {
  return MIME_TYPES_PERMITIDOS.includes(
    type as (typeof MIME_TYPES_PERMITIDOS)[number]
  )
}

// Mapa de tipos MIME → ícono de Lucide
const FILE_ICON_MAP: Array<{
  test: (mime: string) => boolean
  icon: LucideIcon
}> = [
  {
    test: m =>
      m.includes('pdf') || m.includes('word') || m.includes('document'),
    icon: FileText,
  },
  { test: m => m.startsWith('image/'), icon: FileImage },
  { test: m => m.startsWith('video/'), icon: FileVideo },
  { test: m => m.includes('zip') || m.includes('rar'), icon: FileArchive },
  {
    test: m => m.includes('spreadsheet') || m.includes('excel'),
    icon: FileSpreadsheet,
  },
  { test: m => m.includes('text/'), icon: FileCode },
]

// Helper para obtener ícono según tipo MIME o extensión de archivo
export function getFileIcon(mimeTypeOrExtension: string): LucideIcon {
  const normalized = mimeTypeOrExtension.toLowerCase()
  return FILE_ICON_MAP.find(entry => entry.test(normalized))?.icon ?? File
}
