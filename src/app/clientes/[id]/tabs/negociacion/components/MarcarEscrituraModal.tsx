'use client'

import { useState } from 'react'

import { Stamp } from 'lucide-react'
import { toast } from 'sonner'

interface MarcarEscrituraModalProps {
  viviendaId: string
  viviendaLabel: string
  onClose: () => void
  onExitosa: () => void
}

export function MarcarEscrituraModal({
  viviendaId,
  viviendaLabel,
  onClose,
  onExitosa,
}: MarcarEscrituraModalProps) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [guardando, setGuardando] = useState(false)

  const handleConfirmar = async () => {
    if (!fecha) return
    setGuardando(true)
    try {
      const res = await fetch('/api/viviendas/escriturar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vivienda_id: viviendaId,
          fecha_escritura: fecha,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      toast.success('Vivienda marcada como Escriturada')
      onExitosa()
    } catch (err) {
      toast.error('Error al escriturar', {
        description: err instanceof Error ? err.message : 'Error desconocido',
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='w-full max-w-sm rounded-2xl border border-violet-200 bg-white p-6 shadow-2xl dark:border-violet-800/40 dark:bg-gray-900'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30'>
            <Stamp className='h-5 w-5 text-violet-600 dark:text-violet-400' />
          </div>
          <div>
            <h3 className='text-sm font-bold text-gray-900 dark:text-white'>
              Marcar como Escriturada
            </h3>
            <p className='text-[11px] text-gray-500 dark:text-gray-400'>
              {viviendaLabel}
            </p>
          </div>
        </div>
        <p className='mb-4 text-[12px] text-gray-600 dark:text-gray-300'>
          Esta acción indica que se firmaron las escrituras públicas. La
          vivienda pasará a estado{' '}
          <span className='font-semibold text-violet-600 dark:text-violet-400'>
            Escriturada
          </span>{' '}
          y ya no podrá trasladarse.
        </p>
        <label className='mb-1 block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400'>
          Fecha de escritura
        </label>
        <input
          type='date'
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className='mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
        />
        <div className='flex gap-2'>
          <button
            onClick={onClose}
            disabled={guardando}
            className='flex-1 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleConfirmar()}
            disabled={!fecha || guardando}
            className='flex-1 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50'
          >
            {guardando ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
