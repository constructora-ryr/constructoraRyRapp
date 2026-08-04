'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Building2, Calendar, CheckCircle2 } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormReturn,
} from 'react-hook-form'

import { FormSelect } from '@/shared/components/ui/form-select'
import { cn } from '@/shared/utils/helpers'

import type { ProyectoFormSchema } from '../../hooks/useProyectosForm'
import { proyectosFormPremiumStyles as styles } from '../../styles/proyectos-form-premium.styles'

interface FormSeccionEstadoFechasProps {
  register: UseFormRegister<ProyectoFormSchema>
  errors: FieldErrors<ProyectoFormSchema>
  touchedFields: UseFormReturn<ProyectoFormSchema>['formState']['touchedFields']
  isEditing: boolean
  isFieldChanged: (field: keyof ProyectoFormSchema) => boolean
}

export function FormSeccionEstadoFechas({
  register,
  errors,
  touchedFields,
  isEditing,
  isFieldChanged,
}: FormSeccionEstadoFechasProps) {
  return (
    <>
      {/* Campo: Estado */}
      <div className={styles.field.container}>
        <label className={styles.field.label}>
          Estado del Proyecto <span className={styles.field.required}>*</span>
          {isEditing && isFieldChanged('estado') && (
            <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
              ✏️ Modificado
            </span>
          )}
        </label>
        <div className={styles.field.inputWrapper}>
          <Building2 className={styles.field.inputIcon} />
          <FormSelect
            {...register('estado')}
            className={cn(
              styles.field.select,
              errors.estado && styles.field.selectError,
              touchedFields.estado &&
                !errors.estado &&
                'border-green-300 dark:border-green-700',
              isEditing &&
                isFieldChanged('estado') &&
                !errors.estado &&
                'border-orange-300 dark:border-orange-700'
            )}
          >
            <option value='en_planificacion'>En Planificación</option>
            <option value='en_proceso'>En Proceso</option>
            <option value='en_construccion'>En Construcción</option>
            <option value='completado'>Completado</option>
            <option value='pausado'>Pausado</option>
          </FormSelect>
          {touchedFields.estado && (
            <div className='pointer-events-none absolute right-10 top-1/2 -translate-y-1/2'>
              {errors.estado ? (
                <AlertCircle className='h-5 w-5 text-red-500' />
              ) : (
                <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
              )}
            </div>
          )}
        </div>
        {errors.estado && (
          <motion.div
            {...styles.animations.errorMessage}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.estado.message}
          </motion.div>
        )}
        {!errors.estado && (
          <p className={styles.field.helper}>
            Marca el estado actual del proyecto
          </p>
        )}
      </div>

      {/* Fechas en Grid 2 columnas */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Campo: Fecha de Inicio */}
        <div className={styles.field.container}>
          <label className={styles.field.label}>
            Fecha de Inicio
            {isEditing && isFieldChanged('fechaInicio') && (
              <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
                ✏️ Modificado
              </span>
            )}
          </label>
          <div className={styles.field.inputWrapper}>
            <Calendar className={styles.field.inputIcon} />
            <input
              {...register('fechaInicio')}
              type='date'
              className={cn(
                styles.field.input,
                errors.fechaInicio && styles.field.inputError,
                touchedFields.fechaInicio &&
                  !errors.fechaInicio &&
                  'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                isEditing &&
                  isFieldChanged('fechaInicio') &&
                  !errors.fechaInicio &&
                  'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20'
              )}
            />
            {touchedFields.fechaInicio && (
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'>
                {errors.fechaInicio ? (
                  <AlertCircle className='h-5 w-5 text-red-500' />
                ) : (
                  <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
                )}
              </div>
            )}
          </div>
          {errors.fechaInicio && (
            <motion.div
              {...styles.animations.errorMessage}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.fechaInicio.message}
            </motion.div>
          )}
        </div>

        {/* Campo: Fecha de Fin Estimada */}
        <div className={styles.field.container}>
          <label className={styles.field.label}>
            Fecha de Fin Estimada
            {isEditing && isFieldChanged('fechaFinEstimada') && (
              <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
                ✏️ Modificado
              </span>
            )}
          </label>
          <div className={styles.field.inputWrapper}>
            <Calendar className={styles.field.inputIcon} />
            <input
              {...register('fechaFinEstimada')}
              type='date'
              className={cn(
                styles.field.input,
                errors.fechaFinEstimada && styles.field.inputError,
                touchedFields.fechaFinEstimada &&
                  !errors.fechaFinEstimada &&
                  'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                isEditing &&
                  isFieldChanged('fechaFinEstimada') &&
                  !errors.fechaFinEstimada &&
                  'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20'
              )}
            />
            {touchedFields.fechaFinEstimada && (
              <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2'>
                {errors.fechaFinEstimada ? (
                  <AlertCircle className='h-5 w-5 text-red-500' />
                ) : (
                  <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
                )}
              </div>
            )}
          </div>
          {errors.fechaFinEstimada && (
            <motion.div
              {...styles.animations.errorMessage}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.fechaFinEstimada.message}
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
