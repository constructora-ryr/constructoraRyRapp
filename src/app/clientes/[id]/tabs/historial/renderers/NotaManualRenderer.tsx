'use client'

import { Star } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { RichTextContent } from '@/shared/components/rich-text/RichTextContent'

export function NotaManualRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const esImportante = evento.metadata?.esImportante === true
  const contenido = evento.descripcion ?? ''

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
    </div>
  )
}
