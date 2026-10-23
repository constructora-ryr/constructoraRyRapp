'use client'

import { useState } from 'react'

import { CheckCircle2, Download, Loader2 } from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'

import { formatCurrency } from './ModalRegistroPago.styles'
import type { AbonoRegistrado } from './useModalRegistroPago'

interface PantallaExitoPagoProps {
  abono: AbonoRegistrado
  esDesembolso: boolean
  fuenteTipo: string
  onDescargarRecibo?: () => Promise<void>
  onCerrar: () => void
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className='flex items-center justify-between gap-3 text-sm'>
      <span className='text-gray-600 dark:text-gray-300'>{etiqueta}</span>
      <span className='text-right font-semibold text-gray-900 dark:text-white'>
        {valor}
      </span>
    </div>
  )
}

export function PantallaExitoPago({
  abono,
  esDesembolso,
  fuenteTipo,
  onDescargarRecibo,
  onCerrar,
}: PantallaExitoPagoProps) {
  const [descargando, setDescargando] = useState(false)

  const descargar = async () => {
    if (!onDescargarRecibo) return
    setDescargando(true)
    try {
      await onDescargarRecibo()
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className='flex flex-col items-center px-5 pb-6 pt-8 text-center'>
      <span className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30'>
        <CheckCircle2 className='h-11 w-11 text-white' />
      </span>

      <h3 className='mt-4 text-xl font-bold text-gray-900 dark:text-white'>
        {esDesembolso ? '¡Desembolso registrado!' : '¡Abono registrado!'}
      </h3>
      <p className='mt-1 rounded-full bg-gray-100 px-3 py-0.5 font-mono text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200'>
        Recibo {formatearNumeroRecibo(abono.numero_recibo)}
      </p>

      <p className='mt-4 text-3xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400'>
        {formatCurrency(abono.monto)}
      </p>

      <div className='mt-4 w-full max-w-sm space-y-2 rounded-2xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:ring-gray-700'>
        <Fila etiqueta='Fuente' valor={fuenteTipo} />
        <Fila etiqueta='Método' valor={abono.metodo_pago} />
        <Fila etiqueta='Fecha' valor={formatDateCompact(abono.fecha_abono)} />
        {abono.saldoFuente != null ? (
          <Fila
            etiqueta='Saldo de la fuente'
            valor={
              abono.saldoFuente > 0
                ? formatCurrency(abono.saldoFuente)
                : 'Pagada al 100 %'
            }
          />
        ) : null}
      </div>

      <div className='mt-5 flex w-full max-w-sm flex-col gap-2'>
        {onDescargarRecibo ? (
          <button
            type='button'
            onClick={descargar}
            disabled={descargando}
            className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 disabled:opacity-60'
          >
            {descargando ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Download className='h-4 w-4' />
            )}
            Descargar recibo PDF
          </button>
        ) : (
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            El recibo PDF está disponible en el historial de abonos.
          </p>
        )}
        <button
          type='button'
          onClick={onCerrar}
          className='h-11 w-full rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
        >
          Listo
        </button>
      </div>
    </div>
  )
}
