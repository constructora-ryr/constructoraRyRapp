/**
 * Tipos para Notas Manuales del Historial
 */

export interface DocumentoVinculado {
  id: string
  titulo: string
  nombre_archivo: string
  tipo_mime: string
  url_storage: string
  estado: string
}

export interface NotaHistorialCliente {
  id: string
  cliente_id: string
  titulo: string
  contenido: string
  es_importante: boolean
  creado_por: string
  fecha_creacion: string
  actualizado_por: string | null
  fecha_actualizacion: string | null
  documento_vinculado_id: string | null
}

export interface NotaHistorialConUsuario extends NotaHistorialCliente {
  creador: {
    id: string
    email: string
    nombres: string
    apellidos: string
    rol: string
  }
  actualizador?: {
    id: string
    email: string
    nombres: string
    apellidos: string
  }
  documento_vinculado?: DocumentoVinculado | null
}

export interface CrearNotaDTO {
  cliente_id: string
  titulo: string
  contenido: string
  es_importante?: boolean
  documento_vinculado_id?: string | null
}

export interface ActualizarNotaDTO {
  titulo?: string
  contenido?: string
  es_importante?: boolean
  documento_vinculado_id?: string | null
}

export interface NotaGlobalConCliente extends NotaHistorialCliente {
  cliente: {
    id: string
    nombres: string
    apellidos: string
  }
  vivienda?: {
    numero: string
    manzana: string
  } | null
  creador: {
    id: string
    email: string
    nombres: string
    apellidos: string
  }
}
