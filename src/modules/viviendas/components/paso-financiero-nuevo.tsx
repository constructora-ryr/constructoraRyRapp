/**
 * PasoFinancieroNuevo - Paso 4: Información financiera
 * ✅ Diseño compacto estándar
 * ✅ Formato de moneda en inputs
 * ✅ Gastos notariales automáticos
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, DollarSign, Lock, TrendingUp } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { FormSelect } from '@/shared/components/ui/form-select'
import { cn } from '@/shared/utils/helpers'

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'
import type {
  ConfiguracionRecargo,
  ResumenFinanciero,
  ViviendaEstado,
} from '../types'
import { formatCurrencyInput, parseCurrency } from '../utils'

interface PasoFinancieroProps {
  register: UseFormRegister<ViviendaSchemaType>
  errors: FieldErrors<ViviendaSchemaType>
  watch: UseFormWatch<ViviendaSchemaType>
  setValue: UseFormSetValue<ViviendaSchemaType>
  resumenFinanciero: ResumenFinanciero
  configuracionRecargos: ConfiguracionRecargo[]
  bloqueado?: boolean
  estadoVivienda?: ViviendaEstado | string
}

export function PasoFinancieroNuevo({
  register,
  errors,
  watch,
  setValue,
  resumenFinanciero,
  configuracionRecargos,
  bloqueado = false,
  estadoVivienda,
}: PasoFinancieroProps) {
  const valorBase = watch('valor_base') || 0
  const esEsquinera = watch('es_esquinera') || false
  const recargoEsquinera = watch('recargo_esquinera') || 0

  // Filtrar recargos de tipo esquinera
  const recargosEsquinera = configuracionRecargos.filter(
    r => r.tipo.toLowerCase().includes('esquinera') && r.activo
  )

  // Formatear moneda para display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className='space-y-3'
    >
      {/* Título del paso */}
      <div>
        <h2 className='mb-1 text-xl font-bold text-gray-900 dark:text-white'>
          Información Financiera
        </h2>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Define el valor base y recargos de la vivienda
        </p>
      </div>

      {/* Banner de bloqueo para viviendas Entregadas */}
      {bloqueado ? (
        <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20'>
          <Lock className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
          <div>
            <p className='text-sm font-bold text-amber-800 dark:text-amber-300'>
              Campos financieros bloqueados
            </p>
            <p className='mt-0.5 text-xs text-amber-700 dark:text-amber-400'>
              Esta vivienda está en estado <strong>{estadoVivienda}</strong>.
              Los valores financieros no pueden modificarse una vez entregada.
            </p>
          </div>
        </div>
      ) : null}

      {/* Valor Base */}
      <div className={styles.field.container}>
        <label htmlFor='valor_base' className={styles.field.label}>
          Valor Base <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <DollarSign className={styles.field.inputIcon} />
          <input
            id='valor_base'
            type='text'
            value={formatCurrencyInput(valorBase?.toString() || '')}
            onChange={e => {
              const valor = parseCurrency(e.target.value)
              setValue('valor_base', valor)
            }}
            placeholder='$ 50.000.000'
            disabled={bloqueado}
            className={cn(
              styles.field.input,
              errors.valor_base && styles.field.inputError,
              bloqueado &&
                'cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800'
            )}
          />
        </div>
        {errors.valor_base && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.valor_base.message as string}
          </motion.div>
        )}
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
          Precio base sin recargos: {formatCurrency(valorBase)}
        </p>
      </div>

      {/* Es Esquinera */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <input
            {...register('es_esquinera')}
            id='es_esquinera'
            type='checkbox'
            disabled={bloqueado}
            className={cn(
              'h-5 w-5 rounded border-2 border-gray-300 text-orange-500 transition-colors focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600',
              bloqueado && 'cursor-not-allowed opacity-60'
            )}
          />
          <label
            htmlFor='es_esquinera'
            className='cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            ¿Es vivienda esquinera?
          </label>
        </div>

        {/* Recargo Esquinera (solo si es esquinera) */}
        {esEsquinera && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.field.container}
          >
            <label htmlFor='recargo_esquinera' className={styles.field.label}>
              Recargo por Esquinera{' '}
              <span className={styles.field.required}>*</span>
            </label>
            <div className={styles.field.inputWrapper}>
              <TrendingUp className={styles.field.inputIcon} />
              <FormSelect
                {...register('recargo_esquinera', { valueAsNumber: true })}
                id='recargo_esquinera'
                disabled={bloqueado}
                className={cn(
                  styles.field.input,
                  errors.recargo_esquinera && styles.field.inputError,
                  bloqueado &&
                    'cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-800'
                )}
              >
                <option value='0'>Selecciona el recargo por esquinera</option>
                {recargosEsquinera.map(recargo => (
                  <option key={recargo.id} value={recargo.valor}>
                    {recargo.nombre} - {formatCurrency(recargo.valor)}
                  </option>
                ))}
              </FormSelect>
            </div>
            {errors.recargo_esquinera && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors.recargo_esquinera.message as string}
              </motion.div>
            )}
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Recargo adicional: {formatCurrency(recargoEsquinera)}
            </p>
          </motion.div>
        )}
      </div>

      {/* Resumen Financiero */}
      <div className='rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-3 dark:border-orange-800 dark:from-orange-950/30 dark:to-amber-950/30'>
        <div className='mb-3 flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30'>
            <DollarSign className='h-4 w-4 text-white' />
          </div>
          <h3 className='text-base font-bold text-orange-900 dark:text-orange-100'>
            Resumen Financiero
          </h3>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between border-b border-orange-200 py-1.5 dark:border-orange-800'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              Valor Base:
            </span>
            <span className='text-sm font-semibold text-gray-900 dark:text-white'>
              {formatCurrency(resumenFinanciero.valor_base)}
            </span>
          </div>

          <div className='flex items-center justify-between border-b border-orange-200 py-1.5 dark:border-orange-800'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              Gastos Notariales (Automático):
            </span>
            <span className='text-sm font-semibold text-blue-600 dark:text-blue-400'>
              + {formatCurrency(resumenFinanciero.gastos_notariales)}
            </span>
          </div>

          {esEsquinera && (
            <div className='flex items-center justify-between border-b border-orange-200 py-1.5 dark:border-orange-800'>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Recargo Esquinera:
              </span>
              <span className='text-sm font-semibold text-orange-600 dark:text-orange-400'>
                + {formatCurrency(resumenFinanciero.recargo_esquinera)}
              </span>
            </div>
          )}

          <div className='flex items-center justify-between pt-2'>
            <span className='text-base font-bold text-gray-900 dark:text-white'>
              Valor Total:
            </span>
            <span className='bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-xl font-bold text-transparent'>
              {formatCurrency(resumenFinanciero.valor_total)}
            </span>
          </div>
        </div>

        {/* Nota informativa */}
        <div className='mt-3 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-700 dark:bg-blue-900/20'>
          <p className='text-xs text-blue-900 dark:text-blue-100'>
            ℹ️ <strong>Nota:</strong> Los gastos notariales son un recargo{' '}
            <strong>obligatorio</strong> que se suma automáticamente al valor
            base de todas las viviendas.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
