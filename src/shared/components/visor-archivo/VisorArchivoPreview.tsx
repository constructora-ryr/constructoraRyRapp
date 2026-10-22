'use client'

/**
 * Vista previa de un archivo (imagen, PDF u otro) para los visores de la app.
 * - Imagen: zoom, rotación, arrastre y doble clic (useVistaImagen).
 * - PDF: antes de montar el iframe verifica que el archivo exista; si no, el
 *   iframe mostraría el JSON de error de Storage.
 * - Avisos de error / sin archivo / no previsualizable, con Reintentar y
 *   Abrir en pestaña nueva, y marca de agua opcional.
 */

import { useEffect, useState } from 'react'

import {
  AlertCircle,
  Download,
  ExternalLink,
  FileQuestion,
  FileText,
  RefreshCw,
} from 'lucide-react'

import NextImage from 'next/image'

import { cn } from '@/shared/utils/helpers'

import { useVistaImagen } from './useVistaImagen'
import {
  VisorAviso,
  VisorCargando,
  btnAvisoPrimario,
  btnAvisoSecundario,
} from './VisorArchivoEstados'
import { VisorArchivoHerramientas } from './VisorArchivoHerramientas'
import type { VisorNavegacion } from './VisorArchivoModal'

export type TipoArchivo = 'imagen' | 'pdf' | 'otro'

/** Deduce el tipo a partir del mime o del nombre/ruta del archivo */
export function tipoDeArchivo(
  mime?: string | null,
  nombre?: string | null
): TipoArchivo {
  const m = (mime ?? '').toLowerCase()
  const n = (nombre ?? '').toLowerCase()
  if (m.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif)$/.test(n))
    return 'imagen'
  if (m.includes('pdf') || n.endsWith('.pdf')) return 'pdf'
  return 'otro'
}

interface VisorArchivoPreviewProps {
  /** URL firmada o ruta de la API que redirige a ella (null = preparándose) */
  url: string | null
  tipo: TipoArchivo
  titulo: string
  /** No se pudo obtener la URL (p.ej. el archivo no existe en Storage) */
  errorUrl?: boolean
  /** No hay archivo adjunto: aviso neutro en lugar de error */
  sinArchivo?: { titulo: string; descripcion: string }
  /** Texto en diagonal sobre el archivo (p.ej. "ANULADO") */
  marcaAgua?: string
  /** Botón de descarga cuando el archivo no se puede previsualizar */
  onDescargar?: () => void
  /** Degradado del ícono de carga */
  acento?: string
  /** Anterior/siguiente en la barra flotante (el teclado lo maneja la carcasa) */
  navegacion?: VisorNavegacion
  /** Tamaño del contenedor (por defecto llena el cuerpo de un visor) */
  className?: string
}

type Estado = 'cargando' | 'listo' | 'error'

export function VisorArchivoPreview({
  url,
  tipo,
  titulo,
  errorUrl = false,
  sinArchivo,
  marcaAgua,
  onDescargar,
  acento = 'from-slate-600 to-slate-800',
  navegacion,
  className,
}: VisorArchivoPreviewProps) {
  const [estado, setEstado] = useState<Estado>('cargando')
  // Cambiar la key fuerza a recargar imagen/iframe
  const [intento, setIntento] = useState(0)
  const vista = useVistaImagen(url, tipo === 'imagen' && estado === 'listo')

  useEffect(() => {
    setEstado('cargando')
    setIntento(0)
  }, [url])

  // PDF: comprobar que exista. Storage responde 400/404 si falta; cualquier
  // otra respuesta (o un fallo de red/CORS) deja que el iframe lo intente.
  useEffect(() => {
    if (!url || tipo !== 'pdf') return
    let cancelado = false
    fetch(url, { method: 'HEAD' })
      .then(r => {
        if (!cancelado)
          setEstado(r.status === 400 || r.status === 404 ? 'error' : 'listo')
      })
      .catch(() => {
        if (!cancelado) setEstado('listo')
      })
    return () => {
      cancelado = true
    }
  }, [url, tipo, intento])

  const reintentar = () => {
    setEstado('cargando')
    setIntento(i => i + 1)
  }
  const abrirEnPestana = () => {
    if (url) window.open(url, '_blank', 'noopener')
  }

  const conError = errorUrl || estado === 'error'
  const mostrarArchivo = !!url && !sinArchivo && !conError

  const botonAbrir = url ? (
    <button
      type='button'
      onClick={abrirEnPestana}
      className={btnAvisoSecundario}
    >
      <ExternalLink className='h-3.5 w-3.5' />
      Abrir en pestaña nueva
    </button>
  ) : null

  const contenido = () => {
    if (sinArchivo)
      return (
        <VisorAviso
          icon={FileText}
          tono='neutro'
          titulo={sinArchivo.titulo}
          descripcion={sinArchivo.descripcion}
        />
      )
    if (conError)
      return (
        <VisorAviso
          icon={AlertCircle}
          tono='error'
          titulo='No se pudo cargar el archivo'
          descripcion='Puede ser un problema de conexión o que el archivo ya no esté disponible en el almacenamiento.'
        >
          {url ? (
            <button
              type='button'
              onClick={reintentar}
              className={btnAvisoPrimario}
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Reintentar
            </button>
          ) : null}
          {botonAbrir}
        </VisorAviso>
      )
    if (tipo === 'otro')
      return (
        <VisorAviso
          icon={FileQuestion}
          tono='neutro'
          titulo='Vista previa no disponible'
          descripcion='Este tipo de archivo no se puede mostrar en el navegador. Descárgalo para abrirlo.'
        >
          {onDescargar ? (
            <button
              type='button'
              onClick={onDescargar}
              className={btnAvisoPrimario}
            >
              <Download className='h-3.5 w-3.5' />
              Descargar archivo
            </button>
          ) : null}
          {botonAbrir}
        </VisorAviso>
      )
    if (!url)
      return <VisorCargando label='Preparando el archivo…' acento={acento} />
    if (tipo === 'pdf')
      return estado === 'listo' ? (
        <iframe
          key={`${url}-${intento}`}
          src={url}
          title={titulo}
          className='absolute inset-0 h-full w-full border-0 bg-white'
        />
      ) : (
        <VisorCargando label='Cargando documento…' acento={acento} />
      )
    return (
      <div
        ref={vista.contenedorRef}
        {...vista.handlers}
        className={cn(
          'absolute inset-4 bottom-20 touch-none',
          vista.zoom > 1 && 'cursor-grab active:cursor-grabbing'
        )}
      >
        {estado === 'cargando' ? (
          <VisorCargando label='Cargando imagen…' acento={acento} />
        ) : null}
        <div
          className={cn(
            'absolute inset-0',
            !vista.arrastrando && 'transition-transform duration-150 ease-out'
          )}
          style={{ transform: vista.transform }}
        >
          <NextImage
            key={`${url}-${intento}`}
            src={url}
            alt={titulo}
            fill
            unoptimized
            draggable={false}
            className={cn(
              'select-none object-contain drop-shadow-2xl transition-opacity duration-500',
              estado === 'listo' ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setEstado('listo')}
            onError={() => setEstado('error')}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative min-h-[55vh] flex-shrink-0 overflow-hidden bg-slate-950 md:min-h-0 md:flex-1 md:flex-shrink',
        className
      )}
    >
      {/* Retícula de puntos */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:22px_22px]'
      />

      {contenido()}

      {marcaAgua && mostrarArchivo ? (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden'
        >
          <span className='-rotate-[24deg] select-none rounded-2xl border-[6px] border-rose-500/60 px-10 py-3 text-6xl font-black tracking-[0.3em] text-rose-500/50 sm:text-8xl'>
            {marcaAgua}
          </span>
        </div>
      ) : null}

      <VisorArchivoHerramientas
        navegacion={navegacion}
        herramientas={mostrarArchivo && tipo !== 'otro'}
        vista={tipo === 'imagen' ? vista : undefined}
        lista={estado === 'listo'}
        onAbrirEnPestana={abrirEnPestana}
      />
    </div>
  )
}
