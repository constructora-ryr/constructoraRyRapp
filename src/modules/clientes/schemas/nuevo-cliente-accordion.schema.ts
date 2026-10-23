/**
 * Schema y pasos del formulario para crear cliente (5 pasos).
 * Los campos comunes con editar están en cliente-campos.ts.
 */

import { z } from 'zod'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'

import {
  CAMPOS_PASO_CONTACTO,
  CAMPOS_PASO_PERSONAL,
  camposCliente,
  PASO_CONTACTO,
  PASO_INTERES,
  PASO_NOTAS,
  PASO_PERSONAL,
  PASO_RESUMEN,
} from './cliente-campos'

export const PASOS_CLIENTE: WizardStepConfig[] = [
  { id: 1, ...PASO_PERSONAL },
  { id: 2, ...PASO_CONTACTO },
  { id: 3, ...PASO_INTERES },
  { id: 4, ...PASO_NOTAS },
  { id: 5, ...PASO_RESUMEN },
]

export const clienteFormSchema = z.object({
  ...camposCliente,
  proyecto_interes_id: z.string().optional(),
  vivienda_interes_id: z.string().optional(),
  notas_interes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type ClienteFormValues = z.infer<typeof clienteFormSchema>

export const FIELDS_PASO_1_NUEVO_CLIENTE = CAMPOS_PASO_PERSONAL
export const FIELDS_PASO_2_NUEVO_CLIENTE = CAMPOS_PASO_CONTACTO
