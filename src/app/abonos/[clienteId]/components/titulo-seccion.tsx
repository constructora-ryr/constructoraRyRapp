import type { ReactNode } from 'react'

import type { LucideIcon } from 'lucide-react'

/**
 * Título de las dos secciones del detalle (Por cobrar · Pagos recibidos):
 * mismo estilo para que se lean como partes hermanas de la página.
 */
export function TituloSeccion({
  icon: Icon,
  titulo,
  detalle,
  acciones,
}: {
  icon: LucideIcon
  titulo: string
  /** A la derecha del título: conteo o total */
  detalle?: ReactNode
  /** Controles a la derecha (filtros) */
  acciones?: ReactNode
}) {
  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-2 px-1'>
      <h2 className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white'>
        <Icon className='h-4 w-4 text-violet-600 dark:text-violet-400' />
        {titulo}
      </h2>
      {detalle ? (
        <span className='text-sm text-slate-500 dark:text-slate-400'>
          {detalle}
        </span>
      ) : null}
      {acciones ? <div className='ml-auto'>{acciones}</div> : null}
    </div>
  )
}
