import { useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'

import { formatDateCompact, getTodayDateString } from '@/lib/utils/date.utils'
import { getCreditoByFuente } from '@/modules/fuentes-pago/services/creditos-constructora.service'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

import { useRegistrarAbonoMutation } from '../../hooks/useAbonosQuery'
import {
  eliminarComprobante,
  generarPathComprobante,
  subirComprobante,
} from '../../services/abonos-storage.service'
import {
  getModoRegistro,
  type FuentePagoConAbonos,
  type MetodoPago,
  type ModoRegistro,
} from '../../types'

import { getColorScheme, type ColorScheme } from './ModalRegistroPago.styles'

type FaseLoading = 'idle' | 'subiendo' | 'guardando'

export interface UseModalRegistroPagoProps {
  open: boolean
  negociacionId: string
  fuentesPago: FuentePagoConAbonos[]
  fuenteInicial?: FuentePagoConAbonos
  fechaMinima?: string
  /** Pre-carga el monto y lo bloquea (útil para pago de cuotas de crédito) */
  montoPrecargado?: number
  /** Porción del montoPrecargado que corresponde a mora (para contabilidad) */
  moraIncluida?: number
  onSuccess: (meta?: { fechaAbono?: string }) => void
  onClose: () => void
}

function buildInitialState(
  fuenteInicial: FuentePagoConAbonos,
  fechaMinima?: string,
  montoPrecargado?: number
) {
  const modo: ModoRegistro = getModoRegistro(fuenteInicial)
  const montoInicial =
    modo === 'desembolso'
      ? (fuenteInicial.monto_aprobado ?? 0).toString()
      : montoPrecargado != null
        ? montoPrecargado.toString()
        : ''
  return {
    fuente: fuenteInicial,
    monto: montoInicial,
    fechaAbono: getTodayDateString(),
    metodoPago: 'Transferencia' as MetodoPago,
    referencia: '',
    notas: '',
    comprobante: null as File | null,
    fechaMinima,
  }
}

export function useModalRegistroPago({
  open,
  negociacionId,
  fuentesPago,
  fuenteInicial,
  fechaMinima,
  montoPrecargado,
  moraIncluida: moraIncluidaProp = 0,
  onSuccess,
  onClose,
}: UseModalRegistroPagoProps) {
  const fallbackFuente = fuenteInicial ?? fuentesPago[0]

  const [fuenteSeleccionada, setFuenteSeleccionadaState] =
    useState<FuentePagoConAbonos>(fallbackFuente)
  const [monto, setMonto] = useState('')
  const [fechaAbono, setFechaAbono] = useState(getTodayDateString())
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia')
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [valorCuota, setValorCuota] = useState<number | undefined>()

  useEffect(() => {
    if (!esCreditoConstructora(fuenteSeleccionada?.tipo)) {
      setValorCuota(undefined)
      return
    }
    getCreditoByFuente(fuenteSeleccionada.id).then(({ data }) => {
      setValorCuota(data?.valor_cuota ?? undefined)
    })
  }, [fuenteSeleccionada?.id, fuenteSeleccionada?.tipo])
  const [faseLoading, setFaseLoading] = useState<FaseLoading>('idle')
  const [abonoRegistrado, setAbonoRegistrado] = useState<{
    id: string
    numero_recibo: string
    monto: number
    fecha_abono: string
    metodo_pago: string
    numero_referencia: string | null
    comprobante_url: string | null
    notas: string | null
    fecha_creacion: string
  } | null>(null)

  const cancelledRef = useRef(false)
  // Ref síncrono — previene doble submit antes de que React re-renderice el botón disabled
  const submittingRef = useRef(false)

  // React Query mutation para registrar abono
  const registrarAbonoMutation = useRegistrarAbonoMutation()

  // ── Reset de estado cuando el modal se abre ─────────────────────────────────
  useEffect(() => {
    if (!open) return
    const fuente = fuenteInicial ?? fuentesPago[0]
    const initial = buildInitialState(fuente, fechaMinima, montoPrecargado)
    setFuenteSeleccionadaState(fuente)
    setMonto(initial.monto)
    setFechaAbono(initial.fechaAbono)
    setMetodoPago(initial.metodoPago)
    setReferencia('')
    setNotas('')
    setComprobante(null)
    setErrors({})
    setFaseLoading('idle')
    setAbonoRegistrado(null)
    cancelledRef.current = false
  }, [open, fuenteInicial, fuentesPago, fechaMinima, montoPrecargado])

  // ── Cuando cambia la fuente: recalcular monto y método ─────────────────────
  useEffect(() => {
    const esDesembolso = !fuenteSeleccionada.permite_multiples_abonos
    if (esDesembolso) {
      setMonto((fuenteSeleccionada.monto_aprobado ?? 0).toString())
      // Si el método actual era Efectivo (no válido para desembolso), resetearlo
      setMetodoPago(prev => (prev === 'Efectivo' ? 'Transferencia' : prev))
    } else {
      setMonto(montoPrecargado != null ? montoPrecargado.toString() : '')
    }
    setErrors({})
  }, [fuenteSeleccionada, montoPrecargado])

  // ── Valores derivados ───────────────────────────────────────────────────────
  const modo: ModoRegistro = getModoRegistro(fuenteSeleccionada)
  const esDesembolso = modo === 'desembolso'
  const esCuotaPreCargada = montoPrecargado != null
  const colorScheme: ColorScheme = getColorScheme(fuenteSeleccionada.tipo)
  const saldoPendiente = fuenteSeleccionada.saldo_pendiente ?? 0
  const montoNum = parseFloat(monto.replace(/[^0-9]/g, '')) || 0
  const isSubmitting = faseLoading !== 'idle'

  const metodosDisponibles: MetodoPago[] = esDesembolso
    ? ['Transferencia', 'Cheque']
    : ['Efectivo', 'Transferencia', 'Cheque']

  // ── Cambio de fuente (wrapper) ──────────────────────────────────────────────
  const setFuenteSeleccionada = (fuente: FuentePagoConAbonos) => {
    setFuenteSeleccionadaState(fuente)
  }

  // ── Validación ──────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!esDesembolso && !esCuotaPreCargada) {
      if (!monto || isNaN(montoNum) || montoNum <= 0) {
        newErrors.monto = 'El monto debe ser mayor a cero'
      } else if (montoNum > saldoPendiente) {
        newErrors.monto = 'No puede exceder el saldo pendiente'
      }
    }

    if (!fechaAbono) {
      newErrors.fechaAbono = 'La fecha es obligatoria'
    } else if (fechaMinima && fechaAbono < fechaMinima) {
      newErrors.fechaAbono = `No puede ser anterior al inicio de la negociación (${formatDateCompact(fechaMinima)})`
    } else if (fechaAbono > getTodayDateString()) {
      newErrors.fechaAbono = `No puede ser mayor a hoy (${formatDateCompact(getTodayDateString())})`
    }

    if (!comprobante) {
      newErrors.comprobante = 'El comprobante es obligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit: 2 fases (Storage → BD) ─────────────────────────────────────────
  const handleSubmit = async () => {
    // Guard síncrono — bloquea re-entradas antes de que React re-renderice el botón
    if (submittingRef.current) return
    submittingRef.current = true

    if (!validar()) {
      submittingRef.current = false
      return
    }
    if (!comprobante) {
      submittingRef.current = false
      return
    }

    cancelledRef.current = false

    // Fase 1: subir comprobante a Storage
    setFaseLoading('subiendo')
    const path = generarPathComprobante(
      negociacionId,
      fuenteSeleccionada.id,
      comprobante
    )

    let uploadedPath: string
    try {
      uploadedPath = await subirComprobante(path, comprobante)
    } catch {
      submittingRef.current = false
      setFaseLoading('idle')
      setErrors({
        submit:
          'No se pudo subir el comprobante. Verifica tu conexión e intenta de nuevo.',
      })
      return
    }

    if (cancelledRef.current) {
      await eliminarComprobante(uploadedPath)
      return
    }

    // Fase 2: registrar en BD (via React Query mutation)
    setFaseLoading('guardando')
    try {
      const respuestaJson = await registrarAbonoMutation.mutateAsync({
        negociacion_id: negociacionId,
        fuente_pago_id: fuenteSeleccionada.id,
        monto: esDesembolso
          ? (fuenteSeleccionada.monto_aprobado ?? 0)
          : montoNum,
        mora_incluida: moraIncluidaProp > 0 ? moraIncluidaProp : undefined,
        fecha_abono: fechaAbono,
        metodo_pago: metodoPago,
        numero_referencia: referencia || null,
        notas: notas || null,
        comprobante_path: uploadedPath,
      })

      // Capturar datos del abono registrado para mostrar pantalla de éxito
      if (respuestaJson?.abono) {
        setAbonoRegistrado(respuestaJson.abono as typeof abonoRegistrado)
      }

      // Celebrar cuando la negociación queda completada
      if (respuestaJson?.negociacion_completada) {
        const nombre = respuestaJson.cliente_nombre
        toast.success(
          nombre ? `${nombre} completó el pago` : 'Pago completado',
          {
            description:
              'La negociación fue marcada como Completada y el cliente ascendió a Propietario.',
            duration: 6000,
          }
        )
      }
    } catch {
      submittingRef.current = false
      setFaseLoading('idle')
      setErrors({
        submit:
          'No se pudo guardar el pago. El comprobante puede haber quedado sin registrar — intenta de nuevo.',
      })
      return
    }

    submittingRef.current = false
    setFaseLoading('idle')
    // No llamar onSuccess() aquí — la pantalla de éxito maneja el cierre
  }

  // ── Cierra la pantalla de éxito: refresca datos y cierra modal ────────────
  const handleCloseExito = () => {
    const fechaGuardada = abonoRegistrado?.fecha_abono
    setAbonoRegistrado(null)
    onSuccess({
      fechaAbono: fechaGuardada ? fechaGuardada.slice(0, 10) : undefined,
    })
    onClose()
  }

  // ── Cierre del modal (marca cancelado para rollback si hay upload en curso) ─
  const handleClose = () => {
    cancelledRef.current = true
    onClose()
  }

  return {
    // Estado controlado
    fuenteSeleccionada,
    setFuenteSeleccionada,
    monto,
    setMonto,
    fechaAbono,
    setFechaAbono,
    metodoPago,
    setMetodoPago,
    referencia,
    setReferencia,
    notas,
    setNotas,
    comprobante,
    setComprobante,
    // Derivados
    modo,
    esDesembolso,
    colorScheme,
    metodosDisponibles,
    saldoPendiente,
    montoNum,
    isSubmitting,
    errors,
    // Éxito
    abonoRegistrado,
    // Cuota pre-cargada
    esCuotaPreCargada,
    moraIncluidaProp,
    // Crédito constructora
    valorCuota,
    numeroCuota:
      valorCuota && esCreditoConstructora(fuenteSeleccionada?.tipo)
        ? Math.round((fuenteSeleccionada?.monto_recibido ?? 0) / valorCuota) + 1
        : undefined,
    // Handlers
    handleSubmit,
    handleClose,
    handleCloseExito,
  }
}
