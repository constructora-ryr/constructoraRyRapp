/**
 * Campos del formulario de cliente compartidos por crear y editar, y las
 * guías de cada paso. Las reglas que cruzan campos (documento según su
 * tipo, mayoría de edad, teléfono o correo) están en
 * utils/validacion-pasos-cliente.
 */

import { Heart, MapPin, NotebookPen, ClipboardCheck, User } from 'lucide-react'
import { z } from 'zod'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'

/** Letras con tildes, ñ, espacios, apóstrofo y guion */
const REGEX_SOLO_LETRAS = /^[\p{L}\s'-]+$/u
/** Teléfono: dígitos, +, -, espacios, paréntesis */
const REGEX_TELEFONO = /^[0-9+\-\s()]+$/

const nombre = (que: string) =>
  z
    .string()
    .trim()
    .min(2, `Escribe ${que} (mínimo 2 letras)`)
    .max(80, 'Máximo 80 caracteres')
    .regex(REGEX_SOLO_LETRAS, 'Solo letras, espacios, tildes y guiones')

const telefono = z
  .string()
  .regex(REGEX_TELEFONO, 'Solo números, +, -, (, ) y espacios')
  .min(7, 'Mínimo 7 dígitos')
  .max(15, 'Máximo 15 caracteres')
  .or(z.literal(''))

export const camposCliente = {
  // Datos personales
  nombres: nombre('los nombres'),
  apellidos: nombre('los apellidos'),
  tipo_documento: z.string().min(1, 'Elige el tipo de documento'),
  // Longitud y formato por tipo: validarDocumentoIdentidad
  numero_documento: z
    .string()
    .trim()
    .min(1, 'Escribe el número de documento')
    .max(20, 'Máximo 20 caracteres'),
  fecha_nacimiento: z.string().optional(),
  estado_civil: z.string().optional(),
  // Contacto y ubicación
  telefono,
  telefono_alternativo: telefono,
  email: z
    .string()
    .email('Correo inválido. Sin tildes ni ñ (ej: londono@gmail.com)')
    .max(100, 'Máximo 100 caracteres')
    .or(z.literal('')),
  direccion: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(200, 'Máximo 200 caracteres')
    .or(z.literal('')),
  departamento: z.string().min(1, 'Elige el departamento'),
  ciudad: z.string().min(1, 'Elige la ciudad o municipio'),
  // Notas
  notas: z.string().max(500, 'Máximo 500 caracteres').optional(),
}

export const CAMPOS_PASO_PERSONAL = [
  'nombres',
  'apellidos',
  'tipo_documento',
  'numero_documento',
] as const

export const CAMPOS_PASO_CONTACTO = ['departamento', 'ciudad'] as const

// ── Guías de los pasos (primera línea + consejos) ─────────────────────────
export const PASO_PERSONAL: Omit<WizardStepConfig, 'id'> = {
  title: 'Datos personales',
  description:
    'Escribe el nombre como aparece en el documento de identidad.\nEl número se revisa mientras escribes: si el cliente ya existe, verás su nombre y podrás abrirlo.\nLa fecha de nacimiento es opcional, pero si la escribes debe ser mayor de 18 años (requisito para firmar contratos).',
  icon: User,
}

export const PASO_CONTACTO: Omit<WizardStepConfig, 'id'> = {
  title: 'Contacto y ubicación',
  description:
    'Necesitamos al menos una forma de contactar al cliente: teléfono o correo (pueden ser los dos).\nElige primero el departamento para ver sus ciudades.\nLa dirección y el otro teléfono son opcionales.',
  icon: MapPin,
}

export const PASO_INTERES: Omit<WizardStepConfig, 'id'> = {
  title: 'Interés inicial',
  description:
    'Opcional: si el cliente ya sabe qué proyecto o casa le interesa, márcalo aquí.\nQuedará guardado en la pestaña Intereses de su detalle y lo podrás cambiar después.',
  icon: Heart,
}

export const PASO_NOTAS: Omit<WizardStepConfig, 'id'> = {
  title: 'Notas',
  description:
    'Opcional: observaciones internas que ayuden al equipo (cómo llegó, preferencias, horarios para llamar…).\nEl cliente no las ve.',
  icon: NotebookPen,
}

export const PASO_RESUMEN: Omit<WizardStepConfig, 'id'> = {
  title: 'Resumen',
  description:
    'Revisa que todo esté bien antes de crear el cliente.\nCorrige cualquier sección con "Editar".\nDespués podrás subir su cédula y asignarle una vivienda desde su detalle.',
  icon: ClipboardCheck,
}
