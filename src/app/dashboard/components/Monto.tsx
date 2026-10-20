'use client'

import { Tooltip } from '@/shared/components/ui/Tooltip'
import { formatCurrency } from '@/shared/utils/format'

import { formatCOPCompact } from '../utils/dashboard-format'

interface MontoProps {
  value: number
  className?: string
  /**
   * false cuando el monto va dentro de un enlace (fila clicable): el tooltip
   * abre al pasar el cursor, pero no agrega un segundo foco de teclado
   */
  focusable?: boolean
  /** Texto a mostrar en lugar del valor abreviado (p.ej. un contador animado) */
  children?: React.ReactNode
}

/**
 * Monto abreviado ("$634 M") con el valor exacto ("$ 633.768.000") en un
 * tooltip al pasar el cursor o enfocar. El subrayado punteado indica que hay
 * más detalle.
 */
export function Monto({
  value,
  className = '',
  focusable = true,
  children,
}: MontoProps) {
  const completo = formatCurrency(value)
  const abreviado = formatCOPCompact(value)

  // Menos de mil: el abreviado ya es el valor exacto
  if (Math.abs(value) < 1000) {
    return <span className={className}>{children ?? abreviado}</span>
  }

  return (
    <Tooltip content={completo} delayDuration={150}>
      <span
        tabIndex={focusable ? 0 : undefined}
        aria-label={completo}
        className={`cursor-help underline decoration-slate-300 decoration-dotted underline-offset-4 outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-slate-400 dark:decoration-slate-600 ${className}`}
      >
        {children ?? abreviado}
      </span>
    </Tooltip>
  )
}
