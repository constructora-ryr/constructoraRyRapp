/**
 * NotaModal - Modal para crear/editar notas manuales en el historial
 * Permite agregar contexto adicional al timeline del cliente
 */

'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, FileEdit, Loader2, Save, Star, X } from 'lucide-react'
import { createPortal } from 'react-dom'

import { logger } from '@/lib/utils/logger'
import { useNotaPorId } from '@/modules/clientes/hooks/useNotaPorId'
import { useNotasHistorial } from '@/modules/clientes/hooks/useNotasHistorial'
import { RichTextEditor } from '@/shared/components/rich-text/RichTextEditor'

interface NotaModalProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNombre: string
  notaId?: string | null
}

// Extrae texto plano del HTML para validar longitud mínima
function extractText(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export function NotaModal({
  isOpen,
  onClose,
  clienteId,
  clienteNombre,
  notaId,
}: NotaModalProps) {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [esImportante, setEsImportante] = useState(false)

  const modoEdicion = !!notaId
  const { crearNota, actualizarNota, isCreando, isActualizando } =
    useNotasHistorial(clienteId)
  const { data: notaData } = useNotaPorId(notaId)

  useEffect(() => {
    if (notaData && modoEdicion) {
      setTitulo(notaData.titulo)
      setContenido(notaData.contenido)
      setEsImportante(notaData.es_importante)
    } else if (!modoEdicion) {
      setTitulo('')
      setContenido('')
      setEsImportante(false)
    }
  }, [notaData, modoEdicion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const textoPlano = extractText(contenido)
    if (titulo.trim().length < 3 || textoPlano.length < 10) return

    try {
      let result

      if (modoEdicion && notaId) {
        result = await actualizarNota({
          notaId,
          datos: {
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            es_importante: esImportante,
          },
        })
      } else {
        result = await crearNota({
          cliente_id: clienteId,
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          es_importante: esImportante,
        })
      }

      if (result.success) {
        setTitulo('')
        setContenido('')
        setEsImportante(false)
        onClose()
      }
    } catch (error) {
      logger.error('Error en handleSubmit nota:', error)
    }
  }

  if (!isOpen) return null

  const isLoading = isCreando || isActualizando
  const textoPlano = extractText(contenido)
  const isDisabled =
    isLoading || titulo.trim().length < 3 || textoPlano.length < 10

  return createPortal(
    <div className='fixed inset-0 z-[500] flex items-center justify-center p-4'>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className='relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900'
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
                <FileEdit className='h-5 w-5 text-white' strokeWidth={2.5} />
              </div>
              <div>
                <h3 className='text-lg font-bold text-white'>
                  {modoEdicion ? 'Editar Nota' : 'Agregar Nota al Historial'}
                </h3>
                <p className='text-sm text-purple-100'>
                  Cliente: {clienteNombre}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4 p-6'>
          <div>
            <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Título de la nota *
            </label>
            <input
              type='text'
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder='Ej: Llamada telefónica — Consulta sobre disponibilidad'
              maxLength={200}
              className='w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800'
              required
            />
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {titulo.length}/200 caracteres
            </p>
          </div>

          <div>
            <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Contenido de la nota *
            </label>
            <RichTextEditor
              value={contenido}
              onChange={setContenido}
              placeholder='Describe el evento, conversación o información relevante...'
              minHeight='160px'
            />
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              {textoPlano.length} caracteres (mínimo 10)
            </p>
          </div>

          {/* Marcar como importante */}
          <div className='flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/30'>
            <input
              type='checkbox'
              id='nota-importante'
              checked={esImportante}
              onChange={e => setEsImportante(e.target.checked)}
              className='mt-0.5 h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-2 focus:ring-yellow-500'
            />
            <div className='flex-1'>
              <label
                htmlFor='nota-importante'
                className='flex cursor-pointer items-center gap-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100'
              >
                <Star className='h-4 w-4' />
                Marcar como importante
              </label>
              <p className='mt-0.5 text-xs text-yellow-700 dark:text-yellow-300'>
                Las notas importantes se destacarán en el historial
              </p>
            </div>
          </div>

          {/* Info */}
          <div className='flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
            <p className='text-xs text-blue-800 dark:text-blue-200'>
              Esta nota quedará registrada en el historial del cliente. Solo tú
              o un administrador podrán editarla o eliminarla.
            </p>
          </div>

          {/* Botones */}
          <div className='flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800'
            >
              Cancelar
            </button>
            <motion.button
              type='submit'
              disabled={isDisabled}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {modoEdicion ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <Save className='h-4 w-4' />
                  {modoEdicion ? 'Actualizar Nota' : 'Guardar Nota'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}
