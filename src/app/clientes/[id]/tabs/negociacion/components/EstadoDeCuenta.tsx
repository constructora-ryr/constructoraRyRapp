'use client'

import { useState } from 'react'

import { ChevronDown, HelpCircle, ScrollText } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { Tooltip } from '@/shared/components/ui'
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
  const excedente = diferencia < 0 ? Math.abs(diferencia) : 0
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
          {/* ─── 1. Precio del inmueble ─── */}
          <LineItem
            label='Precio del inmueble'
            value={formatCurrency(valorComercial)}
            bold
            tooltip='Valor de la vivienda para efectos de escritura pública y crédito hipotecario. Incluye gastos notariales y recargos si aplican.'
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
                  tooltip='Costos de escrituración que el cliente asume: notaría, registro, impuestos, etc.'
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

          {descuento > 0 && (
            <LineItem
              label={`− Descuento${motivoDescuento ? ` · ${motivoDescuento}` : ''}`}
              value={`− ${formatCurrency(descuento)}`}
              valueClass='text-violet-600 dark:text-violet-400'
            />
          )}

          <Rule />

          {/* ─── 2. Lo que el cliente realmente paga ─── */}
          <LineItem
            label='Lo que el cliente paga'
            value={formatCurrency(valorTotalPagar)}
            bold
            tooltip={
              descuento > 0
                ? `Precio del inmueble (${formatCurrency(valorComercial)}) menos el descuento otorgado (${formatCurrency(descuento)}). Esta es la obligación real del cliente con la constructora.`
                : 'Obligación total del cliente con la constructora.'
            }
          />

          {/* ─── 3. Fuentes de pago ─── */}
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

          {/* Suma fuentes */}
          <LineItem
            label='Total comprometido en fuentes'
            value={formatCurrency(totalComprometido)}
            bold
            tooltip='Suma de todos los montos aprobados en las fuentes de pago: crédito hipotecario, subsidios, cuota inicial, etc.'
          />

          {/* Bridge: fuentes → excedente — muestra el cálculo explícito */}
          {excedente > 0 && (
            <>
              <LineItem
                label='− Lo que el cliente paga'
                value={`− ${formatCurrency(valorTotalPagar)}`}
                valueClass='text-gray-500 dark:text-gray-400'
                indent
              />
              <div className='my-1.5 border-t border-dashed border-amber-200 dark:border-amber-800/50' />
              {estadoDevolucion === 'procesada' ? (
                <LineItem
                  label={`Excedente devuelto al cliente${fechaDevolucion ? ` · ${formatDateForDisplay(fechaDevolucion)}` : ''}`}
                  value={formatCurrency(montoDevolucion ?? excedente)}
                  bold
                  valueClass='text-emerald-600 dark:text-emerald-400'
                  tooltip='Las fuentes de pago superaron el total a pagar por el cliente. Este excedente ya fue devuelto.'
                />
              ) : (
                <LineItem
                  label='Excedente a devolver al cliente'
                  value={formatCurrency(excedente)}
                  bold
                  valueClass='text-amber-600 dark:text-amber-400'
                  tooltip={`Las fuentes (${formatCurrency(totalComprometido)}) superan lo que el cliente debe pagar (${formatCurrency(valorTotalPagar)}). Una vez se completen los desembolsos, estos ${formatCurrency(excedente)} deben ser devueltos al cliente.`}
                />
              )}
            </>
          )}

          <Rule />

          {/* ─── 4. Abonos recibidos y saldo real ─── */}
          <LineItem
            label='Total abonado'
            value={formatCurrency(totalAbonado)}
            bold
            valueClass={
              totalAbonado >= valorTotalPagar
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-white'
            }
            tooltip='Suma de todos los pagos efectivamente recibidos por la constructora hasta ahora.'
          />

          <LineItem
            label='Saldo real por pagar'
            value={saldoReal > 0 ? formatCurrency(saldoReal) : '$ 0 ✓'}
            bold
            valueClass={
              saldoReal === 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-white'
            }
            tooltip={`Lo que el cliente aún debe pagar: ${formatCurrency(valorTotalPagar)} (obligación) menos ${formatCurrency(totalAbonado)} ya abonado.`}
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
  tooltip,
}: {
  label: string
  value: string
  bold?: boolean
  indent?: boolean
  valueClass?: string
  tooltip?: string
}) {
  const labelContent = (
    <span
      className={
        bold
          ? 'font-semibold text-gray-800 dark:text-gray-200'
          : 'text-gray-500 dark:text-gray-400'
      }
    >
      {label}
    </span>
  )

  return (
    <div
      className={`flex items-baseline justify-between py-0.5 ${indent ? 'pl-3' : ''}`}
    >
      {tooltip ? (
        <Tooltip content={tooltip} side='right'>
          <span className='inline-flex cursor-help items-center gap-1'>
            {labelContent}
            <HelpCircle className='h-2.5 w-2.5 flex-shrink-0 text-gray-300 dark:text-gray-600' />
          </span>
        </Tooltip>
      ) : (
        labelContent
      )}
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
