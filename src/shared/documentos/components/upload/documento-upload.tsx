'use client'

/**
 * Subida de un documento a una entidad (cliente, proyecto o vivienda).
 * La lógica vive en useDocumentoUpload; aquí solo se arma la UI.
 */

import { CheckCircle2, Link2 } from 'lucide-react'

import { DocumentoFormBase } from '@/shared/components/forms/documento'
import { type ModuleName } from '@/shared/config/module-themes'

import { useDocumentoUpload } from '../../hooks'
import { type TipoEntidad, obtenerConfiguracionEntidad } from '../../types'

import { CheckboxDocumentoIdentidad } from './CheckboxDocumentoIdentidad'

interface DocumentoUploadProps {
  entidadId: string
  tipoEntidad: TipoEntidad
  /** Carpeta destino */
  carpetaId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
  /** Tema; si no se pasa, se infiere de tipoEntidad */
  moduleName?: ModuleName
  /** Para vincular el documento a un requisito pendiente */
  metadata?: Record<string, unknown> | null
}

export function DocumentoUpload({
  entidadId,
  tipoEntidad,
  carpetaId,
  onSuccess,
  onCancel,
  moduleName,
  metadata,
}: DocumentoUploadProps) {
  const themeModuleName =
    moduleName || obtenerConfiguracionEntidad(tipoEntidad).moduleName

  const {
    formatos,
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,
    esDocumentoIdentidad,
    categoriaIdentidad,
    checkboxDeshabilitado,
    yaExisteDocumentoIdentidad,
    tipoDocumento,
    infoTipoDocumento,
    fileInputRef,
    register,
    handleSubmit,
    errors,
    setValue,
    watch,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    limpiarArchivo,
  } = useDocumentoUpload({
    entidadId,
    tipoEntidad,
    carpetaId,
    metadata,
    onSuccess,
  })

  const autoIdentidad = metadata?.auto_check_identidad === true
  const categoriaBloqueadaPor =
    esDocumentoIdentidad && categoriaIdentidad
      ? 'Asignada por ser documento de identidad'
      : tipoDocumento && infoTipoDocumento?.categoria_sugerida
        ? 'Asignada por el requisito'
        : undefined

  return (
    <div className='space-y-5'>
      {tipoDocumento && infoTipoDocumento ? (
        <div className='flex items-start gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 p-4 dark:border-blue-500/30 dark:from-blue-500/10 dark:via-cyan-500/5 dark:to-indigo-500/10'>
          <span className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-md'>
            <Link2 className='h-5 w-5' />
          </span>
          <div className='min-w-0'>
            <p className='text-sm font-bold text-blue-900 dark:text-blue-100'>
              Se vinculará automáticamente
            </p>
            <p className='text-xs text-blue-800 dark:text-blue-200'>
              Al subirlo quedará cumplido el requisito{' '}
              <strong>&quot;{infoTipoDocumento.titulo}&quot;</strong>.
            </p>
          </div>
        </div>
      ) : null}

      {tipoEntidad === 'cliente' &&
      !yaExisteDocumentoIdentidad &&
      !tipoDocumento ? (
        <div>
          <CheckboxDocumentoIdentidad
            checked={esDocumentoIdentidad ?? false}
            onChange={checked => setValue('es_documento_identidad', checked)}
            disabled={checkboxDeshabilitado || autoIdentidad}
          />
          {autoIdentidad && esDocumentoIdentidad ? (
            <p className='mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400'>
              <CheckCircle2 className='h-3.5 w-3.5' />
              Marcado automáticamente como identificación oficial
            </p>
          ) : null}
        </div>
      ) : null}

      <DocumentoFormBase
        moduleName={themeModuleName}
        archivoSeleccionado={archivoSeleccionado}
        errorArchivo={errorArchivo}
        isDragging={isDragging}
        fileInputRef={fileInputRef}
        formatos={formatos}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileInputChange}
        onLimpiarArchivo={limpiarArchivo}
        categorias={categorias}
        isSubmitting={subiendoDocumento}
        categoriaBloqueadaPor={categoriaBloqueadaPor}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        setValue={setValue}
        watch={watch}
        onCancel={onCancel}
      />
    </div>
  )
}
