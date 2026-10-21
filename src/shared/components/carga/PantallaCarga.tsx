/**
 * Carga a pantalla completa (loading.tsx de cada ruta y validación de
 * sesión). Fondo con un toque del color del módulo y el Cargador grande.
 */

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import type { TemaCarga } from './carga-temas'
import { Cargador } from './Cargador'

export function PantallaCarga({
  modulo = 'app',
  icon,
  label = 'Cargando',
  className,
}: {
  modulo?: TemaCarga
  icon?: LucideIcon
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[60vh] w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900',
        className
      )}
    >
      <Cargador modulo={modulo} icon={icon} label={label} tamano='lg' />
    </div>
  )
}
