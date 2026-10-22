'use client'

/**
 * Estados de página del detalle de vivienda: esqueleto mientras carga y
 * pantalla de "no encontrada" o error.
 */

import { motion } from 'framer-motion'
import { ArrowLeft, HousePlus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { InfoEsqueleto } from '@/modules/viviendas/components/detalle/DetalleEsqueletos'
import { Hueso } from '@/shared/components/carga'

export const FONDO_DETALLE =
  'min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/50 to-amber-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'

export function ViviendaDetalleCargando() {
  return (
    <div className={FONDO_DETALLE}>
      <div className='mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:py-8'>
        <div className='h-36 animate-pulse rounded-2xl bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 dark:from-orange-900/40 dark:via-amber-900/40 dark:to-yellow-900/30' />
        <Hueso className='h-12 w-80 max-w-full rounded-2xl' />
        <InfoEsqueleto />
      </div>
    </div>
  )
}

export function ViviendaNoEncontrada({ mensaje }: { mensaje?: string }) {
  const router = useRouter()
  return (
    <div className={`${FONDO_DETALLE} flex items-center justify-center`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='px-4 text-center'
      >
        <div className='mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-lg'>
          <HousePlus className='h-10 w-10' />
        </div>
        <h2 className='mb-2 text-2xl font-bold text-slate-900 dark:text-white'>
          No pudimos abrir la vivienda
        </h2>
        <p className='mb-6 max-w-sm text-slate-600 dark:text-slate-400'>
          {mensaje ?? 'La vivienda no existe o fue eliminada.'}
        </p>
        <button
          type='button'
          onClick={() => router.push('/viviendas')}
          className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5'
        >
          <ArrowLeft className='h-4 w-4' />
          Volver a viviendas
        </button>
      </motion.div>
    </div>
  )
}
