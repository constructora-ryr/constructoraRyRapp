'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

interface BotonFormatoProps {
  onClick: () => void
  icon: LucideIcon
  label: string
  atajo?: string
  active?: boolean
  disabled?: boolean
  /** 'oscuro': en la barra flotante (fondo carbón) */
  tono?: 'claro' | 'oscuro'
}

/** Botón de formato de la barra del editor y de la barra flotante */
export function BotonFormato({
  onClick,
  icon: Icon,
  label,
  atajo,
  active = false,
  disabled = false,
  tono = 'claro',
}: BotonFormatoProps) {
  return (
    <button
      type='button'
      title={atajo ? `${label} (${atajo})` : label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Sin perder la selección del editor al hacer clic
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30',
        tono === 'claro'
          ? active
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
          : active
            ? 'bg-white/20 text-white'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon className='h-4 w-4' />
    </button>
  )
}
