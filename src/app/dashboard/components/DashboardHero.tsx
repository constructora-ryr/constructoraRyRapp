'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

import Link from 'next/link'

export interface HeroAction {
  label: string
  href: string
  primary?: boolean
}

interface DashboardHeroProps {
  saludo: string
  nombre: string
  rol: string
  fechaHoy: string
  actions: HeroAction[]
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 120, damping: 20 },
  },
}

export function DashboardHero({
  saludo,
  nombre,
  rol,
  fechaHoy,
  actions,
}: DashboardHeroProps) {
  return (
    <motion.div
      variants={itemVariants}
      className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'
    >
      <div>
        <p className='text-sm text-slate-500 first-letter:uppercase dark:text-slate-400'>
          {fechaHoy}
        </p>
        <h1
          className='mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl'
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          {saludo}, {nombre}
          {rol && (
            <span className='ml-3 inline-flex translate-y-[-3px] items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 align-middle text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'>
              {rol}
            </span>
          )}
        </h1>
      </div>

      {actions.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {actions.map(action => (
            <Link
              key={action.href}
              href={action.href}
              className={
                action.primary
                  ? 'inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                  : 'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }
            >
              <Plus className='h-4 w-4' />
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
