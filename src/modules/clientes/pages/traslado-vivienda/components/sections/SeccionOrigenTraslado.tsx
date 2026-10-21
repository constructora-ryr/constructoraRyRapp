/**
 * SeccionOrigenTraslado — Paso 1
 *
 * Muestra resumen read-only de la negociación actual,
 * fuentes de pago con sus abonos, y campos de motivo/autorización.
 */

'use client'

import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Banknote,
  Building2,
  CheckCircle2,
  DollarSign,
  Home,
  Lock,
  MapPin,
  User,
} from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import type { FuenteConAbonos } from '@/modules/clientes/services/traslado-vivienda.service'
import { Cargador } from '@/shared/components/carga'

import { styles as s } from '../../styles'

interface SeccionOrigenTrasladoProps {
  cargandoValidacion: boolean
  validacion: {
    valido: boolean
    errores: string[]
    fuentesConAbonos: FuenteConAbonos[]
    negociacionOrigen: Record<string, unknown> | null
  }
  fuentesObligatorias: FuenteConAbonos[]
  motivo: string
  setMotivo: (v: string) => void
  autorizadoPor: string
  setAutorizadoPor: (v: string) => void
  /** Error inline mostrado al intentar avanzar con el campo vacío/corto */
  errorMotivo?: string | null
  errorAutorizadoPor?: string | null
}

export function SeccionOrigenTraslado({
  cargandoValidacion,
  validacion,
  fuentesObligatorias,
  motivo,
  setMotivo,
  autorizadoPor,
  setAutorizadoPor,
  errorMotivo,
  errorAutorizadoPor,
}: SeccionOrigenTrasladoProps) {
  if (cargandoValidacion) {
    return (
      <Cargador
        modulo='clientes'
        tamano='sm'
        label='Validando negociación actual'
        className='py-8'
      />
    )
  }

  const neg = validacion.negociacionOrigen
  if (!neg) {
    return (
      <div className={s.alert.error}>
        <AlertCircle className={`${s.alert.icon} text-red-500`} />
        <div className={s.alert.content}>
          <p className={s.alert.title}>Error</p>
          <p className={s.alert.message}>
            No se pudo cargar la negociación actual.
          </p>
          {validacion.errores.length > 0 ? (
            <ul className='mt-1 list-inside list-disc space-y-0.5'>
              {validacion.errores.map((err, i) => (
                <li key={i} className='text-xs text-red-700 dark:text-red-300'>
                  {err}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    )
  }

  const vivienda = neg.viviendas as Record<string, unknown> | undefined
  const manzana = vivienda?.manzanas as Record<string, unknown> | undefined
  const proyecto = manzana?.proyectos as Record<string, unknown> | undefined

  return (
    <div className='space-y-4'>
      {/* Errores de validación */}
      {!validacion.valido && validacion.errores.length > 0 ? (
        <div className={s.alert.error}>
          <AlertCircle className={`${s.alert.icon} text-red-500`} />
          <div className={s.alert.content}>
            <p className={`${s.alert.title} text-red-800 dark:text-red-200`}>
              No se puede trasladar
            </p>
            <ul className='mt-1 list-inside list-disc space-y-0.5'>
              {validacion.errores.map((err, i) => (
                <li key={i} className='text-xs text-red-700 dark:text-red-300'>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {/* Resumen de negociación actual */}
      <div className='rounded-xl border-2 border-cyan-200 bg-cyan-50/50 p-4 dark:border-cyan-800 dark:bg-cyan-950/30'>
        <h3 className='mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white'>
          <Home className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          Vivienda Actual
        </h3>

        <div className='grid grid-cols-2 gap-3'>
          <div className='space-y-0.5'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
              Vivienda
            </p>
            <p className='text-sm font-bold text-gray-900 dark:text-white'>
              {manzana?.nombre as string} · Casa {vivienda?.numero as string}
            </p>
          </div>
          <div className='space-y-0.5'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
              Proyecto
            </p>
            <p className='text-sm font-bold text-gray-900 dark:text-white'>
              {proyecto?.nombre as string}
            </p>
          </div>
          <div className='space-y-0.5'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
              Valor negociado
            </p>
            <p className='text-sm font-bold text-gray-900 dark:text-white'>
              {formatCurrency((neg.valor_total_pagar as number) ?? 0)}
            </p>
          </div>
          <div className='space-y-0.5'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
              Total abonado
            </p>
            <p className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
              {formatCurrency((neg.total_abonado as number) ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Fuentes activas */}
      <div className='space-y-2'>
        <h3 className='flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white'>
          <Banknote className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          Fuentes de Pago Actuales
        </h3>

        {validacion.fuentesConAbonos.map(fuente => {
          const tieneAbonos = fuente.monto_recibido > 0
          const esObligatoria = fuentesObligatorias.some(
            f => f.id === fuente.id
          )

          return (
            <div
              key={fuente.id}
              className={`rounded-lg border p-3 ${
                fuente.bloquea_traslado
                  ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
                  : esObligatoria
                    ? 'border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  {fuente.es_externa ? (
                    <Building2 className='h-4 w-4 text-blue-500' />
                  ) : (
                    <DollarSign className='h-4 w-4 text-emerald-500' />
                  )}
                  <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                    {fuente.tipo}
                  </span>
                  {fuente.entidad ? (
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      ({fuente.entidad})
                    </span>
                  ) : null}
                </div>
                <span className='text-sm font-bold text-gray-900 dark:text-white'>
                  {formatCurrency(fuente.monto_aprobado)}
                </span>
              </div>

              {tieneAbonos ? (
                <div className='mt-2 flex items-center gap-3 text-xs'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Recibido: {formatCurrency(fuente.monto_recibido)} (
                    {fuente.abonos_count} abonos)
                  </span>
                </div>
              ) : null}

              {/* Badge de estado */}
              <div className='mt-2'>
                {fuente.bloquea_traslado ? (
                  <span className='inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300'>
                    <Lock className='h-3 w-3' />
                    Bloquea traslado (desembolso externo)
                  </span>
                ) : esObligatoria ? (
                  <span className='inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'>
                    <ArrowRightLeft className='h-3 w-3' />
                    Se trasladará obligatoriamente (mín{' '}
                    {formatCurrency(fuente.monto_recibido)})
                  </span>
                ) : !tieneAbonos ? (
                  <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300'>
                    <CheckCircle2 className='h-3 w-3' />
                    Sin desembolso — permite traslado
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Formulario de motivo y autorización */}
      {validacion.valido ? (
        <div className='space-y-3 rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
          <h3 className='flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white'>
            <AlertTriangle className='h-4 w-4 text-amber-500' />
            Datos del Traslado
          </h3>

          {/* Motivo */}
          <div className='space-y-1'>
            <label className={s.label.base}>
              <MapPin className='h-3.5 w-3.5' />
              Motivo del traslado <span className={s.label.required}>*</span>
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder='Describe el motivo del traslado de vivienda (mín. 20 caracteres)...'
              rows={3}
              className={`${
                errorMotivo
                  ? s.input.error
                  : motivo.length >= 20
                    ? s.input.success
                    : s.input.base
              } resize-none`}
            />
            <div className='flex items-center justify-between'>
              <span
                className={`text-xs ${
                  errorMotivo ? 'font-semibold text-red-500' : 'text-gray-400'
                }`}
              >
                {errorMotivo ?? `${motivo.length}/20 caracteres mínimo`}
              </span>
              <span
                className={`text-xs tabular-nums ${
                  motivo.length >= 20 ? 'text-emerald-500' : 'text-gray-400'
                }`}
              >
                {motivo.length} / 20
              </span>
            </div>
          </div>

          {/* Autorizado por */}
          <div className='space-y-1'>
            <label className={s.label.base}>
              <User className='h-3.5 w-3.5' />
              Autorizado por <span className={s.label.required}>*</span>
            </label>
            <input
              type='text'
              value={autorizadoPor}
              onChange={e => setAutorizadoPor(e.target.value)}
              placeholder='Nombre de quien autorizó el traslado'
              className={
                errorAutorizadoPor
                  ? s.input.error
                  : autorizadoPor.length >= 3
                    ? s.input.success
                    : s.input.base
              }
            />
            {errorAutorizadoPor ? (
              <p className='text-xs font-semibold text-red-500'>
                {errorAutorizadoPor}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
