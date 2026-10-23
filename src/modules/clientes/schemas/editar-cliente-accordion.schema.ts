/**
 * Schema, pasos y categorías para editar cliente (3 pasos).
 * Los campos comunes con crear están en cliente-campos.ts.
 */

import { FileText, Phone, User } from 'lucide-react'
import { z } from 'zod'

import type { WizardStepConfig } from '@/shared/components/accordion-wizard'
import type { CategoriaConfig } from '@/shared/components/modulos/ConfirmarCambiosModal'

import {
  CAMPOS_PASO_CONTACTO,
  CAMPOS_PASO_PERSONAL,
  camposCliente,
  PASO_CONTACTO,
  PASO_NOTAS,
  PASO_PERSONAL,
} from './cliente-campos'

// ── Configuración de pasos ─────────────────────────────
export const PASOS_CLIENTE_EDICION: WizardStepConfig[] = [
  { id: 1, ...PASO_PERSONAL },
  { id: 2, ...PASO_CONTACTO },
  { id: 3, ...PASO_NOTAS },
]

export const editarClienteSchema = z.object(camposCliente)

export type EditarClienteFormValues = z.input<typeof editarClienteSchema>

// ── Campos por paso para validación ───────────────────
export const FIELDS_PASO_1_EDITAR_CLIENTE = CAMPOS_PASO_PERSONAL
export const FIELDS_PASO_2_EDITAR_CLIENTE = CAMPOS_PASO_CONTACTO

// ── Categorías para modal de confirmación ─────────────
export const CATEGORIAS_CAMBIOS_CLIENTE: Record<string, CategoriaConfig> = {
  personal: { titulo: 'Datos Personales', icono: User },
  contacto: { titulo: 'Contacto y Ubicación', icono: Phone },
  notas: { titulo: 'Notas', icono: FileText },
}
