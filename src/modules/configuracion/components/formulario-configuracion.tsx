/**
 * FormularioConfiguracion - Formulario para crear/editar configuración
 * ✅ React Hook Form + Zod
 * ✅ Formato de moneda
 */

'use client'

import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertCircle, DollarSign, FileText, Tag, Type } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { FormSelect } from '@/shared/components/ui/form-select'

import {
  configuracionService,
  type ConfiguracionRecargo,
} from '../services/configuracion.service'

const schema = z.object({
  tipo: z.string().min(1, 'El tipo es obligatorio'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  valor: z.number().min(1, 'El valor debe ser mayor a 0'),
  descripcion: z.string().optional(),
  activo: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  configuracion?: ConfiguracionRecargo | null
  onGuardar: (datos: FormData) => Promise<boolean>
  onCancelar: () => void
}

export function FormularioConfiguracion({
  configuracion,
  onGuardar,
  onCancelar,
}: Props) {
  const esEdicion = !!configuracion

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: '',
      nombre: '',
      valor: 0,
      descripcion: '',
      activo: true,
    },
  })

  // Cargar datos si es edición
  useEffect(() => {
    if (configuracion) {
      reset({
        tipo: configuracion.tipo,
        nombre: configuracion.nombre,
        valor: configuracion.valor,
        descripcion: configuracion.descripcion || '',
        activo: configuracion.activo ?? true,
      })
    }
  }, [configuracion, reset])

  const onSubmit = async (datos: FormData) => {
    const exito = await onGuardar(datos)
    if (exito) {
      reset()
      onCancelar()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const valorActual = watch('valor')
  const tiposDisponibles = configuracionService.getTiposDisponibles()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Tipo */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Tipo <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <Tag className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <FormSelect
            {...register('tipo')}
            disabled={esEdicion}
            className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900/50'
          >
            <option value=''>Selecciona un tipo</option>
            {tiposDisponibles.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </FormSelect>
        </div>
        {errors.tipo && (
          <p className='flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
            <AlertCircle className='h-3 w-3' />
            {errors.tipo.message}
          </p>
        )}
      </div>

      {/* Nombre */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Nombre <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <Type className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            {...register('nombre')}
            type='text'
            placeholder='Ej: Gastos Notariales 2025'
            className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50'
          />
        </div>
        {errors.nombre && (
          <p className='flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
            <AlertCircle className='h-3 w-3' />
            {errors.nombre.message}
          </p>
        )}
      </div>

      {/* Valor */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Valor <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            {...register('valor', { valueAsNumber: true })}
            type='number'
            step='100000'
            min='0'
            placeholder='5000000'
            className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50'
          />
        </div>
        {errors.valor && (
          <p className='flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
            <AlertCircle className='h-3 w-3' />
            {errors.valor.message}
          </p>
        )}
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          Valor formateado: {formatCurrency(valorActual)}
        </p>
      </div>

      {/* Descripción */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Descripción (Opcional)
        </label>
        <div className='relative'>
          <FileText className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
          <textarea
            {...register('descripcion')}
            rows={3}
            placeholder='Descripción del recargo...'
            className='w-full resize-none rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900/50'
          />
        </div>
      </div>

      {/* Activo */}
      <div className='flex items-center gap-3'>
        <input
          {...register('activo')}
          id='activo'
          type='checkbox'
          className='h-5 w-5 rounded border-2 border-gray-300 text-blue-500 transition-colors focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600'
        />
        <label
          htmlFor='activo'
          className='cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300'
        >
          Configuración activa
        </label>
      </div>

      {/* Botones */}
      <div className='flex items-center gap-3 pt-4'>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type='submit'
          disabled={isSubmitting}
          className='flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isSubmitting ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type='button'
          onClick={onCancelar}
          className='rounded-lg bg-gray-200 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        >
          Cancelar
        </motion.button>
      </div>
    </form>
  )
}
