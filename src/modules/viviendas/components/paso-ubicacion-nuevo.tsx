/**
 * PasoUbicacionNuevo — Paso 1: proyecto (lista), manzana (tarjetas) y número
 * (cuadrícula). En edición muestra la ubicación como solo lectura.
 * Datos en usePasoUbicacion.
 */

'use client'

import { useEffect } from 'react'

import { Building2 } from 'lucide-react'
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

import { ErrorCampo, EtiquetaCampo } from './formulario/piezas'
import { SelectorManzana } from './formulario/SelectorManzana'
import { SelectorNumero } from './formulario/SelectorNumero'
import { UbicacionSoloLectura } from './formulario/UbicacionSoloLectura'

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
  const enEdicion = mode === 'edit'
  const u = usePasoUbicacion({ setValue, watch, enabled: !enEdicion })
  const proyectoId = watch('proyecto_id')
  const manzanaId = watch('manzana_id')
  const numero = watch('numero')

  // Con un solo proyecto activo no hay nada que elegir
  useEffect(() => {
    if (!enEdicion && !proyectoId && u.proyectos.length === 1)
      setValue('proyecto_id', u.proyectos[0].id)
  }, [enEdicion, proyectoId, u.proyectos, setValue])

  if (enEdicion) return <UbicacionSoloLectura vivienda={viviendaActual} />

  const elegir = (campo: 'manzana_id' | 'numero', valor: string) =>
    setValue(campo, valor, { shouldValidate: true, shouldDirty: true })

  const libres = u.numeros.filter(n => !n.ocupado).length

  return (
    <div className='space-y-5'>
      <div>
        <EtiquetaCampo htmlFor='proyecto_id'>Proyecto</EtiquetaCampo>
        <div className={styles.field.inputWrapper}>
          <Building2 className={styles.field.inputIcon} />
          <FormSelect
            {...register('proyecto_id')}
            id='proyecto_id'
            disabled={u.cargandoProyectos}
            className={cn(
              styles.field.select,
              errors.proyecto_id && styles.field.inputError
            )}
          >
            <option value=''>
              {u.cargandoProyectos
                ? 'Cargando proyectos…'
                : 'Selecciona un proyecto'}
            </option>
            {u.proyectos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </FormSelect>
        </div>
        <ErrorCampo mensaje={errors.proyecto_id?.message} />
      </div>

      {proyectoId ? (
        <div>
          <EtiquetaCampo>Manzana</EtiquetaCampo>
          <SelectorManzana
            manzanas={u.manzanas}
            seleccionada={manzanaId}
            onSeleccionar={id => elegir('manzana_id', id)}
            cargando={u.cargandoManzanas}
            error={!!errors.manzana_id}
          />
          <ErrorCampo mensaje={errors.manzana_id?.message} />
        </div>
      ) : null}

      {u.manzana ? (
        <div>
          <EtiquetaCampo
            extra={
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {libres} libre{libres === 1 ? '' : 's'} en la Mz.{' '}
                {u.manzana.nombre}
              </span>
            }
          >
            Número de casa
          </EtiquetaCampo>
          <SelectorNumero
            numeros={u.numeros}
            seleccionado={numero}
            onSeleccionar={n => elegir('numero', n)}
            cargando={u.cargandoNumeros}
            error={!!errors.numero}
          />
          <ErrorCampo mensaje={errors.numero?.message} />
        </div>
      ) : null}
    </div>
  )
}
