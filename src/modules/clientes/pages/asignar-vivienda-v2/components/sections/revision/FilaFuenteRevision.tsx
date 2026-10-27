'use client'

/**
 * Una fuente en la revisión: ícono y color de su tipo, % del total, entidad
 * y, si es crédito con la constructora, el resumen de su plan de cuotas.
 */

import { useMemo } from 'react'

import { TrendingUp } from 'lucide-react'

import { formatDateForDisplay } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import type { FuentePagoConfiguracion } from '@/modules/clientes/components/asignar-vivienda/types'
import { obtenerMontoParaCierre } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'
import { calcularTablaAmortizacion } from '@/modules/fuentes-pago/utils/calculos-credito'
import { iconoFuente } from '@/shared/constants/fuente-iconos'
import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

/** Lo que aporta la fuente al cierre (crédito constructora: solo capital) */
export function montoFuente(
  f: FuentePagoConfiguracion,
  tiposConCampos: TipoFuentePagoConCampos[]
): number {
  const tipo = tiposConCampos.find(t => t.nombre === f.tipo)
  return f.config
    ? obtenerMontoParaCierre(
        f.config,
        tipo,
        tipo?.configuracion_campos?.campos ?? []
      )
    : 0
}

export function FilaFuenteRevision({
  f,
  tiposConCampos,
  entidades,
  valorTotal,
}: {
  f: FuentePagoConfiguracion
  tiposConCampos: TipoFuentePagoConCampos[]
  entidades: Array<{ value: string; label: string }>
  valorTotal: number
}) {
  const tipo = tiposConCampos.find(t => t.nombre === f.tipo)
  const color = getFuenteColorClasses(tipo?.color)
  const Icono = iconoFuente(tipo?.icono)
  const monto = montoFuente(f, tiposConCampos)
  const pct = valorTotal > 0 ? (monto / valorTotal) * 100 : 0
  const entidad = f.config?.entidad
    ? (entidades.find(e => e.value === f.config?.entidad)?.label ??
      f.config.entidad)
    : null

  const params = f.config?.parametrosCredito
  const credito = useMemo(() => {
    if (!params) return null
    try {
      const fechaInicio =
        typeof params.fechaInicio === 'string'
          ? new Date(params.fechaInicio + 'T12:00:00')
          : params.fechaInicio
      return calcularTablaAmortizacion({ ...params, fechaInicio })
    } catch {
      return null
    }
  }, [params])

  return (
    <div className='flex gap-3 py-2.5'>
      <span
        className={cn(
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
          color.icon
        )}
      >
        <Icono className='h-4 w-4' />
      </span>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='font-semibold text-gray-900 dark:text-white'>
              {f.tipo}
            </p>
            <p className='flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400'>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-semibold',
                  color.badge
                )}
              >
                {pct.toFixed(1)} %
              </span>
              {entidad ? <span>{entidad}</span> : null}
            </p>
          </div>
          <span
            className={cn('flex-shrink-0 font-bold tabular-nums', color.texto)}
          >
            {formatCurrency(monto)}
          </span>
        </div>

        {credito ? (
          <div className='mt-2 space-y-0.5 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:ring-gray-700'>
            <div className='flex justify-between'>
              <span>Capital</span>
              <span className='tabular-nums'>
                {formatCurrency(credito.capital)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='flex items-center gap-1'>
                <TrendingUp className='h-3 w-3' />
                Intereses ({params?.tasaMensual ?? 0} % mensual)
              </span>
              <span className='tabular-nums'>
                +{formatCurrency(credito.interesTotal)}
              </span>
            </div>
            <div className='flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100'>
              <span>Total del crédito</span>
              <span className='tabular-nums'>
                {formatCurrency(credito.montoTotal)}
              </span>
            </div>
            <p className='pt-0.5 text-gray-500 dark:text-gray-400'>
              {params?.numCuotas ?? 0} cuotas de{' '}
              {formatCurrency(credito.valorCuotaMensual)}
              {credito.cuotas[0]
                ? ` · primera el ${formatDateForDisplay(
                    credito.cuotas[0].fechaVencimiento
                      .toISOString()
                      .split('T')[0]
                  )}`
                : ''}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
