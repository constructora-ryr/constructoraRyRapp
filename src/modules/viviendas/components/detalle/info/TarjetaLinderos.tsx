/**
 * Linderos con la misma insignia de color (N, S, O, Occ) del formulario,
 * en cuadrícula 2×2 desde tablet.
 */

'use client'

import { Compass } from 'lucide-react'

import { LINDEROS } from '@/modules/viviendas/constants/linderos'
import type { Vivienda } from '@/modules/viviendas/types'
import { cn } from '@/shared/utils/helpers'

import { TarjetaDetalle } from '../piezas'

export function TarjetaLinderos({
  vivienda,
  className,
}: {
  vivienda: Vivienda
  className?: string
}) {
  return (
    <TarjetaDetalle
      titulo='Linderos'
      icon={Compass}
      degradado='from-violet-500 to-purple-600'
      className={className}
    >
      <ul className='grid gap-2 md:grid-cols-2'>
        {LINDEROS.map(l => (
          <li
            key={l.campo}
            className='flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900/50'
          >
            <span
              className={cn(
                'mt-0.5 flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br px-1 text-[10px] font-bold text-white',
                l.color
              )}
            >
              {l.letra}
            </span>
            <div className='min-w-0'>
              <p className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
                {l.nombre}
              </p>
              <p className='break-words text-sm text-slate-900 dark:text-white'>
                {vivienda[l.campo] || '—'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </TarjetaDetalle>
  )
}
