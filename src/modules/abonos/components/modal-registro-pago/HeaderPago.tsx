'use client'

import { Landmark, Wallet } from 'lucide-react'

import { getLabelsContextuales } from '@/shared/constants/fuentes-pago.constants'

import type { FuentePagoConAbonos, ModoRegistro } from '../../types'

import { formatCurrency } from './ModalRegistroPago.styles'

interface HeaderPagoProps {
  modo: ModoRegistro
  fuente: FuentePagoConAbonos
  /** Clases del encabezado (degradado del color de la fuente) */
  className: string
  chipClassName: string
  valorCuota?: number
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className='min-w-0 rounded-xl bg-white/15 px-2.5 py-2 ring-1 ring-white/20'>
      <p className='truncate text-[11px] font-medium text-white/80'>
        {etiqueta}
      </p>
      <p className='truncate text-sm font-bold tabular-nums text-white sm:text-base'>
        {valor}
      </p>
    </div>
  )
}

export function HeaderPago({
  modo,
  fuente,
  className,
  chipClassName,
  valorCuota,
}: HeaderPagoProps) {
  const esDesembolso = modo === 'desembolso'
  const Icono = esDesembolso ? Landmark : Wallet
  const labels = getLabelsContextuales(fuente.tipo)

  return (
    <div className={className}>
      <div className='pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl' />

      <div className='relative flex items-start gap-3 pr-8'>
        <span className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30'>
          <Icono className='h-5 w-5 text-white' />
        </span>
        <div className='min-w-0'>
          <h2 className='text-lg font-bold leading-tight text-white sm:text-xl'>
            {esDesembolso ? 'Registrar desembolso' : 'Registrar abono'}
          </h2>
          <div className='mt-1 flex flex-wrap items-center gap-1.5'>
            <span className='text-sm font-medium text-white/90'>
              {fuente.tipo}
            </span>
            <span className={chipClassName}>
              {esDesembolso ? 'Pago único' : 'Abonos parciales'}
            </span>
            {valorCuota ? (
              <span className={chipClassName}>
                Cuota {formatCurrency(valorCuota)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className='relative mt-3 grid grid-cols-3 gap-2'>
        <Cifra
          etiqueta={labels.montoLabel}
          valor={formatCurrency(fuente.monto_aprobado ?? 0)}
        />
        <Cifra
          etiqueta={labels.recibidoLabel}
          valor={formatCurrency(fuente.monto_recibido ?? 0)}
        />
        <Cifra
          etiqueta='Saldo'
          valor={formatCurrency(fuente.saldo_pendiente ?? 0)}
        />
      </div>
    </div>
  )
}
