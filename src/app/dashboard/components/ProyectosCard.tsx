'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight, Building2 } from 'lucide-react'

import Link from 'next/link'

import type { DashboardStatsData } from '../hooks/useDashboardStats'

const ESTADO_LABELS: Record<string, { label: string; chip: string }> = {
  en_proceso: {
    label: 'En proceso',
    chip: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/20',
  },
  en_construccion: {
    label: 'En construcción',
    chip: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-400/20',
  },
  en_planificacion: {
    label: 'Planificación',
    chip: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-400/10 dark:border-sky-400/20',
  },
  completado: {
    label: 'Completado',
    chip: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-500/10 dark:border-slate-500/20',
  },
  pausado: {
    label: 'Pausado',
    chip: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-400/10 dark:border-rose-400/20',
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

interface ProyectosCardProps {
  loading: boolean
  proyectos: DashboardStatsData['proyectos']
  canNavigate: boolean
}

function ProyectosCardComponent({
  loading,
  proyectos,
  canNavigate,
}: ProyectosCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className='group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-300 dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none dark:hover:border-emerald-500/30'
    >
      {/* Subtle top glow - no mouse tracking */}
      <div className='absolute inset-x-0 top-0 z-10 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-emerald-500/50' />

      <div className='relative z-10 mb-8 flex items-start justify-between'>
        <div>
          <h2 className='text-lg font-medium text-slate-900 dark:text-white'>
            Estado de Proyectos
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-white/50'>
            {proyectos.activos} en ejecución · {proyectos.completados}{' '}
            finalizado{proyectos.completados !== 1 ? 's' : ''}
          </p>
        </div>
        {canNavigate && (
          <Link
            href='/proyectos'
            className='rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white'
          >
            <ArrowRight className='h-4 w-4' />
          </Link>
        )}
      </div>

      <div className='custom-scrollbar relative z-10 max-h-[260px] flex-1 overflow-y-auto pr-2'>
        {loading ? (
          <div className='space-y-6'>
            {[1, 2, 3].map(i => (
              <div key={i} className='space-y-3'>
                <div className='flex justify-between'>
                  <div className='h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-white/10' />
                  <div className='h-4 w-10 animate-pulse rounded bg-slate-200 dark:bg-white/10' />
                </div>
                <div className='h-1.5 w-full animate-pulse rounded-full bg-slate-100 dark:bg-white/5' />
              </div>
            ))}
          </div>
        ) : proyectos.list.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center py-6 text-slate-400 dark:text-white/30'>
            <Building2 className='mb-3 h-8 w-8' />
            <p className='text-sm'>No hay obras registradas</p>
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            {proyectos.list.slice(0, 6).map(p => {
              const estado = ESTADO_LABELS[p.estado] ?? {
                label: p.estado,
                chip: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-white/60 dark:bg-white/5 dark:border-white/10',
              }
              const pct =
                p.totalViviendas > 0
                  ? Math.round((p.viviendasVendidas / p.totalViviendas) * 100)
                  : 0
              return (
                <div key={p.id}>
                  <div className='mb-3 flex items-center justify-between gap-4'>
                    <span className='truncate text-sm font-medium text-slate-800 dark:text-white/90'>
                      {p.nombre}
                    </span>
                    <span
                      className={`shrink-0 rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${estado.chip}`}
                    >
                      {estado.label}
                    </span>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5'>
                      <motion.div
                        className='h-full rounded-full bg-emerald-500 dark:bg-emerald-400'
                        initial={{ width: '0%' }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className='w-9 text-right text-xs font-medium tabular-nums text-slate-500 dark:text-white/50'>
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export const ProyectosCard = memo(ProyectosCardComponent)
