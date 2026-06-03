/**
 * PasoLegalNuevo - Paso 3: Información legal
 * ✅ Componente presentacional puro
 * ✅ Lógica en usePasoLegal hook
 */

'use client'

import { useCallback, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileText, Hash, MapPin, Maximize } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

interface PasoLegalProps {
  register: UseFormRegister<ViviendaSchemaType>
  errors: FieldErrors<ViviendaSchemaType>
}

export function PasoLegalNuevo({ register, errors }: PasoLegalProps) {
  const [areaHint, setAreaHint] = useState<string | null>(null)
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showAreaHint = useCallback((message: string) => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current)
    setAreaHint(message)
    hintTimeoutRef.current = setTimeout(() => setAreaHint(null), 2500)
  }, [])

  // ✅ Prevenir teclas inválidas con retroalimentación visual
  const handleDecimalKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { key, ctrlKey, metaKey } = e
      if (
        ctrlKey ||
        metaKey ||
        [
          'Backspace',
          'Delete',
          'ArrowLeft',
          'ArrowRight',
          'Tab',
          'Home',
          'End',
        ].includes(key)
      )
        return

      const input = e.currentTarget
      const value = input.value
      const selStart = input.selectionStart ?? value.length
      const selEnd = input.selectionEnd ?? value.length
      const hasSelection = selStart !== selEnd

      if (!/[\d.]/.test(key)) {
        e.preventDefault()
        showAreaHint('Solo se permiten números y punto decimal')
        return
      }

      if (key === '.' && value.includes('.') && !hasSelection) {
        e.preventDefault()
        showAreaHint('Solo se permite un punto decimal')
        return
      }

      if (/\d/.test(key) && value.includes('.') && !hasSelection) {
        const dotIndex = value.indexOf('.')
        const decimals = value.slice(dotIndex + 1)
        if (selStart > dotIndex && decimals.length >= 3) {
          e.preventDefault()
          showAreaHint('Máximo 3 decimales (Ej: 66.125)')
          return
        }
      }
    },
    [showAreaHint]
  )

  // ✅ Filtrar input para operaciones de pegado (fallback)
  const handleDecimalInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      let cleaned = input.value.replace(/[^\d.]/g, '')
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('')
      }
      if (parts.length === 2 && parts[1].length > 3) {
        cleaned = parts[0] + '.' + parts[1].slice(0, 3)
      }
      if (input.value !== cleaned) {
        input.value = cleaned
        showAreaHint('Se ajustó el valor — solo números con hasta 3 decimales')
      }
    },
    [showAreaHint]
  )

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
          Información Legal
        </h2>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Datos catastrales y documentos de la vivienda
        </p>
      </div>

      {/* Matrícula Inmobiliaria */}
      <div className={styles.field.container}>
        <label htmlFor='matricula_inmobiliaria' className={styles.field.label}>
          Matrícula Inmobiliaria{' '}
          <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <FileText className={styles.field.inputIcon} />
          <input
            {...register('matricula_inmobiliaria')}
            id='matricula_inmobiliaria'
            type='text'
            placeholder='Ej: 050-123456'
            className={cn(
              styles.field.input,
              errors.matricula_inmobiliaria && styles.field.inputError
            )}
          />
        </div>
        {errors.matricula_inmobiliaria && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.matricula_inmobiliaria.message as string}
          </motion.div>
        )}
      </div>

      {/* Nomenclatura */}
      <div className={styles.field.container}>
        <label htmlFor='nomenclatura' className={styles.field.label}>
          Nomenclatura <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <MapPin className={styles.field.inputIcon} />
          <input
            {...register('nomenclatura')}
            id='nomenclatura'
            type='text'
            placeholder='Ej: Calle 123 # 45-67'
            className={cn(
              styles.field.input,
              errors.nomenclatura && styles.field.inputError
            )}
          />
        </div>
        {errors.nomenclatura && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.nomenclatura.message as string}
          </motion.div>
        )}
      </div>

      {/* Áreas */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* Área del Lote */}
        <div className={styles.field.container}>
          <label htmlFor='area_lote' className={styles.field.label}>
            Área del Lote (m²) <span className={styles.field.required}>*</span>
          </label>
          <div className={styles.field.inputWrapper}>
            <Maximize className={styles.field.inputIcon} />
            <input
              {...register('area_lote')}
              id='area_lote'
              type='text'
              inputMode='decimal'
              placeholder='66.125'
              onKeyDown={handleDecimalKeyDown}
              onInput={handleDecimalInput}
              className={cn(
                styles.field.input,
                errors.area_lote && styles.field.inputError
              )}
            />
          </div>
          {errors.area_lote && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.area_lote.message as string}
            </motion.div>
          )}
        </div>

        {/* Área Construida */}
        <div className={styles.field.container}>
          <label htmlFor='area_construida' className={styles.field.label}>
            Área Construida (m²){' '}
            <span className={styles.field.required}>*</span>
          </label>
          <div className={styles.field.inputWrapper}>
            <Maximize className={styles.field.inputIcon} />
            <input
              {...register('area_construida')}
              id='area_construida'
              type='text'
              inputMode='decimal'
              placeholder='41.00'
              onKeyDown={handleDecimalKeyDown}
              onInput={handleDecimalInput}
              className={cn(
                styles.field.input,
                errors.area_construida && styles.field.inputError
              )}
            />
          </div>
          {errors.area_construida && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.field.error}
            >
              <AlertCircle className={styles.field.errorIcon} />
              {errors.area_construida.message as string}
            </motion.div>
          )}
        </div>
      </div>

      {/* Hint dinámico para campos de área */}
      <AnimatePresence>
        {areaHint ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {areaHint}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Tipo de Vivienda */}
      <div className={styles.field.container}>
        <label htmlFor='tipo_vivienda' className={styles.field.label}>
          Tipo de Vivienda <span className={styles.field.required}>*</span>
        </label>
        <div className={styles.field.inputWrapper}>
          <Hash className={styles.field.inputIcon} />
          <select
            {...register('tipo_vivienda')}
            id='tipo_vivienda'
            className={cn(
              styles.field.select,
              errors.tipo_vivienda && styles.field.inputError
            )}
          >
            <option value=''>Selecciona un tipo</option>
            <option value='Regular'>Regular</option>
            <option value='Irregular'>Irregular</option>
          </select>
        </div>
        {errors.tipo_vivienda && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.field.error}
          >
            <AlertCircle className={styles.field.errorIcon} />
            {errors.tipo_vivienda.message as string}
          </motion.div>
        )}
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
          Regular: Lote rectangular. Irregular: Lote con formas atípicas.
        </p>
      </div>
    </motion.div>
  )
}
