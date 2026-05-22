'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useAnularAbonoMutation } from '../../hooks/useAbonosQuery'
import {
  MOTIVOS_ANULACION,
  type AbonoHistorial,
  type MotivoAnulacion,
} from '../../types'

const DETALLE_MAX_CHARS = 300

const CELEBRATION_DELAY_MS = 1800

export interface UseModalAnularAbonoProps {
  abono: Omit<
    Pick<AbonoHistorial, 'id' | 'numero_recibo' | 'monto' | 'fecha_abono'>,
    'numero_recibo'
  > & { numero_recibo: string | number }
  /** Callback automático ~2s después de anulación exitosa. Debe cerrar el modal y refrescar datos. */
  onAnulacionExitosa?: () => void
}

export function useModalAnularAbono({
  abono,
  onAnulacionExitosa,
}: UseModalAnularAbonoProps) {
  // ── React Query mutation ───────────────────────────────────────────────────
  const anularAbonoMutation = useAnularAbonoMutation()

  // ── Formulario ─────────────────────────────────────────────────────────────
  const [motivoCategoria, setMotivoCategoria] = useState<MotivoAnulacion | ''>(
    ''
  )
  // El valor del textarea vive en un ref para no re-renderizar en cada tecla.
  // Solo tracking.SÍ/NO-está-vacío (booleano) para habilitar el botón cuando es obligatorio.
  const motivoDetalleRef = useRef('')
  const [detalleEsVacio, setDetalleEsVacio] = useState(true)

  // ── Estado de la operación ─────────────────────────────────────────────────
  const anulando = anularAbonoMutation.isPending
  const [error, setError] = useState<string | null>(null)
  const [exitoso, setExitoso] = useState(false)

  // ── Timer para auto-cierre después de celebración ──────────────────────────
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current)
    }
  }, [])

  // ── Validaciones ───────────────────────────────────────────────────────────
  const detalleObligatorio = motivoCategoria === 'Otro'
  const detalleValido = !detalleObligatorio || !detalleEsVacio
  const formularioValido = motivoCategoria !== '' && detalleValido && !anulando

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMotivoChange = useCallback((valor: MotivoAnulacion | '') => {
    setMotivoCategoria(valor)
    setError(null)
    // Limpiar detalle ref si ya no es necesario
    if (valor !== 'Otro') {
      motivoDetalleRef.current = ''
      setDetalleEsVacio(true)
    }
  }, [])

  // Llamado por el subcomponente memoizado. Solo causa re-render del padre
  // cuando la condición vacío/no-vacío cambia (máximo 2 veces por sesión).
  const handleDetalleChange = useCallback((valor: string) => {
    if (valor.length <= DETALLE_MAX_CHARS) {
      motivoDetalleRef.current = valor
      const esVacio = valor.trim().length === 0
      setDetalleEsVacio(prev => (prev === esVacio ? prev : esVacio))
    }
  }, [])

  const handleConfirmar = useCallback(async () => {
    if (!formularioValido) return
    // motivoCategoria is guaranteed non-empty by formularioValido guard above

    setError(null)

    try {
      await anularAbonoMutation.mutateAsync({
        abono_id: abono.id,
        motivo_categoria: motivoCategoria,
        motivo_detalle: motivoDetalleRef.current.trim() || undefined,
      })

      setExitoso(true)
      // Auto-cerrar después de la celebración
      celebrationTimerRef.current = setTimeout(() => {
        onAnulacionExitosa?.()
      }, CELEBRATION_DELAY_MS)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error desconocido al anular'
      )
    }
  }, [
    formularioValido,
    motivoCategoria,
    abono.id,
    anularAbonoMutation,
    onAnulacionExitosa,
  ])

  return {
    // Estado del formulario
    motivoCategoria,
    detalleObligatorio,
    formularioValido,
    // Estado de la operación
    anulando,
    error,
    exitoso,
    // Constantes
    motivos: MOTIVOS_ANULACION,
    detalleMaxChars: DETALLE_MAX_CHARS,
    // Handlers
    handleMotivoChange,
    handleDetalleChange,
    handleConfirmar,
  }
}
