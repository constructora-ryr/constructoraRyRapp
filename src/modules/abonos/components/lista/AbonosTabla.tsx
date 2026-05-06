'use client'

import type { PageSizeOption } from '@/modules/abonos/hooks/useAbonosList'
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
  // Paginación
  paginaActual: number
  totalPaginas: number
  totalFiltrado: number
  pageSize: PageSizeOption
  setPaginaActual: (p: number | ((prev: number) => number)) => void
  setPageSize: (size: PageSizeOption) => void
}

export function AbonosTabla({
  abonos,
  canEdit,
  canAnular,
  onAbonoClick,
  onEditar,
  onAnular,
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
            <th className={`w-36 ${s.tabla.th}`}>Recibo</th>
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
