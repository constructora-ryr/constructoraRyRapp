/**
 * Archivos en el detalle de auditoría: tarjeta compacta (ícono o miniatura,
 * nombre, tamaño, tipo y "Ver archivo") y la URL de cada archivo.
 * El archivo se abre en el visor grande compartido.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { Eye, FileText, Image as ImageIcon } from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { tipoDeArchivo } from '@/shared/components/visor-archivo'
import { cn } from '@/shared/utils/helpers'

import { tamanoLegible } from '../../config/detalle'

export interface ArchivoInfo {
  clave: string
  titulo: string
  /** Bucket de Storage o 'comprobante' (se sirve por la API de abonos) */
  bucket: string
  ruta: string | null
  nombre: string | null
  mime: string | null
  tamano?: unknown
  etiqueta?: string
  tono: 'neutro' | 'anterior' | 'nuevo' | 'eliminado'
}

/** URL para ver el archivo (firmada 1 h, o la ruta de la API de comprobantes) */
export function useUrlArchivo(archivo: ArchivoInfo | null) {
  const comprobante = archivo?.bucket === 'comprobante'
  const firmada = useQuery({
    queryKey: ['auditoria', 'archivo', archivo?.bucket, archivo?.ruta],
    enabled: !!archivo?.ruta && !comprobante,
    retry: false,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(archivo?.bucket as string)
        .createSignedUrl(archivo?.ruta as string, 3600)
      if (error || !data?.signedUrl) throw error ?? new Error('Sin URL')
      return data.signedUrl
    },
  })
  if (!archivo?.ruta) return { url: null, error: false }
  if (comprobante)
    return {
      url: `/api/abonos/comprobante?path=${encodeURIComponent(archivo.ruta)}`,
      error: false,
    }
  return { url: firmada.data ?? null, error: firmada.isError }
}

const TONO: Record<ArchivoInfo['tono'], { borde: string; cinta: string }> = {
  neutro: {
    borde: 'border-slate-200 dark:border-slate-700',
    cinta: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  anterior: {
    borde: 'border-red-200 dark:border-red-500/30',
    cinta: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  },
  nuevo: {
    borde: 'border-emerald-200 dark:border-emerald-500/30',
    cinta:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  eliminado: {
    borde: 'border-red-300 dark:border-red-500/40',
    cinta: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  },
}

export function ArchivoTarjeta({
  archivo,
  onVer,
}: {
  archivo: ArchivoInfo
  onVer: () => void
}) {
  const tipo = tipoDeArchivo(archivo.mime, archivo.nombre ?? archivo.ruta)
  const esImagen = tipo === 'imagen'
  const { url } = useUrlArchivo(esImagen ? archivo : null)
  const peso = tamanoLegible(archivo.tamano)
  const tono = TONO[archivo.tono]

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-white p-3 dark:bg-slate-900',
        tono.borde
      )}
    >
      <span className='flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm'>
        {esImagen && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt='' className='h-full w-full object-cover' />
        ) : esImagen ? (
          <ImageIcon className='h-6 w-6' />
        ) : (
          <FileText className='h-6 w-6' />
        )}
      </span>
      <div className='min-w-0 flex-1'>
        {archivo.etiqueta ? (
          <span
            className={cn(
              'mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              tono.cinta
            )}
          >
            {archivo.etiqueta}
          </span>
        ) : null}
        <p className='line-clamp-2 break-words text-sm font-semibold text-slate-900 dark:text-white'>
          {archivo.nombre ?? archivo.titulo}
        </p>
        <p className='text-xs text-slate-500'>
          {[tipo === 'pdf' ? 'PDF' : esImagen ? 'Imagen' : 'Archivo', peso]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {archivo.ruta ? (
        <button
          type='button'
          onClick={onVer}
          className='inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md'
        >
          <Eye className='h-4 w-4' />
          <span className='hidden sm:inline'>Ver archivo</span>
        </button>
      ) : (
        <span className='text-xs text-slate-400'>Sin archivo</span>
      )}
    </div>
  )
}
