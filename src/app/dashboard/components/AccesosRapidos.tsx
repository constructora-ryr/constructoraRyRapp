'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import Link from 'next/link'

import type { ModuleConfig } from '../config/modules.config'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

function getSpanClass(total: number, index: number): string {
  if (total === 1) return 'md:col-span-12 lg:col-span-6 lg:col-start-4'
  if (total === 2) return 'md:col-span-6 lg:col-span-6'
  if (total === 3) return 'md:col-span-4 lg:col-span-4'
  if (total === 4) return 'md:col-span-6 lg:col-span-3'
  if (total === 5)
    return index < 3
      ? 'md:col-span-4 lg:col-span-4'
      : 'md:col-span-6 lg:col-span-6'
  if (total === 6) return 'md:col-span-4 lg:col-span-4'
  if (total === 7)
    return index < 4
      ? 'md:col-span-6 lg:col-span-3'
      : 'md:col-span-4 lg:col-span-4'
  return 'md:col-span-6 lg:col-span-3'
}

interface AccesosRapidosProps {
  loading: boolean
  modules: ModuleConfig[]
}

function AccesosRapidosComponent({ loading, modules }: AccesosRapidosProps) {
  return (
    <motion.div variants={itemVariants} className='pb-2 pt-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-xl font-medium text-slate-900 dark:text-white'>
          Accesos Rápidos
        </h2>
        <div className='ml-6 h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10' />
      </div>

      {loading ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className='h-32 animate-pulse rounded-2xl border border-slate-200/60 bg-slate-100 dark:border-white/5 dark:bg-white/[0.02] md:col-span-6 lg:col-span-2'
            />
          ))}
        </div>
      ) : modules.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
          {modules.map((mod, index) => (
            <Link
              key={mod.modulo}
              href={mod.href}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:hover:shadow-none ${getSpanClass(modules.length, index)} ${mod.glowColor}`}
            >
              {/* Subtle glow on hover - no mouse tracking */}
              <div className='absolute inset-x-0 top-0 z-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-50 dark:via-white/30' />

              <div className='relative z-10 flex h-full flex-col justify-between'>
                <div className='mb-6 flex items-start justify-between'>
                  <div
                    className={`rounded-lg p-2.5 transition-colors ${mod.iconBgColor} ${mod.iconColor}`}
                  >
                    <mod.icon className='h-5 w-5' />
                  </div>
                  <ArrowRight className='h-4 w-4 text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-500 dark:text-white/20 dark:group-hover:text-white/60' />
                </div>
                <div>
                  <h3 className='text-base font-medium text-slate-800 group-hover:text-slate-900 dark:text-white/90 dark:group-hover:text-white'>
                    {mod.title}
                  </h3>
                  <p className='mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                    {mod.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border border-slate-200/60 bg-white/60 p-8 text-center dark:border-white/5 dark:bg-white/[0.02]'>
          <p className='text-slate-500 dark:text-white/40'>
            No tienes acceso a ningún módulo
          </p>
        </div>
      )}
    </motion.div>
  )
}

export const AccesosRapidos = memo(AccesosRapidosComponent)
