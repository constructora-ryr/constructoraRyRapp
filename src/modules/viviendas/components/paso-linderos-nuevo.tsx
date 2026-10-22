/**
 * PasoLinderosNuevo — Paso 2: los cuatro linderos de la casa, cada uno con su
 * punto cardinal en color. Se usa en crear y en editar.
 */

'use client'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import { LINDEROS } from '../constants/linderos'
import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'

import { ErrorCampo } from './formulario/piezas'

export function PasoLinderosNuevo({
  register,
  errors,
}: {
  register: UseFormRegister<ViviendaSchemaType>
  errors: FieldErrors<ViviendaSchemaType>
}) {
  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
      {LINDEROS.map(l => {
        const error = errors[l.campo]?.message
        return (
          <div key={l.campo}>
            <label
              htmlFor={l.campo}
              className='mb-1.5 flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300'
            >
              <span
                className={cn(
                  'flex h-6 min-w-6 items-center justify-center rounded-md bg-gradient-to-br px-1 text-[10px] font-bold text-white shadow-sm',
                  l.color
                )}
              >
                {l.letra}
              </span>
              Lindero {l.nombre}
              <span className='text-red-500'>*</span>
            </label>
            <textarea
              {...register(l.campo)}
              id={l.campo}
              rows={2}
              placeholder={`Ej: ${l.ejemplo}`}
              className={cn(
                'w-full resize-y rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500',
                error &&
                  'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              )}
            />
            <ErrorCampo mensaje={error} />
          </div>
        )
      })}
    </div>
  )
}
