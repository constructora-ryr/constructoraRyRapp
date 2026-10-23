/**
 * Validaciones de los pasos del formulario de cliente, compartidas por crear
 * y editar (antes estaban copiadas y ya se habían separado: la regla de
 * mayoría de edad solo existía al editar).
 *
 * Cada función recibe las utilidades de react-hook-form, marca los errores
 * en los campos y devuelve si el paso es válido.
 */

import { clientesService } from '../services/clientes.service'

import { errorFechaNacimiento } from './fecha-nacimiento'
import {
  validarDocumentoIdentidad,
  type TipoDocumentoColombia,
} from './validacion-documentos-colombia'

/** Lo mínimo de react-hook-form que necesitan las validaciones */
export interface FormularioCliente {
  getValues: (campo: never) => unknown
  trigger: (campos?: never) => Promise<boolean>
  setError: (campo: never, error: { type: string; message: string }) => void
}

type Campo =
  | 'numero_documento'
  | 'fecha_nacimiento'
  | 'telefono'
  | 'email'
  | 'telefono_alternativo'
  | 'direccion'

const valor = (f: FormularioCliente, campo: string) =>
  String(f.getValues(campo as never) ?? '').trim()
const marcar = (f: FormularioCliente, campo: Campo, mensaje: string) =>
  f.setError(campo as never, { type: 'manual', message: mensaje })
const validarCampos = (f: FormularioCliente, campos: readonly string[]) =>
  f.trigger([...campos] as never)

/**
 * Paso "Datos personales": campos obligatorios, documento válido según su
 * tipo, fecha de nacimiento y documento no repetido.
 * `clienteId`: al editar, para no contarse a sí mismo como duplicado.
 */
export async function validarPasoPersonal(
  f: FormularioCliente,
  campos: readonly string[],
  clienteId?: string
): Promise<boolean> {
  if (!(await validarCampos(f, campos))) return false

  let valido = true
  const tipo = valor(f, 'tipo_documento') as TipoDocumentoColombia
  const numero = valor(f, 'numero_documento')

  const documento = validarDocumentoIdentidad(tipo, numero)
  if (!documento.valido) {
    marcar(f, 'numero_documento', documento.mensaje || 'Documento inválido')
    valido = false
  }

  const errorFecha = errorFechaNacimiento(valor(f, 'fecha_nacimiento'))
  if (errorFecha) {
    marcar(f, 'fecha_nacimiento', errorFecha)
    valido = false
  }

  if (valido) {
    try {
      const existente = await clientesService.buscarPorDocumento(tipo, numero)
      if (existente && existente.id !== clienteId) {
        marcar(
          f,
          'numero_documento',
          `Ya está registrado: ${existente.nombres} ${existente.apellidos}`
        )
        valido = false
      }
    } catch {
      // Sin red no se bloquea: la base de datos impide el duplicado al guardar
    }
  }
  return valido
}

/** Paso "Contacto": ubicación obligatoria y al menos teléfono o correo */
export async function validarPasoContacto(
  f: FormularioCliente,
  campos: readonly string[]
): Promise<boolean> {
  if (!(await validarCampos(f, campos))) return false

  if (!valor(f, 'telefono') && !valor(f, 'email')) {
    const mensaje = 'Escribe al menos un teléfono o un correo'
    marcar(f, 'telefono', mensaje)
    marcar(f, 'email', mensaje)
    return false
  }

  // Formato de los opcionales que sí se llenaron
  const llenos = (
    ['telefono', 'email', 'telefono_alternativo', 'direccion'] as const
  ).filter(c => valor(f, c))
  return llenos.length ? validarCampos(f, llenos) : true
}

/** Campos de texto opcionales: solo se validan si tienen contenido */
export async function validarOpcionales(
  f: FormularioCliente,
  campos: readonly string[]
): Promise<boolean> {
  const llenos = campos.filter(c => valor(f, c))
  return llenos.length ? validarCampos(f, llenos) : true
}
