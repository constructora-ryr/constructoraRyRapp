'use client'

import { Landmark, Wallet } from 'lucide-react'

import {
  esCreditoConstructora as checkCreditoConstructora,
  esCuotaInicial as checkCuotaInicial,
} from '@/shared/constants/fuentes-pago.constants'

import type { FuentePagoConAbonos, ModoRegistro } from '../../types'

import { formatCurrency, type ColorScheme } from './ModalRegistroPago.styles'

interface HeaderPagoProps {
  modo: ModoRegistro
  fuenteSeleccionada: FuentePagoConAbonos
  fuentesPago: FuentePagoConAbonos[]
  colorScheme: ColorScheme
  onFuenteChange: (f: FuentePagoConAbonos) => void
  valorCuota?: number
  numeroCuota?: number
}

export function HeaderPago({
  modo,
  fuenteSeleccionada,
  fuentesPago,
  colorScheme,
  onFuenteChange,
  valorCuota,
  numeroCuota,
}: HeaderPagoProps) {
  const esCreditoConstructora = checkCreditoConstructora(
    fuenteSeleccionada.tipo
  )
  const esDesembolso = modo === 'desembolso'

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${colorScheme.gradient} flex-shrink-0 px-5 py-4`}
    >
      {/* Efecto de luz */}
      <div className='pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl' />
      <div className='pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white opacity-5 blur-3xl' />

      {/* Título + badge */}
      <div className='relative z-10 flex items-start gap-3'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl'>
          {esDesembolso ? (
            <Landmark className='h-5 w-5 text-white' />
          ) : (
            <Wallet className='h-5 w-5 text-white' />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-xl font-bold text-white'>
              Registrar {esDesembolso ? 'Desembolso' : 'Abono'}
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${esDesembolso ? colorScheme.headerBadgeDesembolso : colorScheme.headerBadgeAbono}`}
            >
              {esDesembolso
                ? '🏦 Desembolso único · No editable'
                : '💰 Pago en cuotas'}
            </span>
            {numeroCuota ? (
              <span className='rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white'>
                Cuota #{numeroCuota}
              </span>
            ) : null}
          </div>
          <p className='mt-0.5 text-xs text-white/80'>
            {fuenteSeleccionada.tipo}
          </p>
        </div>
      </div>

      {/* Selector de fuente (solo si hay más de una) */}
      {fuentesPago.length > 1 ? (
        <div className='relative z-10 mt-3 flex flex-wrap items-center gap-2'>
          {fuentesPago.map(fuente => (
            <button
              key={fuente.id}
              type='button'
              onClick={() => onFuenteChange(fuente)}
              className={
                fuente.id === fuenteSeleccionada.id
                  ? 'rounded-lg border border-white/60 bg-white/30 px-2.5 py-1 text-xs font-semibold text-white'
                  : 'rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/70 transition-all hover:bg-white/20 hover:text-white'
              }
            >
              {fuente.tipo}
            </button>
          ))}
        </div>
      ) : null}

      {/* Info: monto aprobado + valor cuota + saldo */}
      <div className='relative z-10 mt-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl'>
        <div
          className={`grid gap-4 ${esCreditoConstructora && valorCuota ? 'grid-cols-3' : 'grid-cols-2'}`}
        >
          <div>
            <p className='mb-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70'>
              {checkCuotaInicial(fuenteSeleccionada.tipo)
                ? 'Monto pactado'
                : esCreditoConstructora
                  ? 'Crédito total'
                  : 'Monto aprobado'}
            </p>
            <p className='text-base font-bold text-white'>
              {fuenteSeleccionada.monto_aprobado != null
                ? formatCurrency(fuenteSeleccionada.monto_aprobado)
                : 'Por confirmar'}
            </p>
          </div>
          {esCreditoConstructora && valorCuota ? (
            <div>
              <p className='mb-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70'>
                Valor cuota
              </p>
              <p className='text-base font-bold text-white'>
                {formatCurrency(valorCuota)}
              </p>
            </div>
          ) : null}
          <div>
            <p className='mb-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70'>
              Saldo pendiente
            </p>
            <p className='text-base font-bold text-white'>
              {formatCurrency(fuenteSeleccionada.saldo_pendiente ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
