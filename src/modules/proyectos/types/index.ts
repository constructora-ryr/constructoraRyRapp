// Tipos para el módulo de proyectos
export interface Proyecto {
  id: string
  nombre: string
  descripcion: string
  ubicacion: string
  departamento: string
  ciudad: string
  direccion: string
  fechaInicio: string | null
  fechaFinEstimada: string | null
  presupuesto: number
  estado: EstadoProyecto
  manzanas: Manzana[]
  documentos?: Documento[]
  progreso?: number
  fechaCreacion: string
  fechaActualizacion: string
  // ✅ Sistema de archivado (soft delete)
  archivado?: boolean
  fechaArchivado?: string | null
  motivoArchivo?: string | null
}

export interface Manzana {
  id: string
  nombre: string
  totalViviendas: number
  viviendasVendidas: number
  precioBase: number
  superficieTotal: number
  proyectoId: string
  ubicacion?: string
  estado: EstadoManzana
  fechaCreacion: string
  // Real counts from viviendas table
  viviendasCreadas?: number
  viviendasDisponibles?: number
  viviendasAsignadas?: number
}

export interface Documento {
  id: string
  nombre: string
  tipo: TipoDocumento
  url: string
  tamaño: number
  fechaSubida: string
  proyectoId: string
}

export type EstadoProyecto =
  // Nuevos estados simplificados
  | 'en_proceso'
  | 'completado'
  // Estados antiguos (compatibilidad para migración)
  | 'en_planificacion'
  | 'en_construccion'
  | 'pausado'

export type EstadoManzana = 'planificada' | 'en_construccion' | 'completada'

export type TipoDocumento =
  | 'plano'
  | 'permiso'
  | 'contrato'
  | 'factura'
  | 'otro'

export type VistaProyecto = 'grid' | 'lista'

export type FiltroProyecto = {
  busqueda: string
  estado?: EstadoProyecto
  fechaDesde?: string
  fechaHasta?: string
  verArchivados?: boolean
}

// Formulario de proyecto
export interface ProyectoFormData {
  id?: string
  responsable?: string
  nombre: string
  descripcion: string
  departamento: string
  ciudad: string
  direccion: string
  fechaInicio: string | null
  fechaFinEstimada: string | null
  presupuesto: number
  estado: EstadoProyecto
  manzanas: ManzanaFormData[]
}

export interface ManzanaFormData {
  id?: string // ID de la manzana en DB (si ya existe)
  nombre: string
  totalViviendas: number
  precioBase: number
  superficieTotal: number
  ubicacion?: string
  // ✅ Campos opcionales para validación (pre-cargados por useProyectoConValidacion)
  cantidadViviendasCreadas?: number
  esEditable?: boolean
  motivoBloqueado?: string
}

// Estados de UI
export interface ProyectosState {
  proyectos: Proyecto[]
  proyectoActual?: Proyecto
  cargando: boolean
  error?: string
  filtros: FiltroProyecto
  vista: VistaProyecto
}

// Eventos y acciones
export interface ProyectosActions {
  // CRUD
  crearProyecto: (data: ProyectoFormData) => Promise<Proyecto>
  actualizarProyecto: (
    id: string,
    data: Partial<ProyectoFormData>
  ) => Promise<Proyecto>
  eliminarProyecto: (id: string) => Promise<void>
  obtenerProyecto: (id: string) => Promise<Proyecto | null>
  obtenerProyectos: (incluirArchivados?: boolean) => Promise<Proyecto[]>

  // ✅ Sistema de archivado
  archivarProyecto: (id: string, motivo?: string) => Promise<void>
  restaurarProyecto: (id: string) => Promise<void>
  eliminarProyectoDefinitivo: (id: string) => Promise<void>

  // UI
  setFiltros: (filtros: Partial<FiltroProyecto>) => void
  setVista: (vista: VistaProyecto) => void
  setProyectoActual: (proyecto?: Proyecto) => void
  limpiarError: () => void
}
