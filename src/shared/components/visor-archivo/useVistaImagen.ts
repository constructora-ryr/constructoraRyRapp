'use client'

/**
 * Zoom (botones y rueda), rotación y arrastre de una imagen en el visor.
 * Se reinicia cada vez que cambia `clave` (otro archivo).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react'

export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 4
const ZOOM_PASO = 0.25

export function useVistaImagen(clave: string | null, activa: boolean) {
  const [zoom, setZoom] = useState(1)
  const [rotacion, setRotacion] = useState(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [arrastrando, setArrastrando] = useState(false)
  const arrastre = useRef<{ x: number; y: number } | null>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)

  const ajustar = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const cambiarZoom = useCallback((delta: number) => {
    setZoom(z => {
      const nuevo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta))
      if (nuevo <= 1) setOffset({ x: 0, y: 0 })
      return nuevo
    })
  }, [])

  useEffect(() => {
    setRotacion(0)
    ajustar()
  }, [clave, ajustar])

  // Rueda = zoom (listener nativo: el onWheel de React es pasivo y no
  // permite evitar el scroll)
  useEffect(() => {
    const el = contenedorRef.current
    if (!el || !activa) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cambiarZoom(e.deltaY < 0 ? ZOOM_PASO : -ZOOM_PASO)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [activa, cambiarZoom, clave])

  const handlers = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (zoom <= 1) return
      e.currentTarget.setPointerCapture(e.pointerId)
      arrastre.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
      setArrastrando(true)
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (!arrastre.current) return
      setOffset({
        x: e.clientX - arrastre.current.x,
        y: e.clientY - arrastre.current.y,
      })
    },
    onPointerUp: () => {
      arrastre.current = null
      setArrastrando(false)
    },
    onDoubleClick: () => (zoom > 1 ? ajustar() : setZoom(2)),
  }

  return {
    contenedorRef,
    handlers,
    zoom,
    arrastrando,
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotacion}deg)`,
    acercar: () => cambiarZoom(ZOOM_PASO),
    alejar: () => cambiarZoom(-ZOOM_PASO),
    rotar: () => setRotacion(r => (r + 90) % 360),
    ajustar,
  }
}
