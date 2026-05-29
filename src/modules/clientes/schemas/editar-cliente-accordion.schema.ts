/**
 * Schema, pasos, campos y categorías para useEditarClienteAccordion.
 * Extraído del hook para mantenerlo bajo el límite de líneas recomendado.
 */

import { FileText, Phone, User } from 'lucide-react'
import { z } from 'zod'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'
import type { CategoriaConfig } from '@/shared/components/modulos/ConfirmarCambiosModal'

// ── Configuración de pasos ─────────────────────────────
export const PASOS_CLIENTE_EDICION: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Datos Personales',
    description: 'Nombres, documento e información básica',
  },
  {
    id: 2,
    title: 'Contacto y Ubicación',
    description: 'Teléfono, email y dirección',
  },
  {
    id: 3,
    title: 'Notas Adicionales',
    description: 'Observaciones opcionales',
  },
]

// ── Helpers de validación ──────────────────────────────
const REGEX_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
const REGEX_TELEFONO = /^[0-9+\-\s()]+$/

// ── Schema del formulario ─────────────────────────────
export const editarClienteSchema = z.object({
  // Paso 1: Datos Personales
  nombres: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(80, 'Máximo 80 caracteres')
    .regex(REGEX_SOLO_LETRAS, 'Solo letras, espacios y tildes'),
  apellidos: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(80, 'Máximo 80 caracteres')
    .regex(REGEX_SOLO_LETRAS, 'Solo letras, espacios y tildes'),
  tipo_documento: z.string().min(1, 'El tipo de documento es requerido'),
  numero_documento: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  fecha_nacimiento: z.string().optional(),
  estado_civil: z.string().optional(),
  // Paso 2: Contacto
  telefono: z
    .string()
    .regex(REGEX_TELEFONO, 'Solo números, +, -, (, ) y espacios')
    .min(7, 'Mínimo 7 dígitos')
    .max(15, 'Máximo 15 caracteres')
    .or(z.literal('')),
  telefono_alternativo: z
    .string()
    .regex(REGEX_TELEFONO, 'Solo números, +, -, (, ) y espacios')
    .min(7, 'Mínimo 7 dígitos')
    .max(15, 'Máximo 15 caracteres')
    .or(z.literal('')),
  email: z
    .string()
    .email(
      'Correo inválido. Los emails solo admiten letras sin tildes ni ñ (ej: londono@gmail.com)'
    )
    .max(100, 'Máximo 100 caracteres')
    .or(z.literal('')),
  direccion: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(200, 'Máximo 200 caracteres')
    .or(z.literal('')),
  departamento: z.string().min(1, 'El departamento es obligatorio'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  // Paso 3: Notas
  notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type EditarClienteFormValues = z.input<typeof editarClienteSchema>

// ── Campos por paso para validación ───────────────────
export const FIELDS_PASO_1_EDITAR_CLIENTE = [
  'nombres',
  'apellidos',
  'tipo_documento',
  'numero_documento',
] as const

export const FIELDS_PASO_2_EDITAR_CLIENTE = ['departamento', 'ciudad'] as const

// ── Categorías para modal de confirmación ─────────────
export const CATEGORIAS_CAMBIOS_CLIENTE: Record<string, CategoriaConfig> = {
  personal: { titulo: 'Datos Personales', icono: User },
  contacto: { titulo: 'Contacto y Ubicación', icono: Phone },
  notas: { titulo: 'Notas', icono: FileText },
}
