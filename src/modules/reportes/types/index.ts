export type TipoEntidadFinanciera =
  | 'Banco'
  | 'Caja de Compensación'
  | 'Cooperativa'
  | 'Otro'

// ── Fila plana que devuelve el servicio ─────────────────────────────────────

export interface FuentePagoConEntidadRow {
  fuenteId: string
  negociacionId: string
  clienteId: string
  clienteNombre: string
  clienteTipoDocumento: string
  clienteDocumento: string
  tipoFuente: string
  montoAprobado: number
  numeroReferencia: string | null
  fechaActa: string | null
  estadoNegociacion: string
  entidadId: string
  entidadNombre: string
  entidadTipo: TipoEntidadFinanciera
  entidadCodigo: string
  viviendaLabel: string | null
}

// ── Agrupación por entidad (resultado final del hook) ───────────────────────

export interface ClienteEnEntidad {
  negociacionId: string
  clienteId: string
  clienteNombre: string
  clienteTipoDocumento: string
  clienteDocumento: string
  tipoFuente: string
  montoAprobado: number
  numeroReferencia: string | null
  fechaActa: string | null
  estadoNegociacion: string
  viviendaLabel: string | null
}

export interface EntidadFinancieraResumen {
  id: string
  nombre: string
  tipo: TipoEntidadFinanciera
  codigo: string
  totalNegociaciones: number
  totalClientesUnicos: number
  montoTotalAprobado: number
  porcentajeDelTotal: number
  clientes: ClienteEnEntidad[]
}

export interface ReporteFinanciacionData {
  entidades: EntidadFinancieraResumen[]
  totalFuentesConEntidad: number
  montoTotalAprobado: number
  totalClientesFinanciados: number
}
