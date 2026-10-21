'use client'

/** Estados del panel de vista previa: cargando y avisos (error / sin archivo) */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import { FileText, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

export const btnAvisoPrimario =
  'inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-lg transition-colors hover:bg-slate-100'
export const btnAvisoSecundario =
  'inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700'

export function VisorCargando({
  label,
  acento,
}: {
  label: string
  /** Degradado del ícono central, p.ej. 'from-violet-600 to-fuchsia-500' */
  acento: string
}) {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center gap-5'>
      <div className='relative h-20 w-20'>
        <motion.div
          className='absolute inset-0 rounded-full border-[3px] border-transparent border-r-white/40 border-t-white/80'
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className='flex h-20 w-20 items-center justify-center'
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-2xl',
              acento
            )}
          >
            <FileText className='h-6 w-6' />
          </span>
        </motion.div>
      </div>
      <motion.p
        className='text-xs font-medium text-white/70'
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {label}
      </motion.p>
    </div>
  )
}

export function VisorAviso({
  icon: Icon,
  tono,
  titulo,
  descripcion,
  children,
}: {
  icon: LucideIcon
  tono: 'error' | 'neutro'
  titulo: string
  descripcion: string
  /** Botones de acción */
  children?: ReactNode
}) {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center'>
      <span
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-2xl ring-1',
          tono === 'error'
            ? 'bg-rose-500/10 text-rose-400 ring-rose-500/30'
            : 'bg-slate-800 text-slate-400 ring-slate-700'
        )}
      >
        <Icon className='h-8 w-8' />
      </span>
      <p className='text-base font-semibold text-slate-100'>{titulo}</p>
      <p className='max-w-sm text-xs text-slate-400'>{descripcion}</p>
      {children ? (
        <div className='mt-2 flex flex-wrap justify-center gap-2'>
          {children}
        </div>
      ) : null}
    </div>
  )
}
