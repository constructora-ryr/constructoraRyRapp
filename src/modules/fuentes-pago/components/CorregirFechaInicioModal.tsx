'use client'

import { useMemo, useState } from 'react'

import { CalendarClock, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type {
  CreditoConstructora,
  PeriodoCredito,
} from '@/modules/fuentes-pago/types'
import { sumarMeses } from '@/modules/fuentes-pago/utils/calculos-credito'

interface CorregirFechaInicioModalProps {
  creditoActual: CreditoConstructora
  periodos: PeriodoCredito[]
  procesando: boolean
  onConfirmar: (nuevaFechaInicio: Date) => Promise<void>
  onCerrar: () => void
}

export function CorregirFechaInicioModal({
  creditoActual,
  periodos,
  procesando,
  onConfirmar,
  onCerrar,
}: CorregirFechaInicioModalProps) {
  const fechaOriginalStr = creditoActual.fecha_inicio // YYYY-MM-DD
  const [fechaStr, setFechaStr] = useState(fechaOriginalStr)

  // Calcular desplazamiento en meses y preview de cuotas
  const { mesesDiff, cuotasPreview } = useMemo(() => {
    const original = new Date(fechaOriginalStr + 'T12:00:00')
    const nueva = new Date(fechaStr + 'T12:00:00')
    const diff =
      (nueva.getFullYear() - original.getFullYear()) * 12 +
      (nueva.getMonth() - original.getMonth())

    const preview = periodos.map(p => {
      const fechaActual = new Date(
        p.fecha_vencimiento.slice(0, 10) + 'T12:00:00'
      )
      return {
        numero: p.numero_cuota,
        fechaOriginal: fechaActual,
        fechaNueva: sumarMeses(fechaActual, diff),
        valorCuota: p.valor_cuota,
        estado: p.estado_periodo,
      }
    })

    return { mesesDiff: diff, cuotasPreview: preview }
  }, [fechaOriginalStr, fechaStr, periodos])

  const sinCambio = mesesDiff === 0

  const handleConfirmar = async () => {
    if (sinCambio) return
    await onConfirmar(new Date(fechaStr + 'T12:00:00'))
  }

  return createPortal(
    <>
      <div
        className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm'
        onClick={onCerrar}
        aria-hidden='true'
      />

      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-corregir-fecha-title'
        className='fixed inset-x-0 bottom-0 z-[9999] mx-auto max-w-lg sm:inset-0 sm:flex sm:items-center sm:justify-center'
      >
        <div className='w-full rounded-t-2xl bg-white shadow-2xl dark:bg-gray-900 sm:rounded-2xl'>
          {/* Header */}
          <div className='flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 sm:rounded-t-2xl'>
            <div className='flex items-center gap-2 text-white'>
              <CalendarClock className='h-5 w-5' />
              <h2
                id='modal-corregir-fecha-title'
                className='text-base font-bold'
              >
                Corregir Fecha de Inicio
              </h2>
            </div>
            <button
              onClick={onCerrar}
              disabled={procesando}
              aria-label='Cerrar'
              className='rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white disabled:opacity-50'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='space-y-4 p-5'>
            {/* Info */}
            <div className='rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'>
              Mueve todas las fechas de cuotas el mismo número de meses sin
              recalcular montos. Úsalo solo para correcciones de error.
            </div>

            {/* Fechas */}
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='mb-1 text-xs font-medium text-gray-500 dark:text-gray-400'>
                  Fecha actual
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {formatDateCompact(fechaOriginalStr)}
                </p>
              </div>
              <div>
                <label className='mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300'>
                  Nueva fecha de inicio
                </label>
                <input
                  type='date'
                  value={fechaStr}
                  onChange={e => setFechaStr(e.target.value)}
                  className='w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                />
              </div>
            </div>

            {/* Indicador de desplazamiento */}
            {!sinCambio && (
              <div
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  mesesDiff > 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                }`}
              >
                {mesesDiff > 0 ? '▶' : '◀'} Todas las cuotas se corren{' '}
                {Math.abs(mesesDiff)}{' '}
                {Math.abs(mesesDiff) === 1 ? 'mes' : 'meses'} hacia{' '}
                {mesesDiff > 0 ? 'adelante' : 'atrás'}
              </div>
            )}

            {/* Preview cuotas */}
            <div className='max-h-52 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700'>
              <table className='w-full text-xs'>
                <thead className='sticky top-0 bg-gray-50 dark:bg-gray-800'>
                  <tr>
                    <th className='px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400'>
                      N°
                    </th>
                    <th className='px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400'>
                      Fecha actual
                    </th>
                    <th className='px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400'>
                      Nueva fecha
                    </th>
                    <th className='px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400'>
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                  {cuotasPreview.map(c => (
                    <tr key={c.numero} className='bg-white dark:bg-gray-900'>
                      <td className='px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300'>
                        {c.numero}
                      </td>
                      <td className='px-3 py-1.5 text-gray-500 line-through dark:text-gray-400'>
                        {formatDateCompact(
                          c.fechaOriginal.toISOString().slice(0, 10)
                        )}
                      </td>
                      <td
                        className={`px-3 py-1.5 font-medium ${
                          sinCambio
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {formatDateCompact(
                          c.fechaNueva.toISOString().slice(0, 10)
                        )}
                      </td>
                      <td className='px-3 py-1.5 text-right text-gray-700 dark:text-gray-300'>
                        ${c.valorCuota.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botones */}
            <div className='flex gap-3'>
              <button
                onClick={onCerrar}
                disabled={procesando}
                className='flex-1 rounded-xl border-2 border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={procesando || sinCambio}
                className='flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600 disabled:opacity-50'
              >
                {procesando ? 'Aplicando...' : 'Corregir fechas'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
