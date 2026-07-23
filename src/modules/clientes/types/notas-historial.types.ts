/**
 * Tipos para Notas Manuales del Historial
 */

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
}

export interface CrearNotaDTO {
  cliente_id: string
  titulo: string
  contenido: string
  es_importante?: boolean
}

export interface ActualizarNotaDTO {
  titulo?: string
  contenido?: string
  es_importante?: boolean
}

export interface NotaGlobalConCliente extends NotaHistorialCliente {
  cliente: {
    id: string
    nombres: string
    apellidos: string
  }
  creador: {
    id: string
    email: string
    nombres: string
    apellidos: string
  }
}
