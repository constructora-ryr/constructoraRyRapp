'use client'

import { useState } from 'react'

import { ExternalLink, FileText, Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import type { DocumentoVinculado } from '@/modules/clientes/types/notas-historial.types'
import { RichTextContent } from '@/shared/components/rich-text/RichTextContent'
import { DocumentosService } from '@/shared/documentos/services/documentos.service'

function DocumentoVinculadoCard({
  documento,
}: {
  documento: DocumentoVinculado
}) {
  const [abriendo, setAbriendo] = useState(false)

  const handleAbrir = async () => {
    setAbriendo(true)
    try {
      const url = await DocumentosService.obtenerUrlDescarga(
        documento.url_storage,
        'cliente'
      )
      window.open(url, '_blank')
    } catch (error) {
      logger.error('Error al abrir documento vinculado:', error)
      toast.error('No se pudo abrir el documento')
    } finally {
      setAbriendo(false)
    }
  }

  return (
    <button
      type='button'
      onClick={handleAbrir}
      disabled={abriendo}
      className='group flex w-full items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-100 disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-950/30 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50'
    >
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/50'>
        {abriendo ? (
          <Loader2 className='h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400' />
        ) : (
          <FileText className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-indigo-900 dark:text-indigo-100'>
          {documento.titulo}
        </p>
        <p className='text-xs text-indigo-500 dark:text-indigo-400'>
          {abriendo ? 'Abriendo...' : 'Ver documento'}
        </p>
      </div>
      <ExternalLink className='h-4 w-4 shrink-0 text-indigo-400 transition-colors group-hover:text-indigo-600 dark:text-indigo-600 dark:group-hover:text-indigo-400' />
    </button>
  )
}

export function NotaManualRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const esImportante = evento.metadata?.esImportante === true
  const contenido = evento.descripcion ?? ''
  const documentoVinculado = evento.metadata?.documentoVinculado as
    | DocumentoVinculado
    | null
    | undefined

  return (
    <div className='space-y-3'>
      {esImportante && (
        <div className='flex items-center gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 dark:border-yellow-800 dark:bg-yellow-950/30'>
          <Star className='h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400' />
          <span className='text-xs font-semibold text-yellow-700 dark:text-yellow-300'>
            Nota importante
          </span>
        </div>
      )}
      <div className='rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
        <RichTextContent
          html={contenido}
          className='text-gray-700 dark:text-gray-300'
        />
      </div>
      {documentoVinculado && (
        <DocumentoVinculadoCard documento={documentoVinculado} />
      )}
    </div>
  )
}
