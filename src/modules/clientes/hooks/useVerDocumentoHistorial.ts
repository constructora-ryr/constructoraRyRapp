'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

/**
 * Hook para generar URL firmada de un documento de cliente y abrirlo.
 * Extrae la lógica de storage fuera de componentes de historial.
 */
export function useVerDocumentoHistorial() {
  const [cargando, setCargando] = useState<string | null>(null)

  const verDocumento = async (urlStorage: string, id?: string) => {
    const key = id ?? urlStorage
    setCargando(key)
    try {
      const { data, error } = await supabase.storage
        .from('documentos-clientes')
        .createSignedUrl(urlStorage, 3600)

      if (error || !data?.signedUrl) {
        logger.error(
          'Error generando URL firmada para documento historial:',
          error
        )
        toast.error('No se pudo abrir el archivo', {
          description: 'Puede que ya no exista en el almacenamiento.',
        })
        return
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setCargando(null)
    }
  }

  const esCargando = (id: string) => cargando === id

  return { verDocumento, cargando, esCargando }
}
