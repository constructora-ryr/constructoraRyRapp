'use client'

/** Barra flotante del visor: navegación, zoom/rotar y abrir aparte */

import type { ReactNode } from 'react'

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { Tooltip } from '@/shared/components/ui/Tooltip'

import { ZOOM_MAX, ZOOM_MIN, type useVistaImagen } from './useVistaImagen'
import type { VisorNavegacion } from './VisorArchivoModal'

function BotonHerramienta({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <Tooltip content={label} side='top' delayDuration={150}>
      <button
        type='button'
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className='flex h-9 w-9 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'
      >
        {children}
      </button>
    </Tooltip>
  )
}

const Separador = () => <span className='mx-1 h-5 w-px bg-white/15' />

interface VisorArchivoHerramientasProps {
  /** Anterior/siguiente (se muestra aunque el archivo no cargue) */
  navegacion?: VisorNavegacion
  /** Mostrar las herramientas del archivo (no si hay error o no hay archivo) */
  herramientas: boolean
  /** Controles de imagen; sin ellos solo queda "Abrir en pestaña nueva" */
  vista?: ReturnType<typeof useVistaImagen>
  /** La imagen terminó de cargar (habilita los controles) */
  lista?: boolean
  onAbrirEnPestana: () => void
}

/**
 * Barra flotante abajo al centro (como el visor de fotos de Windows):
 * navegación + zoom/rotar + abrir aparte. En móvil se ocultan "Ajustar" y
 * el porcentaje (doble toque ajusta) para que quepa en una línea.
 */
export function VisorArchivoHerramientas({
  navegacion,
  herramientas,
  vista,
  lista = false,
  onAbrirEnPestana,
}: VisorArchivoHerramientasProps) {
  const conNavegacion = !!navegacion && navegacion.total > 1
  if (!conNavegacion && !herramientas) return null
  const nombre = navegacion?.nombre ?? 'Elemento'

  return (
    <div className='absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-2xl border border-white/10 bg-slate-900/85 p-1 shadow-2xl backdrop-blur-md'>
      {conNavegacion ? (
        <>
          <BotonHerramienta
            label={`${nombre} anterior (←)`}
            onClick={() => navegacion.onAnterior?.()}
            disabled={!navegacion.onAnterior}
          >
            <ChevronLeft className='h-5 w-5' />
          </BotonHerramienta>
          <span className='min-w-[3.5rem] px-1 text-center text-xs font-semibold tabular-nums text-white'>
            {navegacion.actual} / {navegacion.total}
          </span>
          <BotonHerramienta
            label={`${nombre} siguiente (→)`}
            onClick={() => navegacion.onSiguiente?.()}
            disabled={!navegacion.onSiguiente}
          >
            <ChevronRight className='h-5 w-5' />
          </BotonHerramienta>
          {herramientas ? <Separador /> : null}
        </>
      ) : null}
      {herramientas && vista ? (
        <>
          <BotonHerramienta
            label='Alejar'
            onClick={vista.alejar}
            disabled={!lista || vista.zoom <= ZOOM_MIN}
          >
            <ZoomOut className='h-4 w-4' />
          </BotonHerramienta>
          <span className='hidden w-12 text-center text-xs font-semibold tabular-nums text-white/80 sm:inline'>
            {Math.round(vista.zoom * 100)}%
          </span>
          <BotonHerramienta
            label='Acercar'
            onClick={vista.acercar}
            disabled={!lista || vista.zoom >= ZOOM_MAX}
          >
            <ZoomIn className='h-4 w-4' />
          </BotonHerramienta>
          <Separador />
          <span className='hidden sm:contents'>
            <BotonHerramienta
              label='Ajustar a la pantalla'
              onClick={vista.ajustar}
              disabled={!lista}
            >
              <Maximize2 className='h-4 w-4' />
            </BotonHerramienta>
          </span>
          <BotonHerramienta
            label='Rotar 90°'
            onClick={vista.rotar}
            disabled={!lista}
          >
            <RotateCw className='h-4 w-4' />
          </BotonHerramienta>
          <Separador />
        </>
      ) : null}
      {herramientas ? (
        <BotonHerramienta
          label='Abrir en pestaña nueva'
          onClick={onAbrirEnPestana}
        >
          <ExternalLink className='h-4 w-4' />
        </BotonHerramienta>
      ) : null}
    </div>
  )
}
