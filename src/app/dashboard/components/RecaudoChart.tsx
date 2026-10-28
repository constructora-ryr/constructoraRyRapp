'use client'

import { memo, useState } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Table2 } from 'lucide-react'

import Link from 'next/link'

import { formatCurrency } from '@/shared/utils/format'

import type { DashboardStatsData } from '../hooks/useDashboardStats'
import {
  formatCOPCompact,
  formatMesCorto,
  formatMesLargo,
  niceScale,
} from '../utils/dashboard-format'

import { Monto } from './Monto'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

const SKELETON_HEIGHTS = [40, 25, 55, 60, 80, 45, 95, 40, 35, 15, 20, 30]

interface RecaudoChartProps {
  loading: boolean
  data: DashboardStatsData['recaudoMensual']
  canNavigate: boolean
}

function RecaudoChartComponent({
  loading,
  data,
  canNavigate,
}: RecaudoChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [vista, setVista] = useState<'grafico' | 'tabla'>('grafico')

  const total12m = data.reduce((s, d) => s + d.total, 0)
  const conDatos = data.filter(d => d.total > 0).length
  const promedio = conDatos > 0 ? total12m / conDatos : 0
  const maxVal = Math.max(0, ...data.map(d => d.total))
  const scale = niceScale(maxVal)
  const ticks = Array.from({ length: 5 }, (_, i) => scale.step * i)
  const ultimo = data.length - 1
  // El mejor mes lleva su valor a la vista, aunque el actual esté en cero
  const iMax = maxVal > 0 ? data.findIndex(d => d.total === maxVal) : -1

  return (
    <motion.section
      variants={itemVariants}
      aria-labelledby='recaudo-title'
      className='flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'
    >
      <div className='mb-6 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2
            id='recaudo-title'
            className='text-lg font-medium text-slate-900 dark:text-white'
          >
            Recaudo mensual
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            {loading ? (
              'Últimos 12 meses'
            ) : (
              <>
                Últimos 12 meses · <Monto value={total12m} /> en total ·
                promedio <Monto value={promedio} />
                /mes
              </>
            )}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <div
            role='group'
            aria-label='Cambiar vista'
            className='flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700'
          >
            {(
              [
                { id: 'grafico', icon: BarChart3, label: 'Gráfico' },
                { id: 'tabla', icon: Table2, label: 'Tabla' },
              ] as const
            ).map(opt => (
              <button
                key={opt.id}
                type='button'
                onClick={() => setVista(opt.id)}
                aria-pressed={vista === opt.id}
                aria-label={opt.label}
                title={opt.label}
                className={`rounded-md p-1.5 transition-colors ${
                  vista === opt.id
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <opt.icon className='h-4 w-4' />
              </button>
            ))}
          </div>
          {canNavigate && (
            <Link
              href='/abonos'
              className='flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
            >
              Abonos <ArrowRight className='h-4 w-4' />
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className='flex h-56 items-end gap-2 pl-16'>
          {SKELETON_HEIGHTS.map((h, i) => (
            <div key={i} className='flex flex-1 justify-center'>
              <div
                className='w-full max-w-[24px] animate-pulse rounded-t bg-slate-100 dark:bg-slate-700/60'
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
      ) : vista === 'tabla' ? (
        <div className='max-h-64 overflow-y-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400'>
                <th className='py-2 font-medium'>Mes</th>
                <th className='py-2 text-right font-medium'>Abonos</th>
                <th className='py-2 text-right font-medium'>Recaudo</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d, i) => (
                <tr
                  key={d.mes}
                  className='border-b border-slate-100 last:border-0 dark:border-slate-700/50'
                >
                  <td className='py-2 capitalize text-slate-700 dark:text-slate-200'>
                    {formatMesLargo(d.mes)}
                    {i === 0 && (
                      <span className='ml-2 text-xs text-slate-500 dark:text-slate-400'>
                        en curso
                      </span>
                    )}
                  </td>
                  <td className='py-2 text-right tabular-nums text-slate-500 dark:text-slate-400'>
                    {d.cantidad}
                  </td>
                  <td className='py-2 text-right font-medium tabular-nums text-slate-900 dark:text-white'>
                    {formatCurrency(d.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='flex h-56'>
          {/* Eje Y */}
          <div className='relative w-16 shrink-0'>
            <div className='absolute inset-x-0 bottom-6 top-0'>
              {ticks.map(t => (
                <span
                  key={t}
                  className='absolute right-2 translate-y-1/2 whitespace-nowrap text-[11px] tabular-nums text-slate-500 dark:text-slate-400'
                  style={{ bottom: `${(t / scale.max) * 100}%` }}
                >
                  {t === 0 ? '0' : formatCOPCompact(t)}
                </span>
              ))}
            </div>
          </div>

          <div className='relative flex flex-1 flex-col'>
            {/* Gridlines */}
            <div className='pointer-events-none absolute inset-x-0 bottom-6 top-0'>
              {ticks.map(t => (
                <div
                  key={t}
                  className={`absolute inset-x-0 h-px ${t === 0 ? 'bg-slate-300 dark:bg-slate-600' : 'bg-slate-100 dark:bg-slate-700/60'}`}
                  style={{ bottom: `${(t / scale.max) * 100}%` }}
                />
              ))}
            </div>

            {/* Columnas */}
            <div
              className='relative flex flex-1 items-end'
              onPointerLeave={() => setHovered(null)}
            >
              {data.map((d, i) => {
                const pct = (d.total / scale.max) * 100
                const esActual = i === ultimo
                const activo = hovered === i
                const mostrarLabel =
                  hovered === null && d.total > 0 && (esActual || i === iMax)
                return (
                  <div
                    key={d.mes}
                    tabIndex={0}
                    role='img'
                    aria-label={`${formatMesLargo(d.mes)}${esActual ? ' (en curso)' : ''}: ${formatCurrency(d.total)}, ${d.cantidad} abonos`}
                    onPointerEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    className='relative flex h-full flex-1 cursor-default items-end justify-center outline-none focus-visible:rounded focus-visible:bg-slate-50 dark:focus-visible:bg-slate-700/30'
                  >
                    <motion.div
                      className={`relative w-[70%] max-w-[24px] rounded-t-[4px] transition-colors ${
                        esActual
                          ? 'bg-gradient-to-t from-red-600 to-rose-500 shadow-[0_-4px_16px_-4px_rgba(220,38,38,0.45)]'
                          : activo
                            ? 'bg-slate-800 dark:bg-slate-200'
                            : i === iMax
                              ? 'bg-slate-700 dark:bg-slate-300'
                              : 'bg-slate-500 dark:bg-slate-500'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.03,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {mostrarLabel && (
                        <span className='absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-slate-900 dark:text-white'>
                          {formatCOPCompact(d.total)}
                        </span>
                      )}
                    </motion.div>

                    {activo && (
                      <div
                        className={`pointer-events-none absolute z-20 mb-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-600 dark:bg-slate-900 ${
                          i < 2
                            ? 'left-0'
                            : i > ultimo - 2
                              ? 'right-0'
                              : 'left-1/2 -translate-x-1/2'
                        }`}
                        style={{ bottom: `calc(${Math.max(pct, 0)}% + 4px)` }}
                      >
                        <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                          {formatCurrency(d.total)}
                        </p>
                        <p className='text-xs capitalize text-slate-500 dark:text-slate-400'>
                          {formatMesLargo(d.mes)}
                          {esActual ? ' · en curso' : ''} · {d.cantidad}{' '}
                          {d.cantidad === 1 ? 'abono' : 'abonos'}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Eje X */}
            <div className='flex h-6 items-end'>
              {data.map((d, i) => (
                <span
                  key={d.mes}
                  className={`flex-1 whitespace-nowrap text-center text-[11px] ${
                    i === ultimo
                      ? 'font-semibold text-slate-700 dark:text-slate-200'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {(() => {
                    // En pantallas angostas el año ("ene 26") no cabe
                    const [mes, anio] = formatMesCorto(d.mes).split(' ')
                    return (
                      <>
                        {mes}
                        {anio && (
                          <span className='hidden sm:inline'> {anio}</span>
                        )}
                      </>
                    )
                  })()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  )
}

export const RecaudoChart = memo(RecaudoChartComponent)
