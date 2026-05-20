'use client'

import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Hash,
  Receipt,
  Wallet,
} from 'lucide-react'

import Link from 'next/link'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { formatearNumeroRecibo } from '@/modules/abonos/utils/formato-recibo'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { useAbonosViviendaTab } from '@/modules/viviendas/hooks/useAbonosViviendaTab'
import type { Vivienda } from '@/modules/viviendas/types'
import { formatCurrency } from '@/shared/utils'

interface AbonosTabProps {
  vivienda: Vivienda
  onRegistrarAbono: () => void
}

/**
 * Tab de abonos de la vivienda
 * Muestra los abonos activos de la negociacion activa en curso
 */
export function AbonosTab({ vivienda }: AbonosTabProps) {
  const { puede, esAdmin } = usePermisosQuery()
  const canViewAbonos = esAdmin || puede('abonos', 'ver')
  const { abonos, totalAbonado, cargando } = useAbonosViviendaTab(vivienda.id)

  const saldoPendiente =
    (vivienda.valor_total || 0) - (vivienda.total_abonado || 0)
  const porcentaje = vivienda.porcentaje_pagado || 0

  return (
    <div key='abonos' className='animate-fade-in space-y-4'>
      {/* Resumen financiero - 3 mini cards */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        {/* Total Abonado */}
        <div className='relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-4 shadow-lg'>
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10'>
            <div className='mb-1.5 flex items-center gap-1.5'>
              <Wallet className='h-4 w-4 text-orange-100' />
              <p className='text-xs font-semibold uppercase tracking-wide text-orange-100'>
                Total Abonado
              </p>
            </div>
            <p className='text-2xl font-black text-white'>
              {formatCurrency(totalAbonado || vivienda.total_abonado || 0)}
            </p>
          </div>
        </div>

        {/* Saldo Pendiente */}
        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-1.5 flex items-center gap-1.5'>
            <DollarSign className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400'>
              Saldo Pendiente
            </p>
          </div>
          <p className='text-2xl font-black text-gray-900 dark:text-white'>
            {formatCurrency(saldoPendiente)}
          </p>
        </div>

        {/* Cantidad de Abonos */}
        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-1.5 flex items-center gap-1.5'>
            <Hash className='h-4 w-4 text-amber-600 dark:text-amber-400' />
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400'>
              Abonos Realizados
            </p>
          </div>
          <p className='text-2xl font-black text-gray-900 dark:text-white'>
            {abonos.length || vivienda.cantidad_abonos || 0}
          </p>
          <div className='mt-2'>
            <div className='mb-1 flex items-center justify-between'>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {porcentaje.toFixed(1)}% pagado
              </span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000'
                style={{ width: `${Math.min(porcentaje, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de abonos recientes */}
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80'>
        {/* Header de la tabla */}
        <div className='flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700'>
          <div className='flex items-center gap-2.5'>
            <div className='rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 p-1.5'>
              <Receipt className='h-4 w-4 text-white' />
            </div>
            <div>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                {`Abonos de Negociaci\u00F3n Activa`}
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {`Pagos registrados en la negociaci\u00F3n vigente`}
              </p>
            </div>
          </div>
          {vivienda.clientes && canViewAbonos && (
            <Link
              href={`/abonos/${vivienda.clientes.id}`}
              className='inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400 dark:hover:bg-orange-950/50'
            >
              <ExternalLink className='h-3.5 w-3.5' />
              Ver en Abonos
            </Link>
          )}
        </div>

        {/* Estado de carga */}
        {cargando ? (
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-3'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent' />
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Cargando abonos...
              </p>
            </div>
          </div>
        ) : abonos.length === 0 ? (
          /* Estado vacio */
          <div className='flex flex-col items-center justify-center px-4 py-12'>
            <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30'>
              <Receipt className='h-7 w-7 text-orange-400 dark:text-orange-500' />
            </div>
            <p className='mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              {`No hay abonos en la negociaci\u00F3n activa`}
            </p>
            <p className='max-w-xs text-center text-xs text-gray-500 dark:text-gray-400'>
              {`Los abonos registrados a la negociaci\u00F3n vigente de esta vivienda aparecer\u00E1n aqu\u00ED`}
            </p>
          </div>
        ) : (
          /* Lista de abonos */
          <div className='divide-y divide-gray-100 dark:divide-gray-700/50'>
            {abonos.map(abono => (
              <div
                key={abono.id}
                className='flex items-center gap-4 px-4 py-3 transition-colors hover:bg-orange-50/50 dark:hover:bg-orange-950/10'
              >
                {/* Icono recibo */}
                <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40'>
                  <Receipt className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                </div>

                {/* Info principal */}
                <div className='min-w-0 flex-1'>
                  <div className='mb-0.5 flex items-center gap-2'>
                    <span className='text-sm font-bold text-gray-900 dark:text-white'>
                      {formatearNumeroRecibo(abono.numero_recibo)}
                    </span>
                    <span className='inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'>
                      {abono.fuente_pago.tipo}
                    </span>
                  </div>
                  <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
                    <span className='inline-flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {formatDateCompact(abono.fecha_abono)}
                    </span>
                    <span className='inline-flex items-center gap-1'>
                      <CreditCard className='h-3 w-3' />
                      {abono.metodo_pago}
                    </span>
                    {abono.numero_referencia ? (
                      <span className='inline-flex items-center gap-1'>
                        <FileText className='h-3 w-3' />
                        Ref: {abono.numero_referencia}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Monto */}
                <div className='flex-shrink-0 text-right'>
                  <p className='text-sm font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(abono.monto)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer con link si hay abonos */}
        {!cargando &&
          abonos.length > 0 &&
          vivienda.clientes &&
          canViewAbonos && (
            <div className='border-t border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-700/50 dark:bg-gray-900/30'>
              <Link
                href={`/abonos/${vivienda.clientes.id}`}
                className='inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
              >
                Ver detalle completo en Abonos
                <ArrowUpRight className='h-3.5 w-3.5' />
              </Link>
            </div>
          )}
      </div>
    </div>
  )
}
