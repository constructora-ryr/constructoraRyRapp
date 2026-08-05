'use client'

import { useEffect, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  FileEdit,
  FileText,
  Loader2,
  Paperclip,
  Save,
  Search,
  Star,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { useNotaPorId } from '@/modules/clientes/hooks/useNotaPorId'
import { useNotasHistorial } from '@/modules/clientes/hooks/useNotasHistorial'
import type { DocumentoVinculado } from '@/modules/clientes/types/notas-historial.types'
import { RichTextEditor } from '@/shared/components/rich-text/RichTextEditor'

interface NotaModalProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNombre: string
  notaId?: string | null
}

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
  const [documentoVinculadoId, setDocumentoVinculadoId] = useState<
    string | null
  >(null)
  const [documentoVinculado, setDocumentoVinculado] =
    useState<DocumentoVinculado | null>(null)
  const [pickerAbierto, setPickerAbierto] = useState(false)
  const [busquedaDoc, setBusquedaDoc] = useState('')

  const modoEdicion = !!notaId
  const { crearNota, actualizarNota, isCreando, isActualizando } =
    useNotasHistorial(clienteId)
  const { data: notaData } = useNotaPorId(notaId)

  const { data: documentosCliente = [] } = useQuery({
    queryKey: ['documentos-cliente-picker', clienteId],
    queryFn: async () => {
      const { data } = await supabase
        .from('documentos_cliente')
        .select('id,titulo,nombre_archivo,tipo_mime,url_storage,estado')
        .eq('cliente_id', clienteId)
        .eq('es_version_actual', true)
        .neq('estado', 'eliminado')
        .order('fecha_creacion', { ascending: false })
      return (data || []) as DocumentoVinculado[]
    },
    enabled: isOpen,
    staleTime: 30_000,
  })

  const documentosFiltrados = useMemo(() => {
    if (!busquedaDoc.trim()) return documentosCliente
    const q = busquedaDoc.toLowerCase()
    return documentosCliente.filter(d => d.titulo.toLowerCase().includes(q))
  }, [documentosCliente, busquedaDoc])

  useEffect(() => {
    if (notaData && modoEdicion) {
      setTitulo(notaData.titulo)
      setContenido(notaData.contenido)
      setEsImportante(notaData.es_importante)
      setDocumentoVinculadoId(notaData.documento_vinculado_id)
      setDocumentoVinculado(notaData.documento_vinculado ?? null)
    } else if (!modoEdicion) {
      setTitulo('')
      setContenido('')
      setEsImportante(false)
      setDocumentoVinculadoId(null)
      setDocumentoVinculado(null)
    }
    setPickerAbierto(false)
    setBusquedaDoc('')
  }, [notaData, modoEdicion])

  const handleSeleccionarDocumento = (doc: DocumentoVinculado) => {
    setDocumentoVinculadoId(doc.id)
    setDocumentoVinculado(doc)
    setPickerAbierto(false)
    setBusquedaDoc('')
  }

  const handleQuitarDocumento = () => {
    setDocumentoVinculadoId(null)
    setDocumentoVinculado(null)
  }

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
            documento_vinculado_id: documentoVinculadoId,
          },
        })
      } else {
        result = await crearNota({
          cliente_id: clienteId,
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          es_importante: esImportante,
          documento_vinculado_id: documentoVinculadoId,
        })
      }

      if (result.success) {
        setTitulo('')
        setContenido('')
        setEsImportante(false)
        setDocumentoVinculadoId(null)
        setDocumentoVinculado(null)
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
        <form
          onSubmit={handleSubmit}
          className='max-h-[75vh] space-y-4 overflow-y-auto p-6'
        >
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

          {/* Documento vinculado */}
          <div>
            <label className='mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Documento vinculado{' '}
              <span className='font-normal text-gray-400'>(opcional)</span>
            </label>

            {documentoVinculado ? (
              <div className='flex items-center gap-3 rounded-lg border-2 border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800 dark:bg-indigo-950/30'>
                <FileText className='h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400' />
                <span className='flex-1 truncate text-sm font-medium text-indigo-900 dark:text-indigo-100'>
                  {documentoVinculado.titulo}
                </span>
                <button
                  type='button'
                  onClick={handleQuitarDocumento}
                  className='rounded-md p-1 text-indigo-500 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900'
                  title='Quitar vínculo'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setPickerAbierto(v => !v)}
                  className='flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400'
                >
                  <Paperclip className='h-4 w-4' />
                  Vincular documento del cliente
                </button>

                {pickerAbierto && (
                  <div className='absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800'>
                    <div className='border-b border-gray-100 p-2 dark:border-gray-700'>
                      <div className='flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-600 dark:bg-gray-900'>
                        <Search className='h-3.5 w-3.5 text-gray-400' />
                        <input
                          autoFocus
                          type='text'
                          value={busquedaDoc}
                          onChange={e => setBusquedaDoc(e.target.value)}
                          placeholder='Buscar documento...'
                          className='flex-1 bg-transparent text-xs outline-none'
                        />
                      </div>
                    </div>
                    <div className='max-h-48 overflow-y-auto'>
                      {documentosFiltrados.length === 0 ? (
                        <p className='px-4 py-3 text-xs text-gray-500 dark:text-gray-400'>
                          {documentosCliente.length === 0
                            ? 'Este cliente no tiene documentos'
                            : 'Sin coincidencias'}
                        </p>
                      ) : (
                        documentosFiltrados.map(doc => (
                          <button
                            key={doc.id}
                            type='button'
                            onClick={() => handleSeleccionarDocumento(doc)}
                            className='flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                          >
                            <FileText className='h-4 w-4 shrink-0 text-indigo-500' />
                            <span className='truncate text-gray-800 dark:text-gray-200'>
                              {doc.titulo}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
              Vincula un comprobante o soporte relevante para acceder desde esta
              nota
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
