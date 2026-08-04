'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  MapPin,
} from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormReturn,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { FormSelect } from '@/shared/components/ui/form-select'
import { cn } from '@/shared/utils/helpers'

import type { ProyectoFormSchema } from '../../hooks/useProyectosForm'
import { proyectosFormPremiumStyles as styles } from '../../styles/proyectos-form-premium.styles'

interface FormSeccionInfoGeneralProps {
  register: UseFormRegister<ProyectoFormSchema>
  errors: FieldErrors<ProyectoFormSchema>
  touchedFields: UseFormReturn<ProyectoFormSchema>['formState']['touchedFields']
  watch: UseFormWatch<ProyectoFormSchema>
  setValue: UseFormSetValue<ProyectoFormSchema>
  isEditing: boolean
  isFieldChanged: (field: keyof ProyectoFormSchema) => boolean
  validandoNombre: boolean
  departamentos: string[]
  ciudades: string[]
}

export function FormSeccionInfoGeneral({
  register,
  errors,
  touchedFields,
  watch,
  isEditing,
  isFieldChanged,
  validandoNombre,
  departamentos,
  ciudades,
}: FormSeccionInfoGeneralProps) {
  const departamentoSeleccionado = watch('departamento')

  return (
    <motion.div
      {...styles.animations.infoSection}
      className={styles.infoSection.container}
    >
      {/* Header */}
      <div className={styles.infoSection.header}>
        <div className={styles.infoSection.headerIcon}>
          <FileCheck className={styles.infoSection.headerIconSvg} />
        </div>
        <h3 className={styles.infoSection.headerTitle}>Información General</h3>
      </div>

      <div className={styles.infoSection.content}>
        {/* Campo: Nombre */}
        <div className={styles.field.container}>
          <label className={styles.field.label}>
            Nombre del Proyecto <span className={styles.field.required}>*</span>
            {isEditing && isFieldChanged('nombre') && (
              <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
                ✏️ Modificado
              </span>
            )}
          </label>
          <div className={styles.field.inputWrapper}>
            <Building2 className={styles.field.inputIcon} />
            <input
              {...register('nombre')}
              type='text'
              placeholder='Ej: Urbanización Los Pinos'
              maxLength={100}
              className={cn(
                styles.field.input,
                errors.nombre && styles.field.inputError,
                touchedFields.nombre &&
                  !errors.nombre &&
                  'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                isEditing &&
                  isFieldChanged('nombre') &&
                  !errors.nombre &&
                  'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20'
              )}
            />
            {touchedFields.nombre && (
              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                {validandoNombre ? (
                  <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
                ) : errors.nombre ? (
                  <AlertCircle className='h-5 w-5 text-red-500' />
                ) : (
                  <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
                )}
              </div>
            )}
          </div>
          {errors.nombre && (
            <motion.div
              {...styles.animations.errorMessage}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.nombre.message}
            </motion.div>
          )}
          {!errors.nombre && (
            <p className={styles.field.helper}>
              Solo letras, números, espacios, guiones, paréntesis y puntos
            </p>
          )}
        </div>

        {/* Campos: Departamento + Ciudad */}
        <div className='grid grid-cols-2 gap-3'>
          {/* Departamento */}
          <div className={styles.field.container}>
            <label className={styles.field.label}>
              Departamento <span className={styles.field.required}>*</span>
              {isEditing && isFieldChanged('departamento') && (
                <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
                  ✏️ Modificado
                </span>
              )}
            </label>
            <div className={styles.field.inputWrapper}>
              <MapPin className={styles.field.inputIcon} />
              <FormSelect
                {...register('departamento')}
                className={cn(
                  styles.field.input,
                  errors.departamento && styles.field.inputError,
                  touchedFields.departamento &&
                    !errors.departamento &&
                    'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                  isEditing &&
                    isFieldChanged('departamento') &&
                    !errors.departamento &&
                    'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20'
                )}
              >
                <option value=''>Selecciona un departamento</option>
                {departamentos.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </FormSelect>
              {touchedFields.departamento && (
                <div className='pointer-events-none absolute right-9 top-1/2 -translate-y-1/2'>
                  {errors.departamento ? (
                    <AlertCircle className='h-5 w-5 text-red-500' />
                  ) : (
                    <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
                  )}
                </div>
              )}
            </div>
            {errors.departamento && (
              <motion.div
                {...styles.animations.errorMessage}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors.departamento.message}
              </motion.div>
            )}
          </div>

          {/* Ciudad */}
          <div className={styles.field.container}>
            <label className={styles.field.label}>
              Ciudad / Municipio{' '}
              <span className={styles.field.required}>*</span>
              {isEditing && isFieldChanged('ciudad') && (
                <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
                  ✏️ Modificado
                </span>
              )}
            </label>
            <div className={styles.field.inputWrapper}>
              <MapPin className={styles.field.inputIcon} />
              <FormSelect
                {...register('ciudad')}
                disabled={!departamentoSeleccionado}
                className={cn(
                  styles.field.input,
                  errors.ciudad && styles.field.inputError,
                  touchedFields.ciudad &&
                    !errors.ciudad &&
                    'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                  isEditing &&
                    isFieldChanged('ciudad') &&
                    !errors.ciudad &&
                    'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20',
                  !departamentoSeleccionado && 'cursor-not-allowed opacity-50'
                )}
              >
                <option value=''>
                  {departamentoSeleccionado
                    ? 'Selecciona una ciudad'
                    : 'Primero selecciona un depto.'}
                </option>
                {ciudades.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FormSelect>
              {touchedFields.ciudad && (
                <div className='pointer-events-none absolute right-9 top-1/2 -translate-y-1/2'>
                  {errors.ciudad ? (
                    <AlertCircle className='h-5 w-5 text-red-500' />
                  ) : (
                    <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
                  )}
                </div>
              )}
            </div>
            {errors.ciudad && (
              <motion.div
                {...styles.animations.errorMessage}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors.ciudad.message}
              </motion.div>
            )}
          </div>
        </div>

        {/* Campo: Dirección */}
        <div className={styles.field.container}>
          <label className={styles.field.label}>
            Dirección <span className={styles.field.required}>*</span>
            {isEditing && isFieldChanged('direccion') && (
              <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
                ✏️ Modificado
              </span>
            )}
          </label>
          <div className={styles.field.inputWrapper}>
            <MapPin className={styles.field.inputIcon} />
            <input
              {...register('direccion')}
              type='text'
              placeholder='Ej: Calle 48 Norte #4E-07'
              maxLength={200}
              className={cn(
                styles.field.input,
                errors.direccion && styles.field.inputError,
                touchedFields.direccion &&
                  !errors.direccion &&
                  'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                isEditing &&
                  isFieldChanged('direccion') &&
                  !errors.direccion &&
                  'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20'
              )}
            />
            {touchedFields.direccion && (
              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                {errors.direccion ? (
                  <AlertCircle className='h-5 w-5 text-red-500' />
                ) : (
                  <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
                )}
              </div>
            )}
          </div>
          {errors.direccion && (
            <motion.div
              {...styles.animations.errorMessage}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.direccion.message}
            </motion.div>
          )}
          {!errors.direccion && (
            <p className={styles.field.helper}>Dirección exacta del proyecto</p>
          )}
        </div>

        {/* Campo: Descripción */}
        <div>
          <label className={styles.field.label}>
            Descripción <span className={styles.field.required}>*</span>
            {isEditing && isFieldChanged('descripcion') && (
              <span className='ml-2 text-xs font-medium text-orange-600 dark:text-orange-400'>
                ✏️ Modificado
              </span>
            )}
          </label>
          <div className={styles.field.textareaWrapper}>
            <FileText className={styles.field.textareaIcon} />
            <textarea
              {...register('descripcion')}
              rows={3}
              placeholder='Descripción breve del proyecto...'
              maxLength={1000}
              className={cn(
                styles.field.textarea,
                errors.descripcion && styles.field.textareaError,
                touchedFields.descripcion &&
                  !errors.descripcion &&
                  'border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/20',
                isEditing &&
                  isFieldChanged('descripcion') &&
                  !errors.descripcion &&
                  'border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/20'
              )}
            />
            {touchedFields.descripcion && (
              <div className='absolute right-3 top-3'>
                {errors.descripcion ? (
                  <AlertCircle className='h-5 w-5 text-red-500' />
                ) : (
                  <CheckCircle2 className='h-5 w-5 text-green-500 duration-200 animate-in fade-in zoom-in' />
                )}
              </div>
            )}
          </div>
          {errors.descripcion && (
            <motion.div
              {...styles.animations.errorMessage}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.descripcion.message}
            </motion.div>
          )}
          {!errors.descripcion && (
            <p className={styles.field.helper}>
              Mínimo 10 caracteres. Puedes usar letras, números y puntuación
              básica
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
