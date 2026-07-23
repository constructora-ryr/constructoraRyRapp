'use client'

import {
  AlertCircle,
  Building2,
  CreditCard,
  DollarSign,
  Home,
  RefreshCw,
  User,
} from 'lucide-react'

import { formatearDinero } from '../../utils/formatters'

interface NegociacionDetalleRenderProps {
  metadata: Record<string, unknown>
  accion?: string
}

const ACCION_TIPO_LABELS: Record<string, string> = {
  rebalanceo_plan_financiero: 'Rebalanceo del Plan Financiero',
  ajuste_descuento: 'Ajuste de Descuento',
  cambio_estado: 'Cambio de Estado',
}

export function NegociacionDetalleRender({
  metadata,
  accion,
}: NegociacionDetalleRenderProps) {
  const get = (key: string, fallback = 'N/A'): string =>
    metadata[key] != null ? String(metadata[key]) : fallback

  if (accion === 'UPDATE') {
    const accionTipo = get('accion_tipo', '')
    const label = ACCION_TIPO_LABELS[accionTipo] ?? accionTipo
    const valor = Number(metadata.valor_vivienda ?? 0)

    return (
      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30'>
          <RefreshCw className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400'>
              Negociación Actualizada
            </p>
            {label && (
              <p className='text-sm font-bold text-blue-700 dark:text-blue-300'>
                {label}
              </p>
            )}
          </div>
          {valor > 0 && (
            <div className='ml-auto text-right'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Valor vivienda
              </p>
              <p className='text-sm font-bold text-gray-700 dark:text-gray-300'>
                {formatearDinero(valor)}
              </p>
            </div>
          )}
        </div>

        {Boolean(metadata.motivo) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Motivo
            </label>
            <div className='flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
              <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500' />
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                {String(metadata.motivo)}
              </p>
            </div>
          </div>
        )}

        {Boolean(metadata.notas) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Notas
            </label>
            <p className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300'>
              {String(metadata.notas)}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Cliente
          </label>
          <div className='flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white'>
            <User className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            {get('cliente_nombre')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Documento
          </label>
          <div className='text-base text-gray-900 dark:text-white'>
            {get('cliente_documento')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Vivienda
          </label>
          <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
            <Home className='h-5 w-5 text-orange-600 dark:text-orange-400' />
            {metadata.manzana_nombre != null
              ? `Mz. ${get('manzana_nombre')} · Casa ${get('vivienda_numero')}`
              : `Casa ${get('vivienda_numero')}`}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Proyecto
          </label>
          <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
            <Building2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            {get('proyecto_nombre')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Valor Total
          </label>
          <div className='flex items-center gap-2 text-base font-bold text-green-600 dark:text-green-400'>
            <DollarSign className='h-5 w-5' />
            {formatearDinero(
              Number(
                metadata.negociacion_valor_total ??
                  metadata.negociacion_valor_total_pagar ??
                  0
              )
            )}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Estado
          </label>
          <span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            {get('negociacion_estado')}
          </span>
        </div>

        {metadata.negociacion_saldo_pendiente != null && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Saldo Pendiente
            </label>
            <div className='text-base font-bold text-red-600 dark:text-red-400'>
              {formatearDinero(
                Number(metadata.negociacion_saldo_pendiente ?? 0)
              )}
            </div>
          </div>
        )}

        {metadata.fuentes_count != null && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Fuentes de Pago
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <CreditCard className='h-5 w-5 text-gray-400' />
              {get('fuentes_count')} fuente(s)
            </div>
          </div>
        )}
      </div>

      {metadata.negociacion_notas != null &&
        String(metadata.negociacion_notas).trim() && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Notas
            </label>
            <p className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300'>
              {String(metadata.negociacion_notas)}
            </p>
          </div>
        )}
    </div>
  )
}
