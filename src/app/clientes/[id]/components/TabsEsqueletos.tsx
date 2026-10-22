/**
 * Skeletons de las pestañas del detalle de cliente. Se usan tanto mientras
 * llega el código de la pestaña (dynamic import) como mientras llegan sus
 * datos, para que la transición sea continua: skeleton → contenido.
 */

import {
  Hueso,
  TarjetaEsqueleto,
  ZonaEsqueleto,
} from '@/shared/components/carga'

/** Encabezado de tarjeta: ícono de color + título y subtítulo */
function EncabezadoTarjeta() {
  return (
    <div className='flex items-center gap-3'>
      <Hueso className='h-10 w-10 flex-shrink-0 rounded-xl' />
      <div className='flex-1 space-y-2'>
        <Hueso className='h-4 w-40' />
        <Hueso className='h-3 w-56 max-w-full' />
      </div>
    </div>
  )
}

export function InteresesEsqueleto() {
  return (
    <ZonaEsqueleto label='Cargando intereses' className='space-y-4'>
      <div className='grid grid-cols-3 gap-3'>
        {[0, 1, 2].map(i => (
          <Hueso key={i} className='h-20 rounded-2xl' />
        ))}
      </div>
      <div className='flex justify-end'>
        <Hueso className='h-10 w-44 rounded-xl' />
      </div>
      <div className='grid gap-4 lg:grid-cols-2'>
        {[0, 1].map(i => (
          <TarjetaEsqueleto key={i} className='space-y-4'>
            <EncabezadoTarjeta />
            <div className='grid grid-cols-2 gap-3'>
              <Hueso className='h-14 rounded-xl' />
              <Hueso className='h-14 rounded-xl' />
            </div>
            <Hueso className='h-9 w-full rounded-xl' />
          </TarjetaEsqueleto>
        ))}
      </div>
    </ZonaEsqueleto>
  )
}

export function NegociacionEsqueleto() {
  return (
    <ZonaEsqueleto label='Cargando negociación' className='space-y-4'>
      {/* Resumen: encabezado + KPIs */}
      <TarjetaEsqueleto className='space-y-5'>
        <EncabezadoTarjeta />
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
          {[0, 1, 2, 3].map(i => (
            <Hueso key={i} className='h-20 rounded-xl' />
          ))}
        </div>
        <Hueso className='h-2.5 w-full rounded-full' />
      </TarjetaEsqueleto>

      {/* Plan de pagos: fuentes */}
      <TarjetaEsqueleto className='space-y-4'>
        <EncabezadoTarjeta />
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {[0, 1, 2].map(i => (
            <Hueso key={i} className='h-32 rounded-xl' />
          ))}
        </div>
      </TarjetaEsqueleto>

      {/* Abonos recibidos */}
      <TarjetaEsqueleto className='space-y-3'>
        <EncabezadoTarjeta />
        {[0, 1, 2].map(i => (
          <div key={i} className='flex items-center gap-3'>
            <Hueso className='h-9 w-9 rounded-lg' />
            <Hueso className='h-4 flex-1' />
            <Hueso className='h-4 w-24' />
          </div>
        ))}
      </TarjetaEsqueleto>
    </ZonaEsqueleto>
  )
}

export function HistorialEsqueleto() {
  return (
    <ZonaEsqueleto label='Cargando historial' className='space-y-4 py-4'>
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        {[0, 1, 2, 3].map(i => (
          <Hueso key={i} className='h-20 rounded-2xl' />
        ))}
      </div>
      <Hueso className='h-11 w-full rounded-xl' />
      <div className='space-y-3'>
        <Hueso className='h-4 w-32' />
        {[0, 1, 2, 3].map(i => (
          <div key={i} className='flex gap-3'>
            <Hueso className='mt-1 h-9 w-9 flex-shrink-0 rounded-full' />
            <TarjetaEsqueleto className='flex-1 space-y-2 !p-4'>
              <Hueso className={i % 2 ? 'h-4 w-1/2' : 'h-4 w-2/3'} />
              <Hueso className='h-3 w-1/3' />
            </TarjetaEsqueleto>
          </div>
        ))}
      </div>
    </ZonaEsqueleto>
  )
}
