'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, UserX } from 'lucide-react'

import { useRouter } from 'next/navigation'

const fondo =
  'min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/60 to-blue-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'

/** Esqueleto del detalle mientras se resuelve el slug y carga el cliente */
export function ClienteDetalleCargando() {
  return (
    <div className={fondo}>
      <div className='mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:py-8'>
        <div className='h-36 animate-pulse rounded-2xl bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-200 dark:from-cyan-900/40 dark:via-blue-900/40 dark:to-indigo-900/40' />
        <div className='h-12 w-2/3 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60' />
        <div className='h-40 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60' />
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='h-64 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60' />
          <div className='h-64 animate-pulse rounded-2xl bg-white dark:bg-slate-800/60' />
        </div>
      </div>
    </div>
  )
}

export function ClienteNoEncontrado() {
  const router = useRouter()
  return (
    <div className={`${fondo} flex items-center justify-center`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='px-4 text-center'
      >
        <div className='mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-lg'>
          <UserX className='h-10 w-10' />
        </div>
        <h2 className='mb-2 text-2xl font-bold text-slate-900 dark:text-white'>
          Cliente no encontrado
        </h2>
        <p className='mb-6 text-slate-600 dark:text-slate-400'>
          El cliente que buscas no existe o fue eliminado.
        </p>
        <button
          type='button'
          onClick={() => router.push('/clientes')}
          className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:-translate-y-0.5'
        >
          <ArrowLeft className='h-4 w-4' />
          Volver a clientes
        </button>
      </motion.div>
    </div>
  )
}
