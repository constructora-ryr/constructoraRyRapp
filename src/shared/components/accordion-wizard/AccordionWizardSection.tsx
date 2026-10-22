'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { moduleThemes } from '@/shared/config/module-themes'

import {
  checkAppearAnim,
  progressBarTransition,
  sectionExpandAnim,
} from './accordion-wizard.animations'
import { getAccordionWizardStyles } from './accordion-wizard.styles'
import type { AccordionWizardSectionProps } from './accordion-wizard.types'
import { AccordionWizardGuia } from './AccordionWizardGuia'
import { AccordionWizardSummary } from './AccordionWizardSummary'

const CHIP =
  'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400'

/**
 * Sección del accordion con 3 estados visuales:
 * - completed: tarjeta compacta con check, resumen en chips y "Editar"
 * - active: expandida con ícono del módulo, guía del paso y contenido
 * - pending: contorno punteado, atenuada, sin interacción
 */
export function AccordionWizardSection({
  status,
  stepNumber,
  title,
  description,
  icon: StepIcon,
  fieldCount,
  currentStep,
  totalSteps,
  progress,
  moduleName,
  summaryItems,
  onEdit,
  changeCount,
  children,
}: AccordionWizardSectionProps) {
  const styles = getAccordionWizardStyles(moduleName)

  // ── Completed ──────────────────────────────────────────
  if (status === 'completed') {
    return (
      <motion.div
        className={styles.section.completed}
        onClick={onEdit}
        role='button'
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') onEdit?.()
        }}
        layout
      >
        <div className='flex items-center gap-3'>
          <motion.div
            className={styles.stepCircle.completed}
            initial={checkAppearAnim.initial}
            animate={checkAppearAnim.animate}
            transition={checkAppearAnim.transition}
          >
            <Check className='h-4 w-4 text-white' strokeWidth={3} />
          </motion.div>

          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
              {title}
            </p>
            {summaryItems ? (
              <AccordionWizardSummary items={summaryItems} />
            ) : null}
          </div>

          {changeCount != null && changeCount > 0 ? (
            <span className='inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-400'>
              <Pencil className='h-3 w-3' />
              {changeCount} {changeCount === 1 ? 'cambio' : 'cambios'}
            </span>
          ) : null}

          {onEdit ? (
            <button
              type='button'
              onClick={e => {
                e.stopPropagation()
                onEdit()
              }}
              className={styles.editButton}
              aria-label={`Editar ${title}`}
            >
              <Pencil className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>Editar</span>
            </button>
          ) : null}
        </div>
      </motion.div>
    )
  }

  // ── Active ─────────────────────────────────────────────
  if (status === 'active') {
    const degradado = moduleThemes[moduleName].classes.gradient.primary
    return (
      <motion.div className={styles.section.active} layout>
        <div className='flex items-center gap-3 px-4 pb-3 pt-4 sm:px-6 sm:pt-5'>
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
              degradado
            )}
          >
            {StepIcon ? (
              <StepIcon className='h-5 w-5' />
            ) : (
              <span className='text-sm font-bold'>{stepNumber}</span>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-base font-bold text-gray-900 dark:text-white'>
              {title}
            </p>
            <div className='mt-1 flex flex-wrap items-center gap-1.5'>
              {currentStep != null && totalSteps != null ? (
                <span className={CHIP}>
                  Paso {currentStep} de {totalSteps}
                </span>
              ) : null}
              {fieldCount?.required ? (
                <span className={CHIP}>
                  {fieldCount.required} obligatorio
                  {fieldCount.required !== 1 ? 's' : ''}
                </span>
              ) : null}
              {fieldCount?.optional ? (
                <span className={CHIP}>
                  {fieldCount.optional} opcional
                  {fieldCount.optional !== 1 ? 'es' : ''}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {description ? (
          <div className='px-4 pb-4 sm:px-6'>
            <AccordionWizardGuia texto={description} moduleName={moduleName} />
          </div>
        ) : null}

        {/* Progreso del paso, solo si hay progreso real (> 0%) */}
        {progress != null && progress > 0 ? (
          <div className={cn('mx-4 sm:mx-6', styles.progressBar.track)}>
            <motion.div
              className={styles.progressBar.fill}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              transition={progressBarTransition}
            />
          </div>
        ) : null}

        <AnimatePresence mode='wait'>
          <motion.div
            key={`section-content-${stepNumber}`}
            initial={sectionExpandAnim.initial}
            animate={sectionExpandAnim.animate}
            exit={sectionExpandAnim.exit}
            transition={sectionExpandAnim.transition}
            className='px-4 pb-5 sm:px-6'
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  // ── Pending ────────────────────────────────────────────
  return (
    <motion.div className={styles.section.pending} layout>
      <div className='flex items-center gap-3'>
        <div className={styles.stepCircle.pending}>
          <span className={styles.stepNumber.pending}>{stepNumber}</span>
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-gray-500 dark:text-gray-400'>
            {title}
          </p>
          {totalSteps != null ? (
            <p className='text-[11px] text-gray-400 dark:text-gray-500'>
              Paso {stepNumber} de {totalSteps}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
