'use client'

import { useState } from 'react'

import { ChevronDown } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/shared/utils/format'

interface FuenteItem {
  id: string
  tipo: string
  monto_aprobado: number
}

interface EstadoDeCuentaProps {
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuento: number
  motivoDescuento?: string | null
  valorTotalPagar: number
  fuentes: FuenteItem[]
  diferencia: number
  estadoDevolucion?: 'pendiente' | 'procesada' | null
  montoDevolucion?: number | null
  fechaDevolucion?: string | null
}

export function EstadoDeCuenta({
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuento,
  motivoDescuento,
  valorTotalPagar,
  fuentes,
  diferencia,
  estadoDevolucion,
  montoDevolucion,
  fechaDevolucion,
}: EstadoDeCuentaProps) {
  const [open, setOpen] = useState(false)

  const tieneExtras = gastosNotariales > 0 || recargoEsquinera > 0
  const valorComercial = valorBase + gastosNotariales + recargoEsquinera
  const totalFuentes = fuentes.reduce((acc, f) => acc + f.monto_aprobado, 0)
  const excedente = diferencia < 0 ? Math.abs(diferencia) : 0
  const saldoPendiente = diferencia > 1 ? diferencia : 0

  return (
    <div className='border-t border-gray-100 dark:border-gray-700/40'>
      <button
        type='button'
        onClick={() => setOpen(p => !p)}
        className='flex w-full items-center justify-between px-4 py-1.5 text-[11px] text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
      >
        <span>Estado de cuenta</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='px-5 pb-4 pt-1 text-xs'>
          {/* Valor comercial del inmueble */}
          <LineItem
            label='Valor comercial del inmueble'
            value={formatCurrency(valorComercial)}
            bold
          />
          {tieneExtras && (
            <>
              <LineItem
                label='Valor base'
                value={formatCurrency(valorBase)}
                valueClass='text-gray-500 dark:text-gray-400'
                indent
              />
              {gastosNotariales > 0 && (
                <LineItem
                  label='+ Gastos notariales'
                  value={formatCurrency(gastosNotariales)}
                  valueClass='text-gray-500 dark:text-gray-400'
                  indent
                />
              )}
              {recargoEsquinera > 0 && (
                <LineItem
                  label='+ Recargo esquinera'
                  value={formatCurrency(recargoEsquinera)}
                  valueClass='text-gray-500 dark:text-gray-400'
                  indent
                />
              )}
            </>
          )}

          {/* Descuento */}
          {descuento > 0 && (
            <LineItem
              label={`− Descuento${motivoDescuento ? ` · ${motivoDescuento}` : ''}`}
              value={`− ${formatCurrency(descuento)}`}
              valueClass='text-violet-600 dark:text-violet-400'
            />
          )}

          <Rule />

          {/* Total a Pagar */}
          <LineItem
            label='Total a Pagar'
            value={formatCurrency(valorTotalPagar)}
            bold
          />

          {/* Fuentes de pago */}
          {fuentes.length > 0 && (
            <>
              <p className='mb-0.5 mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500'>
                Fuentes de pago
              </p>
              {fuentes.map(f => (
                <LineItem
                  key={f.id}
                  label={f.tipo}
                  value={formatCurrency(f.monto_aprobado)}
                  indent
                />
              ))}
            </>
          )}

          <Rule />

          {/* Total recibido */}
          <LineItem
            label='Total recibido'
            value={formatCurrency(totalFuentes)}
            bold
          />

          {/* Excedente */}
          {excedente > 0 &&
            (estadoDevolucion === 'procesada' ? (
              <LineItem
                label={`Excedente devuelto al cliente${fechaDevolucion ? ` · ${formatDateForDisplay(fechaDevolucion)}` : ''}`}
                value={`− ${formatCurrency(montoDevolucion ?? excedente)}`}
                valueClass='text-emerald-600 dark:text-emerald-400'
              />
            ) : (
              <LineItem
                label='Excedente pendiente de devolución'
                value={formatCurrency(excedente)}
                valueClass='text-amber-600 dark:text-amber-400'
              />
            ))}

          <Rule />

          {/* Saldo final */}
          <LineItem
            label='Saldo pendiente'
            value={
              saldoPendiente > 0 ? formatCurrency(saldoPendiente) : '$ 0 ✓'
            }
            bold
            valueClass={
              saldoPendiente === 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-white'
            }
          />
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes locales ───────────────────────────────────────────────────

function LineItem({
  label,
  value,
  bold,
  indent,
  valueClass = '',
}: {
  label: string
  value: string
  bold?: boolean
  indent?: boolean
  valueClass?: string
}) {
  return (
    <div
      className={`flex items-baseline justify-between py-0.5 ${indent ? 'pl-3' : ''}`}
    >
      <span
        className={
          bold
            ? 'font-semibold text-gray-800 dark:text-gray-200'
            : 'text-gray-500 dark:text-gray-400'
        }
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${bold ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'} ${valueClass}`}
      >
        {value}
      </span>
    </div>
  )
}

function Rule() {
  return (
    <div className='my-2 border-t border-dashed border-gray-200 dark:border-gray-700/60' />
  )
}
