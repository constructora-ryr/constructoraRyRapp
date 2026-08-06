'use client'

import { useCallback, useRef, useState } from 'react'

import { getTodayDateString } from '@/lib/utils/date.utils'

export type MetodoDevolucionExcedente =
  | 'Transferencia bancaria'
  | 'Efectivo'
  | 'Cheque'
  | 'Otro'

export const METODOS_DEVOLUCION: MetodoDevolucionExcedente[] = [
  'Transferencia bancaria',
  'Efectivo',
  'Cheque',
  'Otro',
]

interface UseDevolucionExcedenteProps {
  negociacionId: string
  montoExcedente: number
  onExitosa?: () => void
}

export function useDevolucionExcedente({
  negociacionId,
  montoExcedente,
  onExitosa,
}: UseDevolucionExcedenteProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fecha, setFecha] = useState(getTodayDateString())
  const [metodo, setMetodo] = useState<MetodoDevolucionExcedente>(
    'Transferencia bancaria'
  )
  const [numeroComprobante, setNumeroComprobante] = useState('')
  const [notas, setNotas] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)

  const [procesando, setProcesando] = useState(false)
  const [exitoso, setExitoso] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validaciones
  const fechaError =
    fecha && fecha > getTodayDateString()
      ? 'La fecha no puede ser futura'
      : null

  const formularioValido =
    !!fecha && !fechaError && !!metodo && !!comprobante && !procesando

  const handleComprobanteChange = useCallback((file: File | null) => {
    setComprobante(file)
  }, [])

  const handleConfirmar = useCallback(async () => {
    if (!formularioValido || !comprobante) return
    setError(null)
    setProcesando(true)

    try {
      const formData = new FormData()
      formData.append('negociacion_id', negociacionId)
      formData.append('monto', String(montoExcedente))
      formData.append('fecha', fecha)
      formData.append('metodo', metodo)
      if (numeroComprobante.trim())
        formData.append('numero_comprobante', numeroComprobante.trim())
      if (notas.trim()) formData.append('notas', notas.trim())
      formData.append('comprobante', comprobante)

      const res = await fetch(
        '/api/negociaciones/procesar-devolucion-excedente',
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          (data as { error?: string }).error ??
            'Error al procesar la devolución'
        )
      }

      setExitoso(true)
      setTimeout(() => {
        onExitosa?.()
      }, 2200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setProcesando(false)
    }
  }, [
    formularioValido,
    comprobante,
    negociacionId,
    montoExcedente,
    fecha,
    metodo,
    numeroComprobante,
    notas,
    onExitosa,
  ])

  return {
    // Refs
    fileInputRef,
    // Campos
    fecha,
    setFecha,
    metodo,
    setMetodo,
    numeroComprobante,
    setNumeroComprobante,
    notas,
    setNotas,
    comprobante,
    handleComprobanteChange,
    // Validaciones
    fechaError,
    formularioValido,
    // Estado async
    procesando,
    exitoso,
    error,
    handleConfirmar,
  }
}
