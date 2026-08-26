'use client'

import { useState } from 'react'

import { ChevronDown, ScrollText } from 'lucide-react'

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
  totalAbonado: number
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
  totalAbonado,
  diferencia,
  estadoDevolucion,
  montoDevolucion,
  fechaDevolucion,
}: EstadoDeCuentaProps) {
  const [open, setOpen] = useState(false)

  const tieneExtras = gastosNotariales > 0 || recargoEsquinera > 0
  const valorComercial = valorBase + gastosNotariales + recargoEsquinera
  const totalComprometido = fuentes.reduce(
    (acc, f) => acc + f.monto_aprobado,
    0
  )
  // Excedente de PLAN (fuentes > precio) — determina el flujo de devolución
  const excedente = diferencia < 0 ? Math.abs(diferencia) : 0
  // Saldo real = lo que falta pagar según abonos registrados
  const saldoReal = Math.max(0, valorTotalPagar - totalAbonado)

  return (
    <div className='border-t border-gray-100 dark:border-gray-700/40'>
      <button
        type='button'
        onClick={() => setOpen(p => !p)}
        className='group flex w-full items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
      >
        <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/50'>
          <ScrollText className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
        </div>
        <span className='flex-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300'>
          Estado de cuenta
        </span>
        <span className='text-[10px] font-medium text-gray-400 transition-colors group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'>
          {open ? 'Ocultar' : 'Ver desglose'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${open ? 'rotate-180' : ''}`}
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

          {/* Suma total del plan de fuentes */}
          <LineItem
            label='Suma total de fuentes de pago'
            value={formatCurrency(totalComprometido)}
            bold
          />

          {/* Total abonado — pagos reales recibidos */}
          <LineItem
            label='Total abonado'
            value={formatCurrency(totalAbonado)}
            bold
            valueClass={
              totalAbonado >= valorTotalPagar
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-white'
            }
          />

          {/* Excedente de plan (fuentes > precio) */}
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

          {/* Saldo real = valorTotalPagar - totalAbonado */}
          <LineItem
            label='Saldo pendiente'
            value={saldoReal > 0 ? formatCurrency(saldoReal) : '$ 0 ✓'}
            bold
            valueClass={
              saldoReal === 0
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
