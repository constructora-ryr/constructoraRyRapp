/**
 * Formatos de archivo que acepta cada módulo al subir documentos.
 * Debe coincidir con `allowed_mime_types` / `file_size_limit` de los buckets
 * en Storage: documentos-clientes solo admite PDF, JPG/PNG, Word y Excel.
 *
 * La validación usa la extensión además del MIME porque Windows no informa
 * tipo para .dwg/.dxf (llegan con `file.type === ''`).
 */

import { formatFileSize } from '../types/documento.types'
import type { TipoEntidad } from '../types/entidad.types'

interface Formato {
  etiqueta: string
  extensiones: string[]
}

const BASICOS: Formato[] = [
  { etiqueta: 'PDF', extensiones: ['pdf'] },
  { etiqueta: 'JPG', extensiones: ['jpg', 'jpeg'] },
  { etiqueta: 'PNG', extensiones: ['png'] },
  { etiqueta: 'Word', extensiones: ['doc', 'docx'] },
  { etiqueta: 'Excel', extensiones: ['xls', 'xlsx'] },
]

const AMPLIADOS: Formato[] = [
  ...BASICOS,
  { etiqueta: 'WEBP', extensiones: ['webp'] },
  { etiqueta: 'PowerPoint', extensiones: ['ppt', 'pptx'] },
  { etiqueta: 'CAD', extensiones: ['dwg', 'dxf'] },
  { etiqueta: 'ZIP/RAR', extensiones: ['zip', 'rar'] },
  { etiqueta: 'TXT', extensiones: ['txt'] },
]

const FORMATOS: Record<TipoEntidad, Formato[]> = {
  cliente: BASICOS,
  proyecto: AMPLIADOS,
  vivienda: AMPLIADOS,
}

export const TAMANO_MAXIMO_ARCHIVO = 50 * 1024 * 1024 // 50 MB
const TAMANO_MINIMO_ARCHIVO = 1 // bytes: solo descarta archivos vacíos

export interface FormatosArchivo {
  /** Para el atributo `accept` del input file */
  accept: string
  /** Para mostrar al usuario: ['PDF', 'JPG', …] */
  etiquetas: string[]
  tamanoMaximo: number
}

export function formatosArchivo(tipoEntidad: TipoEntidad): FormatosArchivo {
  const formatos = FORMATOS[tipoEntidad] ?? BASICOS
  return {
    accept: formatos
      .flatMap(f => f.extensiones)
      .map(e => `.${e}`)
      .join(','),
    etiquetas: formatos.map(f => f.etiqueta),
    tamanoMaximo: TAMANO_MAXIMO_ARCHIVO,
  }
}

/** Mensaje de error, o null si el archivo se puede subir */
export function validarArchivoDocumento(
  file: File,
  tipoEntidad: TipoEntidad
): string | null {
  const formatos = FORMATOS[tipoEntidad] ?? BASICOS
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (!formatos.some(f => f.extensiones.includes(extension))) {
    return `Formato no permitido (.${extension || '?'}). Se aceptan: ${formatos
      .map(f => f.etiqueta)
      .join(', ')}`
  }
  if (file.size < TAMANO_MINIMO_ARCHIVO) return 'El archivo está vacío'
  if (file.size > TAMANO_MAXIMO_ARCHIVO) {
    return `El archivo pesa ${formatFileSize(file.size)} y el máximo es ${formatFileSize(TAMANO_MAXIMO_ARCHIVO)}`
  }
  return null
}
