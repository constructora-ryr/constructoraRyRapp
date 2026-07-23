'use client'

import {
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Edit3,
  FileText,
  Home,
  Tag,
  User,
  XCircle,
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

function formatFecha(val: unknown): string {
  if (!val) return 'N/A'
  try {
    return new Date(String(val)).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return String(val)
  }
}

function ViviendaLabel({ metadata }: { metadata: Record<string, unknown> }) {
  const manzana = get(metadata, 'manzana_nombre')
  const vivienda = get(metadata, 'vivienda_numero')
  const label =
    manzana !== 'N/A' && vivienda !== 'N/A'
      ? `Mz. ${manzana} · Casa ${vivienda}`
      : vivienda !== 'N/A'
        ? `Casa ${vivienda}`
        : 'N/A'
  return (
    <div className='space-y-1'>
      <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
        Vivienda
      </label>
      <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
        <Home className='h-4 w-4 text-orange-600 dark:text-orange-400' />
        {label}
      </div>
    </div>
  )
}

function AbonoCreate({ metadata }: { metadata: Record<string, unknown> }) {
  const monto = Number(metadata.abono_monto ?? 0)
  const saldoAntes = Number(metadata.negociacion_saldo_despues ?? 0)

  return (
    <div className='space-y-4'>
      {/* Monto destacado */}
      <div className='flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950/30'>
        <DollarSign className='h-6 w-6 text-green-600 dark:text-green-400' />
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400'>
            Monto del Abono
          </p>
          <p className='text-xl font-bold text-green-700 dark:text-green-300'>
            {formatearDinero(monto)}
          </p>
        </div>
        {Boolean(metadata.negociacion_saldo_despues) && (
          <div className='ml-auto text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Saldo restante
            </p>
            <p className='text-sm font-bold text-gray-700 dark:text-gray-300'>
              {formatearDinero(saldoAntes)}
            </p>
          </div>
        )}
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

        <ViviendaLabel metadata={metadata} />

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

        {Boolean(metadata.abono_fecha_abono) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Fecha del Abono
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Calendar className='h-4 w-4 text-gray-400' />
              {formatFecha(metadata.abono_fecha_abono)}
            </div>
          </div>
        )}

        {Boolean(metadata.abono_numero_recibo) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              N.° Recibo
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Tag className='h-4 w-4 text-gray-400' />
              {get(metadata, 'abono_numero_recibo')}
            </div>
          </div>
        )}
      </div>

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

function AbonoUpdate({ metadata }: { metadata: Record<string, unknown> }) {
  const montoAnterior = Number(metadata.abono_monto_anterior ?? 0)
  const camposRaw = metadata.campos_editados
  const campos: string[] = Array.isArray(camposRaw) ? camposRaw : []

  return (
    <div className='space-y-4'>
      {/* Header edición */}
      <div className='flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30'>
        <Edit3 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400'>
            Abono Editado
          </p>
          {Boolean(metadata.abono_numero_recibo) && (
            <p className='text-sm font-bold text-blue-700 dark:text-blue-300'>
              Recibo {get(metadata, 'abono_numero_recibo')}
            </p>
          )}
        </div>
        {montoAnterior > 0 && (
          <div className='ml-auto text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Monto original
            </p>
            <p className='text-sm font-bold text-gray-700 dark:text-gray-300'>
              {formatearDinero(montoAnterior)}
            </p>
          </div>
        )}
      </div>

      {campos.length > 0 && (
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Campos Modificados
          </label>
          <div className='flex flex-wrap gap-1.5'>
            {campos.map((c: string) => (
              <span
                key={c}
                className='rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <ViviendaLabel metadata={metadata} />

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

        {Boolean(metadata.abono_fecha_abono_anterior) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Fecha Anterior
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Calendar className='h-4 w-4 text-gray-400' />
              {formatFecha(metadata.abono_fecha_abono_anterior)}
            </div>
          </div>
        )}

        {Boolean(metadata.abono_metodo_pago_anterior) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Método Anterior
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <CreditCard className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
              {get(metadata, 'abono_metodo_pago_anterior')}
            </div>
          </div>
        )}
      </div>

      {Boolean(metadata.motivo_edicion) && (
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Motivo de la Edición
          </label>
          <div className='flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
            <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500' />
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              {String(metadata.motivo_edicion)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function AbonoAnular({ metadata }: { metadata: Record<string, unknown> }) {
  const monto = Number(metadata.abono_monto ?? 0)

  return (
    <div className='space-y-4'>
      {/* Header anulación */}
      <div className='flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30'>
        <XCircle className='h-6 w-6 text-red-600 dark:text-red-400' />
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400'>
            Abono Anulado
          </p>
          <p className='text-xl font-bold text-red-700 dark:text-red-300'>
            {formatearDinero(monto)}
          </p>
        </div>
      </div>

      {/* Motivo */}
      {(Boolean(metadata.motivo_categoria) ||
        Boolean(metadata.motivo_detalle)) && (
        <div className='rounded-lg border border-red-100 bg-red-50/50 p-3 dark:border-red-900/50 dark:bg-red-950/20'>
          <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400'>
            Motivo de Anulación
          </p>
          {Boolean(metadata.motivo_categoria) && (
            <p className='text-sm font-medium text-gray-800 dark:text-gray-200'>
              {String(metadata.motivo_categoria)}
            </p>
          )}
          {Boolean(metadata.motivo_detalle) && (
            <p className='mt-0.5 text-sm text-gray-600 dark:text-gray-400'>
              {String(metadata.motivo_detalle)}
            </p>
          )}
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {Boolean(metadata.anulado_por_nombre) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Anulado Por
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <User className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              {get(metadata, 'anulado_por_nombre')}
            </div>
          </div>
        )}

        {Boolean(metadata.fecha_anulacion) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Fecha de Anulación
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Calendar className='h-4 w-4 text-gray-400' />
              {formatFecha(metadata.fecha_anulacion)}
            </div>
          </div>
        )}

        <ViviendaLabel metadata={metadata} />

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

        {Boolean(metadata.abono_numero_recibo) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              N.° Recibo Original
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Tag className='h-4 w-4 text-gray-400' />
              {get(metadata, 'abono_numero_recibo')}
            </div>
          </div>
        )}

        {Boolean(metadata.abono_fecha_abono) && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Fecha del Abono Original
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Calendar className='h-4 w-4 text-gray-400' />
              {formatFecha(metadata.abono_fecha_abono)}
            </div>
          </div>
        )}
      </div>

      {Boolean(metadata.abono_notas) && (
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Nota del Abono Original
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

export function AbonoDetalleRender({
  metadata,
  accion,
}: AbonoDetalleRenderProps) {
  if (accion === 'ANULAR' || accion === 'DELETE') {
    return <AbonoAnular metadata={metadata} />
  }
  if (accion === 'UPDATE') {
    return <AbonoUpdate metadata={metadata} />
  }
  return <AbonoCreate metadata={metadata} />
}
