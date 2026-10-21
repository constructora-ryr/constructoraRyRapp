/**
 * Carga de una sección, pestaña o modal. Envoltorio del Cargador común
 * (shared/components/carga) que conserva la API que ya usan ~18 pantallas.
 *
 * ```tsx
 * <SectionLoadingSpinner label='Cargando cuotas' moduleName='negociaciones' icon={CreditCard} />
 * ```
 */

import type { LucideIcon } from 'lucide-react'

import { Cargador } from '@/shared/components/carga'
import type { ModuleName } from '@/shared/config/module-themes'

interface SectionLoadingSpinnerProps {
  label: string
  icon?: LucideIcon
  /** Color del módulo; por defecto clientes */
  moduleName?: ModuleName
  /** Clase del contenedor (posición / espaciado) */
  className?: string
}

export function SectionLoadingSpinner({
  label,
  icon,
  moduleName = 'clientes',
  className = 'flex items-center justify-center py-16',
}: SectionLoadingSpinnerProps) {
  return (
    <div className={className}>
      <Cargador modulo={moduleName} icon={icon} label={label} />
    </div>
  )
}
