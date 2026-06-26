/**
 * ============================================
 * HOOK: useNegociacionesTab
 * ============================================
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES
 * Hook que maneja TODA la lógica del tab de negociaciones.
 * El componente solo renderiza UI.
 *
 * Responsabilidades:
 * - Cargar negociaciones del cliente
 * - Seleccionar negociación activa para ver detalle
 * - Cargar fuentes de pago y abonos de la negociación seleccionada
 * - Escuchar eventos de recarga (cuando se crea nueva negociación)
 * - Calcular totales y estadísticas
 * - Navegación y construcción de URLs
 * - Cálculos de valores con descuento
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { logger } from '@/lib/utils/logger'
import { getShortId } from '@/lib/utils/slug.utils'
import { obtenerFuentesPagoConAbonos } from '@/modules/abonos/services/abonos.service'
import { negociacionesService } from '@/modules/clientes/services/negociaciones.service'
import type { Cliente } from '@/modules/clientes/types'

interface UseNegociacionesTabProps {
  clienteId: string
  cliente: Cliente
}

interface NegociacionDetalle {
  id: string
  estado: string
  valor_negociado: number
  descuento_aplicado: number
  proyecto?: { nombre: string }
  vivienda?: {
    numero: string
    manzanas?: { nombre: string }
  }
  fecha_negociacion: string
  fecha_completada?: string
}

interface FuentePago {
  id: string
  tipo: string
  monto_aprobado: number
  entidad?: string
  numero_referencia?: string
  observaciones?: string
  monto_recibido: number
  abonos?: Abono[]
}

interface Abono {
  id: string
  monto: number
  fecha_abono: string
  comprobante_url?: string
}

export function useNegociacionesTab({
  clienteId,
  cliente,
}: UseNegociacionesTabProps) {
  const router = useRouter()

  // =====================================================
  // ESTADO
  // =====================================================

  const [negociaciones, setNegociaciones] = useState<NegociacionDetalle[]>([])
  const [loading, setLoading] = useState(true)
  const [negociacionActiva, setNegociacionActiva] =
    useState<NegociacionDetalle | null>(null)
  const [fuentesPago, setFuentesPago] = useState<FuentePago[]>([])
  const [abonos, setAbonos] = useState<Abono[]>([])
  const [loadingDatos, setLoadingDatos] = useState(false)

  // =====================================================
  // FUNCIONES
  // =====================================================

  /**
   * Cargar todas las negociaciones del cliente
   */
  const cargarNegociaciones = useCallback(async () => {
    if (!clienteId) return

    setLoading(true)
    try {
      const data =
        await negociacionesService.obtenerNegociacionesCliente(clienteId)
      setNegociaciones(data)
    } catch (err) {
      logger.error(
        '❌ [useNegociacionesTab] Error cargando negociaciones:',
        err
      )
      setNegociaciones([])
    } finally {
      setLoading(false)
    }
  }, [clienteId])

  /**
   * Cargar fuentes de pago y abonos de una negociación específica
   */
  const cargarDatosNegociacion = useCallback(async (negociacionId: string) => {
    setLoadingDatos(true)
    try {
      // Cargar fuentes de pago con abonos
      const fuentesData = await obtenerFuentesPagoConAbonos(negociacionId)
      setFuentesPago(fuentesData)

      // Extraer todos los abonos de todas las fuentes
      const todosAbonos = fuentesData.flatMap(fuente => fuente.abonos || [])
      // Ordenar por fecha descendente
      todosAbonos.sort(
        (a, b) =>
          new Date(b.fecha_abono).getTime() - new Date(a.fecha_abono).getTime()
      )
      setAbonos(todosAbonos)
    } catch (err) {
      logger.error(
        '❌ [useNegociacionesTab] Error cargando datos de negociación:',
        err
      )
      setFuentesPago([])
      setAbonos([])
    } finally {
      setLoadingDatos(false)
    }
  }, [])

  /**
   * Ver detalle de una negociación (carga sus datos asociados)
   */
  const verDetalleNegociacion = useCallback(
    async (negociacion: NegociacionDetalle) => {
      setNegociacionActiva(negociacion)
      await cargarDatosNegociacion(negociacion.id)
    },
    [cargarDatosNegociacion]
  )

  /**
   * Volver a la lista de negociaciones
   */
  const volverALista = useCallback(() => {
    setNegociacionActiva(null)
    setFuentesPago([])
    setAbonos([])
  }, [])

  /**
   * Navegar a crear negociación
   */
  const navegarACrearNegociacion = useCallback(() => {
    const clienteSlug = getShortId(cliente.id)
    const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
    router.push(
      `/clientes/${clienteSlug}/negociaciones/crear?nombre=${encodeURIComponent(nombreCliente)}`
    )
  }, [cliente, router])

  /**
   * Navegar a asignar vivienda (desde FAB)
   */
  const navegarAAsignarVivienda = useCallback(() => {
    const clienteSlug = getShortId(cliente.id)
    const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
    router.push(
      `/clientes/${clienteSlug}/asignar-vivienda?nombre=${encodeURIComponent(nombreCliente)}`
    )
  }, [cliente, router])

  /**
   * Navegar a registrar abono
   */
  const navegarARegistrarAbono = useCallback(
    (negociacionId: string) => {
      const nombreCliente = cliente.nombre_completo || cliente.nombres || ''
      router.push(
        `/abonos?cliente_id=${cliente.id}&negociacion_id=${negociacionId}&cliente_nombre=${encodeURIComponent(nombreCliente)}`
      )
    },
    [cliente, router]
  )

  // =====================================================
  // CÁLCULOS COMPUTADOS
  // =====================================================

  /**
   * Calcular valores de cada negociación (con memoización)
   */
  const negociacionesConValores = useMemo(() => {
    return negociaciones.map(neg => {
      const valorBase = neg.valor_negociado || 0
      const descuento = neg.descuento_aplicado || 0
      const valorFinal = valorBase - descuento

      return {
        ...neg,
        valorBase,
        descuento,
        valorFinal,
      }
    })
  }, [negociaciones])

  const totales = {
    valorFinal: negociacionActiva
      ? (negociacionActiva.valor_negociado || 0) -
        (negociacionActiva.descuento_aplicado || 0)
      : 0,
    totalAbonado: abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0),
    totalFuentesPago: fuentesPago.reduce(
      (sum, fuente) => sum + (fuente.monto_aprobado || 0),
      0
    ),
  }

  /**
   * Transformar fuentes de pago al formato esperado por componentes de UI
   */
  const fuentesTransformadas = fuentesPago.map(fuente => ({
    tipo: fuente.tipo,
    monto: fuente.monto_aprobado || 0,
    entidad: fuente.entidad || undefined,
    numero_referencia: fuente.numero_referencia || undefined,
    detalles: fuente.observaciones || undefined,
    monto_recibido: fuente.monto_recibido || 0,
  }))

  // =====================================================
  // EFECTOS
  // =====================================================

  // Cargar negociaciones al montar o cuando cambia el cliente
  useEffect(() => {
    if (clienteId) {
      cargarNegociaciones()
    }
  }, [clienteId, cargarNegociaciones])

  // Escuchar evento de recarga (cuando se crea nueva negociación)
  useEffect(() => {
    const handleRecargar = () => {
      cargarNegociaciones()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('negociacion-creada', handleRecargar)
      return () =>
        window.removeEventListener('negociacion-creada', handleRecargar)
    }
  }, [cargarNegociaciones])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    negociaciones: negociacionesConValores,
    loading,
    negociacionActiva,
    fuentesPago: fuentesTransformadas,
    abonos,
    loadingDatos,

    // Acciones
    verDetalleNegociacion,
    volverALista,
    recargarNegociaciones: cargarNegociaciones,

    // Navegación
    navegarACrearNegociacion,
    navegarAAsignarVivienda,
    navegarARegistrarAbono,

    // Cálculos
    totales,
  }
}
