'use client'

import { useEffect, useState } from 'react'

import { ArrowLeftRight, Loader2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/shared/utils/format'

import type { PagoExcedente } from '../../hooks/usePagosExcedentes'
import { useProcesarPagoExcedente } from '../../hooks/usePagosExcedentes'

interface Props {
  isOpen: boolean
  onClose: () => void
  pagoExcedente: PagoExcedente
  negociacionId: string
}

export function ProcesarPagoExcedenteModal({
  isOpen,
  onClose,
  pagoExcedente,
  negociacionId,
}: Props) {
  const [fecha, setFecha] = useState(getTodayDateString())
  const [notas, setNotas] = useState('')
  const mutation = useProcesarPagoExcedente(negociacionId)

  useEffect(() => {
    if (isOpen) {
      setFecha(getTodayDateString())
      setNotas('')
    }
  }, [isOpen])

  const handleSubmit = async () => {
    await mutation.mutateAsync({
      id: pagoExcedente.id,
      fecha_procesado: fecha,
      notas: notas.trim() || null,
    })
    onClose()
  }

  if (typeof window === 'undefined' || !isOpen) return null

  return createPortal(
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-900'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between rounded-t-2xl bg-amber-500 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <ArrowLeftRight className='h-5 w-5 text-white' />
            <div>
              <h2 className='text-base font-bold text-white'>
                Registrar Devolución al Cliente
              </h2>
              <p className='text-xs text-white/80'>
                Monto a devolver:{' '}
                <strong>{formatCurrency(pagoExcedente.monto_excedente)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='rounded-full p-1 text-white/80 transition hover:bg-white/20'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div className='space-y-4 p-5'>
          {/* Resumen */}
          <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-900/20'>
            <p className='text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400'>
              Resumen del excedente
            </p>
            <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
              <span className='text-gray-600 dark:text-gray-400'>Pagó</span>
              <span className='text-right font-semibold'>
                {formatCurrency(pagoExcedente.monto_pagado)}
              </span>
              <span className='text-gray-600 dark:text-gray-400'>Debía</span>
              <span className='text-right font-semibold'>
                {formatCurrency(pagoExcedente.monto_esperado)}
              </span>
              <span className='font-semibold text-amber-700 dark:text-amber-400'>
                A devolver
              </span>
              <span className='text-right text-base font-bold text-amber-700 dark:text-amber-400'>
                {formatCurrency(pagoExcedente.monto_excedente)}
              </span>
            </div>
          </div>

          {/* Fecha devolución */}
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Fecha de devolución *
            </label>
            <input
              type='date'
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              max={getTodayDateString()}
              className='w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            />
          </div>

          {/* Notas opcionales */}
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder='Método de devolución, número de transferencia, etc.'
              rows={2}
              className='w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
            />
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-2 border-t border-gray-100 px-5 py-4 dark:border-white/5'>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className='rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!fecha || mutation.isPending}
            className='flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50'
          >
            {mutation.isPending && (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            )}
            Confirmar devolución
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
