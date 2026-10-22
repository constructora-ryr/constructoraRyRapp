/**
 * PasoFinancieroNuevo — Paso 4: valor base, esquinera con su recargo y el
 * total calculado. Se usa en crear y en editar (con `bloqueado` cuando la
 * vivienda ya fue entregada).
 */

'use client'

import { useEffect } from 'react'

import { DollarSign, Lock } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import type {
  ConfiguracionRecargo,
  ResumenFinanciero,
  ViviendaEstado,
} from '../types'
import { formatCurrencyInput, parseCurrency } from '../utils'

import { ErrorCampo, EtiquetaCampo } from './formulario/piezas'
import { ResumenValores } from './formulario/ResumenValores'
import { SelectorRecargo } from './formulario/SelectorRecargo'

interface PasoFinancieroProps {
  register: UseFormRegister<ViviendaSchemaType>
  errors: FieldErrors<ViviendaSchemaType>
  watch: UseFormWatch<ViviendaSchemaType>
  setValue: UseFormSetValue<ViviendaSchemaType>
  resumenFinanciero: ResumenFinanciero
  configuracionRecargos: ConfiguracionRecargo[]
  errorConfiguracion?: boolean
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
  errorConfiguracion,
  bloqueado = false,
  estadoVivienda,
}: PasoFinancieroProps) {
  const valorBase = Number(watch('valor_base')) || 0
  const esEsquinera = !!watch('es_esquinera')
  const recargo = Number(watch('recargo_esquinera')) || 0

  // Si deja de ser esquinera, el recargo no puede quedar guardado
  // (valor_total en la BD lo suma aunque es_esquinera sea false)
  useEffect(() => {
    if (!esEsquinera && recargo !== 0)
      setValue('recargo_esquinera', 0, { shouldDirty: true })
  }, [esEsquinera, recargo, setValue])

  const recargosEsquinera = configuracionRecargos.filter(
    r => r.tipo.toLowerCase().includes('esquinera') && r.activo
  )

  return (
    <div className='space-y-4'>
      {bloqueado ? (
        <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20'>
          <Lock className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
          <p className='text-xs text-amber-800 dark:text-amber-300'>
            <strong>Valores bloqueados.</strong> La vivienda está en estado{' '}
            <strong>{estadoVivienda}</strong> y sus valores ya no se pueden
            cambiar.
          </p>
        </div>
      ) : null}

      <div>
        <EtiquetaCampo htmlFor='valor_base'>Valor base</EtiquetaCampo>
        <div className='relative'>
          <DollarSign className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-orange-500' />
          <input
            id='valor_base'
            type='text'
            inputMode='numeric'
            autoComplete='off'
            value={formatCurrencyInput(String(valorBase || ''))}
            onChange={e =>
              setValue('valor_base', parseCurrency(e.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            placeholder='$ 120.000.000'
            disabled={bloqueado}
            className={cn(
              'h-12 w-full rounded-xl border-2 border-gray-300 bg-white pl-10 pr-3 text-lg font-bold tabular-nums text-gray-900 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white',
              errors.valor_base &&
                'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
          />
        </div>
        <ErrorCampo mensaje={errors.valor_base?.message} />
      </div>

      <label
        className={cn(
          'flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500/50',
          esEsquinera
            ? 'border-orange-400 bg-orange-50/60 dark:border-orange-700 dark:bg-orange-950/20'
            : 'border-gray-200 dark:border-gray-700',
          bloqueado && 'cursor-not-allowed opacity-60'
        )}
      >
        <span>
          <span className='block text-sm font-bold text-gray-900 dark:text-white'>
            Vivienda esquinera
          </span>
          <span className='block text-xs text-gray-500 dark:text-gray-400'>
            Las esquineras llevan un recargo adicional
          </span>
        </span>
        <input
          {...register('es_esquinera')}
          type='checkbox'
          disabled={bloqueado}
          className='peer sr-only'
        />
        <span className='relative h-6 w-11 flex-shrink-0 rounded-full bg-gray-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500 peer-checked:after:translate-x-5 dark:bg-gray-600' />
      </label>

      {esEsquinera ? (
        <div>
          <EtiquetaCampo>Recargo por esquinera</EtiquetaCampo>
          <SelectorRecargo
            recargos={recargosEsquinera}
            valor={recargo}
            bloqueado={bloqueado}
            error={!!errors.recargo_esquinera}
            onSeleccionar={v =>
              setValue('recargo_esquinera', v, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <ErrorCampo mensaje={errors.recargo_esquinera?.message} />
        </div>
      ) : null}

      <ResumenValores
        resumen={resumenFinanciero}
        errorConfiguracion={errorConfiguracion}
      />
    </div>
  )
}
