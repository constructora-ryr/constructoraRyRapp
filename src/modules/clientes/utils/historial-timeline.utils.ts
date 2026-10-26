/**
 * Funciones puras de la línea de tiempo del historial del cliente:
 * qué eventos se muestran, búsqueda/categoría, agrupación por día y resumen.
 */

import { formatDateForDisplay } from '@/lib/utils/date.utils'

import type {
  EventoHistorialHumanizado,
  GrupoEventosPorFecha,
} from '../types/historial.types'

/** Campos de documento que solo afectan la UI (anclar): no son historial */
const CAMPOS_UI_DOCUMENTO = new Set(['es_importante', 'anclado_at'])

/**
 * Ediciones que se explican solo por sus campos. Si todos los campos son
 * internos (p. ej. el enlace a la cédula que se guarda al subirla) no queda
 * nada que mostrar. Las de negociación quedan fuera: algunas se muestran
 * por su motivo (rebalanceo, cierre) aunque no traigan campos.
 */
const EDICIONES_SOLO_CAMPOS = new Set([
  'cliente_actualizado',
  'interes_actualizado',
  'evento_generico',
])

/** Descarta eventos técnicos que no aportan al historial visible */
export function esEventoVisible(ev: EventoHistorialHumanizado): boolean {
  const operacion = ev.metadata?.tipo_operacion as string | undefined

  if (ev.tipo === 'documento_actualizado') {
    // Reemplazo de archivo: se audita aparte
    if (operacion === 'REEMPLAZO_ARCHIVO') return false
    // Ediciones que solo anclan/desanclan
    if (operacion === 'edicion_documento') {
      const cambios = ev.metadata?.cambios as
        | Record<string, unknown>
        | undefined
      const campos = cambios ? Object.keys(cambios) : []
      if (campos.length > 0 && campos.every(c => CAMPOS_UI_DOCUMENTO.has(c)))
        return false
    }
  }

  if (
    ev.accion === 'UPDATE' &&
    EDICIONES_SOLO_CAMPOS.has(ev.tipo) &&
    !ev.detalles?.length
  ) {
    return false
  }

  // La negociación destino de un traslado ya está en el evento 'traslado_vivienda'
  if (ev.tipo === 'negociacion_traslado_interna') return false

  return true
}

/** Filtro de la UI: categoría (tabla o 'notas') + búsqueda de texto */
export function filtrarEventos(
  eventos: EventoHistorialHumanizado[],
  { categoria, busqueda }: { categoria: string; busqueda: string }
): EventoHistorialHumanizado[] {
  const termino = busqueda.trim().toLowerCase()
  return eventos.filter(e => {
    if (categoria !== 'todos' && e.tabla !== categoria) return false
    if (!termino) return true
    return [e.titulo, e.descripcion, e.usuario.email, e.usuario.nombres]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(termino)
  })
}

/** Día local YYYY-MM-DD (no UTC: un evento a las 9 p. m. es de ese día) */
export function claveDiaLocal(fecha: string | Date): string {
  const d = new Date(fecha)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** "Hoy", "Ayer" o la fecha completa */
export function etiquetaDia(clave: string, hoy = new Date()): string {
  if (clave === claveDiaLocal(hoy)) return 'Hoy'
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)
  if (clave === claveDiaLocal(ayer)) return 'Ayer'
  return formatDateForDisplay(clave)
}

/** Agrupa por día local, del más reciente al más antiguo */
export function agruparPorDia(
  eventos: EventoHistorialHumanizado[],
  hoy = new Date()
): GrupoEventosPorFecha[] {
  const grupos = new Map<string, EventoHistorialHumanizado[]>()
  for (const evento of eventos) {
    const clave = claveDiaLocal(evento.fecha)
    const lista = grupos.get(clave)
    if (lista) lista.push(evento)
    else grupos.set(clave, [evento])
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, lista]) => ({
      fecha,
      fechaFormateada: etiquetaDia(fecha, hoy),
      eventos: lista,
      total: lista.length,
    }))
}

export interface ResumenHistorial {
  total: number
  /** Últimos 7 días */
  estaSemana: number
  /** Desde el día 1 del mes actual */
  esteMes: number
  /** Eliminaciones y eventos en rojo (renuncias, anulaciones…) */
  criticos: number
  /** Fecha del evento más antiguo */
  primerEvento: string | null
}

/** `eventos` debe venir ordenado del más reciente al más antiguo */
export function calcularResumen(
  eventos: EventoHistorialHumanizado[],
  ahora = new Date()
): ResumenHistorial {
  const haceUnaSemana = new Date(ahora)
  haceUnaSemana.setDate(ahora.getDate() - 7)
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  let estaSemana = 0
  let esteMes = 0
  let criticos = 0
  for (const e of eventos) {
    const fecha = new Date(e.fecha)
    if (fecha >= haceUnaSemana) estaSemana++
    if (fecha >= inicioMes) esteMes++
    if (e.accion === 'DELETE' || e.color === 'red') criticos++
  }

  return {
    total: eventos.length,
    estaSemana,
    esteMes,
    criticos,
    primerEvento: eventos.at(-1)?.fecha ?? null,
  }
}

/** Elemento de la línea de tiempo: un evento suelto o una ráfaga agrupada */
export type ItemTimeline =
  | { tipo: 'evento'; evento: EventoHistorialHumanizado }
  | { tipo: 'rafaga'; id: string; eventos: EventoHistorialHumanizado[] }

/** Mínimo de acciones iguales seguidas para agruparlas */
export const MINIMO_RAFAGA = 3

const claveRafaga = (e: EventoHistorialHumanizado) =>
  // Las notas y los eventos ocultos siempre van sueltos (tienen acciones propias)
  e.tabla === 'notas' || e.oculto
    ? null
    : `${e.tipo}|${e.usuario.id ?? e.usuario.email}`

/**
 * Junta acciones consecutivas del mismo tipo y la misma persona (p.ej. 12
 * documentos subidos seguidos) en una sola ráfaga. `eventos` debe ser de un
 * mismo día y estar ordenado.
 */
export function agruparRafagas(
  eventos: EventoHistorialHumanizado[]
): ItemTimeline[] {
  const items: ItemTimeline[] = []
  let i = 0
  while (i < eventos.length) {
    const clave = claveRafaga(eventos[i])
    let fin = i + 1
    while (clave && fin < eventos.length && claveRafaga(eventos[fin]) === clave)
      fin++

    if (fin - i >= MINIMO_RAFAGA) {
      const grupo = eventos.slice(i, fin)
      items.push({
        tipo: 'rafaga',
        id: `rafaga-${grupo[0].id}`,
        eventos: grupo,
      })
    } else {
      for (const evento of eventos.slice(i, fin))
        items.push({ tipo: 'evento', evento })
    }
    i = fin
  }
  return items
}

/** Cuántos eventos hay por categoría (tabla o 'notas') */
export function contarPorCategoria(
  eventos: EventoHistorialHumanizado[]
): Record<string, number> {
  const conteo: Record<string, number> = { todos: eventos.length }
  for (const e of eventos) conteo[e.tabla] = (conteo[e.tabla] ?? 0) + 1
  return conteo
}
