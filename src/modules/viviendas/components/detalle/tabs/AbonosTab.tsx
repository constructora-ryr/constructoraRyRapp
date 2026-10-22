/**
 * Pestaña Abonos del detalle de vivienda: resumen (abonado, saldo, cantidad)
 * y los abonos activos de la negociación vigente.
 */

'use client'

import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  Hash,
  Receipt,
  Wallet,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { getShortId } from '@/lib/utils/slug.utils'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { useAbonosViviendaTab } from '@/modules/viviendas/hooks/useAbonosViviendaTab'
import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/modules/viviendas/utils'

import { AbonosEsqueleto } from '../DetalleEsqueletos'
import { TarjetaDetalle } from '../piezas'

function Cifra({
  icon: Icon,
  etiqueta,
  valor,
  destacada = false,
}: {
  icon: LucideIcon
  etiqueta: string
  valor: string
  destacada?: boolean
}) {
  return (
    <div
      className={
        destacada
          ? 'rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-4 text-white shadow-md shadow-orange-500/20'
          : 'rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
      }
    >
      <p
        className={`flex items-center gap-1.5 text-xs font-semibold ${
          destacada ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <Icon className='h-3.5 w-3.5' />
        {etiqueta}
      </p>
      <p
        className={`mt-1 text-xl font-black tabular-nums ${
          destacada ? '' : 'text-slate-900 dark:text-white'
        }`}
      >
        {valor}
      </p>
    </div>
  )
}

function SinAbonos({ texto }: { texto: string }) {
  return (
    <div className='flex flex-col items-center px-4 py-10 text-center'>
      <span className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/15'>
        <Receipt className='h-7 w-7 text-orange-500' />
      </span>
      <p className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
        Sin abonos
      </p>
      <p className='mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400'>
        {texto}
      </p>
    </div>
  )
}

export function AbonosTab({
  vivienda,
  puedeVerAbonos,
}: {
  vivienda: Vivienda
  puedeVerAbonos: boolean
}) {
  const { abonos, cargando } = useAbonosViviendaTab(vivienda.negociacion_id)
  const cliente = vivienda.clientes

  if (cargando) return <AbonosEsqueleto />

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <Cifra
          icon={Wallet}
          etiqueta={`Abonado · ${vivienda.porcentaje_pagado ?? 0}%`}
          valor={formatCurrency(vivienda.total_abonado || 0)}
          destacada
        />
        <Cifra
          icon={Receipt}
          etiqueta='Saldo pendiente'
          valor={formatCurrency(
            vivienda.saldo_pendiente ?? vivienda.valor_total
          )}
        />
        <Cifra
          icon={Hash}
          etiqueta='Abonos realizados'
          valor={String(abonos.length)}
        />
      </div>

      <TarjetaDetalle
        titulo='Historial de abonos'
        icon={Receipt}
        accion={
          cliente && puedeVerAbonos ? (
            <Link
              href={`/abonos/${getShortId(cliente.id)}`}
              className='inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10'
            >
              Ver en Abonos
              <ArrowUpRight className='h-3.5 w-3.5' />
            </Link>
          ) : null
        }
      >
        {abonos.length === 0 ? (
          <SinAbonos
            texto={
              vivienda.negociacion_id
                ? 'Los abonos que registre el cliente aparecerán aquí.'
                : 'La vivienda no tiene una venta en curso.'
            }
          />
        ) : (
          <ul className='space-y-2'>
            {abonos.map(a => (
              <li
                key={a.id}
                className='flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900/50'
              >
                <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/10'>
                  <Receipt className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <span className='text-sm font-bold text-slate-900 dark:text-white'>
                      {formatearNumeroRecibo(a.numero_recibo)}
                    </span>
                    <span className='rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'>
                      {a.fuente}
                    </span>
                  </div>
                  <div className='mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400'>
                    <span className='inline-flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {formatDateCompact(a.fecha_abono)}
                    </span>
                    <span className='inline-flex items-center gap-1'>
                      <CreditCard className='h-3 w-3' />
                      {a.metodo_pago}
                    </span>
                    {a.numero_referencia ? (
                      <span>Ref. {a.numero_referencia}</span>
                    ) : null}
                  </div>
                </div>
                <span className='flex-shrink-0 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
                  {formatCurrency(a.monto)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </TarjetaDetalle>
    </div>
  )
}
