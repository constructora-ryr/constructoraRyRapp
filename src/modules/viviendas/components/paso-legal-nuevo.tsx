/**
 * PasoLegalNuevo — Paso 3: matrícula (verificada mientras se escribe),
 * nomenclatura, áreas en m² y tipo de lote. Se usa en crear y en editar.
 */

'use client'

import { FileText, MapPin, Maximize, Square, Spline } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form'

import { cn } from '@/shared/utils/helpers'

import { useCampoDecimal } from '../hooks/useCampoDecimal'
import { useVerificacionMatricula } from '../hooks/useVerificacionMatricula'
import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { nuevaViviendaStyles as styles } from '../styles/nueva-vivienda.styles'

import { EstadoMatricula } from './formulario/EstadoMatricula'
import { ErrorCampo, EtiquetaCampo } from './formulario/piezas'

const TIPOS_LOTE = [
  {
    valor: 'Regular',
    icon: Square,
    descripcion: 'Lote rectangular',
  },
  {
    valor: 'Irregular',
    icon: Spline,
    descripcion: 'Lote con forma atípica',
  },
] as const

interface PasoLegalProps {
  register: UseFormRegister<ViviendaSchemaType>
  errors: FieldErrors<ViviendaSchemaType>
  watch: UseFormWatch<ViviendaSchemaType>
  /** En edición, para no contar la propia vivienda como duplicada */
  viviendaId?: string
}

export function PasoLegalNuevo({
  register,
  errors,
  watch,
  viviendaId,
}: PasoLegalProps) {
  const decimal = useCampoDecimal()
  const matricula = useVerificacionMatricula(
    watch('matricula_inmobiliaria'),
    viviendaId
  )
  const tipo = watch('tipo_vivienda')

  const campoArea = (
    campo: 'area_lote' | 'area_construida',
    etiqueta: string,
    ejemplo: string
  ) => (
    <div>
      <EtiquetaCampo htmlFor={campo}>{etiqueta}</EtiquetaCampo>
      <div className={styles.field.inputWrapper}>
        <Maximize className={styles.field.inputIcon} />
        <input
          {...register(campo)}
          id={campo}
          type='text'
          inputMode='decimal'
          placeholder={ejemplo}
          onKeyDown={decimal.onKeyDown}
          onInput={decimal.onInput}
          className={cn(
            styles.field.input,
            'pr-10',
            errors[campo] && styles.field.inputError
          )}
        />
        <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400'>
          m²
        </span>
      </div>
      <ErrorCampo mensaje={errors[campo]?.message} />
    </div>
  )

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <EtiquetaCampo
            htmlFor='matricula_inmobiliaria'
            extra={<EstadoMatricula estado={matricula} />}
          >
            Matrícula inmobiliaria
          </EtiquetaCampo>
          <div className={styles.field.inputWrapper}>
            <FileText className={styles.field.inputIcon} />
            <input
              {...register('matricula_inmobiliaria')}
              id='matricula_inmobiliaria'
              type='text'
              inputMode='numeric'
              autoComplete='off'
              placeholder='Ej: 373-123456'
              className={cn(
                styles.field.input,
                (errors.matricula_inmobiliaria ||
                  matricula.estado === 'duplicada') &&
                  styles.field.inputError
              )}
            />
          </div>
          <ErrorCampo mensaje={errors.matricula_inmobiliaria?.message} />
        </div>

        <div>
          <EtiquetaCampo htmlFor='nomenclatura'>Nomenclatura</EtiquetaCampo>
          <div className={styles.field.inputWrapper}>
            <MapPin className={styles.field.inputIcon} />
            <input
              {...register('nomenclatura')}
              id='nomenclatura'
              type='text'
              placeholder='Ej: Calle 12 # 3-45'
              className={cn(
                styles.field.input,
                errors.nomenclatura && styles.field.inputError
              )}
            />
          </div>
          <ErrorCampo mensaje={errors.nomenclatura?.message} />
        </div>

        {campoArea('area_lote', 'Área del lote', '66.125')}
        {campoArea('area_construida', 'Área construida', '41.5')}
      </div>

      {decimal.aviso ? (
        <p className='text-xs font-medium text-amber-600 dark:text-amber-400'>
          {decimal.aviso}
        </p>
      ) : null}

      <div>
        <EtiquetaCampo>Tipo de lote</EtiquetaCampo>
        <div role='radiogroup' className='grid grid-cols-2 gap-2'>
          {TIPOS_LOTE.map(({ valor, icon: Icon, descripcion }) => {
            const activo = tipo === valor
            return (
              <label
                key={valor}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500/50',
                  activo
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30'
                    : 'border-gray-200 bg-white hover:border-orange-300 dark:border-gray-700 dark:bg-gray-900'
                )}
              >
                <input
                  {...register('tipo_vivienda')}
                  type='radio'
                  value={valor}
                  className='sr-only'
                />
                <span
                  className={cn(
                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                    activo
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                  )}
                >
                  <Icon className='h-4 w-4' />
                </span>
                <span className='min-w-0'>
                  <span className='block text-sm font-bold text-gray-900 dark:text-white'>
                    {valor}
                  </span>
                  <span className='block text-xs text-gray-500 dark:text-gray-400'>
                    {descripcion}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <ErrorCampo mensaje={errors.tipo_vivienda?.message} />
      </div>
    </div>
  )
}
