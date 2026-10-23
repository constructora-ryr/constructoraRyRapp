/**
 * ConfirmarCambiosDocumentoModal - Modal para confirmar cambios en documentos
 *
 * ✅ Componente presentacional puro
 * ✅ Diseño tipo diff/comparación profesional
 * ✅ Visualización clara de antes/después
 */

'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  Folder,
  Loader2,
  Pencil,
  X,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'

import type { ResumenCambiosDocumento } from '../../hooks/useDetectarCambiosDocumento'

interface ConfirmarCambiosDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cambios: ResumenCambiosDocumento
  isLoading?: boolean
  nombreCategoria?: string
}

export function ConfirmarCambiosDocumentoModal({
  isOpen,
  onClose,
  onConfirm,
  cambios,
  isLoading = false,
  nombreCategoria,
}: ConfirmarCambiosDocumentoModalProps) {
  if (!isOpen) {
    return null
  }

  const getIconForField = (campo: string) => {
    switch (campo) {
      case 'titulo':
        return <FileText className='h-5 w-5' />
      case 'descripcion':
        return <Pencil className='h-5 w-5' />
      case 'categoria_id':
        return <Folder className='h-5 w-5' />
      case 'fecha_documento':
      case 'fecha_vencimiento':
        return <Calendar className='h-5 w-5' />
      default:
        return <Pencil className='h-5 w-5' />
    }
  }

  const formatValue = (campo: string, valor: string | null) => {
    if (
      !valor ||
      valor === 'Sin fecha' ||
      valor === 'Sin categoría' ||
      valor === 'Sin descripción' ||
      valor === 'Sin vencimiento'
    ) {
      return valor
    }

    // Si es una fecha ISO, formatearla
    if (campo.includes('fecha') && valor.includes('-')) {
      try {
        return formatDateCompact(valor)
      } catch {
        return valor
      }
    }

    // Si es categoría, mostrar nombre legible
    if (campo === 'categoria_id' && nombreCategoria) {
      return nombreCategoria
    }

    return valor
  }

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='absolute inset-0 bg-black/60 backdrop-blur-md'
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />

      {/* Modal - Compacto */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className='relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900'
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Compacto */}
        <div className='relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 px-4 py-3 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800'>
          <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />
          <div className='relative z-10 flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                <AlertTriangle className='h-5 w-5 text-white' />
              </div>
              <div>
                <h3 className='text-base font-bold text-white'>
                  Revisar Cambios
                </h3>
                <p className='flex items-center gap-1.5 text-xs text-green-50'>
                  <CheckCircle2 className='h-3 w-3' />
                  <span>
                    {cambios.totalCambios} modificación
                    {cambios.totalCambios !== 1 ? 'es' : ''} detectada
                    {cambios.totalCambios !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className='rounded-lg p-1.5 text-white/80 transition-all hover:bg-white/20 hover:text-white disabled:opacity-50'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Body con scroll - Compacto */}
        <div className='max-h-[calc(90vh-140px)] overflow-y-auto p-4'>
          <div className='space-y-2.5'>
            {cambios.cambios.map((cambio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className='relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50'
              >
                {/* Header del campo - Compacto */}
                <div className='border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/50'>
                  <div className='flex items-center gap-2'>
                    <div className='text-green-600 dark:text-green-400'>
                      {getIconForField(cambio.campo)}
                    </div>
                    <span className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                      {cambio.label}
                    </span>
                  </div>
                </div>

                {/* Comparación Antes/Después - Compacto y Responsive */}
                <div className='p-3'>
                  <div className='grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr,auto,1fr] md:gap-3'>
                    {/* ANTES */}
                    <div>
                      <div className='mb-1.5 flex items-center gap-1.5'>
                        <div className='h-1.5 w-1.5 rounded-full bg-red-500'></div>
                        <span className='text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400'>
                          Anterior
                        </span>
                      </div>
                      <div className='rounded-md border border-red-200 bg-white p-2.5 dark:border-red-900/50 dark:bg-gray-800'>
                        {formatValue(cambio.campo, cambio.valorAnterior) ===
                        cambio.valorAnterior?.toString() ? (
                          <p className='break-words text-xs text-gray-600 line-through decoration-red-500 dark:text-gray-400'>
                            {cambio.valorAnterior}
                          </p>
                        ) : (
                          <p className='break-words text-xs italic text-gray-500 dark:text-gray-400'>
                            {formatValue(cambio.campo, cambio.valorAnterior)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* FLECHA - Responsive (horizontal en móvil, vertical en desktop) */}
                    <div className='flex items-center justify-center md:flex-col'>
                      <div className='rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-md'>
                        <ArrowRight className='h-4 w-4 text-white md:rotate-0' />
                      </div>
                    </div>

                    {/* DESPUÉS */}
                    <div>
                      <div className='mb-1.5 flex items-center gap-1.5'>
                        <div className='h-1.5 w-1.5 rounded-full bg-green-500'></div>
                        <span className='text-[10px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400'>
                          Nuevo
                        </span>
                      </div>
                      <div className='rounded-md border border-green-200 bg-white p-2.5 dark:border-green-900/50 dark:bg-gray-800'>
                        <p className='break-words text-xs font-semibold text-green-700 dark:text-green-300'>
                          {formatValue(cambio.campo, cambio.valorNuevo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer fijo - Compacto */}
        <div className='sticky bottom-0 border-t border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center'>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              ¿Confirmas estos cambios?
            </p>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={onClose}
                disabled={isLoading}
                className='flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:flex-none'
              >
                Cancelar
              </button>
              <button
                type='button'
                onClick={onConfirm}
                disabled={isLoading}
                className='flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-90 disabled:hover:scale-100 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800 sm:flex-none'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='h-4 w-4' />
                    <span>Confirmar y Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
