/**
 * Qué renderer muestra el detalle de cada tipo de evento del historial.
 * Los tipos sin renderer propio usan CambioGenericoRenderer (antes → ahora).
 */

import type { ComponentType } from 'react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { AbonoEditadoRenderer } from './AbonoEditadoRenderer'
import { AbonoRegistradoRenderer } from './AbonoRegistradoRenderer'
import { CambioGenericoRenderer } from './CambioGenericoRenderer'
import { ClienteCreadoRenderer } from './ClienteCreadoRenderer'
import { DevolucionRenderer } from './DevolucionRenderer'
import { DocumentoRenderer } from './DocumentoRenderer'
import { NegociacionActualizadaRenderer } from './NegociacionActualizadaRenderer'
import { NegociacionCreadaRenderer } from './NegociacionCreadaRenderer'
import { NotaManualRenderer } from './NotaManualRenderer'
import { RenunciaRenderer } from './RenunciaRenderer'
import { TrasladoViviendaRenderer } from './TrasladoViviendaRenderer'

type Renderer = ComponentType<{ evento: EventoHistorialHumanizado }>

const RENDERERS: Partial<Record<string, Renderer>> = {
  cliente_creado: ClienteCreadoRenderer,

  negociacion_creada: NegociacionCreadaRenderer,
  negociacion_actualizada: NegociacionActualizadaRenderer,
  traslado_vivienda: TrasladoViviendaRenderer,

  abono_registrado: AbonoRegistradoRenderer,
  abono_anulado: AbonoRegistradoRenderer,
  abono_editado: AbonoEditadoRenderer,

  renuncia_creada: RenunciaRenderer,
  renuncia_aprobada: RenunciaRenderer,
  renuncia_rechazada: RenunciaRenderer,
  renuncia_devolucion_procesada: DevolucionRenderer,
  excedente_devolucion_procesada: DevolucionRenderer,

  documento_subido: DocumentoRenderer,
  documento_actualizado: DocumentoRenderer,
  documento_eliminado: DocumentoRenderer,

  nota_manual: NotaManualRenderer,
}

export function getEventoRenderer(tipo: string): Renderer {
  return RENDERERS[tipo] ?? CambioGenericoRenderer
}
