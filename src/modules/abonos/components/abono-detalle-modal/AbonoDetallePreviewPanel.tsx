'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  ExternalLink,
  FileText,
  Maximize2,
  Receipt,
  RefreshCw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import NextImage from 'next/image'

import { Tooltip } from '@/shared/components/ui/Tooltip'

import { abonoDetalleStyles as s } from './AbonoDetalleModal.styles'

interface AbonoDetallePreviewPanelProps {
  comprobanteUrl: string | null
  loadingComprobante: boolean
  tieneComprobante: boolean
  esImagen: boolean
  esPDF: boolean
  /** Marca de agua "ANULADO" sobre el documento */
  anulado?: boolean
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 4
const ZOOM_PASO = 0.25

function ContentLoadingState({ label }: { label: string }) {
  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center gap-6'>
      <div className='relative'>
        {/* Rotating ring */}
        <motion.div
          className='absolute inset-0 h-20 w-20 rounded-full border-[3px] border-transparent border-r-violet-500 border-t-fuchsia-400'
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Icon */}
        <motion.div
          className='relative flex h-20 w-20 items-center justify-center'
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 shadow-2xl shadow-violet-500/40'>
            <Receipt className='h-6 w-6 text-white' strokeWidth={2} />
          </div>
        </motion.div>
      </div>
      <motion.p
        className='text-xs font-medium text-violet-300'
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {label}
      </motion.p>
    </div>
  )
}

function BotonHerramienta({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip content={label} side='top' delayDuration={150}>
      <button
        type='button'
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={s.preview.toolBtn}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export function AbonoDetallePreviewPanel({
  comprobanteUrl,
  loadingComprobante,
  tieneComprobante,
  esImagen,
  esPDF,
  anulado = false,
}: AbonoDetallePreviewPanelProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  // Reintentos: cambiar la key fuerza a recargar imagen/iframe
  const [intento, setIntento] = useState(0)

  // Vista de la imagen: zoom, rotación y desplazamiento (arrastrar)
  const [zoom, setZoom] = useState(1)
  const [rotacion, setRotacion] = useState(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const arrastre = useRef<{ x: number; y: number } | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  const ajustar = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  // Reset al cambiar de comprobante (apertura de otro abono)
  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
    setIframeLoading(true)
    setIntento(0)
    setRotacion(0)
    ajustar()
  }, [comprobanteUrl, ajustar])

  const cambiarZoom = useCallback((delta: number) => {
    setZoom(z => {
      const nuevo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta))
      if (nuevo <= 1) setOffset({ x: 0, y: 0 })
      return nuevo
    })
  }, [])

  // Rueda del mouse = zoom (listener nativo: onWheel de React es pasivo y no
  // permite evitar el scroll de la página)
  useEffect(() => {
    const el = contenedorRef.current
    if (!el || !esImagen) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cambiarZoom(e.deltaY < 0 ? ZOOM_PASO : -ZOOM_PASO)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [esImagen, cambiarZoom, comprobanteUrl])

  const reintentar = () => {
    setImageError(false)
    setImageLoading(true)
    setIframeLoading(true)
    setIntento(i => i + 1)
  }

  const abrirEnPestana = () => {
    if (comprobanteUrl) window.open(comprobanteUrl, '_blank', 'noopener')
  }

  const hayDocumento = tieneComprobante && !!comprobanteUrl
  const mostrarHerramientasImagen =
    hayDocumento && esImagen && !imageError && !imageLoading

  return (
    <div className={s.preview.container}>
      {/* Fondo con retícula de puntos */}
      <div aria-hidden className={s.preview.grid} />

      {loadingComprobante ? (
        <ContentLoadingState label='Cargando comprobante...' />
      ) : hayDocumento ? (
        esImagen ? (
          <div
            ref={contenedorRef}
            className={`${s.preview.imgWrapper} ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onPointerDown={e => {
              if (zoom <= 1) return
              e.currentTarget.setPointerCapture(e.pointerId)
              arrastre.current = {
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
              }
              setArrastrando(true)
            }}
            onPointerMove={e => {
              if (!arrastre.current) return
              setOffset({
                x: e.clientX - arrastre.current.x,
                y: e.clientY - arrastre.current.y,
              })
            }}
            onPointerUp={() => {
              arrastre.current = null
              setArrastrando(false)
            }}
            onDoubleClick={() => (zoom > 1 ? ajustar() : setZoom(2))}
          >
            {imageLoading && !imageError ? (
              <ContentLoadingState label='Cargando comprobante de pago...' />
            ) : null}

            {imageError ? null : (
              <div
                className={`absolute inset-0 ${arrastrando ? '' : 'transition-transform duration-150 ease-out'}`}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotacion}deg)`,
                }}
              >
                <NextImage
                  key={`${comprobanteUrl}-${intento}`}
                  src={comprobanteUrl}
                  alt='Comprobante de pago'
                  fill
                  unoptimized
                  draggable={false}
                  className={`select-none object-contain drop-shadow-2xl transition-opacity duration-500 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false)
                    setImageError(true)
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {iframeLoading && esPDF ? (
              <ContentLoadingState label='Cargando comprobante de pago...' />
            ) : null}
            <iframe
              key={`${comprobanteUrl}-${intento}`}
              src={comprobanteUrl}
              className={`${s.preview.iframe} transition-opacity duration-500 ${
                iframeLoading && esPDF ? 'opacity-0' : 'opacity-100'
              }`}
              title='Comprobante de pago'
              onLoad={() => setIframeLoading(false)}
            />
          </>
        )
      ) : (
        <div className={s.preview.placeholder}>
          <div className={s.preview.placeholderIcon}>
            <FileText className='h-8 w-8 text-slate-400' />
          </div>
          <p className={s.preview.placeholderTitle}>Sin comprobante adjunto</p>
          <p className={s.preview.placeholderSub}>
            No se adjuntó comprobante al registrar este abono
          </p>
        </div>
      )}

      {/* Error al cargar */}
      {hayDocumento && imageError ? (
        <div className={s.preview.placeholder}>
          <div className={s.preview.errorIcon}>
            <AlertCircle className='h-8 w-8 text-rose-400' />
          </div>
          <p className={s.preview.placeholderTitle}>
            No se pudo cargar el comprobante
          </p>
          <p className={s.preview.placeholderSub}>
            Puede ser un problema de conexión o que el archivo ya no esté
            disponible.
          </p>
          <div className='mt-2 flex flex-wrap justify-center gap-2'>
            <button
              type='button'
              onClick={reintentar}
              className={s.preview.errorBtnPrimary}
            >
              <RefreshCw className='h-3.5 w-3.5' />
              Reintentar
            </button>
            <button
              type='button'
              onClick={abrirEnPestana}
              className={s.preview.errorBtn}
            >
              <ExternalLink className='h-3.5 w-3.5' />
              Abrir en pestaña nueva
            </button>
          </div>
        </div>
      ) : null}

      {/* Marca de agua de anulado */}
      {anulado && hayDocumento ? (
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden'
        >
          <span className='-rotate-[24deg] select-none rounded-2xl border-[6px] border-rose-500/60 px-10 py-3 text-6xl font-black tracking-[0.3em] text-rose-500/50 sm:text-8xl'>
            ANULADO
          </span>
        </div>
      ) : null}

      {/* Barra de herramientas flotante */}
      {hayDocumento && !imageError ? (
        <div className={s.preview.toolbar}>
          {esImagen ? (
            <>
              <BotonHerramienta
                label='Alejar'
                onClick={() => cambiarZoom(-ZOOM_PASO)}
                disabled={!mostrarHerramientasImagen || zoom <= ZOOM_MIN}
              >
                <ZoomOut className='h-4 w-4' />
              </BotonHerramienta>
              <span className='w-12 text-center text-xs font-semibold tabular-nums text-white/80'>
                {Math.round(zoom * 100)}%
              </span>
              <BotonHerramienta
                label='Acercar'
                onClick={() => cambiarZoom(ZOOM_PASO)}
                disabled={!mostrarHerramientasImagen || zoom >= ZOOM_MAX}
              >
                <ZoomIn className='h-4 w-4' />
              </BotonHerramienta>
              <span className={s.preview.toolSep} />
              <BotonHerramienta
                label='Ajustar a la pantalla'
                onClick={ajustar}
                disabled={!mostrarHerramientasImagen}
              >
                <Maximize2 className='h-4 w-4' />
              </BotonHerramienta>
              <BotonHerramienta
                label='Rotar 90°'
                onClick={() => setRotacion(r => (r + 90) % 360)}
                disabled={!mostrarHerramientasImagen}
              >
                <RotateCw className='h-4 w-4' />
              </BotonHerramienta>
              <span className={s.preview.toolSep} />
            </>
          ) : null}
          <BotonHerramienta
            label='Abrir en pestaña nueva'
            onClick={abrirEnPestana}
          >
            <ExternalLink className='h-4 w-4' />
          </BotonHerramienta>
        </div>
      ) : null}
    </div>
  )
}
