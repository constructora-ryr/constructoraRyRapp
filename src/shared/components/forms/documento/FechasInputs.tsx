'use client'

/**
 * Fecha del documento y vencimiento. El vencimiento se habilita solo cuando
 * hay fecha del documento (la validación del schema exige ese orden).
 */

import { useEffect } from 'react'

import { AlertCircle, CalendarClock, CalendarDays } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { getTodayDateString } from '@/lib/utils/date.utils'
import type { DocumentoFormData } from '@/shared/documentos/schemas/documento.schema'
import { cn } from '@/shared/utils/helpers'

import { documentoFormStyles as s } from './documento-form.styles'

interface FechasInputsProps {
  register: UseFormRegister<DocumentoFormData>
  watch: UseFormWatch<DocumentoFormData>
  setValue: UseFormSetValue<DocumentoFormData>
  errors: FieldErrors<DocumentoFormData>
  /** Anillo de foco del módulo */
  foco: string
}

export function FechasInputs({
  register,
  watch,
  setValue,
  errors,
  foco,
}: FechasInputsProps) {
  const fechaDocumento = watch('fecha_documento')
  const fechaVencimiento = watch('fecha_vencimiento')

  // Sin fecha del documento no puede haber vencimiento
  useEffect(() => {
    if (!fechaDocumento && fechaVencimiento) {
      setValue('fecha_vencimiento', '', { shouldValidate: true })
    }
  }, [fechaDocumento, fechaVencimiento, setValue])

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      <div>
        <label htmlFor='doc-fecha' className={s.etiqueta}>
          <CalendarDays className='h-3.5 w-3.5 text-blue-500' />
          Fecha del documento
        </label>
        <input
          id='doc-fecha'
          {...register('fecha_documento')}
          type='date'
          max={getTodayDateString()}
          className={cn(
            s.campo,
            foco,
            errors.fecha_documento ? s.campoError : s.campoNormal
          )}
        />
        {errors.fecha_documento ? (
          <p className={s.error}>
            <AlertCircle className='h-3 w-3 flex-shrink-0' />
            {errors.fecha_documento.message}
          </p>
        ) : (
          <p className={s.ayuda}>Cuándo se expidió o firmó</p>
        )}
      </div>

      <div>
        <label htmlFor='doc-vencimiento' className={s.etiqueta}>
          <CalendarClock className='h-3.5 w-3.5 text-orange-500' />
          Vencimiento
        </label>
        <input
          id='doc-vencimiento'
          {...register('fecha_vencimiento')}
          type='date'
          min={fechaDocumento || undefined}
          disabled={!fechaDocumento}
          className={cn(
            s.campo,
            foco,
            errors.fecha_vencimiento ? s.campoError : s.campoNormal
          )}
        />
        {errors.fecha_vencimiento ? (
          <p className={s.error}>
            <AlertCircle className='h-3 w-3 flex-shrink-0' />
            {errors.fecha_vencimiento.message}
          </p>
        ) : (
          <p className={s.ayuda}>
            {fechaDocumento
              ? 'Solo si el documento expira'
              : 'Primero indica la fecha del documento'}
          </p>
        )}
      </div>
    </div>
  )
}
