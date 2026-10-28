'use client'

import { memo, type ElementType } from 'react'

import { motion } from 'framer-motion'
import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react'

import Link from 'next/link'

import { AnimatedCounter } from '@/shared/components/ui/AnimatedCounter'

import { Monto } from './Monto'

export interface KpiSubItem {
  label: string
  dot: string
}

export interface KpiDelta {
  /** Texto ya formateado, p.ej. "+148% vs septiembre" */
  label: string
  direction: 'up' | 'down' | 'flat'
  /** true si subir es bueno (recaudo, ventas) */
  upIsGood?: boolean
}

interface KpiCardProps {
  label: string
  value: number
  sub?: string
  subItems?: KpiSubItem[]
  delta?: KpiDelta
  icon: ElementType
  accentText: string
  accentBg: string
  format?: (value: number) => string
  /** Muestra el valor exacto en un tooltip (KPIs de dinero abreviados) */
  montoCompleto?: boolean
  /** Barra de avance 0-100 bajo la cifra (p.ej. % vendido) */
  progreso?: number
  /** Si se define, toda la tarjeta es clicable */
  href?: string
  loading: boolean
}

const DELTA_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus }

function deltaClass({ direction, upIsGood = true }: KpiDelta): string {
  if (direction === 'flat') return 'text-slate-500 dark:text-slate-400'
  const good = (direction === 'up') === upIsGood
  return good
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-rose-600 dark:text-rose-400'
}

function KpiCardComponent({
  label,
  value,
  sub,
  subItems,
  delta,
  icon: Icon,
  accentText,
  accentBg,
  format,
  montoCompleto,
  progreso,
  href,
  loading,
}: KpiCardProps) {
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null

  const content = (
    <>
      <div className='mb-5 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2.5'>
          <span
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${accentBg} ${accentText}`}
          >
            <Icon className='h-4 w-4' />
          </span>
          <span className='text-sm font-medium text-slate-600 dark:text-slate-300'>
            {label}
          </span>
        </div>
        {href && (
          <ArrowUpRight className='h-4 w-4 text-slate-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300' />
        )}
      </div>

      {loading ? (
        <div className='h-9 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700' />
      ) : (
        (() => {
          const contador = (
            <AnimatedCounter
              value={value}
              format={format}
              className='text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white'
            />
          )
          return montoCompleto ? (
            // La tarjeta ya es un enlace: el tooltip abre al pasar el cursor
            <Monto value={value} focusable={!href} className='self-start'>
              {contador}
            </Monto>
          ) : (
            contador
          )
        })()
      )}

      {progreso !== undefined && !loading && (
        <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/70'>
          <motion.div
            className='h-full origin-left rounded-full bg-gradient-to-r from-red-500 to-rose-600'
            initial={{ scaleX: 0 }}
            animate={{ scaleX: Math.min(100, Math.max(0, progreso)) / 100 }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          />
        </div>
      )}

      <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1'>
        {delta && DeltaIcon && !loading && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${deltaClass(delta)}`}
          >
            <DeltaIcon className='h-3.5 w-3.5' />
            {delta.label}
          </span>
        )}
        {subItems && subItems.length > 0
          ? subItems.map(item => (
              <span key={item.label} className='flex items-center gap-1.5'>
                <span
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${item.dot}`}
                />
                <span className='text-xs text-slate-500 dark:text-slate-400'>
                  {item.label}
                </span>
              </span>
            ))
          : sub && (
              <span className='text-xs text-slate-500 dark:text-slate-400'>
                {sub}
              </span>
            )}
      </div>
    </>
  )

  const className =
    'group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.25)] transition-all dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} hover:-translate-y-0.5 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:translate-y-0 dark:hover:border-slate-600`}
      >
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export const KpiCard = memo(KpiCardComponent)
