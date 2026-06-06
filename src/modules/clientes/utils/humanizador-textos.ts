/**
 * Genera el título y descripción legibles para cada tipo de evento.
 */

import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { LABELS_TIPO_DESCUENTO } from '@/modules/clientes/constants/descuento.constants'

import type {
  EventoHistorialCliente,
  TipoEventoHistorial,
} from '../types/historial.types'

import { CAMPOS_EXCLUIDOS, ETIQUETAS } from './humanizador-constantes'

export function generarTextos(
  evento: EventoHistorialCliente,
  tipo: TipoEventoHistorial
): { titulo: string; descripcion: string } {
  const { datos_nuevos, datos_anteriores, cambios_especificos, metadata } =
    evento

  switch (tipo) {
    // ========== CLIENTE ==========
    case 'cliente_creado': {
      const nombre = [datos_nuevos?.nombres, datos_nuevos?.apellidos]
        .filter(Boolean)
        .join(' ')
        .trim()
      return {
        titulo: 'Nuevo cliente',
        descripcion: nombre
          ? `${nombre} registrado en el sistema`
          : 'Cliente registrado en el sistema',
      }
    }

    case 'cliente_actualizado': {
      const camposVisibles = cambios_especificos
        ? Object.keys(cambios_especificos).filter(
            campo => !CAMPOS_EXCLUIDOS.has(campo)
          )
        : []
      const descripcionCampos =
        camposVisibles.length > 0
          ? camposVisibles.map(c => ETIQUETAS[c] ?? c).join(', ')
          : 'información del perfil'
      return {
        titulo: 'Datos del cliente actualizados',
        descripcion: `Campos modificados: ${descripcionCampos}`,
      }
    }

    case 'cliente_estado_cambiado': {
      const estadoAnterior = cambios_especificos?.estado?.antes || 'desconocido'
      const estadoNuevo = cambios_especificos?.estado?.despues || 'desconocido'
      return {
        titulo: 'Cambio de estado',
        descripcion: `De "${estadoAnterior}" a "${estadoNuevo}"`,
      }
    }

    case 'cliente_eliminado': {
      const nombre = [datos_anteriores?.nombres, datos_anteriores?.apellidos]
        .filter(Boolean)
        .join(' ')
        .trim()
      return {
        titulo: 'Cliente eliminado',
        descripcion: nombre
          ? `Se eliminó el registro de ${nombre}`
          : 'Se eliminó el registro del cliente',
      }
    }

    // ========== NEGOCIACIÓN ==========
    case 'traslado_vivienda': {
      const origenMza = metadata?.vivienda_origen_manzana
        ? `Mza. ${metadata.vivienda_origen_manzana}`
        : null
      const origenNum = metadata?.vivienda_origen_numero
        ? `Casa ${metadata.vivienda_origen_numero}`
        : null
      const origenLabel =
        [origenMza, origenNum].filter(Boolean).join(' ') || null

      const destinoMza = metadata?.vivienda_destino_manzana
        ? `Mza. ${metadata.vivienda_destino_manzana}`
        : null
      const destinoNum = metadata?.vivienda_destino_numero
        ? `Casa ${metadata.vivienda_destino_numero}`
        : null
      const destinoLabel =
        [destinoMza, destinoNum].filter(Boolean).join(' ') || null

      const flecha =
        origenLabel && destinoLabel ? `${origenLabel} → ${destinoLabel}` : null
      const proyOrigenStr = metadata?.vivienda_origen_proyecto
        ? String(metadata.vivienda_origen_proyecto)
        : null
      const proyDestinoStr = metadata?.vivienda_destino_proyecto
        ? String(metadata.vivienda_destino_proyecto)
        : null
      const proyInfo =
        proyOrigenStr === proyDestinoStr
          ? proyDestinoStr
          : [proyOrigenStr, proyDestinoStr].filter(Boolean).join(' → ')
      return {
        titulo: 'Traslado de vivienda',
        descripcion:
          [flecha, proyInfo].filter(Boolean).join(' · ') ||
          'Cambio de vivienda registrado',
      }
    }

    case 'negociacion_traslado_interna':
      // Este tipo se filtra en la UI — nunca debería llegar al renderer
      return {
        titulo: 'Nueva negociación (traslado)',
        descripcion: 'Parte de un traslado de vivienda',
      }

    case 'negociacion_cerrada_traslado': {
      const estadoAnterior =
        (cambios_especificos?.estado as { antes?: unknown } | undefined)
          ?.antes ?? 'Activa'
      const motivo = cambios_especificos?.motivo_traslado as
        | { despues?: unknown }
        | undefined
      const motivoStr = motivo?.despues ? String(motivo.despues) : null
      return {
        titulo: 'Negociación cerrada por traslado',
        descripcion: motivoStr
          ? `${String(estadoAnterior)} → Cerrada por Traslado · ${motivoStr}`
          : `${String(estadoAnterior)} → Cerrada por Traslado`,
      }
    }

    case 'negociacion_creada': {
      const manzanaParte = metadata?.manzana_nombre
        ? `Mza. ${metadata.manzana_nombre}`
        : null
      const casaParte = metadata?.vivienda_numero
        ? `Casa ${metadata.vivienda_numero}`
        : (metadata?.vivienda_nombre ?? null)
      const viviendaLabel =
        [manzanaParte, casaParte].filter(Boolean).join(' · ') || null
      const proyectoParte = metadata?.proyecto_nombre
        ? String(metadata.proyecto_nombre)
        : null
      const partes = [
        viviendaLabel ? `Vivienda: ${viviendaLabel}` : null,
        proyectoParte ? `Proyecto: ${proyectoParte}` : null,
      ].filter(Boolean)
      return {
        titulo: 'Nueva negociación',
        descripcion:
          partes.length > 0
            ? `Vivienda asignada: ${[viviendaLabel, proyectoParte].filter(Boolean).join(' · ')}`
            : 'Vivienda asignada al cliente',
      }
    }

    case 'negociacion_actualizada': {
      // Rebalanceo del plan financiero
      if (metadata?.accion_tipo === 'rebalanceo_plan_financiero') {
        const motivo = metadata.motivo ? String(metadata.motivo) : null
        return {
          titulo: 'Cierre financiero ajustado',
          descripcion: motivo
            ? `Motivo: ${motivo}`
            : 'Cierre financiero ajustado en la negociación',
        }
      }
      // Cambio de descuento (aplicar o eliminar)
      // ✅ USO cambios_especificos (qué realmente cambió) como señal principal,
      //    NO datos_nuevos (estado actual de la fila), para evitar falsos
      //    positivos cuando otros triggers actualizan la fila después de
      //    cambiar el descuento y datos_nuevos.descuento_aplicado = 0 en todos.
      const cambioDescuento = cambios_especificos?.descuento_aplicado as
        | {
            antes?: unknown
            despues?: unknown
            anterior?: unknown
            nuevo?: unknown
          }
        | undefined
      const tieneCambioDescuento = Boolean(cambioDescuento)
      if (tieneCambioDescuento) {
        // Soporta formato del trigger {antes/despues} y el formato legacy {anterior/nuevo}
        const montoNuevo = (cambioDescuento?.despues ??
          cambioDescuento?.nuevo) as number | null | undefined
        // montoNuevo === 0 o null → descuento eliminado
        if (!montoNuevo) {
          return {
            titulo: 'Descuento eliminado',
            descripcion: 'El descuento fue removido de la negociación',
          }
        }
        const tipo = datos_nuevos?.tipo_descuento as string | undefined
        const tipoLabel = tipo
          ? (LABELS_TIPO_DESCUENTO[
              tipo as keyof typeof LABELS_TIPO_DESCUENTO
            ] ?? tipo)
          : null
        const montoStr = `$${montoNuevo.toLocaleString('es-CO')}`
        const partes = ['Descuento aplicado', tipoLabel, montoStr].filter(
          Boolean
        )
        return {
          titulo: 'Descuento aplicado',
          descripcion: partes.join(' · '),
        }
      }
      // Cambio genérico de campos
      const camposVisibles = cambios_especificos
        ? Object.keys(cambios_especificos).filter(
            campo => !CAMPOS_EXCLUIDOS.has(campo)
          )
        : []
      return {
        titulo: 'Negociación actualizada',
        descripcion:
          camposVisibles.length > 0
            ? `Campos modificados: ${camposVisibles.map(c => ETIQUETAS[c] ?? c).join(', ')}`
            : 'Términos de la negociación modificados',
      }
    }

    case 'negociacion_estado_cambiada': {
      const negEstadoAnterior =
        cambios_especificos?.estado?.antes || 'desconocido'
      const negEstadoNuevo =
        cambios_especificos?.estado?.despues || 'desconocido'
      return {
        titulo: 'Cambio en negociación',
        descripcion: `Estado: "${negEstadoAnterior}" → "${negEstadoNuevo}"`,
      }
    }

    case 'negociacion_completada':
      return {
        titulo: 'Negociación completada',
        descripcion: 'La negociación se finalizó exitosamente',
      }

    // ========== ABONO ==========
    case 'abono_registrado': {
      const montoVal =
        (metadata?.abono_monto as number | undefined) ??
        (datos_nuevos?.monto as number | undefined)
      const montoStr = montoVal ? `$${montoVal.toLocaleString('es-CO')}` : 'N/A'
      const consecutivo = metadata?.abono_numero_recibo
        ? formatearNumeroRecibo(String(metadata.abono_numero_recibo))
        : null
      const fuente = metadata?.fuente_tipo ? String(metadata.fuente_tipo) : null
      const metodo = metadata?.abono_metodo_pago
        ? String(metadata.abono_metodo_pago)
        : null
      const fechaRaw = metadata?.abono_fecha_abono
        ? String(metadata.abono_fecha_abono)
        : (datos_nuevos?.fecha_abono as string | undefined)
      const fechaStr = fechaRaw
        ? new Date(fechaRaw).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : null
      const partes = [
        consecutivo ? `Recibo: ${consecutivo}` : null,
        fechaStr ? `Fecha: ${fechaStr}` : null,
        `Valor: ${montoStr}`,
        fuente ? `Fuente: ${fuente}` : null,
        metodo ? `Método: ${metodo}` : null,
      ].filter(Boolean)
      return {
        titulo: 'Nuevo abono',
        descripcion: partes.join(' · '),
      }
    }

    case 'abono_editado': {
      const camposEditados = metadata?.campos_editados as string[] | undefined
      const motivo = metadata?.motivo_edicion
        ? String(metadata.motivo_edicion)
        : null
      const numeroRecibo = metadata?.abono_numero_recibo
        ? formatearNumeroRecibo(String(metadata.abono_numero_recibo))
        : null
      const partes = [
        numeroRecibo ? `Recibo: ${numeroRecibo}` : null,
        camposEditados?.length
          ? `Campos: ${camposEditados.join(', ')}`
          : 'Datos del abono modificados',
        motivo ? `Motivo: ${motivo}` : null,
      ].filter(Boolean)
      return {
        titulo: 'Abono editado',
        descripcion: partes.join(' · '),
      }
    }

    case 'abono_anulado': {
      const montoVal =
        (metadata?.abono_monto as number | undefined) ??
        (datos_anteriores?.monto as number | undefined)
      const montoStr = montoVal ? `$${montoVal.toLocaleString('es-CO')}` : 'N/A'
      const consecutivo = metadata?.abono_numero_recibo
        ? formatearNumeroRecibo(String(metadata.abono_numero_recibo))
        : null
      const motivo = metadata?.motivo_categoria
        ? String(metadata.motivo_categoria)
        : null
      const partes = [
        consecutivo ? `Recibo: ${consecutivo}` : null,
        `Valor: ${montoStr}`,
        motivo ? `Motivo: ${motivo}` : null,
      ].filter(Boolean)
      return {
        titulo: 'Abono anulado',
        descripcion: partes.join(' · '),
      }
    }

    // ========== RENUNCIA ==========
    case 'renuncia_creada': {
      const manzanaParte = metadata?.manzana_nombre
        ? `Mza. ${metadata.manzana_nombre}`
        : null
      const casaParte = metadata?.vivienda_numero
        ? `Casa ${metadata.vivienda_numero}`
        : null
      const viviendaLabel =
        [manzanaParte, casaParte].filter(Boolean).join(' · ') || null
      const proyectoParte = metadata?.proyecto_nombre
        ? String(metadata.proyecto_nombre)
        : null
      const montoDevolucion = metadata?.monto_a_devolver as
        | number
        | null
        | undefined
      const requiereDevolucion = metadata?.requiere_devolucion as
        | boolean
        | undefined
      const devolucionStr =
        requiereDevolucion === false
          ? 'Sin devolución pendiente'
          : montoDevolucion
            ? `Devolución pendiente: $${Number(montoDevolucion).toLocaleString('es-CO')}`
            : null
      const partes = [viviendaLabel, proyectoParte, devolucionStr].filter(
        Boolean
      )
      return {
        titulo:
          requiereDevolucion === false
            ? 'Renuncia sin devolución'
            : 'Nueva renuncia',
        descripcion:
          partes.length > 0
            ? partes.join(' · ')
            : 'Renuncia registrada a la negociación',
      }
    }

    case 'renuncia_aprobada':
      return {
        titulo: 'Renuncia aprobada',
        descripcion: 'La solicitud de renuncia fue aprobada',
      }

    case 'renuncia_rechazada':
      return {
        titulo: 'Renuncia rechazada',
        descripcion: 'La solicitud de renuncia fue rechazada',
      }

    case 'renuncia_devolucion_procesada': {
      const manzanaParte2 = metadata?.manzana_nombre
        ? `Mza. ${metadata.manzana_nombre}`
        : null
      const casaParte2 = metadata?.vivienda_numero
        ? `Casa ${metadata.vivienda_numero}`
        : null
      const viviendaLabel2 =
        [manzanaParte2, casaParte2].filter(Boolean).join(' · ') || null
      const proyecto2 = metadata?.proyecto_nombre
        ? String(metadata.proyecto_nombre)
        : null
      const monto2 = metadata?.monto_devuelto as number | null | undefined
      const montoStr2 = monto2
        ? `$${Number(monto2).toLocaleString('es-CO')} devueltos`
        : null
      const metodo2 = metadata?.metodo_devolucion
        ? String(metadata.metodo_devolucion)
        : null
      const partes2 = [viviendaLabel2, proyecto2, montoStr2, metodo2].filter(
        Boolean
      )
      return {
        titulo: 'Devolución realizada',
        descripcion:
          partes2.length > 0
            ? `Renuncia cerrada · ${partes2.join(' · ')}`
            : 'Renuncia cerrada · Devolución procesada exitosamente',
      }
    }

    // ========== INTERÉS ==========
    case 'interes_registrado': {
      const proyectoNombre = metadata?.proyecto_nombre || 'N/A'
      return {
        titulo: 'Nuevo interés',
        descripcion: `Interés en proyecto "${proyectoNombre}"`,
      }
    }

    case 'interes_actualizado':
      return {
        titulo: 'Interés actualizado',
        descripcion: 'Registro de interés del cliente modificado',
      }

    case 'interes_descartado':
      return {
        titulo: 'Interés descartado',
        descripcion: 'El cliente descartó su interés en el proyecto',
      }

    // ========== DOCUMENTO ==========
    case 'documento_subido': {
      const nombreDoc = datos_nuevos?.titulo || 'documento'
      return {
        titulo: 'Documento cargado',
        descripcion: `"${nombreDoc}"`,
      }
    }

    case 'documento_actualizado': {
      const tipoOp = metadata?.tipo_operacion as string | undefined
      const docTitulo =
        (metadata?.titulo as string | undefined) ??
        (datos_anteriores?.titulo as string | undefined) ??
        'documento'
      if (tipoOp === 'ARCHIVAR_DOCUMENTO') {
        return {
          titulo: 'Documento archivado',
          descripcion: `"${docTitulo}" movido al archivo`,
        }
      }
      if (tipoOp === 'RESTAURAR_DOCUMENTO_ARCHIVADO') {
        return {
          titulo: 'Documento restaurado',
          descripcion: `"${docTitulo}" restaurado del archivo`,
        }
      }
      if (tipoOp === 'ELIMINAR_DOCUMENTO_SOFTDELETE') {
        return {
          titulo: 'Documento eliminado',
          descripcion: `"${docTitulo}"`,
        }
      }
      if (tipoOp === 'NUEVA_VERSION_DOCUMENTO') {
        const versionNueva = metadata?.version_nueva as number | undefined
        const sufijo = versionNueva ? ` v${versionNueva}` : ''
        return {
          titulo: 'Nueva versión cargada',
          descripcion: `"${docTitulo}"${sufijo}`,
        }
      }
      if (tipoOp === 'REEMPLAZO_ARCHIVO') {
        return {
          titulo: 'Archivo reemplazado',
          descripcion: `Archivo de "${docTitulo}" reemplazado`,
        }
      }
      const camposActualizados = metadata?.campos_actualizados as
        | string[]
        | undefined
      const resumen =
        camposActualizados && camposActualizados.length > 0
          ? camposActualizados.map(c => ETIQUETAS[c] ?? c).join(', ')
          : 'campos'
      return {
        titulo: 'Documento editado',
        descripcion: `"${docTitulo}" · Campos: ${resumen}`,
      }
    }

    case 'documento_eliminado': {
      const docEliminado =
        (metadata?.titulo as string | undefined) ??
        datos_anteriores?.titulo ??
        'documento'
      return {
        titulo: 'Documento eliminado',
        descripcion: `"${docEliminado}"`,
      }
    }

    // ========== GENÉRICO ==========
    default:
      return {
        titulo: 'Evento registrado',
        descripcion: `Acción: ${evento.accion} · Tabla: ${evento.tabla}`,
      }
  }
}
