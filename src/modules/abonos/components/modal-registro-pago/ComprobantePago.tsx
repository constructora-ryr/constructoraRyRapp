'use client'

import { useEffect, useState } from 'react'

import { Eye, FileText, Image as ImageIcon, Upload, X } from 'lucide-react'

import NextImage from 'next/image'

import type { ModoRegistro } from '../../types'

const MIME_ACEPTADOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]
const TAMANO_MAX = 10 * 1024 * 1024 // 10 MB
const INPUT_ID = 'comprobante-pago-input'

interface ComprobantePagoProps {
  modo: ModoRegistro
  archivo: File | null
  onArchivoChange: (archivo: File | null) => void
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ComprobantePago({
  modo,
  archivo,
  onArchivoChange,
  error,
}: ComprobantePagoProps) {
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!archivo || !archivo.type.startsWith('image/')) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(archivo)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  const errorMsg = error || localError || null

  const label =
    modo === 'desembolso'
      ? {
          title: 'Comprobante de desembolso bancario',
          hint: 'Adjunta el comprobante emitido por la entidad (obligatorio)',
        }
      : {
          title: 'Comprobante de pago',
          hint: 'Adjunta el recibo o comprobante (obligatorio)',
        }

  function validarYSeleccionar(file: File) {
    if (!MIME_ACEPTADOS.includes(file.type)) {
      setLocalError('Formato no válido. Usa JPG, PNG, WEBP o PDF.')
      return
    }
    if (file.size > TAMANO_MAX) {
      setLocalError('El archivo supera el límite de 10 MB.')
      return
    }
    setLocalError(null)
    onArchivoChange(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) validarYSeleccionar(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validarYSeleccionar(file)
    e.target.value = ''
  }

  function handleClear(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLocalError(null)
    onArchivoChange(null)
  }

  function handleVerArchivo(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!archivo) return
    const url = URL.createObjectURL(archivo)
    window.open(url, '_blank', 'noopener,noreferrer')
    // Revoke after enough time for the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 15_000)
  }

  const esImagen = archivo ? archivo.type.startsWith('image/') : false
  const esPDF = archivo?.type === 'application/pdf'

  const borderClass = errorMsg
    ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
    : dragOver
      ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
      : archivo
        ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'

  const zonaContenido = (
    <div className='relative'>
      {archivo ? (
        <button
          type='button'
          onClick={handleClear}
          className='absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:hover:bg-red-900/40 dark:hover:text-red-400'
          aria-label='Quitar archivo'
        >
          <X className='h-3.5 w-3.5' />
        </button>
      ) : null}

      <div
        className={`rounded-xl border-2 border-dashed p-4 transition-all duration-200 ${archivo ? '' : 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20'} ${borderClass}`}
      >
        {!archivo ? (
          <div className='flex flex-col items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40'>
              <Upload className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='text-center'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Arrastra el comprobante o{' '}
                <span className='text-blue-600 underline underline-offset-2 dark:text-blue-400'>
                  haz clic para seleccionar
                </span>
              </p>
              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                JPG, PNG, WEBP o PDF · máx 10 MB
              </p>
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-3 pr-8'>
            {esImagen ? (
              previewUrl ? (
                <div className='relative h-12 w-12 flex-shrink-0'>
                  <NextImage
                    unoptimized
                    src={previewUrl}
                    alt='Vista previa del comprobante'
                    fill
                    className='rounded-lg border border-gray-200 object-cover dark:border-gray-700'
                  />
                </div>
              ) : (
                <div className='h-12 w-12 flex-shrink-0 animate-pulse rounded-lg bg-blue-100 dark:bg-blue-900/40' />
              )
            ) : esPDF ? (
              <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40'>
                <FileText className='h-6 w-6 text-red-600 dark:text-red-400' />
              </div>
            ) : (
              <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800'>
                <ImageIcon className='h-6 w-6 text-gray-500' />
              </div>
            )}
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-gray-900 dark:text-white'>
                {archivo.name}
              </p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {formatBytes(archivo.size)}
              </p>
            </div>
            <button
              type='button'
              onClick={handleVerArchivo}
              className='inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
              title='Ver archivo en nueva pestaña'
            >
              <Eye className='h-3.5 w-3.5' />
              Ver
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className='space-y-1.5'>
      <p className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
        {label.title} <span className='text-red-500'>*</span>
      </p>
      <p className='-mt-1 text-xs text-gray-500 dark:text-gray-400'>
        {label.hint}
      </p>

      {/*
        Label htmlFor → abre el file picker nativamente.
        Evita inputRef.click() programático que interfiere con el FocusTrap/DismissableLayer de Radix Dialog.
        Cuando ya hay archivo, usamos div (no necesitamos label ni cursor-pointer).
      */}
      {!archivo ? (
        <label
          htmlFor={INPUT_ID}
          className='block cursor-pointer'
          onDragOver={e => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {zonaContenido}
        </label>
      ) : (
        <div
          onDragOver={e => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {zonaContenido}
        </div>
      )}

      {/* Input real — tabIndex -1 para no interferir con el FocusTrap de Radix */}
      <input
        id={INPUT_ID}
        type='file'
        accept={MIME_ACEPTADOS.join(',')}
        onChange={handleChange}
        tabIndex={-1}
        className='sr-only'
      />

      {errorMsg ? (
        <p className='text-xs text-red-600 dark:text-red-400'>{errorMsg}</p>
      ) : null}
    </div>
  )
}
