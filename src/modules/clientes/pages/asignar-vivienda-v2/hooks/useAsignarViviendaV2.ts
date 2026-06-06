/**
 * useAsignarViviendaV2
 *
 * Orquestador central del formulario acordeón de asignación de vivienda.
 * Adaptado al patrón AccordionWizard compartido.
 * Delega a sub-hooks existentes — no duplica lógica.
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Banknote, ClipboardCheck, Home } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { formatDateForDB } from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import { useAsignarViviendaForm } from '@/modules/clientes/components/asignar-vivienda/hooks/useAsignarViviendaForm'
import { useFuentesPago } from '@/modules/clientes/components/asignar-vivienda/hooks/useFuentesPago'
import { useProyectosViviendas } from '@/modules/clientes/components/asignar-vivienda/hooks/useProyectosViviendas'
import type {
  FuentePagoConfig,
  FuentePagoConfiguracion,
} from '@/modules/clientes/components/asignar-vivienda/types'
import { useCrearNegociacion } from '@/modules/clientes/hooks/useCrearNegociacion'
import type { CrearFuentePagoDTO } from '@/modules/clientes/types'
import {
  type EstadoVivienda,
  validarSinNegociacionActiva,
  validarViviendaDisponible,
} from '@/modules/clientes/utils/asignar-vivienda-validaciones'
import { obtenerMonto } from '@/modules/clientes/utils/fuentes-pago-campos.utils'
import { useEntidadesFinancierasCombinadas } from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'
import { useTiposFuentesConCampos } from '@/modules/configuracion/hooks/useTiposFuentesConCampos'
import type {
  SectionStatus,
  SummaryItem,
  WizardStepConfig,
} from '@/shared/components/accordion-wizard'

// ── Configuración de pasos ─────────────────────────────
export const PASOS_ASIGNACION: WizardStepConfig[] = [
  {
    id: 1,
    title: 'Vivienda y Valores',
    description:
      'Selecciona el proyecto, la vivienda y configura descuentos si aplica.',
    icon: Home,
  },
  {
    id: 2,
    title: 'Fuentes de Pago',
    description:
      'Configura cómo se financiará la vivienda. Las fuentes deben cubrir el valor total.',
    icon: Banknote,
  },
  {
    id: 3,
    title: 'Revisión y Confirmación',
    description: 'Verifica todos los datos antes de crear la negociación.',
    icon: ClipboardCheck,
  },
]

interface UseAsignarViviendaV2Props {
  clienteId: string
  clienteSlug?: string // para redirect tras guardar
}

export function useAsignarViviendaV2({
  clienteId,
  clienteSlug,
}: UseAsignarViviendaV2Props) {
  const router = useRouter()

  // ─── Navegación ───────────────────────────────────────
  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(
    new Set()
  )
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // ─── Sub-hooks existentes ──────────────────────────────
  const { register, errors, touchedFields, setValue, watch, trigger } =
    useAsignarViviendaForm({ currentStep: pasoActual })

  const {
    proyectos,
    viviendas,
    proyectoSeleccionado,
    viviendaId,
    cargandoProyectos,
    cargandoViviendas,
    setProyectoSeleccionado,
    setViviendaId,
  } = useProyectosViviendas()

  const { data: tiposConCampos = [], isLoading: cargandoTiposConCampos } =
    useTiposFuentesConCampos()
  const { entidades } = useEntidadesFinancierasCombinadas()

  const {
    crearNegociacion,
    creando,
    error: errorNegociacion,
    limpiar: limpiarNegociacion,
  } = useCrearNegociacion()

  // ─── Valores observados ────────────────────────────────
  const aplicarDescuento = watch('aplicar_descuento')
  const descuentoAplicado = watch('descuento_aplicado') ?? 0
  const tipoDescuento = watch('tipo_descuento')
  const motivoDescuento = watch('motivo_descuento')
  const valorEscrituraPublica = watch('valor_escritura_publica')
  const notas = watch('notas')
  const fechaNegociacion = watch('fecha_negociacion')

  // ─── Vivienda seleccionada ─────────────────────────────
  const viviendaSeleccionada = useMemo(
    () => viviendas.find(v => v.id === viviendaId) ?? null,
    [viviendas, viviendaId]
  )

  const valorBase = viviendaSeleccionada?.valor_base ?? 0
  const gastosNotariales = viviendaSeleccionada?.gastos_notariales ?? 0
  const recargoEsquinera = viviendaSeleccionada?.recargo_esquinera ?? 0
  const valorTotal = useMemo(
    () =>
      Math.max(
        0,
        valorBase + gastosNotariales + recargoEsquinera - descuentoAplicado
      ),
    [valorBase, gastosNotariales, recargoEsquinera, descuentoAplicado]
  )

  // Sincronizar valor_negociado en RHF cuando cambia el total
  useEffect(() => {
    setValue('valor_negociado', valorTotal)
  }, [valorTotal, setValue])

  // Fix 3: warning al recargar/salir si el formulario tiene datos sin guardar
  useEffect(() => {
    if (!viviendaId && !proyectoSeleccionado) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [viviendaId, proyectoSeleccionado])

  // Propagar el error real de useCrearNegociacion una vez que React actualiza su estado
  useEffect(() => {
    if (errorNegociacion) {
      setErrorApi(errorNegociacion)
    }
  }, [errorNegociacion])

  // ─── Invalidar pasos 2/3 cuando el descuento cambia ──
  // Si el usuario vuelve al paso 1 y modifica el descuento después de haber
  // configurado fuentes en el paso 2, el total cambia y las fuentes ya no
  // cierran. Forzamos al usuario a revisar el paso 2 de nuevo.
  const prevDescuentoRef = useRef(descuentoAplicado)
  const prevAplicarDescuentoRef = useRef(aplicarDescuento)

  useEffect(() => {
    const descuentoCambio =
      prevDescuentoRef.current !== descuentoAplicado ||
      prevAplicarDescuentoRef.current !== aplicarDescuento
    prevDescuentoRef.current = descuentoAplicado
    prevAplicarDescuentoRef.current = aplicarDescuento

    if (descuentoCambio) {
      setPasosCompletados(prev => {
        if (!prev.has(2) && !prev.has(3)) return prev
        const next = new Set(prev)
        next.delete(2)
        next.delete(3)
        return next
      })
    }
  }, [descuentoAplicado, aplicarDescuento])

  // ─── Fuentes de pago ──────────────────────────────────
  const {
    fuentes,
    totalFuentes,
    diferencia,
    sumaCierra,
    handleFuenteEnabledChange: _handleFuenteEnabledChange,
    handleFuenteConfigChange: _handleFuenteConfigChange,
  } = useFuentesPago({
    valorTotal,
    tiposConCampos,
    cargandoTipos: cargandoTiposConCampos,
  })

  // Adaptadores de nombres al spec
  const handleFuenteEnabledChange = _handleFuenteEnabledChange
  const handleFuenteConfigChange = _handleFuenteConfigChange

  // ─── Validación manual de fuentes ────────────────────
  const [erroresFuentes, setErroresFuentes] = useState<Record<string, string>>(
    {}
  )
  const [mostrarErroresFuentes, setMostrarErroresFuentes] = useState(false)
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const validarFuentesManual = useCallback((): boolean => {
    const errores: Record<string, string> = {}
    fuentes
      .filter(f => f.enabled)
      .forEach(f => {
        const tipoConCampos = tiposConCampos.find(t => t.nombre === f.tipo)
        const camposConfig = tipoConCampos?.configuracion_campos?.campos ?? []
        // Respetar el flag requerido del campo — si requerido:false no bloquear
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
    setErroresFuentes(errores)
    return Object.keys(errores).length === 0
  }, [fuentes, tiposConCampos])

  // ─── Estado de cada sección (wizard pattern) ──────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (pasosCompletados.has(paso)) return 'completed'
      if (paso === pasoActual) return 'active'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ─── Progreso general ────────────────────────────────
  const progress = useMemo(
    () => Math.round((pasosCompletados.size / PASOS_ASIGNACION.length) * 100),
    [pasosCompletados]
  )

  // ─── Summaries por paso (estado completado) ──────────
  const summaryPaso1: SummaryItem[] = useMemo(() => {
    if (!viviendaSeleccionada) return []
    const proyecto = proyectos.find(p => p.id === proyectoSeleccionado)
    return [
      {
        label: 'Vivienda',
        value: `${viviendaSeleccionada.manzana_nombre} · Casa ${viviendaSeleccionada.numero}`,
      },
      { label: 'Proyecto', value: proyecto?.nombre },
      { label: 'Total', value: formatCurrency(valorTotal) },
    ]
  }, [viviendaSeleccionada, proyectos, proyectoSeleccionado, valorTotal])

  const summaryPaso2: SummaryItem[] = useMemo(() => {
    const fuentesOn = fuentes.filter(f => f.enabled).map(f => f.tipo)
    return [
      { label: 'Fuentes', value: fuentesOn.join(', ') || 'Ninguna' },
      { label: 'Cubierto', value: formatCurrency(totalFuentes) },
    ]
  }, [fuentes, totalFuentes])

  // ─── Validación por paso ──────────────────────────────
  const paso1Valido = useMemo(() => {
    const baseValido = !!viviendaId
    if (!aplicarDescuento) return baseValido
    return (
      baseValido &&
      descuentoAplicado > 0 &&
      !!tipoDescuento &&
      (motivoDescuento?.length ?? 0) >= 10
    )
  }, [
    viviendaId,
    aplicarDescuento,
    descuentoAplicado,
    tipoDescuento,
    motivoDescuento,
  ])

  const paso2Valido = sumaCierra && fuentes.some(f => f.enabled)

  // ─── Navegación (wizard pattern) ─────────────────────
  const irSiguiente = useCallback(async () => {
    setIsValidating(true)
    try {
      if (pasoActual === 1) {
        const valido = await trigger([
          'proyecto_id',
          'vivienda_id',
          'valor_negociado',
          'aplicar_descuento',
          'descuento_aplicado',
          'tipo_descuento',
          'motivo_descuento',
        ])
        if (!valido || !paso1Valido) return
        setPasosCompletados(prev => new Set(prev).add(1))
        setPasoActual(prev => Math.min(prev + 1, PASOS_ASIGNACION.length))
        return
      }

      if (pasoActual === 2) {
        if (!sumaCierra) {
          setMostrarErroresFuentes(true)
          return
        }
        const fuentesOk = validarFuentesManual()
        if (!fuentesOk) {
          setMostrarErroresFuentes(true)
          return
        }
        setPasosCompletados(prev => new Set(prev).add(2))
        setPasoActual(prev => Math.min(prev + 1, PASOS_ASIGNACION.length))
        return
      }
    } finally {
      setIsValidating(false)
    }
  }, [pasoActual, paso1Valido, sumaCierra, validarFuentesManual, trigger])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      if (pasosCompletados.has(paso)) {
        // Remover este paso y los siguientes de completados
        setPasosCompletados(prev => {
          const next = new Set(prev)
          for (let i = paso; i <= PASOS_ASIGNACION.length; i++) next.delete(i)
          return next
        })
        setPasoActual(paso)
      }
    },
    [pasosCompletados]
  )

  const handleCancelar = useCallback(() => {
    router.push(`/clientes/${clienteSlug ?? clienteId}`)
  }, [router, clienteSlug, clienteId])

  // ─── Submit final (paso 3) ───────────────────────────
  const handleSubmitFinal = useCallback(async () => {
    setErrorApi(null)

    // Guardia: las fuentes deben seguir cerrando. El usuario puede haber
    // modificado el descuento (paso 1) después de configurar fuentes (paso 2)
    // sin pasar por irSiguiente, dejando un desbalance silencioso.
    if (!sumaCierra) {
      setErrorApi(
        'Las fuentes de pago no cubren el total a financiar. Regresa al paso 2 y ajusta los montos.'
      )
      return
    }

    // Fix 2: verificar que la vivienda sigue disponible en el momento del submit
    const supabase = createClient()
    const { data: viviendaActual, error: errVivienda } = await supabase
      .from('viviendas')
      .select('estado')
      .eq('id', viviendaId)
      .single()

    const checkVivienda = validarViviendaDisponible(
      errVivienda ? null : (viviendaActual?.estado as EstadoVivienda | null)
    )
    if (!checkVivienda.ok) {
      setErrorApi(checkVivienda.error ?? 'Error verificando vivienda.')
      return
    }

    // Fix 1: verificar que el cliente no tenga ya una negociación activa
    const { data: negActiva, error: errNeg } = await supabase
      .from('negociaciones')
      .select('id')
      .eq('cliente_id', clienteId)
      .in('estado', ['Activa', 'Suspendida'])
      .maybeSingle()

    if (errNeg) {
      setErrorApi(
        'No se pudo verificar el estado del cliente. Intenta de nuevo.'
      )
      return
    }
    const checkNeg = validarSinNegociacionActiva(negActiva)
    if (!checkNeg.ok) {
      setErrorApi(checkNeg.error ?? 'Negociación activa existente.')
      return
    }

    const fuentesDTO: CrearFuentePagoDTO[] = fuentes
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
        // Resolver nombre e ID de entidad financiera
        const entidadNombre =
          (entidades.find(e => e.value === f.config.entidad)?.label ??
            f.config.entidad) ||
          undefined
        const entidadId =
          f.config.entidad_financiera_id ||
          entidades.find(e => e.label === entidadNombre)?.value ||
          undefined

        return {
          tipo: f.tipo,
          monto_aprobado: monto,
          capital_para_cierre: f.config.capital_para_cierre ?? undefined,
          parametrosCredito: f.config.parametrosCredito ?? undefined,
          entidad: entidadNombre,
          entidad_financiera_id: entidadId,
          numero_referencia: f.config.numero_referencia || undefined,
          permite_multiples_abonos:
            generaCuotas || (f.config.permite_multiples_abonos ?? false),
        }
      })

    // valor_negociado debe ser el precio PRE-descuento, porque useCrearNegociacion
    // calcula el total a financiar como (valor_negociado - descuento_aplicado)
    // y lo compara contra la suma de fuentes. Enviar el valor post-descuento
    // causaría una doble resta y fallaría la validación.
    const valorPreDescuento = valorTotal + descuentoAplicado

    const result = await crearNegociacion({
      cliente_id: clienteId,
      vivienda_id: viviendaId,
      valor_negociado: valorPreDescuento,
      descuento_aplicado: descuentoAplicado,
      tipo_descuento: tipoDescuento || undefined,
      motivo_descuento: motivoDescuento || undefined,
      valor_escritura_publica: valorEscrituraPublica ?? undefined,
      notas: notas ?? '',
      fecha_negociacion: fechaNegociacion
        ? formatDateForDB(fechaNegociacion)
        : undefined,
      fuentes_pago: fuentesDTO,
    })

    if (!result) return

    toast.success('¡Vivienda asignada exitosamente!', {
      description:
        'La negociación ha sido registrada y la vivienda asignada al cliente.',
      duration: 5000,
    })

    setShowSuccess(true)
    setTimeout(() => {
      router.push(`/clientes/${clienteSlug ?? clienteId}`)
    }, 1800)
  }, [
    sumaCierra,
    fuentes,
    tiposConCampos,
    entidades,
    crearNegociacion,
    clienteId,
    clienteSlug,
    viviendaId,
    valorTotal,
    descuentoAplicado,
    tipoDescuento,
    motivoDescuento,
    valorEscrituraPublica,
    notas,
    fechaNegociacion,
    router,
  ])

  // Limpiar errorApi al modificar campos
  const clearErrorApi = useCallback(() => {
    setErrorApi(null)
    limpiarNegociacion()
  }, [limpiarNegociacion])

  return {
    // Wizard config
    pasos: PASOS_ASIGNACION,
    pasoActual,
    pasosCompletados,
    getEstadoPaso,
    progress,
    summaryPaso1,
    summaryPaso2,
    showSuccess,
    isValidating,

    // Navegación (wizard)
    irSiguiente,
    irAtras,
    irAPaso,

    // RHF
    register,
    errors,
    touchedFields,
    setValue,
    watch,

    // Proyecto / Vivienda
    proyectos,
    viviendas,
    cargandoProyectos,
    cargandoViviendas,
    proyectoSeleccionado,
    viviendaId,
    viviendaSeleccionada,
    setProyectoSeleccionado,
    setViviendaId,

    // Valores calculados
    valorBase,
    gastosNotariales,
    recargoEsquinera,
    descuentoAplicado,
    valorTotal,

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

    // Validación
    paso1Valido,
    paso2Valido,

    // Guardado
    handleSubmitFinal,
    handleCancelar,
    creando,
    errorApi,
    clearErrorApi,
  }
}
