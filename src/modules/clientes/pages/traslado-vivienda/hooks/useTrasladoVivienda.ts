/**
 * useTrasladoVivienda
 *
 * Orquestador central del formulario acordeón de traslado de vivienda.
 * Reutiliza el patrón AccordionWizard idéntico a Asignar Vivienda V2.
 *
 * Paso 1: Resumen de negociación actual + motivo/autorización
 * Paso 2: Selección de vivienda destino + configuración de fuentes
 * Paso 3: Comparativa y confirmación
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { Banknote, ClipboardCheck, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import { logger } from '@/lib/utils/logger'
import { getShortId } from '@/lib/utils/slug.utils'
import { useFuentesPago } from '@/modules/clientes/components/asignar-vivienda/hooks/useFuentesPago'
import { useProyectosViviendas } from '@/modules/clientes/components/asignar-vivienda/hooks/useProyectosViviendas'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
} from '@/modules/clientes/components/asignar-vivienda/types'
import { clientesKeys } from '@/modules/clientes/hooks/useClientesQuery'
import {
  trasladoViviendaService,
  type FuenteConAbonos,
  type FuenteTrasladoDTO,
} from '@/modules/clientes/services/traslado-vivienda.service'
import type { TipoFuentePago } from '@/modules/clientes/types'
import {
  obtenerMonto,
  obtenerMontoParaCierre,
} from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useEntidadesFinancierasCombinadas } from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'
import type { ParametrosCredito } from '@/modules/fuentes-pago/types'
import type {
  SectionStatus,
  SummaryItem,
  WizardStepConfig,
} from '@/shared/components/accordion-wizard'

// ── Configuración de pasos ─────────────────────────────
export const PASOS_TRASLADO: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Negociación Actual',
    description:
      'Verifica que la negociación esté en estado Activa y sin desembolsos externos (hipotecario, subsidios). ' +
      'Las fuentes internas con abonos se trasladarán automáticamente y aparecerán marcadas como obligatorias. ' +
      'Describe el motivo con detalle (mín. 20 caracteres) y registra quién autoriza el traslado.',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Nueva Vivienda y Fuentes de Pago',
    description: [
      'Selecciona el proyecto y la vivienda destino (solo aparecen las disponibles).',
      'Las fuentes marcadas como obligatorias deben incluirse con un monto ≥ al ya abonado en la negociación actual — no se acepta un monto menor.',
      'Para Crédito con la Constructora el monto mínimo aplica sobre el capital, no sobre el total con intereses.',
      'La suma de todas las fuentes debe ser igual al valor total de la nueva vivienda.',
    ].join('\n'),
    icon: Banknote,
  },
  {
    id: 3,
    title: 'Revisión y Confirmación',
    description:
      'Revisa la comparativa antes → después. Al confirmar se ejecutarán automáticamente: ' +
      'cierre de la negociación actual, liberación de la vivienda origen, creación de la nueva negociación, ' +
      'asignación de la nueva vivienda y traslado de abonos. Esta acción es irreversible.',
    icon: ClipboardCheck,
  },
]

interface UseTrasladoViviendaProps {
  clienteId: string
  clienteSlug?: string
  clienteNombre?: string
  negociacionId: string
}

export function useTrasladoVivienda({
  clienteId,
  clienteSlug,
  negociacionId,
}: UseTrasladoViviendaProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // ─── Wizard state ────────────────────────────────────
  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(
    new Set()
  )
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ejecutando, setEjecutando] = useState(false)
  const [errorApi, setErrorApi] = useState<string | null>(null)

  // ─── Paso 1: Datos de validación / negociación actual ──
  const [validacion, setValidacion] = useState<{
    valido: boolean
    errores: string[]
    fuentesConAbonos: FuenteConAbonos[]
    negociacionOrigen: Record<string, unknown> | null
  }>({
    valido: false,
    errores: [],
    fuentesConAbonos: [],
    negociacionOrigen: null,
  })
  const [cargandoValidacion, setCargandoValidacion] = useState(true)

  // Paso 1 form fields
  const [motivo, setMotivo] = useState('')
  const [autorizadoPor, setAutorizadoPor] = useState('')

  // Paso 1 inline field errors (shown after user attempts to advance)
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null)
  const [errorAutorizadoPor, setErrorAutorizadoPor] = useState<string | null>(
    null
  )

  // ─── Paso 2: Vivienda destino ──────────────────────────
  const {
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId: viviendaDestinoId,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaId: setViviendaDestinoId,
  } = useProyectosViviendas()

  const { data: tiposConCampos = [], isLoading: cargandoTiposConCampos } =
    useTiposFuentesConCampos()
  const { entidades } = useEntidadesFinancierasCombinadas()

  const viviendaDestinoSeleccionada = useMemo(
    () => viviendas.find(v => v.id === viviendaDestinoId) ?? null,
    [viviendas, viviendaDestinoId]
  )

  const valorBaseDestino = viviendaDestinoSeleccionada?.valor_base ?? 0
  const gastosNotarialesDestino =
    viviendaDestinoSeleccionada?.gastos_notariales ?? 0
  const recargoEsquineraDestino =
    viviendaDestinoSeleccionada?.recargo_esquinera ?? 0
  const valorTotalDestino = useMemo(
    () =>
      Math.max(
        0,
        valorBaseDestino + gastosNotarialesDestino + recargoEsquineraDestino
      ),
    [valorBaseDestino, gastosNotarialesDestino, recargoEsquineraDestino]
  )

  // Values from origen
  const negOrigen = validacion.negociacionOrigen
  const valorOrigenTotal =
    ((negOrigen as Record<string, unknown>)?.valor_total_pagar as number) ?? 0
  const diferenciaPrecio = valorTotalDestino - valorOrigenTotal

  // ─── Fuentes de pago ──────────────────────────────────
  const {
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    handleFuenteEnabledChange: _handleFuenteEnabledChange,
    handleFuenteConfigChange: _handleFuenteConfigChange,
  } = useFuentesPago({
    valorTotal: valorTotalDestino,
    tiposConCampos,
    cargandoTipos: cargandoTiposConCampos,
  })

  const handleFuenteEnabledChange = _handleFuenteEnabledChange
  const handleFuenteConfigChange = _handleFuenteConfigChange

  // ─── Validación de fuentes ────────────────────────────
  const [erroresFuentes, setErroresFuentes] = useState<Record<string, string>>(
    {}
  )
  const [mostrarErroresFuentes, setMostrarErroresFuentes] = useState(false)

  // ─── Cargar validación al montar ──────────────────────
  useEffect(() => {
    let cancelled = false
    const cargar = async () => {
      setCargandoValidacion(true)
      try {
        const result = await trasladoViviendaService.validarTraslado(
          negociacionId,
          clienteId
        )
        if (cancelled) return
        setValidacion({
          valido: result.valido,
          errores: result.errores,
          fuentesConAbonos: result.fuentesConAbonos,
          negociacionOrigen: result.negociacion as unknown as Record<
            string,
            unknown
          >,
        })
      } catch (error) {
        logger.error('Error validando traslado:', error)
        if (!cancelled) {
          setValidacion({
            valido: false,
            errores: ['Error al validar: intente de nuevo'],
            fuentesConAbonos: [],
            negociacionOrigen: null,
          })
        }
      } finally {
        if (!cancelled) setCargandoValidacion(false)
      }
    }
    cargar()
    return () => {
      cancelled = true
    }
  }, [negociacionId, clienteId])

  // ─── Forzar activación de fuentes que tienen abonos (obligatorias) ──
  const fuentesObligatorias = useMemo(
    () =>
      validacion.fuentesConAbonos.filter(
        f => !f.es_externa && f.monto_recibido > 0
      ),
    [validacion.fuentesConAbonos]
  )

  // Auto-activar y pre-configurar fuentes obligatorias cuando se cargan los tipos
  const fuentesObligatoriasActivadas = useRef(false)
  useEffect(() => {
    if (
      fuentesObligatoriasActivadas.current ||
      cargandoTiposConCampos ||
      fuentes.length === 0 ||
      fuentesObligatorias.length === 0
    ) {
      return
    }

    for (const fOblig of fuentesObligatorias) {
      const tipo = fOblig.tipo as TipoFuentePago
      const tipoConCampos = tiposConCampos.find(t => t.nombre === fOblig.tipo)
      const permiteMultiples = tipoConCampos?.permite_multiples_abonos ?? false
      const esCredito = tipoConCampos?.logica_negocio?.genera_cuotas === true

      // 1. Habilitar la fuente
      const yaActiva = fuentes.find(
        f => f.tipo.toLowerCase() === fOblig.tipo.toLowerCase() && f.enabled
      )
      if (!yaActiva) {
        handleFuenteEnabledChange(tipo, true)
      }

      // 2. Pre-configurar con el monto mínimo obligatorio
      // NOTA: Para crédito constructora usamos el capital ORIGINAL del crédito como
      // punto de partida (no monto_recibido, que incluye intereses y sobreestimaría
      // el capital pendiente). El usuario puede ajustarlo; la validación del hook
      // garantiza que el capital final no sea menor a monto_recibido.
      const capitalMinimo = fOblig.monto_recibido
      const capitalInicial = fOblig.parametrosCredito?.capital ?? capitalMinimo

      if (esCredito) {
        // Usar parámetros originales del crédito existente si están disponibles.
        // capital: capital original del crédito (punto de partida editable por el usuario)
        // tasa, mora y número de cuotas: se toman del crédito original para no sorprender al usuario
        const orig = fOblig.parametrosCredito
        const fechaInicio = orig?.fechaInicio
          ? new Date(orig.fechaInicio + 'T12:00:00')
          : new Date(getTodayDateString() + 'T12:00:00')
        const parametrosCredito: ParametrosCredito = {
          capital: capitalInicial,
          tasaMensual: orig?.tasaMensual ?? 1.5,
          numCuotas: orig?.numCuotas ?? 12,
          fechaInicio,
          tasaMoraDiaria: orig?.tasaMoraDiaria ?? 0.001,
        }
        handleFuenteConfigChange(tipo, {
          tipo,
          monto_aprobado: capitalInicial,
          capital_para_cierre: capitalInicial,
          parametrosCredito,
          permite_multiples_abonos: permiteMultiples,
          campos: {},
        })
      } else {
        // Para fuentes regulares: pre-llenar monto_aprobado con el mínimo obligatorio (ya abonado)
        const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
        const campoCampoMonto = camposConfig.find(c => c.rol === 'monto')
        handleFuenteConfigChange(tipo, {
          tipo,
          monto_aprobado: capitalMinimo,
          permite_multiples_abonos: permiteMultiples,
          campos: campoCampoMonto
            ? { [campoCampoMonto.nombre]: capitalMinimo }
            : {},
        })
      }
    }
    fuentesObligatoriasActivadas.current = true
  }, [
    fuentes,
    fuentesObligatorias,
    cargandoTiposConCampos,
    tiposConCampos,
    handleFuenteEnabledChange,
    handleFuenteConfigChange,
  ])

  // ─── Validaciones ─────────────────────────────────────

  const validarFuentesManual = useCallback((): boolean => {
    const errores: Record<string, string> = {}

    // Validar campos requeridos por tipo
    fuentes
      .filter(f => f.enabled)
      .forEach(f => {
        const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
        const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
        const requiereEntidad = camposConfig.some(
          c => c.rol === 'entidad' && c.requerido
        )
        const requiereReferencia = camposConfig.some(
          c => c.rol === 'referencia' && c.requerido
        )

        if (
          requiereEntidad &&
          (!f.config?.entidad || f.config.entidad.trim() === '')
        ) {
          errores[f.tipo] = 'Entidad requerida'
        } else if (
          requiereReferencia &&
          (!f.config?.numero_referencia ||
            f.config.numero_referencia.trim() === '')
        ) {
          errores[f.tipo] = 'Número de referencia requerido'
        }
      })

    // Validar regla 7: fuentes con abonos mínimo
    for (const fOblig of fuentesObligatorias) {
      const fDest = fuentes.find(
        f => f.tipo.toLowerCase() === fOblig.tipo.toLowerCase() && f.enabled
      )
      if (!fDest) {
        errores[fOblig.tipo] =
          `Obligatoria: tiene ${formatCurrency(fOblig.monto_recibido)} en abonos — debe incluirse`
        continue
      }
      const tipoConCampos = tiposConCampos.find(t => t.nombre === fDest.tipo)
      const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
      const esCredito = tipoConCampos?.logica_negocio?.genera_cuotas === true

      if (esCredito) {
        // Para crédito constructora el flujo es:
        // 1. calculo (en CreditoConstructoraForm) solo se computa cuando capital + tasa + cuotas + fecha están completos
        // 2. Solo entonces se emite capital_para_cierre y parametrosCredito al config
        // Por eso verificamos primero si parametrosCredito existe (proxy de "calculo efectuado")
        // y luego si el capital cumple el mínimo.
        if (!fDest.config?.parametrosCredito) {
          // calculo aún no se ha efectuado — falta completar tasa/cuotas/fecha
          errores[fDest.tipo] =
            'Completa todos los parámetros del crédito: capital, tasa mensual, número de cuotas y fecha de inicio'
          continue
        }
        const capitalCierre = fDest.config.capital_para_cierre ?? 0
        if (capitalCierre < fOblig.monto_recibido) {
          errores[fOblig.tipo] =
            `El capital debe ser mínimo ${formatCurrency(fOblig.monto_recibido)} (ya abonado en la negociación actual)`
        }
        continue
      }

      // Para fuentes sin genera_cuotas (Cuota Inicial, etc.): verificar monto directo
      const monto = fDest.config
        ? obtenerMontoParaCierre(fDest.config, tipoConCampos, camposConfig)
        : 0

      if (monto < fOblig.monto_recibido) {
        errores[fOblig.tipo] =
          `El monto debe ser mínimo ${formatCurrency(fOblig.monto_recibido)} (ya abonado en la negociación actual)`
      }
    }

    setErroresFuentes(errores)
    return Object.keys(errores).length === 0
  }, [fuentes, tiposConCampos, fuentesObligatorias])

  const paso1Valido = useMemo(
    () => motivo.length >= 20 && autorizadoPor.length >= 3 && validacion.valido,
    [motivo, autorizadoPor, validacion.valido]
  )

  const _paso2Valido = useMemo(
    () => !!viviendaDestinoId && sumaCierra && fuentes.some(f => f.enabled),
    [viviendaDestinoId, sumaCierra, fuentes]
  )

  // ─── Estado de cada sección ───────────────────────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (pasosCompletados.has(paso)) return 'completed'
      if (paso === pasoActual) return 'active'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ─── Summaries ────────────────────────────────────────
  const summaryPaso1: SummaryItem[] = useMemo(() => {
    if (!motivo) return []
    return [
      {
        label: 'Motivo',
        value: motivo.substring(0, 50) + (motivo.length > 50 ? '...' : ''),
      },
      { label: 'Autorizado por', value: autorizadoPor },
    ]
  }, [motivo, autorizadoPor])

  const summaryPaso2: SummaryItem[] = useMemo(() => {
    if (!viviendaDestinoSeleccionada) return []
    const fuentesOn = fuentes.filter(f => f.enabled).map(f => f.tipo)
    return [
      {
        label: 'Vivienda destino',
        value: `${viviendaDestinoSeleccionada.manzana_nombre} · Casa ${viviendaDestinoSeleccionada.numero}`,
      },
      { label: 'Valor', value: formatCurrency(valorTotalDestino) },
      { label: 'Fuentes', value: fuentesOn.join(', ') || 'Ninguna' },
    ]
  }, [viviendaDestinoSeleccionada, valorTotalDestino, fuentes])

  // ─── Navegación ───────────────────────────────────────
  const irSiguiente = useCallback(async () => {
    setIsValidating(true)
    try {
      if (pasoActual === 1) {
        // Resetear errores previos
        setErrorMotivo(null)
        setErrorAutorizadoPor(null)

        if (!validacion.valido) {
          // El bloque de errores de validación ya es visible en pantalla — no se necesita toast
          return
        }
        if (motivo.trim().length < 20) {
          setErrorMotivo(
            `El motivo debe tener al menos 20 caracteres (actualmente ${motivo.trim().length})`
          )
          return
        }
        if (autorizadoPor.trim().length < 3) {
          setErrorAutorizadoPor(
            'Ingresa el nombre completo de quien autorizó el traslado (mín. 3 caracteres)'
          )
          return
        }
        setPasosCompletados(prev => new Set(prev).add(1))
        setPasoActual(2)
        return
      }

      if (pasoActual === 2) {
        if (!viviendaDestinoId) {
          toast.error('Selecciona una vivienda destino')
          return
        }
        if (!fuentes.some(f => f.enabled)) {
          toast.error('Configura al menos una fuente de pago')
          return
        }
        // Validar fuentes PRIMERO para mostrar errores específicos por fuente
        // (incluye monto mínimo de fuentes obligatorias y parametrosCredito)
        const fuentesOk = validarFuentesManual()
        setMostrarErroresFuentes(true)
        if (!fuentesOk) {
          return
        }
        if (!sumaCierra) {
          return
        }
        setPasosCompletados(prev => new Set(prev).add(2))
        setPasoActual(3)
        return
      }
    } finally {
      setIsValidating(false)
    }
  }, [
    pasoActual,
    validacion.valido,
    motivo,
    autorizadoPor,
    viviendaDestinoId,
    fuentes,
    sumaCierra,
    validarFuentesManual,
  ])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      if (pasosCompletados.has(paso)) {
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = paso; i <= PASOS_TRASLADO.length; i++) next.delete(i)
          return next
        })
        setPasoActual(paso)
      }
    },
    [pasosCompletados]
  )

  // ─── Submit final ─────────────────────────────────────
  const handleSubmitFinal = useCallback(async () => {
    setErrorApi(null)

    if (!sumaCierra) {
      setErrorApi(
        'Las fuentes de pago no cubren el valor total. Regresa al paso 2 y ajusta los montos.'
      )
      return
    }

    setEjecutando(true)

    try {
      const fuentesDTO: FuenteTrasladoDTO[] = fuentes
        .filter(
          (f): f is FuentePagoConfiguracion & { config: FuentePagoConfig } =>
            f.enabled && f.config !== null
        )
        .map(f => {
          const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
          const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
          const monto = obtenerMonto(f.config, camposConfig)
          const generaCuotas =
            tipoConCampos?.logica_negocio?.genera_cuotas === true

          return {
            tipo: f.tipo,
            monto_aprobado: monto,
            capital_para_cierre: f.config.capital_para_cierre ?? undefined,
            parametrosCredito: f.config.parametrosCredito ?? undefined,
            entidad:
              (entidades.find(e => e.value === f.config.entidad)?.label ??
                f.config.entidad) ||
              undefined,
            numero_referencia: f.config.numero_referencia || undefined,
            permite_multiples_abonos:
              generaCuotas || (f.config.permite_multiples_abonos ?? false),
          }
        })

      await trasladoViviendaService.ejecutarTraslado(
        {
          negociacion_origen_id: negociacionId,
          vivienda_destino_id: viviendaDestinoId,
          valor_negociado: valorTotalDestino,
          fuentes_pago: fuentesDTO,
          motivo,
          autorizado_por: autorizadoPor,
        },
        clienteId
      )

      toast.success('¡Traslado de vivienda ejecutado exitosamente!', {
        description:
          'La negociación anterior ha sido cerrada y la nueva vivienda asignada.',
        duration: 5000,
      })

      // Invalidar cache del cliente para que el banner y tabs muestren la nueva vivienda
      await queryClient.invalidateQueries({
        queryKey: clientesKeys.detail(clienteId),
      })

      setShowSuccess(true)
      setTimeout(() => {
        router.push(`/clientes/${clienteSlug ?? getShortId(clienteId)}`)
      }, 2000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error desconocido'
      logger.error('Error ejecutando traslado:', error)
      setErrorApi(msg)
      toast.error('Error al ejecutar el traslado', { description: msg })
    } finally {
      setEjecutando(false)
    }
  }, [
    sumaCierra,
    fuentes,
    tiposConCampos,
    entidades,
    negociacionId,
    viviendaDestinoId,
    valorTotalDestino,
    motivo,
    autorizadoPor,
    clienteId,
    clienteSlug,
    router,
    queryClient,
  ])

  const clearErrorApi = useCallback(() => {
    setErrorApi(null)
  }, [])

  return {
    // Wizard
    pasos: PASOS_TRASLADO,
    pasoActual,
    getEstadoPaso,
    summaryPaso1,
    summaryPaso2,
    showSuccess,
    isValidating,

    // Navegación
    irSiguiente,
    irAtras,
    irAPaso,

    // Paso 1 - Negociación actual
    cargandoValidacion,
    validacion,
    fuentesObligatorias,
    motivo,
    setMotivo,
    autorizadoPor,
    setAutorizadoPor,
    paso1Valido,
    errorMotivo,
    errorAutorizadoPor,

    // Paso 2 - Vivienda destino
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaDestinoId,
    viviendaDestinoSeleccionada,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaDestinoId,
    valorBaseDestino,
    gastosNotarialesDestino,
    recargoEsquineraDestino,
    valorTotalDestino,
    diferenciaPrecio,
    valorOrigenTotal,

    // Fuentes
    cargandoTipos: cargandoTiposConCampos,
    tiposConCampos,
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    erroresFuentes,
    mostrarErroresFuentes,
    handleFuenteEnabledChange,
    handleFuenteConfigChange,

    // Submit
    handleSubmitFinal,
    ejecutando,
    errorApi,
    clearErrorApi,
    entidades,
  }
}
