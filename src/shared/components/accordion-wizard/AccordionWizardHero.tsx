/**
 * AccordionWizardHero — Encabezado de los asistentes, sobrio como el de los
 * listados (ListPageHeader): ícono con el color del módulo, título,
 * subtítulo, datos en texto (pasos, tiempo, obligatorio) y, si se pasa
 * `currentStep`, una barra segmentada con el avance en el color del módulo.
 * El protagonista es el formulario: sin banner de color.
 */

'use client'

import { motion } from 'framer-motion'
import { Clock, type LucideIcon } from 'lucide-react'

import { colorDeModulo } from '@/shared/config/color-modulo'
import type { ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

interface AccordionWizardHeroProps {
  /** Ícono principal del wizard */
  icon: LucideIcon
  /** Título (ej: "Nuevo cliente") */
  title: string
  /** Subtítulo descriptivo */
  subtitle: string
  /** Módulo: da el color del ícono y de la barra de avance */
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
  const color = colorDeModulo(moduleName).icono

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className='space-y-3'
    >
      <div className='flex items-start gap-3'>
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            color
          )}
        >
          <Icon className='h-5 w-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white'>
            {title}
          </h1>
          <p className='mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400'>
            {subtitle}
          </p>
          <p className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400'>
            {currentStep && totalSteps ? (
              <span className='font-semibold text-slate-700 dark:text-slate-200'>
                Paso {currentStep} de {totalSteps}
              </span>
            ) : totalSteps ? (
              <span>{totalSteps} pasos</span>
            ) : null}
            {estimatedTime ? (
              <span className='inline-flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                {estimatedTime}
              </span>
            ) : null}
            <span>
              <span className='text-rose-500'>*</span> obligatorio
            </span>
          </p>
        </div>
      </div>

      {currentStep && totalSteps ? (
        <div
          className='flex gap-1.5'
          role='progressbar'
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          aria-label={`Paso ${currentStep} de ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className='h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'
            >
              <span
                className={cn(
                  'block h-full origin-left rounded-full bg-gradient-to-r transition-transform duration-300',
                  color,
                  i < currentStep ? 'scale-x-100' : 'scale-x-0'
                )}
              />
            </span>
          ))}
        </div>
      ) : null}
    </motion.header>
  )
}
