/**
 * Nota manual: contenido con formato y, si tiene, el documento vinculado.
 */

import { useState } from 'react'

import { ExternalLink, FileText, Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import type { DocumentoVinculado } from '@/modules/clientes/types/notas-historial.types'
import { RichTextContent } from '@/shared/components/rich-text/RichTextContent'
import { DocumentosService } from '@/shared/documentos/services/documentos.service'

import { Aviso, Seccion } from './piezas'

function DocumentoVinculadoCard({
  documento,
}: {
  documento: DocumentoVinculado
}) {
  const [abriendo, setAbriendo] = useState(false)

  const abrir = async () => {
    setAbriendo(true)
    try {
      const url = await DocumentosService.obtenerUrlDescarga(
        documento.url_storage,
        'cliente'
      )
      window.open(url, '_blank', 'noopener')
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
      onClick={abrir}
      disabled={abriendo}
      className='flex w-full items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-left transition-colors hover:bg-blue-100 disabled:opacity-60 dark:border-blue-500/30 dark:bg-blue-500/10 dark:hover:bg-blue-500/20'
    >
      {abriendo ? (
        <Loader2 className='h-4 w-4 flex-shrink-0 animate-spin text-blue-600' />
      ) : (
        <FileText className='h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-300' />
      )}
      <span className='min-w-0 flex-1 truncate text-sm font-semibold text-blue-800 dark:text-blue-200'>
        {documento.titulo}
      </span>
      <ExternalLink className='h-3.5 w-3.5 flex-shrink-0 text-blue-500' />
    </button>
  )
}

export function NotaManualRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const documento = evento.metadata?.documentoVinculado as
    | DocumentoVinculado
    | null
    | undefined

  return (
    <div className='space-y-4'>
      {evento.metadata?.esImportante === true ? (
        <Aviso
          icon={Star}
          tono='aviso'
          etiqueta='Nota importante'
          texto='Marcada para destacarse en el historial'
        />
      ) : null}
      <div className='rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700/60 dark:bg-slate-800/60'>
        <RichTextContent
          html={evento.descripcion ?? ''}
          className='text-slate-700 dark:text-slate-200'
        />
      </div>
      {documento ? (
        <Seccion titulo='Documento vinculado' sinCaja>
          <DocumentoVinculadoCard documento={documento} />
        </Seccion>
      ) : null}
    </div>
  )
}
