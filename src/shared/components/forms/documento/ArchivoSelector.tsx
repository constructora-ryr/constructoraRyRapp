'use client'

/**
 * Zona para elegir el archivo a subir (arrastrar o clic/toque) y tarjeta del
 * archivo elegido, con miniatura si es imagen. Los formatos y el tamaño
 * máximo vienen del módulo (config/tipos-archivo).
 */

import { useEffect, useState, type RefObject } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, FileText, ImageIcon, UploadCloud, X } from 'lucide-react'

import { type ModuleName } from '@/shared/config/module-themes'
import { temaDocumentos } from '@/shared/documentos/config/documentos-tema'
import {
  formatosArchivo,
  type FormatosArchivo,
} from '@/shared/documentos/config/tipos-archivo'
import {
  formatFileSize,
  getFileExtension,
} from '@/shared/documentos/types/documento.types'
import { cn } from '@/shared/utils/helpers'

interface ArchivoSelectorProps {
  moduleName?: ModuleName
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
}

/** URL local para la miniatura de una imagen (se libera al cambiar) */
function useMiniatura(archivo: File | null) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!archivo?.type.startsWith('image/')) {
      setUrl(null)
      return
    }
    const objeto = URL.createObjectURL(archivo)
    setUrl(objeto)
    return () => URL.revokeObjectURL(objeto)
  }, [archivo])
  return url
}

function ArchivoElegido({
  archivo,
  gradient,
  onQuitar,
}: {
  archivo: File
  gradient: string
  onQuitar: () => void
}) {
  const miniatura = useMiniatura(archivo)
  const Icono = archivo.type.startsWith('image/') ? ImageIcon : FileText

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className='relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60 sm:p-4'
    >
      {miniatura ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob: local de la vista previa
        <img
          src={miniatura}
          alt=''
          className='h-14 w-14 flex-shrink-0 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700'
        />
      ) : (
        <span
          className={cn(
            'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md',
            gradient
          )}
        >
          <Icono className='h-6 w-6' />
        </span>
      )}

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold text-slate-900 dark:text-white'>
          {archivo.name}
        </p>
        <p className='mt-1 flex flex-wrap items-center gap-1.5 text-xs'>
          <span className='rounded-md bg-slate-100 px-1.5 py-0.5 font-bold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300'>
            {getFileExtension(archivo.name)}
          </span>
          <span className='text-slate-500 dark:text-slate-400'>
            {formatFileSize(archivo.size)}
          </span>
          <span className='font-medium text-emerald-700 dark:text-emerald-400'>
            · Listo para subir
          </span>
        </p>
      </div>

      <button
        type='button'
        onClick={onQuitar}
        aria-label='Quitar archivo'
        title='Elegir otro archivo'
        className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-300'
      >
        <X className='h-4 w-4' />
      </button>

      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r',
          gradient
        )}
      />
    </motion.div>
  )
}

export function ArchivoSelector({
  moduleName = 'proyectos',
  archivoSeleccionado,
  errorArchivo,
  isDragging,
  fileInputRef,
  formatos = formatosArchivo('proyecto'),
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onLimpiarArchivo,
}: ArchivoSelectorProps) {
  const tema = temaDocumentos(moduleName)

  if (archivoSeleccionado) {
    return (
      <ArchivoElegido
        archivo={archivoSeleccionado}
        gradient={tema.gradient}
        onQuitar={onLimpiarArchivo}
      />
    )
  }

  const abrir = () => fileInputRef.current?.click()

  return (
    <div className='space-y-2'>
      <div
        role='button'
        tabIndex={0}
        aria-label='Elegir archivo para subir'
        onClick={abrir}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            abrir()
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all focus:outline-none focus-visible:ring-2 sm:py-12',
          tema.foco,
          errorArchivo
            ? 'border-rose-300 bg-rose-50/60 dark:border-rose-500/40 dark:bg-rose-500/5'
            : isDragging
              ? cn('border-transparent ring-2 ring-inset', tema.suave)
              : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:bg-slate-900/30 dark:hover:border-slate-500'
        )}
      >
        <input
          ref={fileInputRef}
          type='file'
          onChange={onFileInputChange}
          className='hidden'
          accept={formatos.accept}
        />

        <motion.span
          animate={isDragging ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-105',
            tema.gradient,
            tema.sombra
          )}
        >
          <UploadCloud className='h-8 w-8' />
        </motion.span>

        <p className='text-base font-bold text-slate-900 dark:text-white'>
          {isDragging ? (
            '¡Suelta el archivo aquí!'
          ) : (
            <>
              <span className='hidden sm:inline'>
                Arrastra un archivo o{' '}
                <span className={tema.texto}>haz clic para elegirlo</span>
              </span>
              <span className='sm:hidden'>
                Toca para <span className={tema.texto}>elegir un archivo</span>
              </span>
            </>
          )}
        </p>
        <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
          Máximo {formatFileSize(formatos.tamanoMaximo)} por archivo
        </p>

        <div className='mt-4 flex flex-wrap justify-center gap-1.5'>
          {formatos.etiquetas.map(etiqueta => (
            <span
              key={etiqueta}
              className='rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
            >
              {etiqueta}
            </span>
          ))}
        </div>
      </div>

      {errorArchivo ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role='alert'
          className='flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
        >
          <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
          {errorArchivo}
        </motion.p>
      ) : null}
    </div>
  )
}
