'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import Link from 'next/link'

import { CLIENTE_ESTADO_COLORS } from '../config/estados.colors'
import type { DashboardStatsData } from '../hooks/useDashboardStats'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

interface ClientesCardProps {
  loading: boolean
  clientes: DashboardStatsData['clientes']
  canNavigate: boolean
}

function ClientesCardComponent({
  loading,
  clientes,
  canNavigate,
}: ClientesCardProps) {
  const total = clientes.total || 1
  const segments = (
    [
      'activos',
      'interesados',
      'propietarios',
      'inactivos',
      'renunciaron',
    ] as const
  ).map(key => ({
    key,
    label: CLIENTE_ESTADO_COLORS[key].label,
    color: CLIENTE_ESTADO_COLORS[key].bg,
    count: clientes[key],
    pct: (clientes[key] / total) * 100,
  }))

  return (
    <motion.div
      variants={itemVariants}
      className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-cyan-300 dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none dark:hover:border-cyan-500/30 lg:col-span-2'
    >
      {/* Subtle top glow - no mouse tracking */}
      <div className='absolute inset-x-0 top-0 z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-cyan-500/50' />

      <div className='relative z-10 mb-6 flex items-start justify-between'>
        <div>
          <h2 className='text-lg font-medium text-slate-900 dark:text-white'>
            Seguimiento Comercial
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-white/50'>
            {clientes.total.toLocaleString('es-CO')} clientes registrados
          </p>
        </div>
        {canNavigate && (
          <Link
            href='/clientes'
            className='flex items-center gap-1.5 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300'
          >
            Ir a Comercial <ArrowRight className='h-4 w-4' />
          </Link>
        )}
      </div>

      {loading ? (
        <div className='relative z-10 space-y-4'>
          <div className='h-2 w-full animate-pulse rounded-full bg-slate-200 dark:bg-white/10' />
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded bg-slate-200 dark:bg-white/10' />
            <div className='h-3 w-16 rounded bg-slate-200 dark:bg-white/10' />
          </div>
        </div>
      ) : (
        <div className='relative z-10 mt-auto pt-4'>
          <div className='flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5'>
            {segments
              .filter(seg => seg.count > 0)
              .map(seg => (
                <motion.div
                  key={seg.key}
                  className={`h-full ${seg.color} border-r-2 border-white last:border-r-0 dark:border-slate-800`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${seg.pct}%` }}
                  transition={{
                    duration: 1.2,
                    delay: 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
          </div>
          <div className='mt-5 flex flex-wrap gap-x-8 gap-y-3'>
            {segments.map(seg => (
              <div key={seg.key} className='flex items-center gap-2.5'>
                <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                  {seg.label}
                </span>
                <span className='text-sm font-semibold tabular-nums text-slate-900 dark:text-white'>
                  {seg.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export const ClientesCard = memo(ClientesCardComponent)
