'use client'

import { useMemo } from 'react'

import { motion } from 'framer-motion'
import {
  ArrowRightLeft,
  Calendar,
  ChevronRight,
  CreditCard,
  Hash,
  Receipt,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import type { AbonoHistorial, FuentePago } from '@/modules/abonos/types'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

interface TimelineAbonosProps {
  abonos: AbonoHistorial[]
  fuentesPago?: Pick<FuentePago, 'id' | 'tipo'>[]
  loading: boolean
  onVerDetalle: (abono: AbonoHistorial) => void
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

export function TimelineAbonos({
  abonos,
  fuentesPago = [],
  loading,
  onVerDetalle,
}: TimelineAbonosProps) {
  const resolveFuenteTipo = (fuente_pago_id: string): string | null =>
    fuentesPago.find(f => f.id === fuente_pago_id)?.tipo ?? null

  // Asigna número de cuota a cada abono de tipo "Crédito con la Constructora"
  // agrupando por fuente y ordenando por fecha ascendente (el orden de pago = orden de cuota)
  const cuotaNumeroMap = useMemo(() => {
    const map = new Map<string, number>()
    const byFuente = new Map<string, AbonoHistorial[]>()

    for (const a of abonos) {
      const tipo = resolveFuenteTipo(a.fuente_pago_id)
      if (!esCreditoConstructora(tipo)) continue
      if (!byFuente.has(a.fuente_pago_id)) byFuente.set(a.fuente_pago_id, [])
      const grupo = byFuente.get(a.fuente_pago_id)
      if (grupo) grupo.push(a)
    }

    for (const grupo of byFuente.values()) {
      const sorted = [...grupo].sort(
        (a, b) =>
          new Date(a.fecha_abono).getTime() - new Date(b.fecha_abono).getTime()
      )
      sorted.forEach((a, i) => map.set(a.id, i + 1))
    }

    return map
  }, [abonos, fuentesPago]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map(i => (
          <div key={i} className='flex items-start gap-3'>
            <div className='h-10 w-10 flex-shrink-0 animate-pulse rounded-xl bg-gray-200 dark:bg-white/[0.06]' />
            <div className='flex-1 animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.06]'>
              <div className='mb-2 h-3 w-24 rounded bg-gray-200 dark:bg-white/10' />
              <div className='h-4 w-32 rounded bg-gray-200 dark:bg-white/10' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!abonos || abonos.length === 0) {
    return (
      <div className='rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none'>
        <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5'>
          <Receipt className='h-6 w-6 text-gray-300 dark:text-white/20' />
        </div>
        <p className='text-sm font-medium text-gray-400 dark:text-white/40'>
          No hay abonos activos registrados
        </p>
        <p className='mt-1 text-xs text-gray-300 dark:text-white/20'>
          Los abonos aparecerán aquí una vez registrados
        </p>
      </div>
    )
  }

  return (
    <div className='relative'>
      {/* Línea vertical de timeline */}
      <div
        className='absolute bottom-5 left-[19px] top-5 w-px'
        style={{
          background:
            'linear-gradient(to bottom, rgba(16,185,129,0.5), rgba(255,255,255,0.08), transparent)',
        }}
      />

      <div className='space-y-2.5'>
        {abonos.map((abono, i) => {
          const esTrasladado = Boolean(abono.trasladado_desde_negociacion_id)
          const fuenteTipo = resolveFuenteTipo(abono.fuente_pago_id)
          const numeroCuota = cuotaNumeroMap.get(abono.id)

          return (
            <motion.div
              key={abono.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className='flex items-center gap-3'
            >
              {/* Nodo — diferenciado para trasladados */}
              <div className='relative z-10 flex-shrink-0'>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ring-2 ring-white dark:ring-gray-950 ${
                    esTrasladado
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-900/40'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/40'
                  }`}
                >
                  {esTrasladado ? (
                    <ArrowRightLeft className='h-4 w-4 text-white' />
                  ) : (
                    <Receipt className='h-4 w-4 text-white' />
                  )}
                </div>
              </div>

              {/* Card — clickeable completa */}
              <button
                type='button'
                onClick={() => onVerDetalle(abono)}
                className='group min-w-0 flex-1 cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.06] dark:shadow-none dark:hover:border-emerald-500/30'
              >
                <div className='flex items-center justify-between gap-3 px-4 py-3'>
                  {/* Left: consecutivo + fuente + metadata */}
                  <div className='min-w-0 flex-1 text-left'>
                    <div className='flex flex-wrap items-center gap-1.5'>
                      {abono.numero_recibo ? (
                        <span className='inline-flex items-center rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300'>
                          {formatearNumeroRecibo(abono.numero_recibo)}
                        </span>
                      ) : null}

                      {fuenteTipo ? (
                        <span className='inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-white/[0.08] dark:text-white/70'>
                          {fuenteTipo}
                        </span>
                      ) : null}

                      {numeroCuota ? (
                        <span className='inline-flex items-center rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'>
                          Cuota #{numeroCuota}
                        </span>
                      ) : null}

                      {esTrasladado ? (
                        <span className='inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400'>
                          <ArrowRightLeft className='h-2.5 w-2.5' />
                          Trasladado
                        </span>
                      ) : null}
                    </div>

                    <div className='mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400 dark:text-white/35'>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-2.5 w-2.5 opacity-60' />
                        {formatDateCompact(abono.fecha_abono)}
                      </span>
                      <span className='opacity-40'>·</span>
                      <span className='flex items-center gap-1'>
                        <CreditCard className='h-2.5 w-2.5 opacity-60' />
                        {abono.metodo_pago}
                      </span>
                      {abono.numero_referencia ? (
                        <>
                          <span className='opacity-40'>·</span>
                          <span className='flex items-center gap-1'>
                            <Hash className='h-2.5 w-2.5' />
                            {abono.numero_referencia}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Right: monto + hint de acción */}
                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <span className='whitespace-nowrap text-base font-extrabold text-emerald-600 dark:text-emerald-300'>
                      {formatCurrency(abono.monto)}
                    </span>
                    <ChevronRight className='h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:text-white/20 dark:group-hover:text-emerald-400' />
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
