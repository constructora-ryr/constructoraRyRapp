'use client'

import { motion } from 'framer-motion'

const CX = 64
const CY = 64
const R = 50
const SW = 11
const CIRC = 2 * Math.PI * R
const GAP = 5

const SEG_CONFIG = [
  { key: 'disponibles' as const, label: 'Disponibles', color: '#10b981' },
  { key: 'asignadas' as const, label: 'Asignadas', color: '#f59e0b' },
  { key: 'entregadas' as const, label: 'Escrituradas', color: '#8b5cf6' },
  { key: 'propietario' as const, label: 'Saldadas', color: '#06b6d4' },
]

interface ViviendasRingChartProps {
  disponibles: number
  asignadas: number
  entregadas: number
  propietario: number
}

export function ViviendasRingChart({
  disponibles,
  asignadas,
  entregadas,
  propietario,
}: ViviendasRingChartProps) {
  const values = { disponibles, asignadas, entregadas, propietario }
  const total = disponibles + asignadas + entregadas + propietario

  const activeConfigs = SEG_CONFIG.filter(s => values[s.key] > 0)
  const usableCirc = CIRC - activeConfigs.length * GAP

  let cumOffset = 0
  const segments = activeConfigs.map(seg => {
    const count = values[seg.key]
    const length = total > 0 ? (count / total) * usableCirc : 0
    const offset = -cumOffset
    cumOffset += length + GAP
    return { ...seg, count, length, offset }
  })

  return (
    <div className='flex items-center gap-6'>
      <div className='relative flex-shrink-0'>
        <svg width='128' height='128' viewBox='0 0 128 128'>
          <g transform={`rotate(-90 ${CX} ${CY})`}>
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill='none'
              className='stroke-zinc-100 dark:stroke-zinc-700'
              strokeWidth={SW}
            />
            {total > 0 ? (
              segments.map((seg, i) => (
                <motion.circle
                  key={seg.key}
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill='none'
                  stroke={seg.color}
                  strokeWidth={SW}
                  strokeLinecap='butt'
                  strokeDashoffset={seg.offset}
                  initial={{ strokeDasharray: `0 ${CIRC}` }}
                  animate={{
                    strokeDasharray: `${seg.length} ${CIRC - seg.length}`,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.18,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                />
              ))
            ) : (
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill='none'
                className='stroke-zinc-200 dark:stroke-zinc-700'
                strokeWidth={SW}
              />
            )}
          </g>
        </svg>
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <span className='font-mono text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-100'>
            {total}
          </span>
          <span className='mt-0.5 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500'>
            Total
          </span>
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-3'>
        {SEG_CONFIG.map(cfg => {
          const count = values[cfg.key]
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={cfg.key} className='space-y-1'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span
                    className='h-2 w-2 flex-shrink-0 rounded-full'
                    style={{ background: cfg.color }}
                  />
                  <span className='text-xs text-zinc-500 dark:text-zinc-400'>
                    {cfg.label}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200'>
                    {count}
                  </span>
                  <span className='w-7 text-right text-[10px] text-zinc-400 dark:text-zinc-500'>
                    {pct}%
                  </span>
                </div>
              </div>
              <div className='h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700'>
                <motion.div
                  className='h-full rounded-full'
                  style={{ background: cfg.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
