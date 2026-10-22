/**
 * Línea de tiempo de la actividad agrupada por día, con "cargar más" y el
 * detalle de cada evento (navegable con ← →).
 */

'use client'

import { useMemo, useState } from 'react'

import { Loader2, ShieldCheck } from 'lucide-react'

import { Hueso, ZonaEsqueleto } from '@/shared/components/carga'

import type { EventoAuditoria } from '../types'
import { agruparPorDia } from '../utils/evento'

import { EventoDetalleModal } from './EventoDetalleModal'
import { EventoFila } from './EventoFila'

export function ListaActividad({
  eventos,
  cargando,
  hayMas,
  cargandoMas,
  cargarMas,
  hayFiltros,
  usuarios,
}: {
  eventos: EventoAuditoria[]
  usuarios: { id: string; nombre: string }[]
  cargando: boolean
  hayMas: boolean
  cargandoMas: boolean
  cargarMas: () => void
  hayFiltros: boolean
}) {
  const [abierto, setAbierto] = useState<number | null>(null)
  const dias = useMemo(() => agruparPorDia(eventos), [eventos])
  const indice = eventos.findIndex(e => e.id === abierto)

  if (cargando) {
    return (
      <ZonaEsqueleto label='Cargando actividad'>
        <div className='space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-800/60'>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className='flex gap-3'>
              <Hueso className='h-10 w-10 rounded-xl' />
              <div className='flex-1 space-y-2'>
                <Hueso className='h-4 w-2/3' />
                <Hueso className='h-3 w-1/2' />
              </div>
            </div>
          ))}
        </div>
      </ZonaEsqueleto>
    )
  }

  if (!eventos.length) {
    return (
      <div className='flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-4 py-14 text-center dark:border-slate-700'>
        <span className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'>
          <ShieldCheck className='h-7 w-7' />
        </span>
        <p className='font-semibold text-slate-800 dark:text-slate-100'>
          {hayFiltros
            ? 'Nada con esos filtros'
            : 'Sin actividad en este periodo'}
        </p>
        <p className='mt-1 max-w-sm text-sm text-slate-500'>
          {hayFiltros
            ? 'Prueba con otro periodo, usuario o tipo de registro.'
            : 'Cuando alguien cree, edite o elimine información, quedará aquí.'}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {dias.map(({ dia, eventos: delDia }) => (
        <section
          key={dia}
          className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
        >
          <header className='sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur dark:border-slate-700/60 dark:bg-slate-800/95'>
            <h3 className='text-sm font-bold capitalize text-slate-800 dark:text-slate-100'>
              {dia}
            </h3>
            <span className='rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'>
              {delDia.length} evento{delDia.length === 1 ? '' : 's'}
            </span>
          </header>
          <div className='divide-y divide-slate-100 p-1.5 dark:divide-slate-700/50'>
            {delDia.map(e => (
              <EventoFila
                key={e.id}
                evento={e}
                onAbrir={() => setAbierto(e.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {hayMas ? (
        <div className='flex justify-center'>
          <button
            type='button'
            onClick={cargarMas}
            disabled={cargandoMas}
            className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          >
            {cargandoMas ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
            Cargar más
          </button>
        </div>
      ) : null}

      {indice >= 0 ? (
        <EventoDetalleModal
          key={eventos[indice].id}
          evento={eventos[indice]}
          usuarios={usuarios}
          onClose={() => setAbierto(null)}
          navegacion={{
            actual: indice + 1,
            total: eventos.length,
            nombre: 'Evento',
            onAnterior:
              indice > 0 ? () => setAbierto(eventos[indice - 1].id) : undefined,
            onSiguiente:
              indice < eventos.length - 1
                ? () => setAbierto(eventos[indice + 1].id)
                : undefined,
          }}
        />
      ) : null}
    </div>
  )
}
