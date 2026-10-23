/**
 * AccordionWizardHero — Header de los wizards: ícono del módulo, título,
 * subtítulo, chips (pasos, tiempo, obligatorio) y, si se pasa
 * `currentStep`, una barra segmentada con el avance.
 */

'use client'

import { motion } from 'framer-motion'
import { Clock, type LucideIcon } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'

// ── Gradientes JIT-safe por módulo ───────────────────────
const HERO_BG: Record<string, string> = {
  proyectos:
    'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800',
  viviendas:
    'from-orange-600 via-amber-600 to-yellow-600 dark:from-orange-700 dark:via-amber-700 dark:to-amber-800',
  clientes:
    'from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800',
  negociaciones: 'from-pink-600 via-purple-600 to-indigo-600',
  abonos:
    'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800',
  documentos:
    'from-red-600 via-rose-600 to-pink-600 dark:from-red-700 dark:via-rose-700 dark:to-pink-800',
  auditorias:
    'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-800',
}

const HERO_SHADOW: Record<string, string> = {
  proyectos: 'shadow-green-500/25',
  viviendas: 'shadow-orange-500/25',
  clientes: 'shadow-cyan-500/25',
  negociaciones: 'shadow-pink-500/25',
  abonos: 'shadow-blue-500/25',
  documentos: 'shadow-red-500/25',
  auditorias: 'shadow-blue-500/25',
}

interface AccordionWizardHeroProps {
  /** Ícono principal del wizard */
  icon: LucideIcon
  /** Título grande (ej: "Nuevo Cliente") */
  title: string
  /** Subtítulo descriptivo */
  subtitle: string
  /** Módulo para theming */
  moduleName: ModuleName
  /** Tiempo estimado (ej: "~2 minutos") */
  estimatedTime?: string
  /** Total de pasos */
  totalSteps?: number
  /** Paso en curso: muestra la barra de avance (opcional) */
  currentStep?: number
}

export function AccordionWizardHero({
  icon: Icon,
  title,
  subtitle,
  moduleName,
  estimatedTime,
  totalSteps,
  currentStep,
}: AccordionWizardHeroProps) {
  const gradient = HERO_BG[moduleName] ?? HERO_BG.proyectos
  const shadow = HERO_SHADOW[moduleName] ?? HERO_SHADOW.proyectos

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 shadow-xl ${shadow}`}
    >
      {/* Retícula fina que se desvanece hacia la izquierda + brillo */}
      <div
        aria-hidden
        className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_left,black,transparent_70%)]'
      />
      <div
        aria-hidden
        className='absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/20 blur-3xl'
      />

      <div className='relative z-10 flex items-start gap-4'>
        {/* Ícono */}
        <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
          <Icon className='h-6 w-6 text-white' />
        </div>

        {/* Texto */}
        <div className='min-w-0 flex-1'>
          <h1 className='text-xl font-bold tracking-tight text-white sm:text-2xl'>
            {title}
          </h1>
          <p className='mt-1 text-sm leading-relaxed text-white/80'>
            {subtitle}
          </p>

          {/* Chips informativos */}
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            {totalSteps ? (
              <span className='inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm'>
                {totalSteps} pasos
              </span>
            ) : null}
            {estimatedTime ? (
              <span className='inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm'>
                <Clock className='h-3 w-3' />
                {estimatedTime}
              </span>
            ) : null}
            <span className='inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm'>
              * = obligatorio
            </span>
          </div>

          {currentStep && totalSteps ? (
            <div
              className='mt-4 flex gap-1.5'
              role='progressbar'
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-valuenow={currentStep}
              aria-label={`Paso ${currentStep} de ${totalSteps}`}
            >
              {Array.from({ length: totalSteps }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i < currentStep ? 'bg-white' : 'bg-white/25'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
