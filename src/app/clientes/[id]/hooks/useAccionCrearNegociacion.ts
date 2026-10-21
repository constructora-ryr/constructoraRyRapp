'use client'

import { useEffect } from 'react'

interface Params {
  listo: boolean
  tieneCedula: boolean
  iniciarAsignacion: () => void
  irADocumentos: () => void
}

/**
 * Atiende `?action=crear-negociacion` (viene de la lista de clientes):
 * si el cliente tiene cédula abre la asignación de vivienda; si no, lleva a
 * Documentos para subirla primero. Limpia el parámetro de la URL.
 */
export function useAccionCrearNegociacion({
  listo,
  tieneCedula,
  iniciarAsignacion,
  irADocumentos,
}: Params) {
  useEffect(() => {
    if (!listo) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('action') !== 'crear-negociacion') return

    window.history.replaceState({}, '', window.location.pathname)
    if (tieneCedula) iniciarAsignacion()
    else irADocumentos()
  }, [listo, tieneCedula, iniciarAsignacion, irADocumentos])
}
