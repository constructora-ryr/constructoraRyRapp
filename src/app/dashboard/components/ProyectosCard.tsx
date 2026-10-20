'use client'

import { memo, useState } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight, Building2 } from 'lucide-react'

import Link from 'next/link'

import { VIVIENDA_ESTADO_COLORS } from '@/shared/config/estados.colors'

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

/**
 * Orden de la barra apilada validado con dataviz/validate_palette.js:
 * violeta (Escriturada) y azul (Asignada) no pueden ir juntos (ΔE 1.3 en
 * deuteranopia). Con este orden el peor par adyacente da ΔE 16.
 */
const SEGMENTOS = [
  'entregadas',
  'propietario',
  'asignadas',
  'disponibles',
] as const

type SegmentoKey = (typeof SEGMENTOS)[number] | 'porCrear'

const POR_CREAR = {
  label: 'Por crear',
  bg: 'bg-slate-200 dark:bg-slate-700/60',
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
  const [hover, setHover] = useState<{ id: string; key: SegmentoKey } | null>(
    null
  )

  const lista = proyectos.list.slice(0, 6)
  const totales = SEGMENTOS.map(key => ({
    key,
    ...VIVIENDA_ESTADO_COLORS[key],
    count: lista.reduce((s, p) => s + p[key], 0),
  }))
  const totalPorCrear = lista.reduce(
    (s, p) => s + Math.max(0, p.totalViviendas - p.viviendasCreadas),
    0
  )

  return (
    <motion.section
      variants={itemVariants}
      aria-labelledby='proyectos-title'
      className='flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'
    >
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div>
          <h2
            id='proyectos-title'
            className='text-lg font-medium text-slate-900 dark:text-white'
          >
            Inventario por proyecto
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {proyectos.activos} en ejecución · {proyectos.completados}{' '}
            finalizado{proyectos.completados !== 1 ? 's' : ''}
          </p>
        </div>
        {canNavigate && (
          <Link
            href='/proyectos'
            className='flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
          >
            Proyectos <ArrowRight className='h-4 w-4' />
          </Link>
        )}
      </div>

      {/* Leyenda: siempre visible, con conteos (identidad nunca solo por color) */}
      {!loading && lista.length > 0 && (
        <ul className='mb-5 flex flex-wrap gap-x-5 gap-y-2'>
          {totales.map(t => (
            <li key={t.key} className='flex items-center gap-2 text-xs'>
              <span className={`h-2.5 w-2.5 rounded-sm ${t.bg}`} />
              <span className='text-slate-500 dark:text-slate-400'>
                {t.label}
              </span>
              <span className='font-semibold tabular-nums text-slate-900 dark:text-white'>
                {t.count}
              </span>
            </li>
          ))}
          {totalPorCrear > 0 && (
            <li className='flex items-center gap-2 text-xs'>
              <span className={`h-2.5 w-2.5 rounded-sm ${POR_CREAR.bg}`} />
              <span className='text-slate-500 dark:text-slate-400'>
                {POR_CREAR.label}
              </span>
              <span className='font-semibold tabular-nums text-slate-900 dark:text-white'>
                {totalPorCrear}
              </span>
            </li>
          )}
        </ul>
      )}

      {loading ? (
        <div className='space-y-6'>
          {[1, 2].map(i => (
            <div key={i} className='space-y-3'>
              <div className='h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700' />
              <div className='h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700/60' />
            </div>
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500'>
          <Building2 className='mb-3 h-8 w-8' />
          <p className='text-sm'>No hay proyectos registrados</p>
        </div>
      ) : (
        <div className='flex flex-col gap-6'>
          {lista.map(p => {
            const estado = ESTADO_LABELS[p.estado] ?? {
              label: p.estado,
              chip: 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:border-slate-600',
            }
            const total = Math.max(p.totalViviendas, 1)
            const porCrear = Math.max(0, p.totalViviendas - p.viviendasCreadas)
            const pctVendido = Math.round((p.viviendasVendidas / total) * 100)
            const segmentos: Array<{
              key: SegmentoKey
              label: string
              bg: string
              count: number
            }> = [
              ...SEGMENTOS.map(key => ({
                key,
                label: VIVIENDA_ESTADO_COLORS[key].label,
                bg: VIVIENDA_ESTADO_COLORS[key].bg,
                count: p[key],
              })),
              { key: 'porCrear' as const, ...POR_CREAR, count: porCrear },
            ].filter(s => s.count > 0)

            const activo =
              hover?.id === p.id
                ? segmentos.find(s => s.key === hover.key)
                : undefined

            return (
              <div key={p.id}>
                <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1'>
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <span className='truncate text-sm font-medium text-slate-900 dark:text-white'>
                      {p.nombre}
                    </span>
                    <span
                      className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${estado.chip}`}
                    >
                      {estado.label}
                    </span>
                  </div>
                  <span className='shrink-0 text-sm text-slate-500 dark:text-slate-400'>
                    <span className='font-semibold text-slate-900 dark:text-white'>
                      {p.viviendasVendidas}
                    </span>{' '}
                    de {p.totalViviendas} vendidas · {pctVendido}%
                  </span>
                </div>

                {/* Barra apilada: 2px de separación entre segmentos */}
                <div
                  className='flex h-3 w-full gap-[2px] overflow-hidden rounded-[4px]'
                  onPointerLeave={() => setHover(null)}
                >
                  {segmentos.map((s, i) => (
                    <motion.div
                      key={s.key}
                      tabIndex={0}
                      role='img'
                      aria-label={`${p.nombre}: ${s.label} ${s.count} (${Math.round((s.count / total) * 100)}%)`}
                      onPointerEnter={() => setHover({ id: p.id, key: s.key })}
                      onFocus={() => setHover({ id: p.id, key: s.key })}
                      onBlur={() => setHover(null)}
                      className={`h-full outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-slate-400 ${s.bg} ${
                        activo && activo.key !== s.key ? 'opacity-40' : ''
                      }`}
                      initial={{ flexGrow: 0 }}
                      animate={{ flexGrow: s.count }}
                      style={{ flexBasis: 0, minWidth: 4 }}
                      transition={{
                        duration: 0.9,
                        delay: i * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  ))}
                </div>

                {/* Lectura del segmento activo (tooltip en línea, sin tapar la barra) */}
                <p className='mt-1.5 h-4 text-xs text-slate-500 dark:text-slate-400'>
                  {activo && (
                    <>
                      <span className='font-semibold text-slate-900 dark:text-white'>
                        {activo.count}
                      </span>{' '}
                      {activo.label.toLowerCase()} ·{' '}
                      {Math.round((activo.count / total) * 100)}% del proyecto
                    </>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </motion.section>
  )
}

export const ProyectosCard = memo(ProyectosCardComponent)
