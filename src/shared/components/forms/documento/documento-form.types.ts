export interface CategoriaDocumentoBase {
  id: string
  nombre: string
  descripcion?: string | null
  /** Nombre ("red") o hex ("#8B5CF6") */
  color?: string
  icono?: string
}
