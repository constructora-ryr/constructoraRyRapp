'use client'

import {
  ArrowDownToLine,
  Calendar,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Receipt,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { formatearMoneda } from './formatearValor'

interface Props {
  evento: EventoHistorialHumanizado
}

export function DevolucionExcedenteRenderer({ evento }: Props) {
  const meta = evento.metadata ?? {}

  const montoDevuelto = meta.monto_devuelto as number | null | undefined
  const metodoDevolucion = String(meta.metodo_devolucion ?? '').trim() || null
  const numeroComprobante = String(meta.numero_comprobante ?? '').trim() || null
  const fechaDevolucion = String(meta.fecha_devolucion ?? '').trim() || null
  const notasCierre = String(meta.notas_cierre ?? '').trim() || null
  const procesadoPor = String(meta.procesado_por ?? '').trim() || null

  return (
    <div className='space-y-3'>
      {/* Banner: devolución procesada */}
      <div className='flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-800 dark:bg-amber-950/30'>
        <CheckCircle2 className='h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400' />
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300'>
            Excedente devuelto al cliente
          </p>
          <p className='text-sm font-bold text-amber-700 dark:text-amber-300'>
            Devolución registrada exitosamente
          </p>
        </div>
      </div>

      {/* Detalle */}
      <section>
        <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400'>
          Detalle de la devolución
        </p>
        <div className='overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/50'>
          {montoDevuelto ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <DollarSign className='mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Monto devuelto
                </p>
                <p className='mt-0.5 text-sm font-bold text-amber-700 dark:text-amber-300'>
                  {formatearMoneda(montoDevuelto)}
                </p>
              </div>
            </div>
          ) : null}

          {metodoDevolucion ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <ArrowDownToLine className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Método
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {metodoDevolucion}
                </p>
              </div>
            </div>
          ) : null}

          {numeroComprobante ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <Receipt className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  N.º comprobante
                </p>
                <p className='mt-0.5 font-mono text-sm text-gray-900 dark:text-white'>
                  {numeroComprobante}
                </p>
              </div>
            </div>
          ) : null}

          {fechaDevolucion ? (
            <div className='flex items-start gap-2.5 border-b border-gray-100 px-3 py-2 dark:border-gray-800'>
              <Calendar className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Fecha de devolución
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {formatDateCompact(fechaDevolucion)}
                </p>
              </div>
            </div>
          ) : null}

          {procesadoPor ? (
            <div className='flex items-start gap-2.5 px-3 py-2'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
              <div>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                  Registrado por
                </p>
                <p className='mt-0.5 text-sm text-gray-900 dark:text-white'>
                  {procesadoPor}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {notasCierre ? (
        <section>
          <p className='mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400'>
            Observaciones
          </p>
          <div className='flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50'>
            <ClipboardList className='mt-0.5 h-4 w-4 shrink-0 text-gray-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {notasCierre}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  )
}
