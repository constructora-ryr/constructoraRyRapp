// ============================================
// SCHEMAS: Validaciones para Documentos
// ============================================

import { z } from 'zod'

// ============================================
// Schema: Categoría de Documento
// ============================================

export const categoriaFormSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo (máx. 100 caracteres)')
    .trim()
    .refine(val => val.length > 0, 'El nombre es requerido'),

  descripcion: z
    .string()
    .max(500, 'La descripción es demasiado larga (máx. 500 caracteres)')
    .optional()
    .or(z.literal('')),

  color: z
    .string()
    // Nombre de la paleta ("blue") o hex de las categorías del sistema
    .regex(/^([a-z]+|#[0-9a-fA-F]{6})$/, 'Color inválido')
    .default('blue'),

  icono: z.string().min(1, 'Debe seleccionar un ícono').default('Folder'),

  // Nuevos campos para sistema flexible
  esGlobal: z.boolean().optional(),
  modulosPermitidos: z
    .array(z.enum(['proyectos', 'clientes', 'viviendas']))
    .optional(),
})

export type CategoriaFormData = z.infer<typeof categoriaFormSchema>

// ============================================
// Schema: Documento
// ============================================

export const documentoFormSchema = z
  .object({
    // Campo obligatorio
    titulo: z
      .string()
      .min(3, 'El título debe tener al menos 3 caracteres')
      .max(200, 'El título es demasiado largo (máx. 200 caracteres)')
      .trim()
      .refine(val => val.length > 0, 'El título es requerido'),

    // Campos opcionales
    descripcion: z
      .string()
      .max(1000, 'La descripción es demasiado larga (máx. 1000 caracteres)')
      .optional()
      .or(z.literal('')),

    categoria_id: z
      .string()
      .uuid('ID de categoría inválido')
      .optional()
      .or(z.literal(''))
      .or(z.null()),

    fecha_documento: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(val => {
        if (!val) return true
        const fecha = new Date(val)
        return !isNaN(fecha.getTime())
      }, 'Fecha inválida')
      .refine(val => {
        if (!val) return true
        const fechaDocumento = new Date(val + 'T12:00:00') // Hora mediodía para evitar timezone issues
        const hoy = new Date()
        hoy.setHours(23, 59, 59, 999) // Final del día actual
        return fechaDocumento <= hoy
      }, 'La fecha del documento no puede ser futura'),

    fecha_vencimiento: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(val => {
        if (!val) return true
        const fecha = new Date(val)
        return !isNaN(fecha.getTime())
      }, 'Fecha inválida'),

    es_documento_identidad: z.boolean().optional(),

    metadata: z.record(z.string(), z.any()).optional(),
  })
  .refine(
    data => {
      // Validación 1: No puede haber vencimiento sin fecha de emisión
      if (data.fecha_vencimiento && !data.fecha_documento) {
        return false
      }
      return true
    },
    {
      message:
        'Debes especificar la fecha de emisión del documento antes de establecer una fecha de vencimiento',
      path: ['fecha_documento'], // El error se mostrará en el campo fecha_documento
    }
  )
  .refine(
    data => {
      // Validación 2: fecha_vencimiento debe ser posterior a fecha_documento
      if (!data.fecha_documento || !data.fecha_vencimiento) {
        return true // Si alguna no está definida, no validamos esta regla
      }

      const fechaDocumento = new Date(data.fecha_documento)
      const fechaVencimiento = new Date(data.fecha_vencimiento)

      return fechaVencimiento > fechaDocumento
    },
    {
      message:
        'La fecha de vencimiento debe ser posterior a la fecha de emisión del documento',
      path: ['fecha_vencimiento'], // El error se mostrará en el campo fecha_vencimiento
    }
  )

export type DocumentoFormData = z.infer<typeof documentoFormSchema>
