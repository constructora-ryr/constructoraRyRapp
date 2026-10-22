'use client'

/**
 * Vista previa de archivos dentro del detalle del historial (comprobantes
 * de abono, documentos del cliente) con el visor compartido: zoom, rotar,
 * abrir en otra pestaña y aviso si el archivo ya no existe.
 */

import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'
import {
  VisorArchivoPreview,
  tipoDeArchivo,
} from '@/shared/components/visor-archivo'

import { Seccion } from './piezas'

/** URL firmada (1 h) de un archivo del bucket de documentos de clientes */
export function useUrlDocumentoCliente(ruta: string | undefined) {
  return useQuery({
    queryKey: ['url-documento-cliente', ruta],
    enabled: !!ruta,
    retry: false,
    // La URL vale 1 hora: se reutiliza un poco menos que eso
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('documentos-clientes')
        .createSignedUrl(ruta as string, 3600)
      if (error || !data?.signedUrl) throw error ?? new Error('Sin URL firmada')
      return data.signedUrl
    },
  })
}

export function VistaArchivo({
  titulo,
  url,
  nombre,
  mime,
  error = false,
}: {
  titulo: string
  /** null mientras se prepara */
  url: string | null
  /** Nombre o ruta del archivo (para saber si es PDF o imagen) */
  nombre?: string | null
  mime?: string | null
  error?: boolean
}) {
  return (
    <Seccion titulo={titulo} sinCaja>
      <div className='flex h-72 flex-col overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 sm:h-96'>
        <VisorArchivoPreview
          url={url}
          tipo={tipoDeArchivo(mime, nombre)}
          titulo={titulo}
          errorUrl={error}
          className='min-h-0 flex-1 md:min-h-0'
        />
      </div>
    </Seccion>
  )
}

/** Documento del cliente: firma la ruta y lo muestra */
export function VistaDocumentoCliente({
  titulo,
  ruta,
  mime,
}: {
  titulo: string
  ruta: string
  mime?: string | null
}) {
  const { data: url, isError } = useUrlDocumentoCliente(ruta)
  return (
    <VistaArchivo
      titulo={titulo}
      url={url ?? null}
      nombre={ruta}
      mime={mime}
      error={isError}
    />
  )
}
