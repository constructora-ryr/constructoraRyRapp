import type { ReactNode } from 'react'

/**
 * Barra de la lista: pestañas de estado arriba y búsqueda / filtros abajo,
 * en una sola tarjeta que se lee como parte de la tabla que sigue.
 */
export function PanelFiltros({
  pestanas,
  children,
}: {
  /** EstadoFiltroTabs */
  pestanas?: ReactNode
  /** ListSearchToolbar u otros filtros */
  children: ReactNode
}) {
  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
      {pestanas ? (
        <div className='border-b border-slate-200/80 dark:border-slate-700/60'>
          {pestanas}
        </div>
      ) : null}
      <div className='p-3'>{children}</div>
    </div>
  )
}
