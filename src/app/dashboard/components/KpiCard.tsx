'use client'

import { memo, type ElementType } from 'react'

import { ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react'

import Link from 'next/link'

import { AnimatedCounter } from './AnimatedCounter'

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
  href,
  loading,
}: KpiCardProps) {
  const DeltaIcon = delta ? DELTA_ICON[delta.direction] : null

  const content = (
    <>
      <div className='mb-5 flex items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <span className={`rounded-lg p-1.5 ${accentBg} ${accentText}`}>
            <Icon className='h-4 w-4' />
          </span>
          <span className='text-sm font-medium text-slate-600 dark:text-slate-300'>
            {label}
          </span>
        </div>
        {href && (
          <ArrowUpRight className='h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300' />
        )}
      </div>

      {loading ? (
        <div className='h-9 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700' />
      ) : (
        <AnimatedCounter
          value={value}
          format={format}
          className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-white'
        />
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
    'group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:border-slate-600`}
      >
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export const KpiCard = memo(KpiCardComponent)
