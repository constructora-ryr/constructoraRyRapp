/**
 * Extrae detalles de cambios de un evento de historial.
 * Convierte datos_nuevos / cambios_especificos en DetalleEvento[] para la UI.
 */

import { mismoDiaCalendario } from '@/lib/utils/date.utils'

import type {
  DetalleEvento,
  EventoHistorialCliente,
  TipoEventoHistorial,
} from '../types/historial.types'

import { CAMPOS_EXCLUIDOS, ETIQUETAS } from './humanizador-constantes'
import { detectarTipoCampo } from './humanizador-tipos'

/** Construye DetalleEvento[] para eventos CREATE a partir de campos específicos. */
function buildCreateDetalles(
  campos: string[],
  src: Record<string, unknown>
): DetalleEvento[] {
  return campos
    .filter(c => src[c] != null && src[c] !== '')
    .map(c => ({
      campo: c,
      etiqueta: ETIQUETAS[c] ?? c,
      valorAnterior: null,
      valorNuevo: src[c],
      tipo: detectarTipoCampo(c),
    }))
}

export function extraerDetalles(
  evento: EventoHistorialCliente,
  tipo: TipoEventoHistorial
): DetalleEvento[] {
  const { cambios_especificos, datos_nuevos, datos_anteriores, accion } = evento

  // === CREATE: Cliente (incluye todos los campos del formulario) ===
  if (tipo === 'cliente_creado' && accion === 'CREATE' && datos_nuevos) {
    const detalles: DetalleEvento[] = []

    // Información personal
    const camposPersonales: Array<[string, string, DetalleEvento['tipo']]> = [
      ['nombres', 'Nombres', 'texto'],
      ['apellidos', 'Apellidos', 'texto'],
      ['tipo_documento', 'Tipo de documento', 'enum'],
      ['numero_documento', 'Número de documento', 'texto'],
      ['fecha_nacimiento', 'Fecha de nacimiento', 'fecha'],
      ['estado_civil', 'Estado civil', 'enum'],
    ]
    for (const [campo, etiqueta, tipoCampo] of camposPersonales) {
      detalles.push({
        campo,
        etiqueta,
        valorAnterior: null,
        valorNuevo: datos_nuevos[campo] || 'No diligenciado',
        tipo: tipoCampo,
      })
    }

    // Contacto
    const camposContacto: Array<[string, string]> = [
      ['telefono', 'Teléfono principal'],
      ['telefono_alternativo', 'Teléfono alternativo'],
      ['email', 'Correo electrónico'],
      ['direccion', 'Dirección'],
      ['ciudad', 'Ciudad'],
      ['departamento', 'Departamento'],
    ]
    for (const [campo, etiqueta] of camposContacto) {
      detalles.push({
        campo,
        etiqueta,
        valorAnterior: null,
        valorNuevo: datos_nuevos[campo] || 'No diligenciado',
        tipo: 'texto',
      })
    }

    // Interés inicial (opcional)
    if (
      datos_nuevos.proyecto_interes_inicial ||
      datos_nuevos.vivienda_interes_inicial
    ) {
      detalles.push({
        campo: 'proyecto_interes_inicial',
        etiqueta: 'Proyecto de interés',
        valorAnterior: null,
        valorNuevo:
          datos_nuevos.proyecto_interes_inicial || 'Sin proyecto específico',
        tipo: 'texto',
      })
      if (datos_nuevos.vivienda_interes_inicial) {
        detalles.push({
          campo: 'vivienda_interes_inicial',
          etiqueta: 'Vivienda de interés',
          valorAnterior: null,
          valorNuevo: datos_nuevos.vivienda_interes_inicial,
          tipo: 'texto',
        })
      }
      if (datos_nuevos.notas_interes) {
        detalles.push({
          campo: 'notas_interes',
          etiqueta: 'Notas del interés',
          valorAnterior: null,
          valorNuevo: datos_nuevos.notas_interes,
          tipo: 'texto',
        })
      }
    } else {
      detalles.push({
        campo: 'interes_inicial',
        etiqueta: 'Interés en proyecto/vivienda',
        valorAnterior: null,
        valorNuevo: 'Sin interés específico registrado',
        tipo: 'texto',
      })
    }

    // Información adicional
    detalles.push({
      campo: 'notas',
      etiqueta: 'Notas y observaciones',
      valorAnterior: null,
      valorNuevo: datos_nuevos.notas || 'Sin observaciones',
      tipo: 'texto',
    })
    detalles.push({
      campo: 'estado',
      etiqueta: 'Estado inicial del cliente',
      valorAnterior: null,
      valorNuevo: datos_nuevos.estado || 'Interesado',
      tipo: 'enum',
    })

    return detalles
  }

  // === CREATE: Negociación ===
  if (tipo === 'negociacion_creada' && accion === 'CREATE' && datos_nuevos) {
    return buildCreateDetalles(
      [
        'valor_negociado',
        'descuento_aplicado',
        'tipo_descuento',
        'motivo_descuento',
        'porcentaje_descuento',
        'valor_total',
        'saldo_pendiente',
        'valor_escritura_publica',
        'estado',
        'fecha_negociacion',
        'notas',
      ],
      datos_nuevos as Record<string, unknown>
    )
  }

  // === CREATE: Abono ===
  if (tipo === 'abono_registrado' && accion === 'CREATE' && datos_nuevos) {
    return buildCreateDetalles(
      [
        'monto',
        'metodo_pago',
        'fecha_abono',
        'numero_referencia',
        'comprobante_url',
        'notas',
        'observaciones',
      ],
      datos_nuevos as Record<string, unknown>
    )
  }

  // === CREATE: Interés ===
  if (tipo === 'interes_registrado' && accion === 'CREATE' && datos_nuevos) {
    return buildCreateDetalles(
      ['presupuesto', 'tipo_vivienda', 'estado', 'observaciones', 'notas'],
      datos_nuevos as Record<string, unknown>
    )
  }

  // === CREATE: Renuncia ===
  if (tipo === 'renuncia_creada' && accion === 'CREATE' && datos_nuevos) {
    return buildCreateDetalles(
      [
        'motivo',
        'estado',
        'monto_devolucion',
        'monto_a_devolver',
        'fecha_renuncia',
        'observaciones',
      ],
      datos_nuevos as Record<string, unknown>
    )
  }

  // === CREATE: Documento ===
  if (tipo === 'documento_subido' && accion === 'CREATE' && datos_nuevos) {
    return buildCreateDetalles(
      [
        'titulo',
        'descripcion',
        'estado',
        'fecha_documento',
        'fecha_vencimiento',
        'es_importante',
        'es_documento_identidad',
        'observaciones',
      ],
      datos_nuevos as Record<string, unknown>
    )
  }

  // === UPDATE: Todas las tablas (diff de cambios_especificos) ===
  if (accion === 'UPDATE' && cambios_especificos) {
    const detalles: DetalleEvento[] = []
    for (const [campo, cambio] of Object.entries(cambios_especificos)) {
      if (CAMPOS_EXCLUIDOS.has(campo)) continue
      const { antes, despues } = cambio as { antes: unknown; despues: unknown }
      // Misma fecha con otra hora guardada (medianoche → mediodía): no cambió
      if (mismoDiaCalendario(antes, despues)) continue
      detalles.push({
        campo,
        etiqueta: ETIQUETAS[campo] ?? campo,
        valorAnterior: antes,
        valorNuevo: despues,
        tipo: detectarTipoCampo(campo),
      })
    }
    return detalles
  }

  // === UPDATE: Documento editado (lee metadata.cambios cuando cambios_especificos es null) ===
  if (
    tipo === 'documento_actualizado' &&
    accion === 'UPDATE' &&
    evento.metadata?.cambios
  ) {
    const cambiosMeta = evento.metadata.cambios as Record<
      string,
      { anterior: unknown; nuevo: unknown }
    >
    const detalles: DetalleEvento[] = []
    for (const [campo, diff] of Object.entries(cambiosMeta)) {
      if (CAMPOS_EXCLUIDOS.has(campo)) continue
      if (mismoDiaCalendario(diff.anterior, diff.nuevo)) continue
      detalles.push({
        campo,
        etiqueta: ETIQUETAS[campo] ?? campo,
        valorAnterior: diff.anterior,
        valorNuevo: diff.nuevo,
        tipo: detectarTipoCampo(campo),
      })
    }
    return detalles
  }

  // === DELETE: mostrar datos anteriores si están disponibles ===
  if (accion === 'DELETE' && datos_anteriores) {
    return buildCreateDetalles(
      Object.keys(datos_anteriores).filter(c => !CAMPOS_EXCLUIDOS.has(c)),
      datos_anteriores as Record<string, unknown>
    )
  }

  return []
}
