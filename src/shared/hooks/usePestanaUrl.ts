'use client'

/**
 * Pestaña activa guardada en la URL (`?tab=historial`): sobrevive a recargar,
 * se puede compartir y otros módulos pueden enlazar directo a una pestaña.
 *
 * El estado local es la fuente de verdad (el clic cambia la pestaña al
 * instante); la URL se actualiza con history.replaceState, sin ir al servidor
 * ni sumar entradas al historial. Si la URL cambia por fuera (atrás, enlace),
 * la pestaña se sincroniza. La pestaña por defecto no se escribe en la URL.
 */

import { useCallback, useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'

const PARAM = 'tab'

function validar<T extends string>(
  valor: string | null | undefined,
  validas: readonly T[],
  porDefecto: T
): T {
  return (validas as readonly string[]).includes(valor ?? '')
    ? (valor as T)
    : porDefecto
}

export function usePestanaUrl<T extends string>(
  validas: readonly T[],
  porDefecto: T
): [T, (pestana: T) => void] {
  const params = useSearchParams()
  const enUrl = validar(params?.get(PARAM), validas, porDefecto)
  const [activa, setActiva] = useState<T>(enUrl)

  // La URL cambió por fuera (atrás/adelante, un enlace a otra pestaña)
  useEffect(() => {
    setActiva(enUrl)
  }, [enUrl])

  const cambiar = useCallback(
    (pestana: T) => {
      setActiva(pestana)
      const url = new URL(window.location.href)
      if (pestana === porDefecto) url.searchParams.delete(PARAM)
      else url.searchParams.set(PARAM, pestana)
      // Estado null: con el estado interno de Next, el router asume que la
      // llamada es suya y no sincroniza useSearchParams
      window.history.replaceState(null, '', url)
    },
    [porDefecto]
  )

  return [activa, cambiar]
}

/** Enlace a una página de detalle abierta en una pestaña concreta */
export function conPestana(href: string, pestana: string): string {
  return `${href}${href.includes('?') ? '&' : '?'}${PARAM}=${encodeURIComponent(pestana)}`
}
