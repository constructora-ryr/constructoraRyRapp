/**
 * Renderer por defecto: lista de cambios antes → ahora del evento.
 * Lo usan cliente actualizado, cambios de estado, intereses y cualquier
 * tipo sin renderer propio.
 */

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { ListaCambios } from './piezas'

export function CambioGenericoRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  return <ListaCambios detalles={evento.detalles ?? []} />
}
