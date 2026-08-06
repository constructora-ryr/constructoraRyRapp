import { useMemo, useState } from 'react'

import {
  useHistorialAbonosQuery,
  useInvalidateNegociacionDetalle,
  useNegociacionesAbonos,
} from '@/modules/abonos/hooks'
import type { FuentePagoConAbonos } from '@/modules/abonos/types'
import { useDocumentosPendientesObligatorios } from '@/modules/clientes/hooks/useDocumentosPendientesObligatorios'
import { filtrarPendientesPorFuente } from '@/modules/clientes/utils/documentos-pendientes.utils'
import { esCreditoConstructora } from '@/shared/constants/fuentes-pago.constants'

/**
 * Hook personalizado para la lógica de negocio del detalle de abonos
 * Maneja: carga de datos, estado del modal, recargas, selección de fuente
 */
export function useAbonosDetalle(clienteId: string) {
  const { negociaciones, isLoading } = useNegociacionesAbonos()
  const invalidateDetalle = useInvalidateNegociacionDetalle()

  // Estado local (UI)
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false)
  const [fuenteSeleccionada, setFuenteSeleccionada] =
    useState<FuentePagoConAbonos | null>(null)

  // Documentos obligatorios pendientes — cache compartido vía React Query
  const { data: pendientesObligatorios = [] } =
    useDocumentosPendientesObligatorios(clienteId)

  // Buscar la negociación del cliente
  const negociacion = useMemo(
    () => negociaciones.find(n => n.cliente.id === clienteId),
    [negociaciones, clienteId]
  )

  // Historial de abonos con React Query (reemplaza useEffect manual)
  const { data: todosLosAbonos = [], isLoading: loadingAbonos } =
    useHistorialAbonosQuery(negociacion?.id ?? null)

  // Solo mostrar abonos activos (excluir anulados del timeline)
  const abonos = useMemo(
    () => todosLosAbonos.filter(a => a.estado === 'Activo'),
    [todosLosAbonos]
  )

  // Función para recargar todos los datos (invalida caché React Query)
  const recargarDatos = () => {
    invalidateDetalle(negociacion?.id)
  }

  // Handler para abrir modal con fuente específica
  const handleRegistrarAbono = (fuente: FuentePagoConAbonos) => {
    setFuenteSeleccionada(fuente)
    setModalAbonoOpen(true)
  }

  // Handler para cerrar modal
  const handleCerrarModal = () => {
    setModalAbonoOpen(false)
    setFuenteSeleccionada(null)
  }

  // Handler para éxito al registrar abono
  const handleAbonoRegistrado = () => {
    recargarDatos()
    handleCerrarModal()
  }

  // Métricas calculadas — campos pre-computados por trigger en BD
  // El trigger capea créditos a capital_para_cierre para que intereses
  // no inflen el progreso por encima del valor de la vivienda.
  const metricas = useMemo(() => {
    if (!negociacion) return null

    const fuentes = negociacion.fuentes_pago || []
    const valorVivienda =
      negociacion.valor_total_pagar ?? negociacion.valor_total ?? 0
    const totalAbonado = negociacion.total_abonado ?? 0
    const porcentajePagado =
      negociacion.porcentaje_pagado ??
      (valorVivienda > 0 ? (totalAbonado / valorVivienda) * 100 : 0)

    // Total comprometido = suma real de lo que el cliente debe pagar (incluye intereses)
    const totalComprometido = fuentes.reduce(
      (sum, f) => sum + (f.monto_aprobado || 0),
      0
    )
    // Solo contar intereses cuando hay un Crédito Directo con la Constructora
    const tieneCreditoConstructora = fuentes.some(f =>
      esCreditoConstructora(f.tipo)
    )
    const interesesTotales = tieneCreditoConstructora
      ? totalComprometido - valorVivienda
      : 0
    const saldoPendienteReal =
      totalComprometido -
      fuentes.reduce((sum, f) => sum + (f.monto_recibido || 0), 0)

    return {
      valorVivienda,
      totalComprometido,
      interesesTotales: interesesTotales > 0 ? interesesTotales : 0,
      totalAbonado,
      saldoPendiente: saldoPendienteReal,
      porcentajePagado,
    }
  }, [negociacion])

  // ✅ Validaciones de fuentes de pago
  const validarFuentePago = useMemo(() => {
    if (!negociacion?.fuentes_pago) return {}

    // Calcular si el cierre financiero está balanceado.
    // Para Crédito con la Constructora usamos capital_para_cierre (sin intereses)
    // porque valor_total_pagar se calcula sobre el capital, no sobre el total
    // de cuotas (capital + intereses). monto_aprobado incluye intereses y
    // causaría un falso descuadre de exactamente el monto de los intereses.
    const valorVivienda =
      negociacion.valor_total_pagar ?? negociacion.valor_total ?? 0
    const totalFuentes = (negociacion.fuentes_pago || []).reduce(
      (sum, f) => sum + (f.capital_para_cierre ?? f.monto_aprobado ?? 0),
      0
    )
    const hayDescuadreFinanciero =
      negociacion.fuentes_pago.length > 0 &&
      Math.abs(totalFuentes - valorVivienda) >= 1

    const validaciones: Record<
      string,
      {
        puedeRegistrarAbono: boolean
        estaCompletamentePagada: boolean
        razonBloqueo?: string
        documentosObligatoriosPendientes: number
        documentosPendientesNombres: string[]
      }
    > = {}

    negociacion.fuentes_pago.forEach(fuente => {
      const saldoPendiente = fuente.saldo_pendiente || 0
      const estaCompletamentePagada = saldoPendiente === 0

      // Función pura: única fuente de verdad del filtro de pendientes por fuente
      const pendientesFuente = filtrarPendientesPorFuente(
        pendientesObligatorios,
        fuente.id,
        fuente.tipo
      )
      const documentosObligatoriosPendientes = pendientesFuente.length
      const documentosPendientesNombres = [...pendientesFuente]
        .sort((a, b) => {
          // Cartas de aprobación/asignación (ESPECIFICO_FUENTE) van primero
          // Boleta de Registro y docs compartidos (COMPARTIDO_CLIENTE) van al final
          if (
            a.alcance === 'ESPECIFICO_FUENTE' &&
            b.alcance !== 'ESPECIFICO_FUENTE'
          )
            return -1
          if (
            a.alcance !== 'ESPECIFICO_FUENTE' &&
            b.alcance === 'ESPECIFICO_FUENTE'
          )
            return 1
          return 0
        })
        .map(d => d.tipo_documento || d.tipo_documento_sistema || '')
        .filter(Boolean)

      // Validar si puede registrar abono
      let puedeRegistrarAbono = true
      let razonBloqueo: string | undefined

      // 0. Descuadre financiero (máxima prioridad — bloqueo global)
      if (hayDescuadreFinanciero) {
        puedeRegistrarAbono = false
        razonBloqueo =
          'Cierre financiero descuadrado — las fuentes de pago no cubren el valor total. Corregir antes de registrar abonos.'
      }
      // 1. Documentos obligatorios pendientes
      else if (documentosObligatoriosPendientes > 0) {
        puedeRegistrarAbono = false
        razonBloqueo = `Tiene ${documentosObligatoriosPendientes} documento${documentosObligatoriosPendientes > 1 ? 's' : ''} obligatorio${documentosObligatoriosPendientes > 1 ? 's' : ''} pendiente${documentosObligatoriosPendientes > 1 ? 's' : ''} de aportar`
      }
      // 2. Fuente completamente pagada
      else if (estaCompletamentePagada) {
        puedeRegistrarAbono = false
        razonBloqueo = 'Fuente de pago completamente pagada'
      }
      // 3. Negociación cancelada o en renuncia
      else if (negociacion.estado === 'Cancelada') {
        puedeRegistrarAbono = false
        razonBloqueo = 'Negociación cancelada'
      } else if (negociacion.estado === 'Renuncia') {
        puedeRegistrarAbono = false
        razonBloqueo = 'Cliente en proceso de renuncia'
      }
      // 4. Negociación completada
      else if (negociacion.estado === 'Completada') {
        puedeRegistrarAbono = false
        razonBloqueo = 'Negociación completada'
      }

      validaciones[fuente.id] = {
        puedeRegistrarAbono,
        estaCompletamentePagada,
        razonBloqueo,
        documentosObligatoriosPendientes,
        documentosPendientesNombres,
      }
    })

    return validaciones
  }, [negociacion, pendientesObligatorios])

  // ✅ Balance global del cierre financiero (para banner en UI)
  const estaBalanceado = useMemo(() => {
    if (!negociacion?.fuentes_pago || negociacion.fuentes_pago.length === 0)
      return true
    const valorVivienda =
      negociacion.valor_total_pagar ?? negociacion.valor_total ?? 0
    const totalFuentes = negociacion.fuentes_pago.reduce(
      (sum, f) => sum + (f.capital_para_cierre ?? f.monto_aprobado ?? 0),
      0
    )
    return totalFuentes >= valorVivienda - 1
  }, [negociacion])

  return {
    // Datos
    negociacion,
    abonos,
    metricas,
    fuenteSeleccionada,

    // Estados de carga
    isLoading,
    loadingAbonos,

    // Estado del modal
    modalAbonoOpen,

    // Validaciones
    validarFuentePago,
    estaBalanceado,

    // Handlers
    handleRegistrarAbono,
    handleCerrarModal,
    handleAbonoRegistrado,
    recargarDatos,
  }
}
