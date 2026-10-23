import { useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'

import { formatDateCompact, getTodayDateString } from '@/lib/utils/date.utils'
import { useTiposFuentePagoConfig } from '@/modules/fuentes-pago/hooks'
import { getCreditoByFuente } from '@/modules/fuentes-pago/services/creditos-constructora.service'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

import { useRegistrarAbonoMutation } from '../../hooks/useAbonosQuery'
import {
  eliminarComprobante,
  generarPathComprobante,
  subirComprobante,
} from '../../services/abonos-storage.service'
import { PagoRechazadoError } from '../../services/registrar-abono.service'
import {
  getModoRegistro,
  type FuentePagoConAbonos,
  type MetodoPago,
} from '../../types'

import { getColorSchemeByToken } from './ModalRegistroPago.styles'

type FaseLoading = 'idle' | 'subiendo' | 'guardando'

export interface AbonoRegistrado {
  id: string
  numero_recibo: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  comprobante_url: string | null
  notas: string | null
  fecha_creacion: string
  /** Saldo de la fuente después del pago */
  saldoFuente: number | null
}

export interface UseModalRegistroPagoProps {
  open: boolean
  negociacionId: string
  fuente: FuentePagoConAbonos
  fechaMinima?: string
  /** Admin puede registrar más del saldo: queda como devolución pendiente */
  esAdmin?: boolean
  onSuccess: (meta?: { fechaAbono?: string }) => void
  onClose: () => void
}

const soloDigitos = (v: string) => parseFloat(v.replace(/[^0-9]/g, '')) || 0

export function useModalRegistroPago({
  open,
  negociacionId,
  fuente,
  fechaMinima,
  esAdmin = false,
  onSuccess,
  onClose,
}: UseModalRegistroPagoProps) {
  const { getTipoConfig } = useTiposFuentePagoConfig()

  const modo = getModoRegistro(fuente)
  const esDesembolso = modo === 'desembolso'
  const montoAprobado = fuente.monto_aprobado ?? 0
  const saldoPendiente = fuente.saldo_pendiente ?? 0

  const [monto, setMonto] = useState('')
  const [fechaAbono, setFechaAbono] = useState(getTodayDateString())
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Transferencia')
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [valorCuota, setValorCuota] = useState<number | undefined>()
  const [faseLoading, setFaseLoading] = useState<FaseLoading>('idle')
  const [abonoRegistrado, setAbonoRegistrado] =
    useState<AbonoRegistrado | null>(null)

  const cancelledRef = useRef(false)
  // Ref síncrono: bloquea el doble clic antes de que React deshabilite el botón
  const submittingRef = useRef(false)
  // Solo se reinicia al abrir, no cuando las props cambian con la modal abierta
  const prevOpenRef = useRef(false)

  const registrarAbonoMutation = useRegistrarAbonoMutation()

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    prevOpenRef.current = open
    if (!justOpened) return
    setMonto(esDesembolso ? String(montoAprobado) : '')
    setFechaAbono(getTodayDateString())
    setMetodoPago('Transferencia')
    setReferencia('')
    setNotas('')
    setComprobante(null)
    setErrors({})
    setFaseLoading('idle')
    setAbonoRegistrado(null)
    cancelledRef.current = false
    submittingRef.current = false
  }, [open, esDesembolso, montoAprobado])

  // Crédito con la constructora: valor de la cuota como atajo del monto
  useEffect(() => {
    if (!esCreditoConstructora(fuente.tipo)) {
      setValorCuota(undefined)
      return
    }
    let vigente = true
    getCreditoByFuente(fuente.id).then(({ data }) => {
      if (vigente) setValorCuota(data?.valor_cuota ?? undefined)
    })
    return () => {
      vigente = false
    }
  }, [fuente.id, fuente.tipo])

  // ── Derivados ───────────────────────────────────────────────────────────
  const colorScheme = getColorSchemeByToken(getTipoConfig(fuente.tipo).color)
  const montoNum = esDesembolso ? montoAprobado : soloDigitos(monto)
  const excedente = !esDesembolso ? Math.max(montoNum - saldoPendiente, 0) : 0
  const saldoDespues = Math.max(saldoPendiente - montoNum, 0)
  const isSubmitting = faseLoading !== 'idle'

  const metodosDisponibles: MetodoPago[] = esDesembolso
    ? ['Transferencia', 'Cheque']
    : ['Efectivo', 'Transferencia', 'Cheque']

  // ── Validación ──────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const nuevos: Record<string, string> = {}
    const hoy = getTodayDateString()

    if (!esDesembolso) {
      if (montoNum <= 0) nuevos.monto = 'Escribe el monto recibido'
      else if (excedente > 0 && !esAdmin)
        nuevos.monto = 'No puede superar el saldo pendiente'
    }

    if (!fechaAbono) nuevos.fechaAbono = 'La fecha es obligatoria'
    else if (fechaMinima && fechaAbono < fechaMinima)
      nuevos.fechaAbono = `No puede ser anterior al inicio de la negociación (${formatDateCompact(fechaMinima)})`
    else if (fechaAbono > hoy)
      nuevos.fechaAbono = `No puede ser posterior a hoy (${formatDateCompact(hoy)})`

    if (!comprobante) nuevos.comprobante = 'Adjunta el comprobante del pago'

    setErrors(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const terminarEnvio = () => {
    submittingRef.current = false
    setFaseLoading('idle')
  }

  // ── Envío en 2 fases: comprobante (Storage) → pago (BD) ─────────────────
  const handleSubmit = async () => {
    if (submittingRef.current) return
    submittingRef.current = true

    if (!validar() || !comprobante) {
      submittingRef.current = false
      return
    }
    cancelledRef.current = false

    setFaseLoading('subiendo')
    let uploadedPath: string
    try {
      uploadedPath = await subirComprobante(
        generarPathComprobante(negociacionId, fuente.id, comprobante),
        comprobante
      )
    } catch {
      terminarEnvio()
      setErrors({
        submit:
          'No se pudo subir el comprobante. Revisa tu conexión e intenta de nuevo.',
      })
      return
    }

    // Se cerró la modal mientras subía: no registrar y no dejar el archivo
    if (cancelledRef.current) {
      terminarEnvio()
      await eliminarComprobante(uploadedPath).catch(() => undefined)
      return
    }

    setFaseLoading('guardando')
    try {
      const respuesta = await registrarAbonoMutation.mutateAsync({
        negociacion_id: negociacionId,
        fuente_pago_id: fuente.id,
        monto: montoNum,
        fecha_abono: fechaAbono,
        metodo_pago: metodoPago,
        numero_referencia: referencia.trim() || null,
        notas: notas.trim() || null,
        comprobante_path: uploadedPath,
        es_overpayment: esAdmin && excedente > 0,
      })

      setAbonoRegistrado({
        ...(respuesta.abono as unknown as Omit<AbonoRegistrado, 'saldoFuente'>),
        saldoFuente: respuesta.saldo_fuente ?? null,
      })

      if (respuesta.negociacion_completada) {
        const nombre = respuesta.cliente_nombre
        toast.success(
          nombre ? `${nombre} completó el pago` : 'Pago completado',
          {
            description:
              'La negociación quedó Completada y el cliente pasó a Propietario.',
            duration: 6000,
          }
        )
      }
    } catch (err) {
      // El servidor rechazó el pago: el comprobante subido no se usará
      if (err instanceof PagoRechazadoError) {
        await eliminarComprobante(uploadedPath).catch(() => undefined)
      }
      setErrors({
        submit:
          err instanceof PagoRechazadoError
            ? err.message
            : 'No se pudo confirmar el registro. Revisa el historial de abonos antes de intentar de nuevo.',
      })
    } finally {
      terminarEnvio()
    }
  }

  const handleCloseExito = () => {
    const fechaGuardada = abonoRegistrado?.fecha_abono
    setAbonoRegistrado(null)
    onSuccess({ fechaAbono: fechaGuardada?.slice(0, 10) })
    onClose()
  }

  // Si hay una subida en curso, marca cancelado para borrar el archivo
  const handleClose = () => {
    cancelledRef.current = true
    onClose()
  }

  return {
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
    modo,
    esDesembolso,
    colorScheme,
    metodosDisponibles,
    saldoPendiente,
    montoNum,
    excedente,
    saldoDespues,
    valorCuota,
    faseLoading,
    isSubmitting,
    errors,
    abonoRegistrado,
    handleSubmit,
    handleClose,
    handleCloseExito,
  }
}
