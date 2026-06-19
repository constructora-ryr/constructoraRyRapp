/**
 * Humanizador de Eventos de Historial � Orquestador
 *
 * Convierte eventos raw de audit_log en mensajes legibles para usuarios.
 * La l�gica est� distribuida en subm�dulos especializados:
 *
 *   humanizador-constantes.ts  ? CAMPOS_EXCLUIDOS, ETIQUETAS
 *   humanizador-tipos.ts       ? detectarTipoEvento, detectarTipoCampo
 *   humanizador-textos.ts      ? generarTextos
 *   humanizador-iconos.ts      ? obtenerIcono, obtenerColor
 *   humanizador-detalles.ts    ? extraerDetalles
 */
import type {
  EventoHistorialCliente,
  EventoHistorialHumanizado,
} from '../types/historial.types'

import { extraerDetalles } from './humanizador-detalles'
import { obtenerColor, obtenerIcono } from './humanizador-iconos'
import { generarTextos } from './humanizador-textos'
import { detectarTipoEvento } from './humanizador-tipos'

/** Convierte un evento raw de audit_log en informaci�n legible para UI. */
export function humanizarEvento(
  evento: EventoHistorialCliente
): EventoHistorialHumanizado {
  const tipo = detectarTipoEvento(evento)
  const { titulo, descripcion } = generarTextos(evento, tipo)
  const icono = obtenerIcono(tipo)
  const color = obtenerColor(tipo)
  const detalles = extraerDetalles(evento, tipo)

  return {
    id: evento.id,
    tipo,
    accion: evento.accion,
    tabla: evento.tabla,
    titulo,
    descripcion,
    fecha: evento.fecha_evento,
    usuario: {
      id: evento.metadata?.usuario_id as string | undefined,
      email: evento.usuario_email,
      nombres: evento.usuario_nombres,
      rol: evento.usuario_rol,
    },
    icono,
    color,
    detalles: detalles.length > 0 ? detalles : undefined,
    metadata: evento.metadata,
    datosAnteriores: evento.datos_anteriores,
    datosNuevos: evento.datos_nuevos,
    modulo: evento.modulo ?? undefined,
    oculto: evento.oculto ?? false,
  }
}

/** Humaniza un array de eventos. �nico export consumido externamente. */
export function humanizarEventos(
  eventos: EventoHistorialCliente[]
): EventoHistorialHumanizado[] {
  return eventos.map(humanizarEvento)
}
