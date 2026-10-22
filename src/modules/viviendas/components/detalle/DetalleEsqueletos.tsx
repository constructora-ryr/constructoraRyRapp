/**
 * Skeletons del detalle de vivienda, con la forma de cada pestaña.
 */

import {
  Hueso,
  TarjetaEsqueleto,
  ZonaEsqueleto,
} from '@/shared/components/carga'

function TarjetaFilas({
  filas,
  className,
}: {
  filas: number
  className?: string
}) {
  return (
    <TarjetaEsqueleto className={className}>
      <div className='mb-4 flex items-center gap-2.5'>
        <Hueso className='h-8 w-8 rounded-lg' />
        <Hueso className='h-4 w-28' />
      </div>
      <div className='space-y-2'>
        {Array.from({ length: filas }, (_, i) => (
          <Hueso key={i} className='h-11 w-full rounded-xl' />
        ))}
      </div>
    </TarjetaEsqueleto>
  )
}

export function InfoEsqueleto() {
  return (
    <ZonaEsqueleto label='Cargando información de la vivienda'>
      <div className='grid gap-4 lg:grid-cols-2'>
        <Hueso className='h-20 rounded-2xl lg:col-span-2' />
        <TarjetaFilas filas={4} />
        <TarjetaFilas filas={4} />
        <TarjetaFilas filas={2} className='lg:col-span-2' />
      </div>
    </ZonaEsqueleto>
  )
}

export function AbonosEsqueleto() {
  return (
    <ZonaEsqueleto label='Cargando abonos'>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {[0, 1, 2].map(i => (
            <Hueso key={i} className='h-[84px] rounded-2xl' />
          ))}
        </div>
        <TarjetaFilas filas={4} />
      </div>
    </ZonaEsqueleto>
  )
}
