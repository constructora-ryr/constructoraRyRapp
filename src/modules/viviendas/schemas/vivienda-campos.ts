/**
 * Reglas de texto compartidas por los formularios de vivienda (crear y
 * editar). Linderos y nomenclatura se copian de escrituras y planos, así que
 * aceptan los signos que aparecen ahí: # ° / : ; m² comillas, etc.
 */

import { z } from 'zod'

const REGEX_TEXTO_LEGAL = /^[\p{L}\p{N}\s.,;:#°º/"'()²³&+-]+$/u

const MENSAJE_TEXTO_LEGAL =
  'Hay caracteres no permitidos. Usa letras, números y signos como . , ; : # ° / - ( )'

export function textoLegal(minimo: number, mensajeMinimo: string) {
  return z
    .string()
    .trim()
    .min(minimo, mensajeMinimo)
    .regex(REGEX_TEXTO_LEGAL, MENSAJE_TEXTO_LEGAL)
}

export const lindero = (direccion: string) =>
  textoLegal(5, `Describe el lindero ${direccion} (mínimo 5 caracteres)`)

export const nomenclatura = textoLegal(5, 'Mínimo 5 caracteres')

export const matricula = z
  .string()
  .trim()
  .min(1, 'La matrícula inmobiliaria es obligatoria')
  .regex(/^[0-9-]+$/, 'Solo números y guiones (Ej: 373-123456)')
