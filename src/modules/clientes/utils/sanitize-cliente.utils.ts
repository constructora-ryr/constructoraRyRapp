/**
 * 🧹 SANITIZADORES ESPECÍFICOS PARA MÓDULO DE CLIENTES
 *
 * Funciones especializadas para sanitizar DTOs de clientes
 * antes de enviarlos a la base de datos.
 */

import {
  formatNombrePropio,
  sanitizeDate,
  sanitizeEnum,
  sanitizeString,
} from '@/lib/utils/sanitize.utils'

import type {
  ActualizarClienteDTO,
  CrearClienteDTO,
  EstadoCivil,
} from '../types'

/**
 * Valores válidos del enum EstadoCivil
 * ✅ Sincronizado con: src/modules/clientes/types/index.ts
 */
const VALID_ESTADOS_CIVILES: readonly EstadoCivil[] = [
  'Soltero(a)',
  'Casado(a)',
  'Unión libre',
  'Viudo(a)',
] as const

/**
 * Sanitizar datos de creación de cliente
 * Convierte strings vacíos a null y valida enums
 */
export function sanitizeCrearClienteDTO(
  datos: CrearClienteDTO
): CrearClienteDTO {
  return {
    ...datos,
    // Campos obligatorios (strings)
    nombres: formatNombrePropio(datos.nombres) || '',
    apellidos: formatNombrePropio(datos.apellidos) || '',
    tipo_documento: datos.tipo_documento,
    numero_documento: sanitizeString(datos.numero_documento) || '',

    // Campos opcionales (strings)
    telefono: sanitizeString(datos.telefono) ?? undefined,
    telefono_alternativo:
      sanitizeString(datos.telefono_alternativo) ?? undefined,
    email: datos.email
      ? (sanitizeString(datos.email)?.toLowerCase() ?? undefined)
      : undefined,
    direccion: sanitizeString(datos.direccion) ?? undefined,
    ciudad: sanitizeString(datos.ciudad) ?? undefined,
    departamento: sanitizeString(datos.departamento) ?? undefined,
    notas: sanitizeString(datos.notas) ?? undefined,

    // Campos opcionales (especiales)
    fecha_nacimiento: sanitizeDate(datos.fecha_nacimiento) ?? undefined,
    estado_civil:
      sanitizeEnum(datos.estado_civil, VALID_ESTADOS_CIVILES) ?? undefined,

    // Interés inicial (mantener como está)
    interes_inicial: datos.interes_inicial,
  }
}

/**
 * Al editar, null BORRA el dato en la BD. Por eso:
 * - vacío a propósito → null (borrar)
 * - valor válido → el valor
 * - valor inválido → undefined (no se envía: se conserva lo que había)
 */
function paraActualizar<T>(
  valor: string | null,
  sanear: (v: string) => T | null
): T | null | undefined {
  if (valor === null || valor.trim() === '') return null
  return sanear(valor) ?? undefined
}

/**
 * Sanitizar datos de actualización de cliente
 * Similar a crear pero todos los campos son opcionales
 */
export function sanitizeActualizarClienteDTO(
  datos: ActualizarClienteDTO
): ActualizarClienteDTO {
  const sanitized: ActualizarClienteDTO = {}

  // Solo incluir campos que existen en el DTO original (con valor !== undefined)
  if (datos.nombres !== undefined)
    sanitized.nombres = formatNombrePropio(datos.nombres) || ''
  if (datos.apellidos !== undefined)
    sanitized.apellidos = formatNombrePropio(datos.apellidos) || ''
  if (datos.tipo_documento !== undefined)
    sanitized.tipo_documento = datos.tipo_documento
  if (datos.numero_documento !== undefined)
    sanitized.numero_documento = sanitizeString(datos.numero_documento) || ''

  if (datos.telefono !== undefined)
    sanitized.telefono = sanitizeString(datos.telefono)
  if (datos.telefono_alternativo !== undefined)
    sanitized.telefono_alternativo = sanitizeString(datos.telefono_alternativo)
  if (datos.email !== undefined)
    sanitized.email = datos.email
      ? (sanitizeString(datos.email)?.toLowerCase() ?? null)
      : null
  if (datos.direccion !== undefined)
    sanitized.direccion = sanitizeString(datos.direccion)
  if (datos.ciudad !== undefined)
    sanitized.ciudad = sanitizeString(datos.ciudad) ?? undefined
  if (datos.departamento !== undefined)
    sanitized.departamento = sanitizeString(datos.departamento) ?? undefined
  if (datos.notas !== undefined) sanitized.notas = sanitizeString(datos.notas)

  // ⚠️ CRÍTICO: Validar que el campo no sea undefined antes de sanitizar
  if (datos.fecha_nacimiento !== undefined)
    sanitized.fecha_nacimiento = paraActualizar(
      datos.fecha_nacimiento,
      sanitizeDate
    )
  if (datos.estado_civil !== undefined)
    sanitized.estado_civil = paraActualizar(datos.estado_civil, v =>
      sanitizeEnum(v, VALID_ESTADOS_CIVILES)
    )

  // Estado (si se está actualizando)
  if (datos.estado !== undefined) sanitized.estado = datos.estado

  // Excluir interes_inicial en actualizaciones (solo para creación)
  // if (datos.interes_inicial !== undefined) ... → NO incluir en updates

  return sanitized
}
