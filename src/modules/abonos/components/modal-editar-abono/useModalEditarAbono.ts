'use client'

import { useCallback, useMemo, useState } from 'react'

import { formatDateCompact, formatDateForInput } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/shared/utils/format'

import { useEditarAbonoMutation } from '../../hooks/useAbonosQuery'
import {
  generarPathComprobante,
  subirComprobante,
} from '../../services/abonos-storage.service'
import type { MetodoPago } from '../../types'
import type {
  AbonoParaEditar,
  DiffCampo,
  EditarAbonoPayload,
} from '../../types/editar-abono.types'

const METODOS_ABONO: MetodoPago[] = ['Efectivo', 'Transferencia', 'Cheque']

interface UseModalEditarAbonoProps {
  abonoInicial: AbonoParaEditar
  onSuccess: () => void
  onClose: () => void
}

export function useModalEditarAbono({
  abonoInicial,
  onSuccess,
  onClose,
}: UseModalEditarAbonoProps) {
  // React Query mutation
  const editarAbonoMutation = useEditarAbonoMutation()

  // ── Form state (pre-llenado con datos actuales) ──────────────────────────
  const [monto, setMonto] = useState(String(abonoInicial.monto))
  const [fechaAbono, setFechaAbono] = useState(
    formatDateForInput(abonoInicial.fecha_abono)
  )
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(
    abonoInicial.metodo_pago ?? null
  )
  const [referencia, setReferencia] = useState(
    abonoInicial.numero_referencia ?? ''
  )
  const [notas, setNotas] = useState(abonoInicial.notas ?? '')
  const [motivo, setMotivo] = useState('')

  // ── Comprobante ──────────────────────────────────────────────────────────
  const [nuevoComprobante, setNuevoComprobante] = useState<File | null>(null)
  const [eliminarComprobante, setEliminarComprobante] = useState(false)
  const [subiendoComprobante, setSubiendoComprobante] = useState(false)

  // ── Estado de envío ──────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)
  const [fase, setFase] = useState<'editar' | 'confirmar'>('editar')

  // ── Diff: qué campos cambiaron ───────────────────────────────────────────
  const diff = useMemo<DiffCampo[]>(() => {
    const changes: DiffCampo[] = []

    const montoNum = parseFloat(monto.replace(/[^0-9.]/g, ''))
    if (!isNaN(montoNum) && montoNum !== abonoInicial.monto) {
      changes.push({
        campo: 'monto',
        label: 'Monto',
        anterior: formatCurrency(abonoInicial.monto),
        nuevo: formatCurrency(montoNum),
      })
    }

    const fechaOrig = formatDateForInput(abonoInicial.fecha_abono)
    if (fechaAbono && fechaAbono !== fechaOrig) {
      changes.push({
        campo: 'fecha_abono',
        label: 'Fecha del abono',
        anterior: formatDateCompact(abonoInicial.fecha_abono),
        nuevo: formatDateCompact(fechaAbono + 'T12:00:00'),
      })
    }

    const metodoOrig = abonoInicial.metodo_pago ?? null
    if (metodoPago !== metodoOrig) {
      changes.push({
        campo: 'metodo_pago',
        label: 'Método de pago',
        anterior: metodoOrig || 'Sin especificar',
        nuevo: metodoPago || 'Sin especificar',
      })
    }

    const refOrig = abonoInicial.numero_referencia ?? ''
    if (referencia !== refOrig) {
      changes.push({
        campo: 'numero_referencia',
        label: 'Referencia',
        anterior: refOrig || 'Sin referencia',
        nuevo: referencia || 'Sin referencia',
      })
    }

    const notasOrig = abonoInicial.notas ?? ''
    if (notas !== notasOrig) {
      changes.push({
        campo: 'notas',
        label: 'Observaciones',
        anterior: notasOrig || 'Sin observaciones',
        nuevo: notas || 'Sin observaciones',
      })
    }

    if (nuevoComprobante) {
      // Extract basename from the stored path for a readable label
      const nombreExistente =
        abonoInicial.comprobante_url?.split('/').pop()?.split('?')[0] ??
        'Archivo existente'
      changes.push({
        campo: 'comprobante_url',
        label: 'Comprobante',
        anterior: abonoInicial.comprobante_url
          ? nombreExistente
          : 'Sin comprobante',
        nuevo: nuevoComprobante.name,
      })
    } else if (eliminarComprobante && abonoInicial.comprobante_url) {
      const nombreExistente =
        abonoInicial.comprobante_url.split('/').pop()?.split('?')[0] ??
        'Archivo existente'
      changes.push({
        campo: 'comprobante_url',
        label: 'Comprobante',
        anterior: nombreExistente,
        nuevo: 'Eliminado (sin comprobante)',
      })
    }

    return changes
  }, [
    monto,
    fechaAbono,
    metodoPago,
    referencia,
    notas,
    nuevoComprobante,
    eliminarComprobante,
    abonoInicial,
  ])

  const hayCambios = diff.length > 0
  const puedeRevisar = hayCambios && !isSubmitting
  const puedeConfirmar =
    hayCambios && motivo.trim().length >= 5 && !isSubmitting
  const irAConfirmar = () => setFase('confirmar')
  const volverAEditar = () => setFase('editar')

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setError(null)

    if (!hayCambios) {
      setError('No hay cambios para guardar.')
      return
    }

    if (motivo.trim().length < 5) {
      setError('El motivo del cambio es requerido (mínimo 5 caracteres).')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Subir nuevo comprobante si lo hay
      let nuevaUrlComprobante: string | undefined = undefined
      if (nuevoComprobante) {
        setSubiendoComprobante(true)
        try {
          const path = generarPathComprobante(
            abonoInicial.negociacion_id,
            abonoInicial.fuente_pago_id,
            nuevoComprobante
          )
          nuevaUrlComprobante = await subirComprobante(path, nuevoComprobante)
        } catch {
          setError('Error al subir el comprobante. Intenta de nuevo.')
          setIsSubmitting(false)
          setSubiendoComprobante(false)
          return
        }
        setSubiendoComprobante(false)
      }

      // 2. Construir payload con solo los campos que cambian
      const payload: EditarAbonoPayload = {
        abonoId: abonoInicial.id,
        motivo: motivo.trim(),
      }

      const montoNum = parseFloat(monto.replace(/[^0-9.]/g, ''))
      if (!isNaN(montoNum) && montoNum !== abonoInicial.monto) {
        payload.monto = montoNum
      }

      const fechaOrig = formatDateForInput(abonoInicial.fecha_abono)
      if (fechaAbono !== fechaOrig) {
        payload.fecha_abono = fechaAbono
      }

      const metodoOrig = abonoInicial.metodo_pago ?? null
      if (metodoPago !== metodoOrig) {
        payload.metodo_pago = metodoPago
      }

      const refOrig = abonoInicial.numero_referencia ?? ''
      if (referencia !== refOrig) {
        payload.numero_referencia = referencia || null
      }

      const notasOrig = abonoInicial.notas ?? ''
      if (notas !== notasOrig) {
        payload.notas = notas || null
      }

      if (nuevaUrlComprobante !== undefined) {
        payload.comprobante_url = nuevaUrlComprobante
      } else if (eliminarComprobante) {
        payload.eliminar_comprobante = true
      }

      // 3. Llamar al servicio via React Query mutation (el server ya registra el audit_log)
      await editarAbonoMutation.mutateAsync(payload)

      setExito(true)
      onSuccess()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Error inesperado. Intenta de nuevo.'
      )
      setIsSubmitting(false)
    }
  }, [
    hayCambios,
    motivo,
    monto,
    fechaAbono,
    metodoPago,
    referencia,
    notas,
    nuevoComprobante,
    eliminarComprobante,
    abonoInicial,
    editarAbonoMutation,
    onSuccess,
  ])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setFase('editar')
    onClose()
  }, [isSubmitting, onClose])

  return {
    // Form fields
    monto,
    setMonto,
    fechaAbono,
    setFechaAbono,
    metodoPago,
    setMetodoPago,
    metodosDisponibles: METODOS_ABONO,
    referencia,
    setReferencia,
    notas,
    setNotas,
    motivo,
    setMotivo,

    // Comprobante
    nuevoComprobante,
    setNuevoComprobante,
    eliminarComprobante,
    setEliminarComprobante,
    subiendoComprobante,

    // Computed
    diff,
    hayCambios,
    fase,
    puedeRevisar,
    puedeConfirmar,
    irAConfirmar,
    volverAEditar,

    // State
    isSubmitting,
    error,
    exito,

    // Actions
    handleSubmit,
    handleClose,
  }
}
