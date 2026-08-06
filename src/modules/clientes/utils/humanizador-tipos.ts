/**
 * Detect the specific type of event from audit_log data,
 * and infer the field kind for display formatting.
 */

import type {
  EventoHistorialCliente,
  TipoEventoHistorial,
} from '../types/historial.types'

export function detectarTipoEvento(
  evento: EventoHistorialCliente
): TipoEventoHistorial {
  const { tabla, accion, cambios_especificos } = evento

  // ========== CLIENTE ==========
  if (tabla === 'clientes') {
    if (accion === 'CREATE') return 'cliente_creado'
    if (accion === 'DELETE') return 'cliente_eliminado'
    if (accion === 'UPDATE') {
      if (cambios_especificos?.estado) return 'cliente_estado_cambiado'
      return 'cliente_actualizado'
    }
  }

  // ========== NEGOCIACIÓN ==========
  if (tabla === 'negociaciones') {
    if (accion === 'CREATE') {
      const meta = evento.metadata as Record<string, unknown> | null
      // El traslado crea la entrada principal con este tipo
      if (meta?.tipo === 'TRASLADO_VIVIENDA') return 'traslado_vivienda'
      // Negociación creada como destino de traslado — redundante, se oculta
      if (
        (evento.datos_nuevos as Record<string, unknown> | null)
          ?.negociacion_origen_id
      ) {
        return 'negociacion_traslado_interna'
      }
      return 'negociacion_creada'
    }
    if (accion === 'UPDATE') {
      if (cambios_especificos?.estado?.despues === 'Completada') {
        return 'negociacion_completada'
      }
      // Negociación cerrada porque fue trasladada a otra vivienda
      if (cambios_especificos?.estado?.despues === 'Cerrada por Traslado') {
        return 'negociacion_cerrada_traslado'
      }
      if (cambios_especificos?.estado) return 'negociacion_estado_cambiada'
      return 'negociacion_actualizada'
    }
  }

  // ========== ABONO ==========
  if (tabla === 'abonos_historial') {
    if (accion === 'CREATE') return 'abono_registrado'
    if (accion === 'UPDATE') return 'abono_editado'
    if (accion === 'DELETE') return 'abono_anulado'
    if (accion === 'ANULAR') return 'abono_anulado'
  }

  // ========== RENUNCIA ==========
  if (tabla === 'renuncias') {
    if (accion === 'CREATE') return 'renuncia_creada'
    if (accion === 'UPDATE') {
      // El modulo campo distingue el tipo específico de UPDATE en renuncias
      if (evento.modulo === 'renuncia_devolucion_procesada')
        return 'renuncia_devolucion_procesada'
      const estadoNuevo = cambios_especificos?.estado?.despues
      if (estadoNuevo === 'Aprobada') return 'renuncia_aprobada'
      if (estadoNuevo === 'Rechazada') return 'renuncia_rechazada'
    }
  }

  // ========== DEVOLUCIÓN EXCEDENTE ==========
  if (tabla === 'negociaciones' && accion === 'UPDATE') {
    if (evento.modulo === 'excedente_devolucion_procesada')
      return 'excedente_devolucion_procesada'
  }

  // ========== INTERÉS ==========
  if (tabla === 'intereses') {
    if (accion === 'CREATE') return 'interes_registrado'
    if (accion === 'UPDATE') {
      if (cambios_especificos?.estado?.despues === 'Descartado') {
        return 'interes_descartado'
      }
      return 'interes_actualizado'
    }
  }

  // ========== DOCUMENTO ==========
  if (tabla === 'documentos_cliente') {
    if (accion === 'CREATE') return 'documento_subido'
    if (accion === 'UPDATE') return 'documento_actualizado'
    if (accion === 'DELETE') return 'documento_eliminado'
  }

  return 'evento_generico'
}

export function detectarTipoCampo(
  campo: string
): 'texto' | 'numero' | 'fecha' | 'booleano' | 'enum' {
  if (campo.includes('fecha')) return 'fecha'
  if (
    campo.includes('valor') ||
    campo.includes('ingresos') ||
    campo === 'cuota_inicial' ||
    campo === 'saldo_pendiente'
  ) {
    return 'numero'
  }
  if (
    campo === 'estado' ||
    campo === 'origen' ||
    campo === 'tipo_documento' ||
    campo === 'metodo_pago'
  ) {
    return 'enum'
  }
  if (campo.includes('activo') || campo.includes('es_')) return 'booleano'
  return 'texto'
}
