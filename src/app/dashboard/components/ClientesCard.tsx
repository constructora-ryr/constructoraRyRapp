'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import Link from 'next/link'

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
  const segments = [
    {
      label: 'Activos',
      count: clientes.activos,
      barClass:
        'bg-cyan-500 dark:bg-cyan-400 dark:shadow-[0_0_10px_rgba(34,211,238,0.5)]',
      dotClass:
        'bg-cyan-500 dark:bg-cyan-400 dark:shadow-[0_0_8px_rgba(34,211,238,0.6)]',
      pct: (clientes.activos / total) * 100,
    },
    {
      label: 'Interesados',
      count: clientes.interesados,
      barClass:
        'bg-violet-500 dark:bg-violet-400 dark:shadow-[0_0_10px_rgba(167,139,250,0.5)]',
      dotClass:
        'bg-violet-500 dark:bg-violet-400 dark:shadow-[0_0_8px_rgba(167,139,250,0.6)]',
      pct: (clientes.interesados / total) * 100,
    },
    {
      label: 'Inactivos',
      count: clientes.inactivos,
      barClass: 'bg-slate-400 dark:bg-slate-500',
      dotClass: 'bg-slate-400 dark:bg-slate-500',
      pct: (clientes.inactivos / total) * 100,
    },
    {
      label: 'Renunciaron',
      count: clientes.renunciaron,
      barClass:
        'bg-rose-500 dark:bg-rose-500 dark:shadow-[0_0_10px_rgba(244,63,94,0.5)]',
      dotClass:
        'bg-rose-500 dark:bg-rose-500 dark:shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      pct: (clientes.renunciaron / total) * 100,
    },
    {
      label: 'Propietarios',
      count: clientes.propietarios,
      barClass:
        'bg-teal-500 dark:bg-teal-400 dark:shadow-[0_0_10px_rgba(20,184,166,0.5)]',
      dotClass:
        'bg-teal-500 dark:bg-teal-400 dark:shadow-[0_0_8px_rgba(20,184,166,0.6)]',
      pct: (clientes.propietarios / total) * 100,
    },
  ]

  return (
    <motion.div
      variants={itemVariants}
      className='group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-md backdrop-blur-2xl transition-colors hover:border-cyan-400/50 dark:border-gray-700/50 dark:bg-gray-800/50 dark:shadow-none dark:hover:border-cyan-500/30 lg:col-span-2'
    >
      {/* Subtle top glow - no mouse tracking */}
      <div className='absolute inset-x-0 top-0 z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-cyan-500/50' />

      <div className='relative z-10 mb-6 flex items-start justify-between'>
        <div>
          <h2 className='text-lg font-medium text-slate-900 dark:text-white'>
            Seguimiento Comercial
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-white/50'>
            {clientes.total} registros totales gestionados
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
                  key={seg.label}
                  className={`h-full ${seg.barClass} border-r-2 border-white last:border-r-0 dark:border-gray-800`}
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
              <div key={seg.label} className='flex items-center gap-2.5'>
                <div className={`h-2.5 w-2.5 rounded-full ${seg.dotClass}`} />
                <span className='text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50'>
                  {seg.label}
                </span>
                <span className='font-mono text-sm font-semibold text-slate-900 dark:text-white'>
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
