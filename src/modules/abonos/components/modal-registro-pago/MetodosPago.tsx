'use client'

import { ArrowRightLeft, Banknote, Check, FileCheck, Info } from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

import type { MetodoPago, ModoRegistro } from '../../types'

import { METODO_PAGO_GRADIENTE } from './ModalRegistroPago.styles'

interface MetodosPagoProps {
  modo: ModoRegistro
  metodosDisponibles: MetodoPago[]
  metodoPago: MetodoPago | null
  onMetodoChange: (metodo: MetodoPago) => void
}

const ICONO_METODO: Partial<
  Record<MetodoPago, React.ComponentType<{ className?: string }>>
> = {
  Efectivo: Banknote,
  Transferencia: ArrowRightLeft,
  Cheque: FileCheck,
}

export function MetodosPago({
  modo,
  metodosDisponibles,
  metodoPago,
  onMetodoChange,
}: MetodosPagoProps) {
  return (
    <div>
      <p className='mb-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100'>
        ¿Cómo se recibió? <span className='text-red-500'>*</span>
      </p>

      <div
        role='radiogroup'
        className={cn(
          'grid gap-2',
          metodosDisponibles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
        )}
      >
        {metodosDisponibles.map(metodo => {
          const Icono = ICONO_METODO[metodo] ?? ArrowRightLeft
          const activo = metodoPago === metodo
          return (
            <button
              key={metodo}
              type='button'
              role='radio'
              aria-checked={activo}
              onClick={() => onMetodoChange(metodo)}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2.5 transition-all',
                activo
                  ? cn(
                      'border-transparent bg-gradient-to-br text-white shadow-md',
                      METODO_PAGO_GRADIENTE[metodo] ??
                        'from-gray-500 to-gray-600'
                    )
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600'
              )}
            >
              {activo ? (
                <span className='absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow ring-1 ring-black/5'>
                  <Check className='h-3 w-3 text-emerald-600' />
                </span>
              ) : null}
              <Icono className='h-5 w-5' />
              <span className='text-xs font-semibold'>{metodo}</span>
            </button>
          )
        })}
      </div>

      {modo === 'desembolso' ? (
        <p className='mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400'>
          <Info className='h-3.5 w-3.5 flex-shrink-0' aria-hidden='true' />
          Los desembolsos de entidades llegan por transferencia o cheque, no en
          efectivo.
        </p>
      ) : null}
    </div>
  )
}
