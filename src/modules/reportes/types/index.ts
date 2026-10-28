export type TipoEntidadFinanciera =
  | 'Banco'
  | 'Caja de Compensación'
  | 'Cooperativa'
  | 'Gobierno'
  | 'Otro'

/** Créditos (bancos) y subsidios (cajas, cooperativas, Mi Casa Ya) */
export type CategoriaFinanciacion = 'creditos' | 'subsidios'

/** Avance del desembolso de una fuente */
export type EstadoDesembolso = 'desembolsado' | 'parcial' | 'pendiente'

export interface ClienteEnEntidad {
  fuenteId: string
  negociacionId: string
  clienteId: string
  clienteNombre: string
  clienteTipoDocumento: string
  clienteDocumento: string
  tipoFuente: string
  montoAprobado: number
  /** Lo que la entidad ya giró (fuentes_pago.monto_recibido) */
  montoRecibido: number
  /** Lo que falta por girar */
  saldoPendiente: number
  numeroReferencia: string | null
  fechaActa: string | null
  estadoNegociacion: string
  viviendaLabel: string | null
  /** Fecha del primer desembolso, si hubo */
  fechaDesembolso: string | null
  estadoDesembolso: EstadoDesembolso
}

export interface EntidadFinancieraResumen {
  id: string
  nombre: string
  tipo: TipoEntidadFinanciera
  categoria: CategoriaFinanciacion
  /** Tipo de fuente más común: da el color y el ícono de la entidad */
  tipoFuente: string
  totalClientesUnicos: number
  montoTotalAprobado: number
  totalDesembolsado: number
  totalPendiente: number
  /** Fuentes que aún no se giran completas */
  fuentesPendientes: number
  clientes: ClienteEnEntidad[]
}

export interface ResumenFinanciacion {
  montoAprobado: number
  desembolsado: number
  pendiente: number
  clientes: number
  /** Clientes con alguna fuente sin girar completa */
  clientesPendientes: number
}

export interface ReporteFinanciacionData {
  entidades: EntidadFinancieraResumen[]
  resumen: ResumenFinanciacion
}
