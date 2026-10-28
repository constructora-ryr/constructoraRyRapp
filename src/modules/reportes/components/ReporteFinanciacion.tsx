'use client'

import { useState } from 'react'

import { AlertCircle, BarChart3, HandCoins, Landmark } from 'lucide-react'

import {
  DetalleTabs,
  type TabDetalle,
} from '@/shared/components/detalle/DetalleTabs'
import { usePestanaUrl } from '@/shared/hooks/usePestanaUrl'

import type { CategoriaFinanciacion, ReporteFinanciacionData } from '../types'

import { DetalleEntidad } from './DetalleEntidad'
import { ListaEntidades } from './ListaEntidades'
import { ResumenFinanciacion } from './ResumenFinanciacion'

const CATEGORIAS = ['creditos', 'subsidios'] as const

interface ReporteFinanciacionProps {
  data: ReporteFinanciacionData | undefined
  isLoading: boolean
  error: Error | null
  onReintentar: () => void
}

/**
 * Financiación por entidad: resumen general, pestañas Créditos / Subsidios,
 * lista de entidades y el detalle de la elegida. La pestaña y la entidad
 * quedan en la URL (?tab=subsidios&entidad=…).
 */
export function ReporteFinanciacion({
  data,
  isLoading,
  error,
  onReintentar,
}: ReporteFinanciacionProps) {
  const entidades = data?.entidades ?? []
  const porCategoria = (c: CategoriaFinanciacion) =>
    entidades.filter(e => e.categoria === c)

  const [categoria, setCategoria] = usePestanaUrl<CategoriaFinanciacion>(
    CATEGORIAS,
    'creditos'
  )
  const visibles = porCategoria(categoria)
  const ids = visibles.map(e => e.id)
  const [entidadId, setEntidadId] = usePestanaUrl<string>(
    ids,
    ids[0] ?? '',
    'entidad'
  )
  // En celular el detalle se abre encima de la lista
  const [detalleMovil, setDetalleMovil] = useState(false)

  if (isLoading) return <EstadoCargando />
  if (error)
    return <EstadoError mensaje={error.message} onReintentar={onReintentar} />
  if (!data || entidades.length === 0) return <EstadoVacio />

  const seleccionada = visibles.find(e => e.id === entidadId) ?? visibles[0]

  const tabs: TabDetalle<CategoriaFinanciacion>[] = [
    {
      id: 'creditos',
      label: 'Créditos',
      icon: Landmark,
      count: porCategoria('creditos').length,
    },
    {
      id: 'subsidios',
      label: 'Subsidios',
      icon: HandCoins,
      count: porCategoria('subsidios').length,
    },
  ]

  const cambiarCategoria = (c: CategoriaFinanciacion) => {
    setCategoria(c)
    setEntidadId(porCategoria(c)[0]?.id ?? '')
  }
  const elegir = (id: string) => {
    setEntidadId(id)
    setDetalleMovil(true)
  }

  return (
    <div className='space-y-4'>
      <ResumenFinanciacion resumen={data.resumen} />

      <DetalleTabs
        tabs={tabs}
        activa={categoria}
        onCambiar={cambiarCategoria}
        tema='reportes'
        etiqueta='Créditos o subsidios'
      />

      <div
        id={`panel-${categoria}`}
        role='tabpanel'
        className='grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]'
      >
        {visibles.length === 0 ? (
          <p className='rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400 lg:col-span-2'>
            No hay {categoria === 'creditos' ? 'créditos' : 'subsidios'} con
            entidad asignada.
          </p>
        ) : (
          <>
            <div className='lg:sticky lg:top-4'>
              <ListaEntidades
                entidades={visibles}
                seleccionadaId={seleccionada?.id ?? ''}
                onSeleccionar={elegir}
              />
            </div>
            {seleccionada && (
              <div className='hidden lg:block'>
                <DetalleEntidad key={seleccionada.id} entidad={seleccionada} />
              </div>
            )}
          </>
        )}
      </div>

      {detalleMovil && seleccionada && (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 lg:hidden'>
          <DetalleEntidad
            key={seleccionada.id}
            entidad={seleccionada}
            onVolver={() => setDetalleMovil(false)}
          />
        </div>
      )}
    </div>
  )
}

// ── Estados ──────────────────────────────────────────────────────────────────

function EstadoCargando() {
  return (
    <div className='space-y-4' aria-busy='true'>
      <div className='h-44 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800' />
      <div className='h-11 w-64 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800' />
      <div className='grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]'>
        <div className='h-96 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800' />
        <div className='hidden h-96 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800 lg:block' />
      </div>
    </div>
  )
}

function EstadoError({
  mensaje,
  onReintentar,
}: {
  mensaje: string
  onReintentar: () => void
}) {
  return (
    <div className='flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center dark:border-rose-500/30 dark:bg-rose-500/10'>
      <AlertCircle className='mb-3 h-10 w-10 text-rose-500' />
      <p className='text-sm font-semibold text-rose-700 dark:text-rose-300'>
        No se pudo cargar el reporte
      </p>
      <p className='mt-1 text-xs text-rose-600 dark:text-rose-400'>{mensaje}</p>
      <button
        type='button'
        onClick={onReintentar}
        className='mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700 active:scale-[0.98]'
      >
        Reintentar
      </button>
    </div>
  )
}

function EstadoVacio() {
  return (
    <div className='flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
      <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25'>
        <BarChart3 className='h-7 w-7' />
      </span>
      <p className='mt-4 text-base font-semibold text-slate-900 dark:text-white'>
        Aún no hay créditos ni subsidios para reportar
      </p>
      <p className='mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400'>
        Aquí aparecerán los créditos y subsidios de las negociaciones activas o
        completadas, cuando su fuente de pago tenga la entidad asignada.
      </p>
    </div>
  )
}
