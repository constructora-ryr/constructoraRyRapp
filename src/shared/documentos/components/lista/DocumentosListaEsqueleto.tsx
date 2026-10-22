/**
 * Skeleton de la lista de documentos (Clientes, Proyectos, Viviendas):
 * pestañas y acciones, carpetas, filtros y tabla con el color del módulo.
 */

import {
  Hueso,
  TarjetaEsqueleto,
  ZonaEsqueleto,
} from '@/shared/components/carga'
import { type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { temaDocumentos } from '../../config/documentos-tema'

const FILAS = 6

export function DocumentosListaEsqueleto({
  moduleName,
}: {
  moduleName?: ModuleName
}) {
  const tema = temaDocumentos(moduleName)

  return (
    <ZonaEsqueleto label='Cargando documentos' className='space-y-4'>
      {/* Pestañas + acciones */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Hueso className='h-11 w-60 rounded-2xl' />
        <div className='flex gap-2'>
          <Hueso className='h-10 w-28 rounded-xl' />
          <Hueso className='h-10 w-40 rounded-xl' />
        </div>
      </div>

      {/* Carpetas */}
      <TarjetaEsqueleto className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Hueso className='h-8 w-8' />
          <Hueso className='h-4 w-24' />
        </div>
        <Hueso className='h-11 w-full rounded-xl' />
      </TarjetaEsqueleto>

      {/* Filtros */}
      <div className='flex flex-col gap-2 sm:flex-row'>
        <Hueso className='h-10 flex-1 rounded-xl' />
        <div className='flex gap-2'>
          <Hueso className='h-10 w-28 rounded-xl' />
          <Hueso className='h-10 w-44 rounded-xl' />
        </div>
      </div>

      {/* Tabla */}
      <div className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
        <div
          className={cn(
            'hidden h-11 bg-gradient-to-r opacity-40 md:block',
            tema.gradient
          )}
        />
        <div className='divide-y divide-slate-100 dark:divide-slate-700/50'>
          {Array.from({ length: FILAS }, (_, i) => (
            <div key={i} className='flex items-center gap-3 px-4 py-3.5'>
              <Hueso className='h-10 w-10 flex-shrink-0 rounded-xl' />
              <div className='min-w-0 flex-1 space-y-2'>
                {/* Anchos distintos para que no parezca una grilla rígida */}
                <Hueso
                  className={cn(
                    'h-4',
                    i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-1/2' : 'w-2/3'
                  )}
                />
                <Hueso className='h-3 w-1/3 md:hidden' />
              </div>
              <Hueso className='hidden h-6 w-32 rounded-full md:block' />
              <div className='hidden items-center gap-2 lg:flex'>
                <Hueso className='h-7 w-7 rounded-full' />
                <Hueso className='h-3 w-24' />
              </div>
              <Hueso className='hidden h-3 w-20 lg:block' />
              <Hueso className='hidden h-3 w-14 lg:block' />
            </div>
          ))}
        </div>
      </div>
    </ZonaEsqueleto>
  )
}
