/**
 * Schemas de validación compartidos para Viviendas
 * ✅ Un solo lugar de verdad
 * ✅ Reutilizable en creación y edición
 * ✅ Validaciones consistentes
 */

import { z } from 'zod'

import { lindero, matricula, nomenclatura } from './vivienda-campos'

// ==================== PASO 1: UBICACIÓN ====================
export const paso1Schema = z.object({
  proyecto_id: z.string().min(1, 'Selecciona un proyecto'),
  manzana_id: z.string().min(1, 'Selecciona una manzana'),
  numero: z.string().min(1, 'El número de vivienda es obligatorio'),
})

// ==================== PASO 2: LINDEROS ====================
export const paso2Schema = z.object({
  lindero_norte: lindero('Norte'),
  lindero_sur: lindero('Sur'),
  lindero_oriente: lindero('Oriente'),
  lindero_occidente: lindero('Occidente'),
})

// ==================== PASO 3: INFORMACIÓN LEGAL ====================
export const paso3SchemaBase = z
  .object({
    matricula_inmobiliaria: matricula,
    nomenclatura,
    area_lote: z.preprocess(
      val => (typeof val === 'number' ? String(val) : val),
      z
        .string()
        .refine(val => {
          const trimmed = val.trim()
          return trimmed !== '' && trimmed !== '0'
        }, 'El área del lote es obligatoria')
        .refine(
          val => /^\d+(\.\d+)?$/.test(val.trim()),
          'Debe ser un número válido (ej: 120.5)'
        )
        .refine(
          val => parseFloat(val) > 0,
          'El área del lote debe ser mayor a 0'
        )
        .transform(val => parseFloat(val))
    ),
    area_construida: z.preprocess(
      val => (typeof val === 'number' ? String(val) : val),
      z
        .string()
        .refine(val => {
          const trimmed = val.trim()
          return trimmed !== '' && trimmed !== '0'
        }, 'El área construida es obligatoria')
        .refine(
          val => /^\d+(\.\d+)?$/.test(val.trim()),
          'Debe ser un número válido (ej: 80.0)'
        )
        .refine(
          val => parseFloat(val) > 0,
          'El área construida debe ser mayor a 0'
        )
        .transform(val => parseFloat(val))
    ),
    tipo_vivienda: z.string().min(1, 'Selecciona un tipo de vivienda'),
  })
  .refine(
    data => {
      // ✅ Validación cruzada: área construida no puede ser mayor al área del lote
      return data.area_construida <= data.area_lote
    },
    {
      message: 'El área construida no puede ser mayor al área del lote',
      path: ['area_construida'],
    }
  )

// ==================== PASO 4: INFORMACIÓN FINANCIERA ====================
export const paso4Schema = z.object({
  valor_base: z
    .number()
    .positive('El precio base debe ser mayor a 0')
    .min(1000000, 'El precio mínimo es $1,000,000'),
  es_esquinera: z.boolean().optional(),
  recargo_esquinera: z.number().optional(),
})

// ==================== SCHEMA COMPLETO ====================
export const viviendaFullSchema = paso1Schema
  .merge(paso2Schema)
  .merge(paso3SchemaBase)
  .merge(paso4Schema)

export type ViviendaSchemaType = z.infer<typeof viviendaFullSchema>
