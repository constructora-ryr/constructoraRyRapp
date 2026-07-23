'use client'

import {
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  User,
} from 'lucide-react'

import { formatearDinero } from '../../utils/formatters'

interface AbonoDetalleRenderProps {
  metadata: Record<string, unknown>
  accion?: string
}

function get(
  metadata: Record<string, unknown>,
  key: string,
  fallback = 'N/A'
): string {
  return metadata[key] != null ? String(metadata[key]) : fallback
}

export function AbonoDetalleRender({
  metadata,
  accion,
}: AbonoDetalleRenderProps) {
  const monto = Number(metadata.abono_monto ?? 0)
  const manzana = get(metadata, 'manzana_nombre')
  const vivienda = get(metadata, 'vivienda_numero')
  const viviendaLabel =
    manzana !== 'N/A' && vivienda !== 'N/A'
      ? `Mz. ${manzana} · Casa ${vivienda}`
      : vivienda !== 'N/A'
        ? `Casa ${vivienda}`
        : 'N/A'

  const esAnulacion = accion === 'DELETE'

  return (
    <div className='space-y-4'>
      {/* Monto destacado */}
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
          esAnulacion
            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
            : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
        }`}
      >
        <DollarSign
          className={`h-6 w-6 ${esAnulacion ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
        />
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              esAnulacion
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}
          >
            {esAnulacion ? 'Abono Anulado' : 'Monto del Abono'}
          </p>
          <p
            className={`text-xl font-bold ${
              esAnulacion
                ? 'text-red-700 dark:text-red-300'
                : 'text-green-700 dark:text-green-300'
            }`}
          >
            {formatearDinero(monto)}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Cliente */}
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Cliente
          </label>
          <div className='flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white'>
            <User className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            {get(metadata, 'cliente_nombre')}
          </div>
        </div>

        {/* Vivienda */}
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Vivienda
          </label>
          <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
            <Home className='h-4 w-4 text-orange-600 dark:text-orange-400' />
            {viviendaLabel}
          </div>
        </div>

        {/* Proyecto */}
        {Boolean(metadata.proyecto_nombre) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Proyecto
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Building2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              {get(metadata, 'proyecto_nombre')}
            </div>
          </div>
        )}

        {/* Fuente de pago */}
        {Boolean(metadata.fuente_tipo) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Fuente de Pago
            </label>
            <span className='inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>
              {get(metadata, 'fuente_tipo')}
            </span>
          </div>
        )}

        {/* Método de pago */}
        {Boolean(metadata.abono_metodo_pago) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Método de Pago
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <CreditCard className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
              {get(metadata, 'abono_metodo_pago')}
            </div>
          </div>
        )}

        {/* Fecha del abono */}
        {Boolean(metadata.abono_fecha_abono) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Fecha del Abono
            </label>
            <div className='text-base text-gray-900 dark:text-white'>
              {new Date(String(metadata.abono_fecha_abono)).toLocaleDateString(
                'es-CO',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notas */}
      {Boolean(metadata.abono_notas) && (
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Notas
          </label>
          <div className='flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
            <FileText className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {String(metadata.abono_notas)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
