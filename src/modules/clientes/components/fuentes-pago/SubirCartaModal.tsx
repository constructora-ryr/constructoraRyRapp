'use client'

/**
 * Modal para subir el documento que pide una fuente de pago (carta de
 * aprobación del crédito, carta de asignación de la caja, carta de Mi Casa
 * Ya…). Mismo lenguaje que el aviso de pendientes: ícono con el color de la
 * fuente, resumen de la fuente, título editable y el selector de archivo
 * compartido. La categoría "Cartas de Aprobación" va fija y el documento
 * queda vinculado al requisito por metadata.
 */

import { useEffect } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Link2, Loader2, Lock, RotateCcw, Upload, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { estiloDeFuente } from '@/modules/clientes/components/documentos-pendientes/estilo-fuente'
import { ArchivoSelector } from '@/shared/components/forms/documento/ArchivoSelector'
import type { FormatosArchivo } from '@/shared/documentos/config/tipos-archivo'
import { cn } from '@/shared/utils/helpers'

import { useSubirCartaModal } from './useSubirCartaModal'

export interface DatosFuente {
  id: string
  tipo: string
  entidad?: string
  monto_aprobado: number
  tipo_documento_sistema?: string // ← tipo exacto para vinculación con la vista
  requisito_config_id?: string // ← FK al requisito: la vista lo usa para detectar doc subido
  // Datos para título inteligente
  vivienda?: {
    numero: string
    manzana: string
  }
  cliente?: {
    nombre_completo: string
  }
}

interface SubirCartaModalProps {
  isOpen: boolean
  onClose: () => void
  fuente: DatosFuente
  clienteId: string
  onSuccess?: () => void
}

/** Debe coincidir con la validación de useSubirCartaModal */
const FORMATOS_CARTA: FormatosArchivo = {
  accept: '.pdf,.jpg,.jpeg,.png',
  etiquetas: ['PDF', 'JPG', 'PNG'],
  tamanoMaximo: 10 * 1024 * 1024,
}

const formatMoney = (valor: number) => `$${valor.toLocaleString('es-CO')}`

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className='min-w-0 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-slate-200/80 dark:bg-slate-900/50 dark:ring-slate-700/60'>
      <p className='text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
        {etiqueta}
      </p>
      <p className='break-words text-sm font-semibold text-slate-900 dark:text-white'>
        {valor}
      </p>
    </div>
  )
}

export function SubirCartaModal({
  isOpen,
  onClose,
  fuente,
  clienteId,
  onSuccess,
}: SubirCartaModalProps) {
  const {
    archivo,
    isDragging,
    isUploading,
    errorArchivo,
    titulo,
    setTitulo,
    tituloSugerido,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleSubmit,
    limpiarArchivo,
  } = useSubirCartaModal({ fuente, clienteId, onClose, onSuccess })

  const cerrar = () => {
    if (!isUploading) onClose()
  }

  // Escape cierra (salvo mientras sube)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUploading) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, isUploading, onClose])

  const { icon: IconoFuente, degradado } = estiloDeFuente(fuente.tipo)
  const nombreDocumento = fuente.tipo_documento_sistema || 'Carta de Aprobación'
  const puedeSubir = !!archivo && !isUploading && !!titulo.trim()

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key='backdrop-subir-carta'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrar}
            className='fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm'
          />

          <div className='pointer-events-none fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4'>
            <motion.div
              key='modal-subir-carta'
              role='dialog'
              aria-modal='true'
              aria-labelledby='subir-carta-titulo'
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className='pointer-events-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700/60 sm:rounded-3xl'
            >
              {/* Encabezado */}
              <div className='relative flex items-start gap-3 border-b border-slate-100 px-5 pb-4 pt-5 dark:border-slate-800'>
                <span
                  className={cn(
                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg',
                    degradado
                  )}
                >
                  <IconoFuente className='h-6 w-6' />
                </span>
                <div className='min-w-0 flex-1 pr-8'>
                  <p className='text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
                    Subir documento requerido
                  </p>
                  <h2
                    id='subir-carta-titulo'
                    className='text-base font-bold leading-snug text-slate-900 dark:text-white'
                  >
                    {nombreDocumento}
                  </h2>
                  <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                    {fuente.tipo}
                    {fuente.entidad ? (
                      <span className='font-medium text-slate-700 dark:text-slate-300'>
                        {' '}
                        · {fuente.entidad}
                      </span>
                    ) : null}
                  </p>
                </div>
                <button
                  type='button'
                  onClick={cerrar}
                  disabled={isUploading}
                  aria-label='Cerrar'
                  className='absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                >
                  <X className='h-5 w-5' />
                </button>
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                    degradado
                  )}
                />
              </div>

              {/* Cuerpo */}
              <div className='flex-1 space-y-4 overflow-y-auto px-5 py-4'>
                {/* Resumen de la fuente */}
                <div className='grid grid-cols-2 gap-2'>
                  {fuente.monto_aprobado > 0 ? (
                    <Dato
                      etiqueta='Monto aprobado'
                      valor={formatMoney(fuente.monto_aprobado)}
                    />
                  ) : null}
                  {fuente.vivienda ? (
                    <Dato
                      etiqueta='Vivienda'
                      valor={`${fuente.vivienda.manzana}${fuente.vivienda.numero}`}
                    />
                  ) : null}
                  {fuente.entidad ? (
                    <Dato etiqueta='Entidad' valor={fuente.entidad} />
                  ) : null}
                  <Dato etiqueta='Fuente' valor={fuente.tipo} />
                </div>

                {/* Vinculación automática */}
                <div className='flex items-start gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50/60 p-3 dark:border-cyan-500/30 dark:from-cyan-500/10 dark:to-blue-500/5'>
                  <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'>
                    <Link2 className='h-4 w-4' />
                  </span>
                  <p className='text-xs leading-relaxed text-cyan-900 dark:text-cyan-100'>
                    <strong>Se vinculará automáticamente.</strong> Al subirlo
                    queda cumplido el requisito de esta fuente y desaparece de
                    los pendientes.
                  </p>
                </div>

                {/* Título */}
                <div>
                  <div className='mb-1.5 flex items-center justify-between gap-2'>
                    <label
                      htmlFor='subir-carta-input-titulo'
                      className='text-sm font-semibold text-slate-700 dark:text-slate-300'
                    >
                      Título del documento
                    </label>
                    {titulo !== tituloSugerido ? (
                      <button
                        type='button'
                        onClick={() => setTitulo(tituloSugerido)}
                        className='inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-300'
                      >
                        <RotateCcw className='h-3 w-3' />
                        Restaurar sugerido
                      </button>
                    ) : null}
                  </div>
                  <input
                    id='subir-carta-input-titulo'
                    type='text'
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder={tituloSugerido}
                    disabled={isUploading}
                    className='w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-cyan-900'
                  />
                  <p className='mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400'>
                    <Lock className='h-3 w-3' />
                    Se guarda en la categoría{' '}
                    <strong className='font-semibold text-slate-700 dark:text-slate-300'>
                      Cartas de Aprobación
                    </strong>
                  </p>
                </div>

                {/* Archivo */}
                <ArchivoSelector
                  moduleName='clientes'
                  archivoSeleccionado={archivo}
                  errorArchivo={errorArchivo}
                  isDragging={isDragging}
                  fileInputRef={fileInputRef}
                  formatos={FORMATOS_CARTA}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onFileInputChange={handleFileChange}
                  onLimpiarArchivo={limpiarArchivo}
                />
              </div>

              {/* Acciones */}
              <div className='flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:justify-end'>
                <button
                  type='button'
                  onClick={cerrar}
                  disabled={isUploading}
                  className='rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200/70 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800'
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={!puedeSubir}
                  className='inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
                >
                  {isUploading ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Subiendo…
                    </>
                  ) : (
                    <>
                      <Upload className='h-4 w-4' />
                      Subir documento
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  // Portal para evitar problemas de z-index y posicionamiento
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
