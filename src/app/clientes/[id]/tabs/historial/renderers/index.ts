/**
 * Factory de renderers para el Historial de Cliente
 * Mapea TipoEventoHistorial → componente de renderer específico
 */

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { AbonoEditadoRenderer } from './AbonoEditadoRenderer'
import { AbonoRegistradoRenderer } from './AbonoRegistradoRenderer'
import { CambioGenericoRenderer } from './CambioGenericoRenderer'
import { ClienteActualizadoRenderer } from './ClienteActualizadoRenderer'
import { ClienteCreadoRenderer } from './ClienteCreadoRenderer'
import { DevolucionProcesadaRenderer } from './DevolucionProcesadaRenderer'
import { DocumentoRenderer } from './DocumentoRenderer'
import { NegociacionActualizadaRenderer } from './NegociacionActualizadaRenderer'
import { NegociacionCreadaRenderer } from './NegociacionCreadaRenderer'
import { NotaManualRenderer } from './NotaManualRenderer'
import { RenunciaRenderer } from './RenunciaRenderer'
import { TrasladoViviendaRenderer } from './TrasladoViviendaRenderer'

type RendererComponent = React.ComponentType<{
  evento: EventoHistorialHumanizado
}>

const RENDERERS: Partial<Record<string, RendererComponent>> = {
  // Cliente
  cliente_creado: ClienteCreadoRenderer,
  cliente_actualizado: ClienteActualizadoRenderer,
  cliente_estado_cambiado: ClienteActualizadoRenderer,

  // Negociación
  negociacion_creada: NegociacionCreadaRenderer,
  traslado_vivienda: TrasladoViviendaRenderer,
  negociacion_cerrada_traslado: CambioGenericoRenderer,
  negociacion_actualizada: NegociacionActualizadaRenderer,
  negociacion_estado_cambiada: CambioGenericoRenderer,
  negociacion_completada: CambioGenericoRenderer,

  // Abono
  abono_registrado: AbonoRegistradoRenderer,
  abono_editado: AbonoEditadoRenderer,
  abono_anulado: AbonoRegistradoRenderer,

  // Renuncia
  renuncia_creada: RenunciaRenderer,
  renuncia_aprobada: RenunciaRenderer,
  renuncia_rechazada: RenunciaRenderer,
  renuncia_devolucion_procesada: DevolucionProcesadaRenderer,

  // Documentos
  documento_subido: DocumentoRenderer,
  documento_actualizado: DocumentoRenderer,
  documento_eliminado: DocumentoRenderer,

  // Interés y genérico
  interes_registrado: CambioGenericoRenderer,
  interes_actualizado: CambioGenericoRenderer,

  // Notas manuales
  nota_manual: NotaManualRenderer,
}

export function getEventoRenderer(tipo: string): RendererComponent {
  return RENDERERS[tipo] ?? CambioGenericoRenderer
}

export {
  AbonoRegistradoRenderer,
  CambioGenericoRenderer,
  ClienteActualizadoRenderer,
  ClienteCreadoRenderer,
  DevolucionProcesadaRenderer,
  DocumentoRenderer,
  NegociacionActualizadaRenderer,
  NegociacionCreadaRenderer,
  RenunciaRenderer,
  TrasladoViviendaRenderer,
}
