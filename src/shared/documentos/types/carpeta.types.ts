/**
 * ============================================
 * TYPES: Carpetas de Documentos
 * ============================================
 *
 * Tipos para el sistema de carpetas jerárquicas
 * que organiza documentos dentro de cada entidad
 * (proyecto, vivienda, cliente).
 */

import type { Database } from '@/lib/supabase/database.types'

import type { TipoEntidad } from './entidad.types'

// Tipos derivados de la BD
export type CarpetaDocumentoRow =
  Database['public']['Tables']['carpetas_documentos']['Row']
export type CarpetaDocumentoInsert =
  Database['public']['Tables']['carpetas_documentos']['Insert']
export type CarpetaDocumentoUpdate =
  Database['public']['Tables']['carpetas_documentos']['Update']

/**
 * Carpeta con conteo de documentos (para mostrar en UI)
 */
export interface CarpetaConConteo extends CarpetaDocumentoRow {
  cantidad_documentos: number
  cantidad_subcarpetas: number
}

/**
 * Parámetros para crear una carpeta
 */
export interface CrearCarpetaParams {
  entidadId: string
  tipoEntidad: TipoEntidad
  nombre: string
  descripcion?: string
  color?: string
  icono?: string
  padreId?: string | null
}

/**
 * Parámetros para actualizar una carpeta
 */
export interface ActualizarCarpetaParams {
  nombre?: string
  descripcion?: string
  color?: string
  icono?: string
  orden?: number
}

/**
 * Breadcrumb item para navegación de carpetas
 */
export interface CarpetaBreadcrumb {
  id: string | null // null = raíz
  nombre: string
}

/**
 * Carpeta plana (cualquier nivel) con su ruta completa para selectores
 * que necesitan mostrar todas las carpetas de la entidad, no solo un nivel.
 */
export interface CarpetaConRuta extends CarpetaDocumentoRow {
  ruta: string // ej: "Documentos desembolso subsidio / Fotos vivienda"
}
