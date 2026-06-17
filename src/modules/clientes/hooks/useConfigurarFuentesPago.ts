/**
 * Hook: useConfigurarFuentesPago
 *
 * Gestiona toda la lógica de configuración de fuentes de pago para una negociación.
 *
 * Responsabilidades:
 * - Cargar fuentes de pago existentes desde la BD
 * - Calcular totales y validar cierre financiero
 * - Agregar, actualizar y eliminar fuentes
 * - Subir documentos (cartas de aprobación)
 * - Guardar cambios en la BD
 *
 * ⚠️ NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'
import { fuentesPagoService } from '@/modules/clientes/services/fuentes-pago.service'
import { cargarTiposFuentesPagoActivas } from '@/modules/clientes/services/tipos-fuentes-pago.service'
import type { TipoFuentePago } from '@/modules/clientes/types'
import { crearCredito } from '@/modules/fuentes-pago/services/creditos-constructora.service'
import { crearCuotasCredito } from '@/modules/fuentes-pago/services/cuotas-credito.service'
import type { ParametrosCredito } from '@/modules/fuentes-pago/types'
import { calcularTablaAmortizacion } from '@/modules/fuentes-pago/utils/calculos-credito'
import { calcularCierreFinanciero } from '@/shared/hooks/useCierreFinanciero'

export interface FuentePago {
  id?: string
  tipo: TipoFuentePago
  monto_aprobado: number
  /** Solo para créditos: capital sin intereses (para cierre financiero correcto) */
  capital_para_cierre?: number
  entidad?: string
  numero_referencia?: string
  fecha_acta?: string
  carta_asignacion_url?: string
  /** Solo para créditos: parámetros del crédito (capital, tasa, cuotas, fecha) */
  parametrosCredito?: ParametrosCredito | null
}

interface UseConfigurarFuentesPagoProps {
  negociacionId: string
  valorTotal: number
  onFuentesActualizadas?: () => void
}

export function useConfigurarFuentesPago({
  negociacionId,
  valorTotal,
  onFuentesActualizadas,
}: UseConfigurarFuentesPagoProps) {
  // =====================================================
  // ESTADO
  // =====================================================
  const [fuentesPago, setFuentesPago] = useState<FuentePago[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =====================================================
  // REACT QUERY: tipos de fuentes activos (read-only, catálogo)
  // =====================================================
  const { data: tiposDisponibles = [], isLoading: cargandoTipos } = useQuery({
    queryKey: ['tipos-fuentes-pago-activas'],
    queryFn: async () => {
      const { data } = await cargarTiposFuentesPagoActivas()
      return data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  // =====================================================
  // TOTALES calculados de forma reactiva (useMemo)
  // =====================================================
  const totales = useMemo(() => {
    const cierre = calcularCierreFinanciero(fuentesPago, valorTotal)
    return {
      total: cierre.totalParaCierre,
      porcentaje: cierre.porcentajeCubierto,
      diferencia: cierre.diferencia,
    }
  }, [fuentesPago, valorTotal])

  // =====================================================
  // FUNCIONES DE LÓGICA
  // =====================================================

  /**
   * Cargar fuentes de pago desde la BD
   */
  const cargarFuentesPago = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const data =
        await fuentesPagoService.obtenerFuentesPagoNegociacion(negociacionId)
      setFuentesPago(
        data.map(f => ({
          id: f.id,
          tipo: f.tipo,
          monto_aprobado: f.monto_aprobado || 0,
          capital_para_cierre: f.capital_para_cierre ?? undefined,
          entidad: f.entidad ?? undefined,
          numero_referencia: f.numero_referencia ?? undefined,
          fecha_acta: f.fecha_acta ?? undefined,
          carta_asignacion_url: f.carta_asignacion_url ?? undefined,
        }))
      )
    } catch (err: unknown) {
      logger.error('Error cargando fuentes:', err)
      setError(
        `Error cargando fuentes de pago: ${err instanceof Error ? err.message : String(err)}`
      )
    } finally {
      setCargando(false)
    }
  }, [negociacionId])

  /**
   * Calcular totales: monto total, porcentaje cubierto, diferencia
   *
   * Uses shared calcularCierreFinanciero — capital_para_cierre is preferred
   * over monto_aprobado to avoid interest inflating the total.
   */

  // ── Effects that depend on the above functions ──────────────────────────

  /**
   * Cargar fuentes de pago existentes al montar o cambiar negociacionId
   */
  useEffect(() => {
    cargarFuentesPago()
  }, [negociacionId, cargarFuentesPago])

  /**
   * Agregar una nueva fuente de pago
   */
  const agregarFuente = (
    tipo: FuentePago['tipo'],
    permiteMultiples: boolean
  ) => {
    // Verificar si ya existe este tipo (excepto Cuota Inicial que puede repetirse)
    if (!permiteMultiples) {
      const existe = fuentesPago.some(f => f.tipo === tipo)
      if (existe) {
        setError(`Ya existe una fuente de tipo "${tipo}"`)
        return
      }
    }

    setFuentesPago([
      ...fuentesPago,
      {
        tipo,
        monto_aprobado: 0,
        entidad: '',
        numero_referencia: '',
      },
    ])
    setError(null)
  }

  /**
   * Actualizar un campo de una fuente existente
   */
  const actualizarFuente = (
    index: number,
    campo: keyof FuentePago,
    valor: FuentePago[keyof FuentePago] | unknown
  ) => {
    const nuevasFuentes = [...fuentesPago]
    nuevasFuentes[index] = { ...nuevasFuentes[index], [campo]: valor }
    setFuentesPago(nuevasFuentes)
  }

  /**
   * Eliminar una fuente de pago
   * Marca como inactiva en lugar de eliminar permanentemente
   */
  const eliminarFuente = async (index: number) => {
    const fuente = fuentesPago[index]

    // Si tiene ID, inactivar en la BD
    if (fuente.id) {
      try {
        // Usar inactivarFuentePago en lugar de eliminar
        await fuentesPagoService.inactivarFuentePago(
          fuente.id,
          'Fuente eliminada por el usuario'
        )
      } catch (err: unknown) {
        // Mostrar error amigable
        const errMsg = err instanceof Error ? err.message : String(err)
        if (errMsg.includes('ya ha recibido')) {
          setError(
            `⚠️ No se puede eliminar esta fuente porque ya ha recibido dinero. ` +
              `Para mantener la integridad del historial de abonos, esta fuente debe permanecer activa.`
          )
        } else {
          setError(`Error eliminando fuente: ${errMsg}`)
        }
        return
      }
    }

    // Eliminar del estado local
    setFuentesPago(fuentesPago.filter((_, i) => i !== index))
    setError(null)
  }

  /**
   * Validar y guardar todas las fuentes de pago
   */
  const guardarFuentes = async () => {
    try {
      setGuardando(true)
      setError(null)

      // Validar que todas las fuentes tengan monto > 0
      const invalidas = fuentesPago.filter(
        f => !f.monto_aprobado || f.monto_aprobado <= 0
      )
      if (invalidas.length > 0) {
        setError('Todas las fuentes deben tener un monto aprobado mayor a 0')
        return
      }

      // Cargar configuración de tipos desde tiposDisponibles (ya cargados via useQuery)
      const tiposMap = new Map(tiposDisponibles.map(t => [t.nombre, t]))

      // Validar entidades requeridas usando la flag de BD
      for (const fuente of fuentesPago) {
        const config = tiposMap.get(fuente.tipo)
        if (config?.requiere_entidad && !fuente.entidad?.trim()) {
          setError(`La fuente "${fuente.tipo}" requiere especificar la entidad`)
          return
        }
      }

      // Guardar cada fuente
      for (const fuente of fuentesPago) {
        if (fuente.id) {
          // Actualizar existente
          await fuentesPagoService.actualizarFuentePago(fuente.id, {
            monto_aprobado: fuente.monto_aprobado,
            entidad: fuente.entidad,
            numero_referencia: fuente.numero_referencia,
            fecha_acta: fuente.fecha_acta ?? null,
          })
        } else {
          // Crear nueva
          const nuevaFuente = await fuentesPagoService.crearFuentePago({
            negociacion_id: negociacionId,
            tipo: fuente.tipo,
            monto_aprobado: fuente.monto_aprobado,
            capital_para_cierre: fuente.capital_para_cierre,
            entidad: fuente.entidad,
            numero_referencia: fuente.numero_referencia,
          })

          // Si el tipo genera cuotas y hay parámetros de crédito, crear tabla de amortización
          const tipoConfig = tiposDisponibles.find(
            t => t.nombre === fuente.tipo
          )
          if (
            tipoConfig?.logica_negocio?.genera_cuotas &&
            fuente.parametrosCredito
          ) {
            const calculo = calcularTablaAmortizacion(fuente.parametrosCredito)

            // Crear registro en creditos_constructora
            const { error: eCred } = await crearCredito({
              fuente_pago_id: nuevaFuente.id,
              capital: fuente.parametrosCredito.capital,
              tasa_mensual: fuente.parametrosCredito.tasaMensual,
              num_cuotas: fuente.parametrosCredito.numCuotas,
              fecha_inicio: fuente.parametrosCredito.fechaInicio
                .toISOString()
                .split('T')[0],
              valor_cuota: calculo.valorCuotaMensual,
              interes_total: calculo.interesTotal,
              monto_total: calculo.montoTotal,
              tasa_mora_diaria:
                fuente.parametrosCredito.tasaMoraDiaria ?? 0.001,
            })
            if (eCred) throw eCred

            // Crear cuotas de amortización
            const { error: eCuotas } = await crearCuotasCredito(
              nuevaFuente.id,
              calculo.cuotas
            )
            if (eCuotas) throw eCuotas
          }
        }
      }

      // Recargar fuentes
      await cargarFuentesPago()

      // Notificar actualización
      onFuentesActualizadas?.()

      toast.info('✅ Fuentes de pago guardadas correctamente')
    } catch (err: unknown) {
      logger.error('Error guardando fuentes:', err)
      setError(
        `Error guardando fuentes: ${err instanceof Error ? err.message : String(err)}`
      )
    } finally {
      setGuardando(false)
    }
  }

  // =====================================================
  // VALORES COMPUTADOS
  // =====================================================

  const cierreCompleto = Math.abs(totales.diferencia) < 1 // Margen de error de 1 peso
  const porcentajeCubierto = totales.porcentaje

  // =====================================================
  // RETORNO
  // =====================================================

  return {
    // Estado
    fuentesPago,
    cargando,
    cargandoTipos,
    tiposDisponibles,
    guardando,
    error,
    totales,

    // Valores computados
    cierreCompleto,
    porcentajeCubierto,

    // Funciones
    agregarFuente,
    actualizarFuente,
    eliminarFuente,
    guardarFuentes,
    cargarFuentesPago,
  }
}
