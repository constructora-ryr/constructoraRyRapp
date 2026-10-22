/**
 * Los cuatro linderos con su insignia de color. Lo usan el formulario
 * (crear/editar) y el detalle de la vivienda.
 */

export type CampoLindero =
  | 'lindero_norte'
  | 'lindero_sur'
  | 'lindero_oriente'
  | 'lindero_occidente'

export const LINDEROS: {
  campo: CampoLindero
  nombre: string
  letra: string
  color: string
  ejemplo: string
}[] = [
  {
    campo: 'lindero_norte',
    nombre: 'Norte',
    letra: 'N',
    color: 'from-sky-500 to-blue-600',
    ejemplo: 'En 6,00 m con la Calle 12 # 3-45',
  },
  {
    campo: 'lindero_sur',
    nombre: 'Sur',
    letra: 'S',
    color: 'from-rose-500 to-red-600',
    ejemplo: 'En 6,00 m con el lote 45 de la Mz. B',
  },
  {
    campo: 'lindero_oriente',
    nombre: 'Oriente',
    letra: 'O',
    color: 'from-amber-500 to-orange-600',
    ejemplo: 'En 11,02 m con la casa 8',
  },
  {
    campo: 'lindero_occidente',
    nombre: 'Occidente',
    letra: 'Occ',
    color: 'from-violet-500 to-purple-600',
    ejemplo: 'En 11,02 m con la casa 10',
  },
]
