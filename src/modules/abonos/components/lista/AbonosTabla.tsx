'use client'

import { ArrowDown, ArrowUp, Calendar, Hash } from 'lucide-react'

import type {
  OrdenAbonos,
  OrdenCampo,
  PageSizeOption,
} from '@/modules/abonos/hooks/useAbonosList'
import type { AbonoConInfo } from '@/modules/abonos/hooks/useAbonosQuery'
import type { AbonoParaEditar } from '@/modules/abonos/types/editar-abono.types'

import { AbonoFila } from './AbonoFila'
import { abonosListaStyles as s } from './abonos-lista.styles'
import { AbonosPaginacion } from './AbonosPaginacion'

interface AbonosTablaProps {
  abonos: AbonoConInfo[]
  canEdit: boolean
  canAnular: boolean
  onAbonoClick: (abono: AbonoConInfo) => void
  onEditar: (abono: AbonoParaEditar) => void
  onAnular: (abono: AbonoConInfo) => void
  // Orden
  orden: OrdenAbonos
  toggleOrden: (campo: OrdenCampo) => void
  // Paginación
  paginaActual: number
  totalPaginas: number
  totalFiltrado: number
  pageSize: PageSizeOption
  setPaginaActual: (p: number | ((prev: number) => number)) => void
  setPageSize: (size: PageSizeOption) => void
}

function IconoOrden({
  activo,
  direccion,
}: {
  activo: boolean
  direccion: 'asc' | 'desc'
}) {
  if (!activo) return null
  return direccion === 'asc' ? (
    <ArrowUp className='h-3 w-3' />
  ) : (
    <ArrowDown className='h-3 w-3' />
  )
}

export function AbonosTabla({
  abonos,
  canEdit,
  canAnular,
  onAbonoClick,
  onEditar,
  onAnular,
  orden,
  toggleOrden,
  paginaActual,
  totalPaginas,
  totalFiltrado,
  pageSize,
  setPaginaActual,
  setPageSize,
}: AbonosTablaProps) {
  return (
    <div className={s.tabla.wrapper}>
      <table className='w-full text-sm'>
        <thead>
          <tr className={s.tabla.thead}>
            <th className={`w-36 ${s.tabla.th}`}>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => toggleOrden('recibo')}
                  className='inline-flex items-center gap-1 transition-colors hover:text-violet-600 dark:hover:text-violet-400'
                  title='Ordenar por número de recibo'
                >
                  <Hash className='h-3 w-3' />
                  Recibo
                  <IconoOrden
                    activo={orden.campo === 'recibo'}
                    direccion={orden.direccion}
                  />
                </button>
                <button
                  onClick={() => toggleOrden('fecha')}
                  className='inline-flex items-center gap-1 text-gray-400 transition-colors hover:text-violet-600 dark:text-gray-500 dark:hover:text-violet-400'
                  title='Ordenar por fecha'
                >
                  <Calendar className='h-3 w-3' />
                  <IconoOrden
                    activo={orden.campo === 'fecha'}
                    direccion={orden.direccion}
                  />
                </button>
              </div>
            </th>
            <th className={s.tabla.th}>Cliente</th>
            <th className={s.tabla.th}>Vivienda</th>
            <th className={`w-36 ${s.tabla.th}`}>Método</th>
            <th className={`w-40 ${s.tabla.thRight}`}>Monto</th>
            {canEdit || canAnular ? <th className='w-20 px-4 py-3' /> : null}
          </tr>
        </thead>
        <tbody className={s.tabla.tbody}>
          {abonos.map(abono => (
            <AbonoFila
              key={abono.id}
              abono={abono}
              canEdit={canEdit}
              canAnular={canAnular}
              onAbonoClick={onAbonoClick}
              onEditar={onEditar}
              onAnular={onAnular}
            />
          ))}
        </tbody>
      </table>

      <AbonosPaginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalFiltrado={totalFiltrado}
        pageSize={pageSize}
        setPaginaActual={setPaginaActual}
        setPageSize={setPageSize}
      />
    </div>
  )
}
