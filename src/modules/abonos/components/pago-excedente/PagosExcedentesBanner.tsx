'use client'

import { useState } from 'react'

import { ArrowLeftRight } from 'lucide-react'

import { formatCurrency } from '@/shared/utils/format'

import type { PagoExcedente } from '../../hooks/usePagosExcedentes'

import { ProcesarPagoExcedenteModal } from './ProcesarPagoExcedenteModal'

interface Props {
  pagos: PagoExcedente[]
  negociacionId: string
}

export function PagosExcedentesBanner({ pagos, negociacionId }: Props) {
  const pendientes = pagos.filter(p => p.estado === 'pendiente')
  const [selected, setSelected] = useState<PagoExcedente | null>(null)

  if (pendientes.length === 0) return null

  const totalExcedente = pendientes.reduce(
    (sum, p) => sum + p.monto_excedente,
    0
  )

  return (
    <>
      <div className='rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/20'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <ArrowLeftRight className='mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400' />
            <div>
              <p className='text-sm font-semibold text-amber-800 dark:text-amber-300'>
                Devolución pendiente al cliente —{' '}
                {formatCurrency(totalExcedente)}
              </p>
              <p className='mt-0.5 text-xs text-amber-700 dark:text-amber-400'>
                El cliente pagó más de lo que debía. Registra la devolución una
                vez realizada.
              </p>
            </div>
          </div>
          <div className='flex shrink-0 flex-col gap-1'>
            {pendientes.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className='rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600'
              >
                Registrar devolución
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected ? (
        <ProcesarPagoExcedenteModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          pagoExcedente={selected}
          negociacionId={negociacionId}
        />
      ) : null}
    </>
  )
}
