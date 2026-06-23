'use client'

import { memo, type ElementType } from 'react'

import { AnimatedCounter } from './AnimatedCounter'

export interface KpiSubItem {
  label: string
  dot: string
}

interface KpiCardProps {
  label: string
  value: number
  sub: string
  subItems?: KpiSubItem[]
  icon: ElementType
  accentText: string
  sparkline: string
  loading: boolean
}

function KpiCardComponent({
  label,
  value,
  sub,
  subItems,
  icon: Icon,
  accentText,
  sparkline,
  loading,
}: KpiCardProps) {
  return (
    <div className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-white dark:border-white/10 dark:bg-white/[0.02] dark:shadow-none dark:hover:bg-white/[0.04]'>
      {/* Subtle top glow on hover - no mouse tracking */}
      <div className='pointer-events-none absolute inset-x-0 top-0 z-0 h-[1px] w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-white/20' />

      {/* Sparkline SVG */}
      <div className='pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-16 overflow-hidden opacity-[0.08] dark:opacity-20'>
        <svg
          viewBox='0 0 100 30'
          preserveAspectRatio='none'
          className={`h-full w-full ${accentText}`}
        >
          <path
            d={`${sparkline} L100,30 L0,30 Z`}
            fill='currentColor'
            opacity='0.15'
          />
          <path
            d={sparkline}
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
          />
        </svg>
      </div>

      <div className='relative z-10 mb-6 flex items-start justify-between'>
        <Icon
          className={`h-5 w-5 opacity-70 transition-opacity group-hover:opacity-100 ${accentText}`}
        />
        <span className='text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/40'>
          {label.split(' ')[0]}
        </span>
      </div>

      <div className='relative z-10'>
        {loading ? (
          <div className='h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-white/10' />
        ) : (
          <AnimatedCounter
            value={value}
            className='text-3xl font-semibold tracking-tight text-slate-900 dark:text-white'
          />
        )}

        {subItems && subItems.length > 0 ? (
          <div className='mt-2 flex flex-wrap gap-x-3 gap-y-1'>
            {subItems.map(item => (
              <span key={item.label} className='flex items-center gap-1.5'>
                <span
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${item.dot}`}
                />
                <span className='text-xs text-slate-500 dark:text-white/40'>
                  {item.label}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className='mt-1 text-xs text-slate-500 dark:text-white/40'>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export const KpiCard = memo(KpiCardComponent)
