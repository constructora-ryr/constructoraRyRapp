'use client'

/**
 * ============================================
 * MODAL: Subir Carta de Aprobación
 * ============================================
 *
 * ✅ MODAL PRE-CONFIGURADO COMPACTO
 * Upload especializado para cartas de aprobación de fuentes de pago
 *
 * Features:
 * - Título EDITABLE con sugerencia inteligente
 * - Categoría "Cartas de Aprobación" bloqueada
 * - Metadata para vinculación automática
 * - Diseño COMPACTO sin scroll
 * - Colores del módulo clientes (cyan/azul)
 *
 * @version 2.0.0 - 2025-12-01
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, FileText, Upload, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { useSubirCartaModal } from './useSubirCartaModal'

// ============================================
// TYPES
// ============================================

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

// ============================================
// COMPONENTE
// ============================================

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
    tituloHeader,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleSubmit,
    limpiarArchivo,
  } = useSubirCartaModal({ fuente, clienteId, onClose, onSuccess })

  const formatMoney = (valor: number) => `$${valor.toLocaleString('es-CO')}`

  const modalContent = (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <>
          {/* Backdrop con z-index más alto */}
          <motion.div
            key='backdrop-subir-carta'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm'
          />

          {/* Modal - COMPACTO con z-index superior al backdrop */}
          <div
            key='container-subir-carta'
            className='pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4'
          >
            <motion.div
              key='modal-subir-carta'
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800'
            >
              {/* Header - COMPACTO con colores del módulo clientes (cyan/azul) */}
              <div className='bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                      <FileText className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h2 className='text-lg font-bold text-white'>
                        {tituloHeader}
                      </h2>
                      <p className='text-xs text-cyan-100'>
                        {fuente.tipo}
                        {fuente.entidad && ` • ${fuente.entidad}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={isUploading}
                    className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 transition-colors hover:bg-white/30 disabled:opacity-50'
                  >
                    <X className='h-4 w-4 text-white' />
                  </button>
                </div>
              </div>

              {/* Content - COMPACTO sin scroll */}
              <div className='space-y-3 p-4'>
                {/* Metadata compacta */}
                <div className='grid grid-cols-2 gap-2 rounded-lg border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800 dark:bg-cyan-950/20'>
                  <div>
                    <p className='text-xs font-medium text-cyan-600 dark:text-cyan-400'>
                      Tipo
                    </p>
                    <p className='text-sm font-semibold text-cyan-900 dark:text-cyan-100'>
                      {fuente.tipo}
                    </p>
                  </div>
                  {fuente.entidad && (
                    <div>
                      <p className='text-xs font-medium text-cyan-600 dark:text-cyan-400'>
                        Entidad
                      </p>
                      <p className='text-sm font-semibold text-cyan-900 dark:text-cyan-100'>
                        {fuente.entidad}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className='text-xs font-medium text-cyan-600 dark:text-cyan-400'>
                      Monto
                    </p>
                    <p className='text-sm font-semibold text-cyan-900 dark:text-cyan-100'>
                      {formatMoney(fuente.monto_aprobado)}
                    </p>
                  </div>
                  {fuente.vivienda && (
                    <div>
                      <p className='text-xs font-medium text-cyan-600 dark:text-cyan-400'>
                        Vivienda
                      </p>
                      <p className='text-sm font-semibold text-cyan-900 dark:text-cyan-100'>
                        {fuente.vivienda.manzana}
                        {fuente.vivienda.numero}
                      </p>
                    </div>
                  )}
                </div>

                {/* Categoría (solo lectura) */}
                <div>
                  <label className='mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Categoría
                  </label>
                  <input
                    type='text'
                    value='Cartas de Aprobación'
                    disabled
                    className='w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                  />
                </div>

                {/* Título (EDITABLE con sugerencia inteligente) */}
                <div>
                  <label className='mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Título del documento
                    <span className='ml-1 text-xs font-normal text-gray-500'>
                      (editable)
                    </span>
                  </label>
                  <input
                    type='text'
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder={tituloSugerido}
                    disabled={isUploading}
                    className='w-full rounded-lg border-2 border-cyan-200 bg-white px-3 py-2 text-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-800 dark:bg-gray-900'
                  />
                  {titulo !== tituloSugerido && (
                    <button
                      onClick={() => setTitulo(tituloSugerido)}
                      className='mt-1 text-xs text-cyan-600 hover:underline dark:text-cyan-400'
                    >
                      ← Restaurar sugerencia
                    </button>
                  )}
                </div>

                {/* Zona de upload compacta */}
                <div>
                  <label className='mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Archivo (PDF, JPG, PNG • Max 10MB)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-all ${
                      isDragging
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                        : 'border-gray-300 hover:border-cyan-400 dark:border-gray-700 dark:hover:border-cyan-600'
                    } ${archivo ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : ''}`}
                  >
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='.pdf,.jpg,.jpeg,.png'
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className='hidden'
                    />
                    <div className='p-4 text-center'>
                      {archivo ? (
                        <div className='space-y-2'>
                          <FileText className='mx-auto h-8 w-8 text-green-600 dark:text-green-400' />
                          <div>
                            <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                              {archivo.name}
                            </p>
                            <p className='text-xs text-green-600 dark:text-green-400'>
                              {(archivo.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                window.open(
                                  URL.createObjectURL(archivo),
                                  '_blank'
                                )
                              }}
                              disabled={isUploading}
                              className='rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-600 transition-colors hover:bg-cyan-100 disabled:opacity-50 dark:bg-cyan-950/30 dark:text-cyan-400 dark:hover:bg-cyan-950/50'
                            >
                              Ver
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                limpiarArchivo()
                              }}
                              disabled={isUploading}
                              className='rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50'
                            >
                              Cambiar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Arrastra un archivo o haz clic
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {errorArchivo && (
                    <p className='mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      {errorArchivo}
                    </p>
                  )}
                </div>

                {/* Botones */}
                <div className='flex gap-2 pt-2'>
                  <button
                    onClick={onClose}
                    disabled={isUploading}
                    className='flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!archivo || isUploading || !titulo.trim()}
                    className='flex-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:from-cyan-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {isUploading ? (
                      <span className='flex items-center justify-center gap-2'>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className='h-4 w-4 rounded-full border-2 border-white/30 border-t-white'
                        />
                        Subiendo...
                      </span>
                    ) : (
                      'Subir Documento'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  // Renderizar en portal para evitar problemas de z-index y positioning
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
