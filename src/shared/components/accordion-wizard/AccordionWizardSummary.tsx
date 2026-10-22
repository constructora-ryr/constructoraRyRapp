'use client'

import { motion } from 'framer-motion'

import { summaryAppearAnim } from './accordion-wizard.animations'
import type { SummaryItem } from './accordion-wizard.types'

interface AccordionWizardSummaryProps {
  items: SummaryItem[]
}

/**
 * Resumen de una sección completada: cada valor en un chip; la etiqueta
 * queda como tooltip para no recargar la línea.
 */
export function AccordionWizardSummary({ items }: AccordionWizardSummaryProps) {
  const visibles = items.filter(item => item.value != null && item.value !== '')
  if (visibles.length === 0) return null

  return (
    <motion.div
      className='mt-1 flex flex-wrap gap-1.5'
      initial={summaryAppearAnim.initial}
      animate={summaryAppearAnim.animate}
      transition={summaryAppearAnim.transition}
    >
      {visibles.map(item => (
        <span
          key={item.label}
          title={item.label}
          className='inline-flex max-w-full items-center truncate rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        >
          {String(item.value)}
        </span>
      ))}
    </motion.div>
  )
}
