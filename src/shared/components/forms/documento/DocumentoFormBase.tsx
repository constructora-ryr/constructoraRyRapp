'use client'

/**
 * Formulario de subida de documento en secciones numeradas: archivo, datos,
 * categoría y fechas. Las secciones 2–4 aparecen al elegir el archivo.
 * El estado y la validación viven en useDocumentoUpload.
 */

import type { BaseSyntheticEvent, RefObject } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Loader2, UploadCloud } from 'lucide-react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'

import { type ModuleName } from '@/shared/config/module-themes'
import { temaDocumentos } from '@/shared/documentos/config/documentos-tema'
import type { FormatosArchivo } from '@/shared/documentos/config/tipos-archivo'
import type { DocumentoFormData } from '@/shared/documentos/schemas/documento.schema'
import { cn } from '@/shared/utils/helpers'

import { ArchivoSelector } from './ArchivoSelector'
import { CategoriaSelector } from './CategoriaSelector'
import { documentoFormStyles as s } from './documento-form.styles'
import type { CategoriaDocumentoBase } from './documento-form.types'
import { FechasInputs } from './FechasInputs'
import { SeccionFormulario } from './SeccionFormulario'

interface DocumentoFormBaseProps {
  moduleName?: ModuleName

  // Archivo
  archivoSeleccionado: File | null
  errorArchivo: string | null
  isDragging: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  formatos?: FormatosArchivo
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLimpiarArchivo: () => void

  // Datos
  categorias: CategoriaDocumentoBase[]
  isSubmitting: boolean
  /** Motivo por el que la categoría no se puede cambiar */
  categoriaBloqueadaPor?: string

  // React Hook Form
  register: UseFormRegister<DocumentoFormData>
  handleSubmit: (e?: BaseSyntheticEvent) => Promise<void>
  errors: FieldErrors<DocumentoFormData>
  setValue: UseFormSetValue<DocumentoFormData>
  watch: UseFormWatch<DocumentoFormData>

  onCancel?: () => void
}

function MensajeError({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null
  return (
    <p className={s.error}>
      <AlertCircle className='h-3 w-3 flex-shrink-0' />
      {mensaje}
    </p>
  )
}

export function DocumentoFormBase({
  moduleName = 'proyectos',
  archivoSeleccionado,
  errorArchivo,
  isDragging,
  fileInputRef,
  formatos,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onLimpiarArchivo,
  categorias,
  isSubmitting,
  categoriaBloqueadaPor,
  register,
  handleSubmit,
  errors,
  setValue,
  watch,
  onCancel,
}: DocumentoFormBaseProps) {
  const tema = temaDocumentos(moduleName)
  const categoriaId = watch('categoria_id') ?? ''
  const titulo = watch('titulo') ?? ''

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <SeccionFormulario
        numero={1}
        titulo='Archivo'
        descripcion='El documento que vas a subir'
        gradient={tema.gradient}
      >
        <ArchivoSelector
          moduleName={moduleName}
          archivoSeleccionado={archivoSeleccionado}
          errorArchivo={errorArchivo}
          isDragging={isDragging}
          fileInputRef={fileInputRef}
          formatos={formatos}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFileInputChange={onFileInputChange}
          onLimpiarArchivo={onLimpiarArchivo}
        />
      </SeccionFormulario>

      <AnimatePresence initial={false}>
        {archivoSeleccionado ? (
          <motion.div
            key='datos'
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className='space-y-6'
          >
            <SeccionFormulario
              numero={2}
              titulo='Datos del documento'
              descripcion='Así aparecerá en la lista de documentos'
              gradient={tema.gradient}
            >
              <div>
                <label htmlFor='doc-titulo' className={s.etiqueta}>
                  Título <span className='text-rose-500'>*</span>
                  <span className='ml-auto font-normal tabular-nums text-slate-400'>
                    {titulo.length}/200
                  </span>
                </label>
                <input
                  id='doc-titulo'
                  {...register('titulo')}
                  maxLength={200}
                  placeholder='Ej: Promesa de compraventa firmada'
                  className={cn(
                    s.campo,
                    tema.foco,
                    errors.titulo ? s.campoError : s.campoNormal
                  )}
                />
                <MensajeError mensaje={errors.titulo?.message} />
              </div>
              <div>
                <label htmlFor='doc-descripcion' className={s.etiqueta}>
                  Descripción{' '}
                  <span className='font-normal text-slate-400'>(opcional)</span>
                </label>
                <textarea
                  id='doc-descripcion'
                  {...register('descripcion')}
                  rows={2}
                  placeholder='Notas para encontrarlo después: número de radicado, notaría, observaciones…'
                  className={cn(
                    s.campo,
                    'resize-y',
                    tema.foco,
                    errors.descripcion ? s.campoError : s.campoNormal
                  )}
                />
                <MensajeError mensaje={errors.descripcion?.message} />
              </div>
            </SeccionFormulario>

            <SeccionFormulario
              numero={3}
              titulo='Categoría'
              descripcion='Ayuda a filtrar y encontrar el documento'
              gradient={tema.gradient}
            >
              <CategoriaSelector
                categorias={categorias}
                value={categoriaId}
                onChange={value =>
                  setValue('categoria_id', value, { shouldDirty: true })
                }
                bloqueadaPor={categoriaBloqueadaPor}
              />
              <MensajeError mensaje={errors.categoria_id?.message} />
            </SeccionFormulario>

            <SeccionFormulario
              numero={4}
              titulo='Fechas'
              descripcion='Opcional: sirven para avisar cuando un documento vence'
              gradient={tema.gradient}
            >
              <FechasInputs
                register={register}
                watch={watch}
                setValue={setValue}
                errors={errors}
                foco={tema.foco}
              />
            </SeccionFormulario>

            <div className='flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-end'>
              {onCancel ? (
                <button
                  type='button'
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className='h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                >
                  Cancelar
                </button>
              ) : null}
              <button
                type='submit'
                disabled={isSubmitting}
                className={cn(
                  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60',
                  tema.gradient,
                  tema.sombra
                )}
              >
                {isSubmitting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <UploadCloud className='h-4 w-4' />
                )}
                {isSubmitting ? 'Subiendo…' : 'Subir documento'}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </form>
  )
}
