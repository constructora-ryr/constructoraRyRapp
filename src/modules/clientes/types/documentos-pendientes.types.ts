/**
 * ============================================
 * TYPES & SCHEMAS: Documentos Pendientes
 * ============================================
 *
 * Tipos TypeScript + Validación Zod para documentos pendientes
 * Garantiza type-safety en compile time y runtime
 *
 * @version 1.0.0 - 2025-12-12
 */

import { z } from 'zod'

// ============================================
// ZOD SCHEMAS (Runtime Validation)
// ============================================

/**
 * Schema para metadata de documento pendiente
 * Valida estructura JSON guardada en PostgreSQL
 */
export const DocumentoPendienteMetadataSchema = z.object({
  // Campos obligatorios
  tipo_fuente: z.enum([
    'Crédito Hipotecario',
    'Subsidio Caja Compensación',
    'Subsidio Mi Casa Ya',
    'Cuota Inicial',
    // Requisitos compartidos del cliente (boleta de registro)
    'Compartido',
  ]),
  descripcion: z.string().min(1, 'Descripción requerida'),
  origen: z.enum(['asignacion_vivienda', 'manual']),
  creado_automaticamente: z.boolean().default(true),

  // Campos opcionales
  entidad: z.string().optional(),
  vivienda: z.string().optional(),
  monto_aprobado: z.number().positive().optional(),

  // Datos enriquecidos (agregados dinámicamente)
  cliente: z
    .object({
      nombre_completo: z.string(),
    })
    .optional(),
  vivienda_detalle: z
    .object({
      numero: z.string(),
      manzana: z.string(),
    })
    .optional(),

  // Campos de la vista vista_documentos_pendientes_fuentes
  entidad_fuente: z.string().optional(),
  nivel_validacion: z.string().optional(),
  alcance: z.enum(['ESPECIFICO_FUENTE', 'COMPARTIDO_CLIENTE']).optional(),
})

/**
 * Schema para documento pendiente completo
 */
export const DocumentoPendienteSchema = z.object({
  id: z.string().uuid(),
  fuente_pago_id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  tipo_documento: z.string(),
  estado: z.enum(['Pendiente', 'Completado', 'Vencido']),
  prioridad: z.enum(['Alta', 'Media', 'Baja']),
  metadata: DocumentoPendienteMetadataSchema,
  fecha_creacion: z.string().datetime(),
  fecha_limite: z.string().datetime().nullable().optional(),
  fecha_completado: z.string().datetime().nullable().optional(),
  completado_por: z.string().uuid().nullable().optional(),
  recordatorios_enviados: z.number().int().min(0).default(0),
  ultima_notificacion: z.string().datetime().nullable().optional(),
})

// ============================================
// TYPESCRIPT TYPES (Inferidos de Zod)
// ============================================

export type DocumentoPendienteMetadata = z.infer<
  typeof DocumentoPendienteMetadataSchema
>
export type DocumentoPendiente = z.infer<typeof DocumentoPendienteSchema>

/**
 * Tipo para crear nuevo documento pendiente
 */
export type CrearDocumentoPendienteDTO = Pick<
  DocumentoPendiente,
  'cliente_id' | 'fuente_pago_id' | 'tipo_documento'
> & {
  metadata: Pick<
    DocumentoPendienteMetadata,
    'tipo_fuente' | 'descripcion' | 'origen' | 'entidad' | 'vivienda'
  >
  prioridad?: DocumentoPendiente['prioridad']
  fecha_limite?: string
}

/**
 * Tipo para documento pendiente enriquecido con datos de relaciones
 */
export type DocumentoPendienteEnriquecido = DocumentoPendiente & {
  _enriched?: {
    negociacion_id?: string
    vivienda?: {
      id: string
      numero: string
      manzana: string
    }
    cliente?: {
      id: string
      nombre_completo: string
    }
  }
}

// ============================================
// QUERY KEYS (React Query)
// ============================================

export const documentosPendientesKeys = {
  all: ['documentos-pendientes'] as const,
  byCliente: (clienteId: string) =>
    [...documentosPendientesKeys.all, 'cliente', clienteId] as const,
  byNegociacion: (negociacionId: string) =>
    [...documentosPendientesKeys.all, 'negociacion', negociacionId] as const,
  byFuentePago: (fuentePagoId: string) =>
    [...documentosPendientesKeys.all, 'fuente-pago', fuentePagoId] as const,
}
