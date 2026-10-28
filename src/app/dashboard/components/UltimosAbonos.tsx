'use client'

import { memo } from 'react'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  Clock,
  Wallet,
} from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'

import type { UltimoAbono } from '../hooks/useDashboardStats'
import {
  diasEntre,
  formatFechaCorta,
  formatFechaHora,
} from '../utils/dashboard-format'

import { Monto } from './Monto'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
}

/** Desde cuántos días de diferencia se resalta un registro tardío */
const UMBRAL_REGISTRO_TARDIO = 7

/** "A17 - Pablo Barrios" */
function etiquetaAbono(a: UltimoAbono): string {
  const vivienda = `${a.manzana ?? ''}${a.casa ?? ''}`
  const cliente = a.cliente ?? 'Cliente'
  return vivienda ? `${vivienda} - ${cliente}` : cliente
}

interface UltimosAbonosProps {
  loading: boolean
  abonos: UltimoAbono[]
  canNavigate: boolean
}

function UltimosAbonosComponent({
  loading,
  abonos,
  canNavigate,
}: UltimosAbonosProps) {
  return (
    <motion.section
      variants={itemVariants}
      aria-labelledby='ultimos-abonos-title'
      className='flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:shadow-none'
    >
      <div className='mb-5 flex items-start justify-between gap-3'>
        <div>
          <h2
            id='ultimos-abonos-title'
            className='text-lg font-medium text-slate-900 dark:text-white'
          >
            Últimos abonos
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            Registrados más recientemente
          </p>
        </div>
        {canNavigate && (
          <Link
            href='/abonos'
            className='flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
          >
            Abonos <ArrowRight className='h-4 w-4' />
          </Link>
        )}
      </div>

      {loading ? (
        <div className='space-y-3'>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='h-[68px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/50'
            />
          ))}
        </div>
      ) : abonos.length === 0 ? (
        <div className='flex flex-1 flex-col items-center justify-center py-10 text-center'>
          <span className='mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'>
            <Wallet className='h-6 w-6' />
          </span>
          <p className='text-sm font-medium text-slate-700 dark:text-slate-200'>
            Aún no hay abonos registrados
          </p>
        </div>
      ) : (
        // En escritorio la tarjeta toma la altura de la columna vecina y la
        // lista hace scroll interno; en móvil se muestra completa
        <ul className='custom-scrollbar -mx-2 flex min-h-0 flex-1 flex-col divide-y divide-slate-100 overflow-y-auto pr-1 dark:divide-slate-700/50'>
          {abonos.map(a => {
            const dias = diasEntre(a.fechaPago, a.fechaRegistro)
            const tardio = dias >= UMBRAL_REGISTRO_TARDIO
            const detalle = [
              a.fuente,
              a.recibo,
              a.registradoPor && `por ${a.registradoPor}`,
            ]
              .filter(Boolean)
              .join(' · ')

            const body = (
              <>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-baseline justify-between gap-3'>
                    <span className='truncate text-sm font-medium text-slate-900 dark:text-white'>
                      {etiquetaAbono(a)}
                    </span>
                    <span className='shrink-0 text-sm font-semibold text-slate-900 dark:text-white'>
                      <Monto value={a.monto} focusable={!canNavigate} />
                    </span>
                  </div>

                  <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600 dark:text-slate-300'>
                    <span className='inline-flex items-center gap-1'>
                      <CalendarCheck
                        className='h-3.5 w-3.5 text-emerald-500'
                        aria-hidden
                      />
                      <span className='text-slate-500 dark:text-slate-400'>
                        Pago
                      </span>
                      {formatFechaCorta(a.fechaPago)}
                    </span>
                    <span className='inline-flex items-center gap-1'>
                      <Clock
                        className='h-3.5 w-3.5 text-slate-500 dark:text-slate-400'
                        aria-hidden
                      />
                      <span className='text-slate-500 dark:text-slate-400'>
                        Registro
                      </span>
                      {formatFechaHora(a.fechaRegistro)}
                    </span>
                    {tardio && (
                      <span
                        title={`Registrado ${dias} días después del pago`}
                        className='rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                      >
                        +{dias} días
                      </span>
                    )}
                  </div>

                  {detalle && (
                    <p className='mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400'>
                      {detalle}
                    </p>
                  )}
                </div>
                {canNavigate && (
                  <ChevronRight className='h-4 w-4 shrink-0 self-center text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300' />
                )}
              </>
            )

            const cls = 'group flex items-start gap-2 rounded-xl px-2 py-3'
            return (
              <li key={a.id}>
                {canNavigate ? (
                  <Link
                    href={`/abonos/${getShortId(a.clienteId)}`}
                    className={`${cls} transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:hover:bg-slate-700/40`}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </motion.section>
  )
}

export const UltimosAbonos = memo(UltimosAbonosComponent)
