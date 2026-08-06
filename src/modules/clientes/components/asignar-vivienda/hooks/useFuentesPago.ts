/**
 * Hook para manejar las fuentes de pago y sus validaciones
 * Carga dinamica desde BD (NO mas hardcodeadas)
 * V2: Soporta campos dinamicos con roles
 * tiposConCampos recibido como parametro - sin doble fetch
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import type {
  CrearFuentePagoDTO,
  TipoFuentePago,
} from '@/modules/clientes/types'
import { obtenerMontoParaCierre } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'

import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
  FuentePagoErrores,
} from '../types'

interface UseFuentesPagoProps {
  valorTotal: number
  /** Tipos con campos dinamicos — ya cargados por el hook padre (evita doble fetch) */
  tiposConCampos: TipoFuentePagoConCampos[]
  /** true mientras el hook padre carga los tipos desde React Query */
  cargandoTipos: boolean
}

export function useFuentesPago({
  valorTotal,
  tiposConCampos,
  cargandoTipos,
}: UseFuentesPagoProps) {
  // Derivar lista de nombres disponibles del parametro (sin fetch adicional)
  const tiposFuentesDisponibles = useMemo(
    () => tiposConCampos.map(t => t.nombre),
    [tiposConCampos]
  )

  // Estado inicial de fuentes (se inicializa cuando tiposConCampos esten listos)
  const [fuentes, setFuentes] = useState<FuentePagoConfiguracion[]>([])

  // Inicializar errores
  const [erroresFuentes, setErroresFuentes] = useState<
    Record<TipoFuentePago, FuentePagoErrores>
  >({} as Record<TipoFuentePago, FuentePagoErrores>)

  // Inicializar fuentes cuando se cargan los tipos desde BD
  useEffect(() => {
    if (!cargandoTipos && tiposFuentesDisponibles.length > 0) {
      const fuentesIniciales: FuentePagoConfiguracion[] =
        tiposFuentesDisponibles.map(nombre => ({
          tipo: nombre as TipoFuentePago,
          enabled: false,
          config: null,
        }))

      setFuentes(fuentesIniciales)

      // Inicializar estado de errores dinamicamente
      const erroresIniciales = tiposFuentesDisponibles.reduce(
        (acc, nombre) => {
          acc[nombre as TipoFuentePago] = {}
          return acc
        },
        {} as Record<TipoFuentePago, FuentePagoErrores>
      )
      setErroresFuentes(erroresIniciales)
    }
  }, [cargandoTipos, tiposFuentesDisponibles])

  // Calculos
  const fuentesActivas = useMemo(() => {
    return fuentes.filter(f => f.enabled && f.config !== null)
  }, [fuentes])

  const totalFuentes = useMemo(() => {
    return fuentesActivas.reduce((sum, f) => {
      const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
      const camposConfig = tipoConCampos?.configuracion_campos?.campos || []
      // Para crédito constructora: usa capital_para_cierre (sin intereses)
      // para que los intereses no inflen el precio de la vivienda
      const monto = obtenerMontoParaCierre(
        f.config,
        tipoConCampos,
        camposConfig
      )
      return sum + monto
    }, 0)
  }, [fuentesActivas, tiposConCampos])

  const diferencia = useMemo(() => {
    return valorTotal - totalFuentes
  }, [valorTotal, totalFuentes])

  const sumaCierra = diferencia <= 0 && totalFuentes > 0

  // Validacion paso 2
  const paso2Valido = useMemo(() => {
    const tieneAlMenosUnaFuente =
      fuentesActivas.length > 0 &&
      fuentesActivas.some(f => {
        const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
        const camposConfig = tipoConCampos?.configuracion_campos?.campos || []
        const monto = obtenerMontoParaCierre(
          f.config,
          tipoConCampos,
          camposConfig
        )
        return monto > 0
      })

    return tieneAlMenosUnaFuente && sumaCierra
  }, [fuentesActivas, sumaCierra, tiposConCampos])

  // Validar una fuente especifica — usa roles dinamicos, sin strings hardcodeados
  const validarFuente = useCallback(
    (
      tipo: TipoFuentePago,
      config: FuentePagoConfig | null
    ): FuentePagoErrores => {
      const errores: FuentePagoErrores = {}

      if (!config) return errores

      // Buscar configuracion de campos para este tipo
      const tipoConCampos = tiposConCampos.find(t => t.nombre === tipo)
      const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []

      // Validar monto
      if (!config.monto_aprobado || config.monto_aprobado <= 0) {
        errores.monto_aprobado = 'El monto debe ser mayor a 0'
      } else if (config.monto_aprobado > valorTotal) {
        errores.monto_aprobado = 'El monto no puede superar el valor total'
      }

      // Validar entidad (solo si este tipo lo requiere segun su configuracion de campos)
      const requiereEntidad = camposConfig.some(c => c.rol === 'entidad')
      if (
        requiereEntidad &&
        (!config.entidad || config.entidad.trim() === '')
      ) {
        errores.entidad = 'Debes indicar la entidad'
      }

      // Validar numero de referencia (solo si este tipo lo requiere)
      const requiereReferencia = camposConfig.some(c => c.rol === 'referencia')
      if (
        requiereReferencia &&
        (!config.numero_referencia || config.numero_referencia.trim() === '')
      ) {
        errores.numero_referencia =
          'Debe especificar el numero de referencia o radicado'
      }

      // NOTA: La carta de aprobacion NO se valida aqui.
      // El sistema creara un documento pendiente automaticamente.

      return errores
    },
    [valorTotal, tiposConCampos]
  )

  // Handlers
  const handleFuenteEnabledChange = useCallback(
    (tipo: TipoFuentePago, enabled: boolean) => {
      setFuentes(
        prev =>
          prev.map(f => {
            if (f.tipo === tipo) {
              // Leer permite_multiples_abonos desde la configuracion del tipo (dinamico)
              const tipoConCampos = tiposConCampos.find(t => t.nombre === tipo)
              const permiteMultiples =
                tipoConCampos?.permite_multiples_abonos ?? false
              return {
                ...f,
                enabled,
                config: enabled
                  ? {
                      tipo,
                      monto_aprobado: 0,
                      permite_multiples_abonos: permiteMultiples,
                    }
                  : null,
              }
            }
            return f
          }) as FuentePagoConfiguracion[]
      )
    },
    [tiposConCampos]
  )

  const handleFuenteConfigChange = useCallback(
    (tipo: TipoFuentePago, config: FuentePagoConfig | null) => {
      setFuentes(prev =>
        prev.map(f => {
          if (f.tipo === tipo) {
            return { ...f, config }
          }
          return f
        })
      )

      // Validar y actualizar errores
      const errores = validarFuente(tipo, config)
      setErroresFuentes(prev => ({
        ...prev,
        [tipo]: errores,
      }))
    },
    [validarFuente]
  )

  // Resetear (todas deshabilitadas) - dinamico
  const resetear = useCallback(() => {
    const fuentesReseteadas: FuentePagoConfiguracion[] =
      tiposFuentesDisponibles.map(nombre => ({
        tipo: nombre as TipoFuentePago,
        enabled: false,
        config: null,
      }))
    setFuentes(fuentesReseteadas)

    const erroresReseteados = tiposFuentesDisponibles.reduce(
      (acc, nombre) => {
        acc[nombre as TipoFuentePago] = {}
        return acc
      },
      {} as Record<TipoFuentePago, FuentePagoErrores>
    )
    setErroresFuentes(erroresReseteados)
  }, [tiposFuentesDisponibles])

  // Obtener fuentes para crear (convierte a DTO)
  const obtenerFuentesParaCrear = useCallback((): CrearFuentePagoDTO[] => {
    return fuentesActivas
      .map(f => f.config)
      .filter((c): c is FuentePagoConfig => c !== null)
      .map(config => ({
        tipo: config.tipo,
        monto_aprobado: config.monto_aprobado,
        entidad: config.entidad,
        numero_referencia: config.numero_referencia,
        carta_aprobacion_url: config.carta_aprobacion_url,
        carta_asignacion_url: config.carta_asignacion_url,
        permite_multiples_abonos: config.permite_multiples_abonos ?? false,
      })) as CrearFuentePagoDTO[]
  }, [fuentesActivas])

  return {
    // Estado de carga — propagado del caller, no generado aqui
    tiposFuentesDisponibles,

    // Estado
    fuentes,
    fuentesActivas,
    erroresFuentes,

    // Calculos
    totalFuentes,
    diferencia,
    sumaCierra,
    paso2Valido,

    // Handlers
    handleFuenteEnabledChange,
    handleFuenteConfigChange,

    // Utilidades
    resetear,
    obtenerFuentesParaCrear,
  }
}
