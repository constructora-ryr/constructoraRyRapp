/**
 * Descuento opcional: interruptor y, al activarlo, monto, tipo y motivo,
 * con el antes → después del total.
 */

'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Tag } from 'lucide-react'
import type {
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { formatCurrency } from '@/lib/utils/format.utils'
import type { AsignarViviendaFormData } from '@/modules/clientes/components/asignar-vivienda/schemas'
import {
  LABELS_TIPO_DESCUENTO,
  TIPOS_DESCUENTO,
} from '@/modules/clientes/constants/descuento.constants'
import { styles as s } from '@/modules/clientes/pages/asignar-vivienda-v2/styles'
import { FormSelect } from '@/shared/components/ui/form-select'
import { cn } from '@/shared/utils/helpers'

const MIN_MOTIVO = 10

export function BloqueDescuento({
  watch,
  setValue,
  errors,
  totalSinDescuento,
  valorTotal,
  onCambio,
}: {
  watch: UseFormWatch<AsignarViviendaFormData>
  setValue: UseFormSetValue<AsignarViviendaFormData>
  errors: FieldErrors<AsignarViviendaFormData>
  totalSinDescuento: number
  valorTotal: number
  onCambio?: () => void
}) {
  const activo = !!watch('aplicar_descuento')
  const monto = Number(watch('descuento_aplicado')) || 0
  const tipo = (watch('tipo_descuento') as string) || ''
  const motivo = (watch('motivo_descuento') as string) || ''
  const pct = totalSinDescuento > 0 ? (monto / totalSinDescuento) * 100 : 0

  const alternar = () => {
    setValue('aplicar_descuento', !activo)
    if (activo) {
      setValue('descuento_aplicado', 0)
      setValue('tipo_descuento', '')
      setValue('motivo_descuento', '')
    }
    onCambio?.()
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-colors',
        activo
          ? 'border-amber-300 bg-amber-50/70 dark:border-amber-500/40 dark:bg-amber-500/10'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
      )}
    >
      <button
        type='button'
        role='switch'
        aria-checked={activo}
        onClick={alternar}
        className='flex w-full items-center gap-3 text-left'
      >
        <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'>
          <Tag className='h-4 w-4' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-sm font-bold text-gray-900 dark:text-white'>
            Aplicar descuento
          </span>
          <span className='block text-xs text-gray-600 dark:text-gray-300'>
            Solo si está autorizado. Reduce el total a cubrir.
          </span>
        </span>
        <span className={s.switch.track(activo)}>
          <span className={s.switch.thumb(activo)} />
        </span>
      </button>

      <AnimatePresence>
        {activo ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className='overflow-hidden'
          >
            <div className='mt-4 space-y-3'>
              <div className={s.field.grid2}>
                <div>
                  <label className={s.field.label}>Monto del descuento</label>
                  <div className='relative'>
                    <span className={s.field.prefix}>$</span>
                    <input
                      type='text'
                      inputMode='numeric'
                      className={`${s.field.inputMono} ${s.field.inputWithPrefix}`}
                      placeholder='0'
                      value={monto > 0 ? monto.toLocaleString('es-CO') : ''}
                      onChange={e => {
                        const n = parseInt(
                          e.target.value.replace(/\D/g, '') || '0',
                          10
                        )
                        setValue('descuento_aplicado', n)
                        onCambio?.()
                      }}
                    />
                  </div>
                  {errors.descuento_aplicado ? (
                    <p className={s.field.error}>
                      <AlertCircle className='h-3 w-3' />
                      {String(errors.descuento_aplicado.message)}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className={s.field.label}>Tipo de descuento</label>
                  <FormSelect
                    className={s.field.select}
                    value={tipo}
                    onChange={e => {
                      setValue('tipo_descuento', e.target.value)
                      onCambio?.()
                    }}
                  >
                    <option value=''>Elige el tipo</option>
                    {TIPOS_DESCUENTO.map(t => (
                      <option key={t} value={t}>
                        {LABELS_TIPO_DESCUENTO[t]}
                      </option>
                    ))}
                  </FormSelect>
                  {errors.tipo_descuento ? (
                    <p className={s.field.error}>
                      <AlertCircle className='h-3 w-3' />
                      {String(errors.tipo_descuento.message)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className={s.field.label}>Motivo del descuento</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  className={s.field.textarea}
                  placeholder='Quién lo autorizó y por qué (mínimo 10 caracteres)'
                  value={motivo}
                  onChange={e => {
                    setValue('motivo_descuento', e.target.value)
                    onCambio?.()
                  }}
                />
                <div className='flex items-center justify-between gap-2'>
                  {errors.motivo_descuento ? (
                    <p className={s.field.error}>
                      <AlertCircle className='h-3 w-3' />
                      {String(errors.motivo_descuento.message)}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={cn(
                      s.charCounter,
                      motivo.length > 0 &&
                        motivo.length < MIN_MOTIVO &&
                        'text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {motivo.length}/500
                    {motivo.length < MIN_MOTIVO
                      ? ` · mínimo ${MIN_MOTIVO}`
                      : ''}
                  </span>
                </div>
              </div>

              {monto > 0 ? (
                <div className='flex flex-wrap items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-amber-200 dark:bg-gray-900 dark:ring-amber-500/30'>
                  <span className='tabular-nums text-gray-500 line-through dark:text-gray-400'>
                    {formatCurrency(totalSinDescuento)}
                  </span>
                  <ArrowRight className='h-4 w-4 text-gray-400' />
                  <span className='font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
                    {formatCurrency(valorTotal)}
                  </span>
                  <span className='ml-auto rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'>
                    −{pct.toFixed(1)} %
                  </span>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
