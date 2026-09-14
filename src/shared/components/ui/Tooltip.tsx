/**
 * Componente: Tooltip
 *
 * Tooltip reutilizable usando Radix UI para mensajes contextuales
 *
 * Uso:
 * ```tsx
 * <Tooltip content="Mensaje del tooltip">
 *   <button>Botón</button>
 * </Tooltip>
 * ```
 */

'use client'

import { ReactNode } from 'react'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface TooltipProps {
  children: ReactNode
  content: string | ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  sideOffset?: number
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  sideOffset = 5,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className='z-50 max-w-xs overflow-hidden rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium leading-relaxed text-white shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border dark:border-gray-700 dark:bg-gray-800'
          >
            {content}
            <TooltipPrimitive.Arrow className='fill-gray-900 dark:fill-gray-800' />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
