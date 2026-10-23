'use client'

/**
 * Avisos del detalle de abonos, con el lenguaje de los demás avisos de la
 * app: tarjeta con degradado suave, ícono en degradado, título y texto.
 */

import type { ReactNode } from 'react'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

const TONOS = {
  rojo: {
    caja: 'border-rose-200 from-rose-50 to-red-50/60 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-red-500/5',
    icono: 'from-rose-500 to-red-600 shadow-rose-500/30',
    titulo: 'text-rose-950 dark:text-rose-100',
    texto: 'text-rose-900/80 dark:text-rose-200/80',
  },
  ambar: {
    caja: 'border-amber-200 from-amber-50 to-orange-50/60 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/5',
    icono: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    titulo: 'text-amber-950 dark:text-amber-100',
    texto: 'text-amber-900/80 dark:text-amber-200/80',
  },
  verde: {
    caja: 'border-emerald-200 from-emerald-50 to-teal-50/60 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-teal-500/5',
    icono: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
    titulo: 'text-emerald-950 dark:text-emerald-100',
    texto: 'text-emerald-900/80 dark:text-emerald-200/80',
  },
}

interface AvisoAbonosProps {
  tono: keyof typeof TONOS
  icon: LucideIcon
  titulo: string
  children: ReactNode
}

export function AvisoAbonos({
  tono,
  icon: Icono,
  titulo,
  children,
}: AvisoAbonosProps) {
  const t = TONOS[tono]
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role='status'
      className={cn(
        'flex items-start gap-3 rounded-2xl border bg-gradient-to-r p-4',
        t.caja
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
          t.icono
        )}
      >
        <Icono className='h-5 w-5' />
      </span>
      <div className='min-w-0'>
        <h4 className={cn('text-sm font-bold', t.titulo)}>{titulo}</h4>
        <p className={cn('mt-0.5 text-xs leading-relaxed', t.texto)}>
          {children}
        </p>
      </div>
    </motion.div>
  )
}
