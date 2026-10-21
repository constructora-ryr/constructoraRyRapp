'use client'

/**
 * Formulario de crear/editar categoría: vista previa en vivo, nombre,
 * descripción, color (paleta) e ícono (por grupos). Validación con zod.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { Tooltip } from '@/shared/components/ui/Tooltip'
import { type ModuleName } from '@/shared/config/module-themes'
import { cn } from '@/shared/utils/helpers'

import { ICONOS_CATEGORIA } from '../../config/categoria-iconos'
import { temaDocumentos } from '../../config/documentos-tema'
import {
  categoriaFormSchema,
  type CategoriaFormData,
} from '../../schemas/documento.schema'
import {
  COLORES_CATEGORIA,
  type CategoriaDocumento,
} from '../../types/documento.types'
import { colorCategoria } from '../../utils/categoria-color'
import { CategoriaIcon } from '../shared/categoria-icon'

interface CategoriaFormProps {
  /** Para edición */
  categoria?: CategoriaDocumento
  moduleName?: ModuleName
  onSubmit: (data: CategoriaFormData) => Promise<void>
  onCancel: () => void
}

type CategoriaFormEntrada = z.input<typeof categoriaFormSchema>

const etiqueta =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
const campo =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white'

export function CategoriaForm({
  categoria,
  moduleName,
  onSubmit,
  onCancel,
}: CategoriaFormProps) {
  const tema = temaDocumentos(moduleName)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaFormEntrada, unknown, CategoriaFormData>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
      color: categoria?.color ?? 'blue',
      icono: categoria?.icono ?? 'Folder',
    },
  })

  const nombre = watch('nombre')
  const descripcion = watch('descripcion')
  const color = watch('color') ?? 'blue'
  const icono = watch('icono') ?? 'Folder'
  const hex = colorCategoria(color)

  // Color propio de una categoría del sistema (hex fuera de la paleta)
  const colorPropio =
    categoria && !COLORES_CATEGORIA.some(c => c.value === categoria.color)
      ? categoria.color
      : null

  const elegir = (campoNombre: 'color' | 'icono', valor: string) =>
    setValue(campoNombre, valor, { shouldDirty: true })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      {/* Vista previa */}
      <div
        className='flex items-center gap-3 rounded-2xl border p-4'
        style={{ borderColor: `${hex}40`, backgroundColor: `${hex}0f` }}
      >
        <span
          className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl'
          style={{ backgroundColor: `${hex}26` }}
        >
          <CategoriaIcon icono={icono} color={hex} size={24} />
        </span>
        <div className='min-w-0'>
          <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
            Vista previa
          </p>
          <p className='truncate font-semibold text-slate-900 dark:text-white'>
            {nombre || 'Nueva categoría'}
          </p>
          {descripcion ? (
            <p className='truncate text-xs text-slate-500 dark:text-slate-400'>
              {descripcion}
            </p>
          ) : null}
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div>
          <label htmlFor='cat-nombre' className={etiqueta}>
            Nombre *
          </label>
          <input
            id='cat-nombre'
            {...register('nombre')}
            type='text'
            placeholder='Ej: Licencias y permisos'
            className={cn(campo, tema.foco)}
          />
          {errors.nombre ? (
            <p className='mt-1 text-xs font-medium text-rose-600'>
              {errors.nombre.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor='cat-descripcion' className={etiqueta}>
            Descripción (opcional)
          </label>
          <input
            id='cat-descripcion'
            {...register('descripcion')}
            type='text'
            placeholder='Qué tipo de documentos agrupa'
            className={cn(campo, tema.foco)}
          />
          {errors.descripcion ? (
            <p className='mt-1 text-xs font-medium text-rose-600'>
              {errors.descripcion.message}
            </p>
          ) : null}
        </div>
      </div>

      {/* Color */}
      <fieldset>
        <legend className={etiqueta}>Color</legend>
        <div className='flex flex-wrap gap-2'>
          {[
            ...(colorPropio
              ? [{ value: colorPropio, label: 'Color actual' }]
              : []),
            ...COLORES_CATEGORIA,
          ].map(({ value, label }) => {
            const activo = color === value
            return (
              <Tooltip key={value} content={label} side='top'>
                <button
                  type='button'
                  onClick={() => elegir('color', value)}
                  aria-label={label}
                  aria-pressed={activo}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-110',
                    activo &&
                      'ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-slate-800'
                  )}
                  style={{ backgroundColor: colorCategoria(value) }}
                >
                  {activo ? <Check className='h-4 w-4' /> : null}
                </button>
              </Tooltip>
            )
          })}
        </div>
      </fieldset>

      {/* Ícono */}
      <fieldset>
        <legend className={etiqueta}>Ícono</legend>
        <div className='max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-700/60 dark:bg-slate-900/40'>
          {ICONOS_CATEGORIA.map(({ grupo, iconos }) => (
            <div key={grupo}>
              <p className='mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
                {grupo}
              </p>
              <div className='grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-10'>
                {iconos.map(({ icono: nombreIcono, label }) => {
                  const activo = icono === nombreIcono
                  return (
                    <Tooltip key={nombreIcono} content={label} side='top'>
                      <button
                        type='button'
                        onClick={() => elegir('icono', nombreIcono)}
                        aria-label={label}
                        aria-pressed={activo}
                        className={cn(
                          'flex aspect-square items-center justify-center rounded-xl transition-all',
                          activo
                            ? 'bg-white shadow-md ring-2 dark:bg-slate-800'
                            : 'text-slate-500 hover:bg-white hover:shadow-sm dark:text-slate-400 dark:hover:bg-slate-800'
                        )}
                        style={
                          activo
                            ? { ['--tw-ring-color' as string]: hex }
                            : undefined
                        }
                      >
                        <CategoriaIcon
                          icono={nombreIcono}
                          color={activo ? hex : undefined}
                          size={20}
                        />
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className='flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:justify-end'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isSubmitting}
          className='h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className={cn(
            'inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r px-5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60',
            tema.gradient,
            tema.sombra
          )}
        >
          {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
          {isSubmitting
            ? 'Guardando…'
            : categoria
              ? 'Guardar cambios'
              : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}
