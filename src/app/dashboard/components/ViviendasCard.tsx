'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import Link from 'next/link'

import type { DashboardStatsData } from '../hooks/useDashboardStats'

import { ViviendasRingChart } from './ViviendasRingChart'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

interface ViviendasCardProps {
  loading: boolean
  viviendas: DashboardStatsData['viviendas']
  canNavigate: boolean
}

function ViviendasCardComponent({
  loading,
  viviendas,
  canNavigate,
}: ViviendasCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className='group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-md backdrop-blur-2xl transition-colors hover:border-amber-400/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:shadow-none dark:hover:border-amber-500/30 md:flex-row'
    >
      {/* Subtle top glow - no mouse tracking */}
      <div className='absolute inset-x-0 top-0 z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-amber-500/50' />

      <div className='relative z-10 mb-6 flex h-full flex-col justify-between md:mb-0 md:w-1/2'>
        <div>
          <h2 className='text-lg font-medium text-slate-900 dark:text-white'>
            Disponibilidad de Viviendas
          </h2>
          <p className='mb-8 mt-1 text-sm text-slate-500 dark:text-white/50'>
            Distribución de viviendas y estado actual
          </p>
        </div>
        {canNavigate && (
          <div>
            <Link
              href='/viviendas'
              className='inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90'
            >
              Ver Inventario <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        )}
      </div>

      <div className='relative z-10 flex items-center justify-center md:w-1/2'>
        {loading ? (
          <div className='h-32 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10' />
        ) : (
          <ViviendasRingChart
            disponibles={viviendas.disponibles}
            asignadas={viviendas.asignadas}
            entregadas={viviendas.entregadas}
            propietario={viviendas.propietario}
          />
        )}
      </div>
    </motion.div>
  )
}

export const ViviendasCard = memo(ViviendasCardComponent)
