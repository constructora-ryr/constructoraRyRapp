/**
 * PasoUbicacionNuevo - Paso 1: Selección de ubicación
 * ✅ Componente presentacional puro
 * ✅ Lógica en usePasoUbicacion hook
 * ✅ React Query para carga de datos
 * ✅ Soporta modo edición (muestra datos como solo lectura)
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Building2, Home, Info, MapPin } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { FormSelect } from '@/shared/components/ui/form-select'
import { cn } from '@/shared/utils/helpers'

import { usePasoUbicacion } from '../hooks/usePasoUbicacion'
import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'
import type { Vivienda } from '../types'

interface PasoUbicacionProps {
  register: UseFormRegister<ViviendaSchemaType>
  errors: FieldErrors<ViviendaSchemaType>
  setValue: UseFormSetValue<ViviendaSchemaType>
  watch: UseFormWatch<ViviendaSchemaType>
  mode?: 'create' | 'edit'
  viviendaActual?: Vivienda | null
}

export function PasoUbicacionNuevo({
  register,
  errors,
  setValue,
  watch,
  mode = 'create',
  viviendaActual = null,
}: PasoUbicacionProps) {
  const isEditMode = mode === 'edit'

  // ✅ Hook con toda la lógica - SOLO en modo creación
  const hookData = usePasoUbicacion({
    setValue,
    watch,
    enabled: !isEditMode, // ← NO ejecutar queries en modo edición
  })

  const {
    proyectos = [],
    manzanas = [],
    numerosDisponibles = [],
    manzanaInfo,
    cargandoProyectos = false,
    cargandoManzanas = false,
  } = isEditMode ? {} : hookData

  // Variables observadas del formulario
  const proyectoSeleccionado = watch('proyecto_id')
  const manzanaSeleccionada = watch('manzana_id')
  const numeroVivienda = watch('numero')

  // Datos para modo edición - usar directamente de viviendaActual (sin queries)
  const proyectoNombre =
    isEditMode && viviendaActual?.manzanas?.proyectos
      ? viviendaActual.manzanas.proyectos.nombre
      : proyectos.find(p => p.id === proyectoSeleccionado)?.nombre ||
        'Cargando...'
  const manzanaNombre =
    isEditMode && viviendaActual?.manzanas
      ? viviendaActual.manzanas.nombre
      : manzanas.find(m => m.id === manzanaSeleccionada)?.nombre ||
        'Cargando...'
  const numeroDisplay =
    isEditMode && viviendaActual ? viviendaActual.numero : numeroVivienda

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className='space-y-3'
    >
      {/* Título del paso */}
      <div className='mb-2'>
        <h2 className='mb-1 text-xl font-bold text-gray-900 dark:text-white'>
          Ubicación de la Vivienda
        </h2>
        <p className='text-xs text-gray-600 dark:text-gray-400'>
          {isEditMode
            ? 'Información de ubicación (no modificable)'
            : 'Selecciona el proyecto, manzana y número de vivienda disponible'}
        </p>
      </div>

      {/* Alerta informativa en modo edición */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5 dark:border-blue-800 dark:bg-blue-950/30'
        >
          <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
          <p className='text-xs text-blue-900 dark:text-blue-100'>
            La ubicación de la vivienda no puede modificarse. Para cambiar estos
            datos, debes crear una nueva vivienda.
          </p>
        </motion.div>
      )}

      {/* Proyecto */}
      <div className={styles.field.container}>
        <label htmlFor='proyecto_id' className={styles.field.label}>
          Proyecto <span className={styles.field.required}>*</span>
        </label>
        {isEditMode ? (
          <div className='flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'>
              <Building2 className='h-5 w-5 text-white' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-bold text-gray-900 dark:text-white'>
                {proyectoNombre}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Proyecto actual
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.field.inputWrapper}>
              <Building2 className={styles.field.inputIcon} />
              <FormSelect
                {...register('proyecto_id')}
                id='proyecto_id'
                disabled={cargandoProyectos}
                className={cn(
                  styles.field.select,
                  errors.proyecto_id && styles.field.inputError
                )}
              >
                <option value=''>Selecciona un proyecto</option>
                {proyectos.map(proyecto => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre}
                  </option>
                ))}
              </FormSelect>
            </div>
            {errors.proyecto_id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors.proyecto_id.message as string}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Manzana */}
      <div className={styles.field.container}>
        <label htmlFor='manzana_id' className={styles.field.label}>
          Manzana <span className={styles.field.required}>*</span>
        </label>
        {isEditMode ? (
          <div className='flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg'>
              <MapPin className='h-5 w-5 text-white' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-bold text-gray-900 dark:text-white'>
                Manzana {manzanaNombre}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Manzana actual
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.field.inputWrapper}>
              <MapPin className={styles.field.inputIcon} />
              <FormSelect
                {...register('manzana_id')}
                id='manzana_id'
                disabled={!proyectoSeleccionado || cargandoManzanas}
                className={cn(
                  styles.field.select,
                  errors.manzana_id && styles.field.inputError
                )}
              >
                <option value=''>
                  {!proyectoSeleccionado
                    ? 'Primero selecciona un proyecto'
                    : cargandoManzanas
                      ? 'Cargando manzanas...'
                      : manzanas.length === 0
                        ? 'No hay manzanas disponibles'
                        : 'Selecciona una manzana'}
                </option>
                {manzanas.map(manzana => (
                  <option
                    key={manzana.id}
                    value={manzana.id}
                    disabled={!manzana.tiene_disponibles}
                  >
                    Manzana {manzana.nombre} ({manzana.viviendas_disponibles}{' '}
                    disponibles)
                  </option>
                ))}
              </FormSelect>
            </div>
            {errors.manzana_id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors.manzana_id.message as string}
              </motion.div>
            )}
            {manzanaInfo && (
              <div className={styles.field.hint}>
                <AlertCircle className={styles.field.hintIcon} />
                Total en manzana: {manzanaInfo.total_viviendas} viviendas •
                Creadas: {manzanaInfo.viviendas_creadas} • Disponibles:{' '}
                {manzanaInfo.viviendas_disponibles}
              </div>
            )}
          </>
        )}
      </div>

      {/* Número de vivienda */}
      <div className={styles.field.container}>
        <label htmlFor='numero' className={styles.field.label}>
          Número de Casa <span className={styles.field.required}>*</span>
        </label>
        {isEditMode ? (
          <div className='flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg'>
              <Home className='h-5 w-5 text-white' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-bold text-gray-900 dark:text-white'>
                Casa Número {numeroDisplay}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Número de casa
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.field.inputWrapper}>
              <Home className={styles.field.inputIcon} />
              <FormSelect
                {...register('numero')}
                id='numero'
                disabled={
                  !manzanaSeleccionada || numerosDisponibles.length === 0
                }
                className={cn(
                  styles.field.select,
                  errors.numero && styles.field.inputError
                )}
              >
                <option value=''>
                  {!manzanaSeleccionada
                    ? 'Primero selecciona una manzana'
                    : numerosDisponibles.length === 0
                      ? 'No hay casas disponibles'
                      : 'Selecciona el número de casa'}
                </option>
                {numerosDisponibles.map(num => (
                  <option key={num} value={num.toString()}>
                    Casa Número {num}
                  </option>
                ))}
              </FormSelect>
            </div>
            {errors.numero && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.field.error}
              >
                <AlertCircle className={styles.field.errorIcon} />
                {errors.numero.message as string}
              </motion.div>
            )}
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              Selecciona el número de casa que deseas crear de las disponibles
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}
