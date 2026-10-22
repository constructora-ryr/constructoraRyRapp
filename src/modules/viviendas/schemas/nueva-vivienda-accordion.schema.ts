/**
 * Schema, tipos y configuración de pasos para useNuevaViviendaAccordion.
 * Las reglas cruzadas (área construida ≤ lote, recargo de esquinera) se
 * validan por paso en el hook, porque cada paso valida solo sus campos.
 */

import { ClipboardCheck, DollarSign, MapPin, Ruler, Scale } from 'lucide-react'
import { z } from 'zod'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'

import { lindero, matricula, nomenclatura } from './vivienda-campos'
import type { ViviendaSchemaType } from './vivienda.schemas'

// ── Configuración de pasos ───────────────────────────────────────
export const PASOS_VIVIENDA: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Ubicación',
    description:
      'Elige el proyecto, la manzana y el número de la casa.\nCada manzana muestra cuántas casas le faltan por registrar.\nLos números grises ya están registrados y no se pueden elegir.',
    icon: MapPin,
  },
  {
    id: 2,
    title: 'Linderos',
    description:
      'Escribe los linderos tal como aparecen en la escritura o el plano.\nIncluye la medida y con qué colinda. Ej: "En 6,00 m con la Calle 12".',
    icon: Ruler,
  },
  {
    id: 3,
    title: 'Información Legal',
    description:
      'Copia la matrícula y la nomenclatura del certificado de tradición.\nLa matrícula se verifica mientras escribes para evitar duplicados.\nEl área construida no puede ser mayor que la del lote.',
    icon: Scale,
  },
  {
    id: 4,
    title: 'Información Financiera',
    description:
      'Define el valor base: los gastos notariales se suman solos.\nSi la casa es esquinera, elige el recargo que le corresponde.',
    icon: DollarSign,
  },
  {
    id: 5,
    title: 'Resumen',
    description:
      'Revisa todo antes de crear la vivienda.\nCorrige cualquier sección con "Editar".\nEl certificado de tradición se sube después, en la pestaña Documentos.',
    icon: ClipboardCheck,
  },
]

const area = (nombre: string, ejemplo: string) =>
  z
    .string()
    .min(1, `El área ${nombre} es obligatoria`)
    .regex(
      /^\d+(\.\d{0,3})?$/,
      `Solo números y hasta 3 decimales (Ej: ${ejemplo})`
    )
    .refine(val => Number(val) > 0, 'Debe ser mayor a 0')

// ── Schema Zod para el formulario ────────────────────────────────
export const nuevaViviendaAccordionSchema = z.object({
  // Paso 1
  proyecto_id: z.string().min(1, 'Selecciona un proyecto'),
  manzana_id: z.string().min(1, 'Selecciona una manzana'),
  numero: z.string().min(1, 'Selecciona el número de la casa'),
  // Paso 2
  lindero_norte: lindero('Norte'),
  lindero_sur: lindero('Sur'),
  lindero_oriente: lindero('Oriente'),
  lindero_occidente: lindero('Occidente'),
  // Paso 3
  matricula_inmobiliaria: matricula,
  nomenclatura,
  area_lote: area('del lote', '66.125'),
  area_construida: area('construida', '41.5'),
  tipo_vivienda: z.enum(['Regular', 'Irregular'], {
    error: 'Selecciona el tipo de lote',
  }),
  // Paso 4
  valor_base: z.coerce.number().min(1, 'El valor base es obligatorio'),
  es_esquinera: z.boolean().default(false),
  recargo_esquinera: z.coerce.number().min(0).default(0),
})

export type ViviendaFormValues = ViviendaSchemaType

// ── Campos por paso (para trigger de validación parcial) ────────
export const FIELDS_PASO_1 = ['proyecto_id', 'manzana_id', 'numero'] as const
export const FIELDS_PASO_2 = [
  'lindero_norte',
  'lindero_sur',
  'lindero_oriente',
  'lindero_occidente',
] as const
export const FIELDS_PASO_3 = [
  'matricula_inmobiliaria',
  'nomenclatura',
  'area_lote',
  'area_construida',
  'tipo_vivienda',
] as const
export const FIELDS_PASO_4 = [
  'valor_base',
  'es_esquinera',
  'recargo_esquinera',
] as const
