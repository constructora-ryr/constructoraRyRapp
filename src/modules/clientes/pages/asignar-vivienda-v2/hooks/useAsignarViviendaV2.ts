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
import {
  formatDateForDB,
  formatDateShort,
  getTodayDateString,
} from '@/lib/utils/date.utils'
import { formatCurrency } from '@/lib/utils/format.utils'
import { getShortId } from '@/lib/utils/slug.utils'
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
  erroresDeFuentes,
  type EstadoVivienda,
  problemasPaso1,
  problemasPasoFuentes,
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
    title: 'Vivienda y valores',
    description:
      'Elige el proyecto y la casa: verás su valor y el total que el cliente debe cubrir.\nSi hay un descuento autorizado, actívalo e indica el monto, el tipo y el motivo (queda registrado).\nEl valor en escritura pública arranca con el total de la casa; cámbialo solo si en la escritura figura otro.\nSi ya se firmó la promesa de compraventa, registra su fecha como fecha de la negociación.',
    icon: Home,
  },
  {
    id: 2,
    title: 'Fuentes de pago',
    description:
      'Agrega las fuentes con las que el cliente pagará hasta cubrir el total.\nCada fuente muestra qué parte del total cubre; la barra suma todas.\nSi sobra dinero, el excedente se devolverá al cliente.',
    icon: Banknote,
  },
  {
    id: 3,
    title: 'Revisión y confirmación',
    description:
      'Revisa que todo esté bien: al confirmar, la casa queda asignada y empieza la negociación.',
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
  const {
    register,
    errors,
    touchedFields,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useAsignarViviendaForm({ currentStep: pasoActual })

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

  // valor_negociado = solo precio base (el trigger DB suma gastos_notariales y recargo_esquinera)
  useEffect(() => {
    setValue('valor_negociado', valorBase)
  }, [valorBase, setValue])

  // Valor en escritura: arranca con el total de la casa elegida (sin
  // descuento). Solo al cambiar de casa: si la lista se recarga no se pisa
  // lo que el usuario escribió.
  const totalCasa = valorBase + gastosNotariales + recargoEsquinera
  const totalCasaRef = useRef(totalCasa)
  totalCasaRef.current = totalCasa
  useEffect(() => {
    if (viviendaId) setValue('valor_escritura_publica', totalCasaRef.current)
  }, [viviendaId, setValue])

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

  // ─── Validación de fuentes ───────────────────────────
  // Se calcula en vivo: al corregir una fuente su error desaparece. Se
  // muestra después del primer intento de avanzar.
  const [mostrarErroresFuentes, setMostrarErroresFuentes] = useState(false)
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const erroresFuentes = useMemo(
    () => erroresDeFuentes(fuentes, tiposConCampos),
    [fuentes, tiposConCampos]
  )
  const problemasFuentes = useMemo(
    () =>
      problemasPasoFuentes({
        fuentesEnUso: fuentes.filter(f => f.enabled).length,
        diferencia,
        valorTotal,
        errores: erroresFuentes,
        formatear: formatCurrency,
      }),
    [fuentes, diferencia, valorTotal, erroresFuentes]
  )

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
      {
        label: 'Fecha',
        value: fechaNegociacion ? formatDateShort(fechaNegociacion) : 'Hoy',
      },
    ]
  }, [
    viviendaSeleccionada,
    proyectos,
    proyectoSeleccionado,
    valorTotal,
    fechaNegociacion,
  ])

  const summaryPaso2: SummaryItem[] = useMemo(() => {
    const fuentesOn = fuentes.filter(f => f.enabled).map(f => f.tipo)
    return [
      { label: 'Fuentes', value: fuentesOn.join(', ') || 'Ninguna' },
      { label: 'Cubierto', value: formatCurrency(totalFuentes) },
    ]
  }, [fuentes, totalFuentes])

  // ─── Validación por paso ──────────────────────────────
  const [intentoPaso1, setIntentoPaso1] = useState(false)
  const problemasVivienda = useMemo(
    () =>
      problemasPaso1({
        viviendaId,
        valorBase,
        valorEscritura: valorEscrituraPublica,
        aplicarDescuento: !!aplicarDescuento,
        descuento: descuentoAplicado,
        tipoDescuento,
        motivoDescuento,
        fechaNegociacion,
        hoy: getTodayDateString(),
      }),
    [
      viviendaId,
      valorBase,
      valorEscrituraPublica,
      aplicarDescuento,
      descuentoAplicado,
      tipoDescuento,
      motivoDescuento,
      fechaNegociacion,
    ]
  )

  const paso1Valido = problemasVivienda.length === 0
  const paso2Valido = problemasFuentes.length === 0

  // ─── Navegación (wizard pattern) ─────────────────────
  const irSiguiente = useCallback(async () => {
    if (pasoActual === 1) {
      setIntentoPaso1(true)
      if (problemasVivienda.length > 0) {
        // Cada error también se marca en su campo
        for (const p of problemasVivienda) {
          setError(p.campo, { type: 'manual', message: p.mensaje })
        }
        return
      }
      clearErrors()
      setPasosCompletados(prev => new Set(prev).add(1))
      setPasoActual(prev => Math.min(prev + 1, PASOS_ASIGNACION.length))
      return
    }

    if (pasoActual === 2) {
      setMostrarErroresFuentes(true)
      if (problemasFuentes.length > 0) return
      setPasosCompletados(prev => new Set(prev).add(2))
      setPasoActual(prev => Math.min(prev + 1, PASOS_ASIGNACION.length))
    }
  }, [pasoActual, problemasVivienda, problemasFuentes, setError, clearErrors])

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
    router.push(`/clientes/${clienteSlug ?? getShortId(clienteId)}`)
  }, [router, clienteSlug, clienteId])

  // ─── Submit final (paso 3) ───────────────────────────
  const handleSubmitFinal = useCallback(async () => {
    setErrorApi(null)
    setIsValidating(true)

    try {
      // Guardia: los pasos anteriores deben seguir válidos. El usuario puede
      // haber vuelto al paso 1 (descuento, casa) después de configurar las
      // fuentes sin pasar por "Siguiente".
      if (problemasVivienda.length > 0) {
        setErrorApi(`Revisa el paso 1: ${problemasVivienda[0].mensaje}`)
        return
      }
      if (problemasFuentes.length > 0) {
        setErrorApi(`Revisa el paso 2: ${problemasFuentes[0]}`)
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

          // El campo de fecha varía según el tipo ("fecha_acta" vs "fecha_resolucion"), buscamos por tipo 'date'.
          const tipoConCamposActual = tiposConCampos.find(
            t => t.nombre === f.tipo
          )
          const camposConfigActual =
            tipoConCamposActual?.configuracion_campos?.campos ?? []
          const fechaCampo = camposConfigActual.find(c => c.tipo === 'date')
          const fechaActaVal = fechaCampo
            ? f.config.campos?.[fechaCampo.nombre]
            : undefined
          const fechaActa =
            fechaActaVal && String(fechaActaVal).trim() !== ''
              ? String(fechaActaVal)
              : undefined

          return {
            tipo: f.tipo,
            monto_aprobado: monto,
            capital_para_cierre: f.config.capital_para_cierre ?? undefined,
            parametrosCredito: f.config.parametrosCredito ?? undefined,
            entidad: entidadNombre,
            entidad_financiera_id: entidadId,
            numero_referencia: f.config.numero_referencia || undefined,
            fecha_acta: fechaActa,
            permite_multiples_abonos:
              generaCuotas || (f.config.permite_multiples_abonos ?? false),
          }
        })

      // valor_negociado = solo valor_base (sin gastos_notariales ni recargo_esquinera).
      // El trigger calcular_valor_total_pagar() suma esos extras automáticamente:
      //   valor_total_pagar = valor_negociado - descuento + gastos + recargo
      // Si enviáramos valor_negociado = valorBase + gastos, el trigger los sumaría
      // de nuevo → doble conteo y descuadre de exactamente gastos_notariales.
      const result = await crearNegociacion({
        cliente_id: clienteId,
        vivienda_id: viviendaId,
        valor_negociado: valorBase,
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
    } finally {
      setIsValidating(false)
    }
    setTimeout(() => {
      router.push(`/clientes/${clienteSlug ?? getShortId(clienteId)}`)
    }, 1800)
  }, [
    problemasVivienda,
    problemasFuentes,
    fuentes,
    tiposConCampos,
    entidades,
    crearNegociacion,
    clienteId,
    clienteSlug,
    viviendaId,
    valorBase,
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

    // Validación: por qué no se puede avanzar (tras el primer intento)
    paso1Valido,
    paso2Valido,
    avisoPaso1: intentoPaso1 ? problemasVivienda.map(p => p.mensaje) : [],
    avisoPaso2: mostrarErroresFuentes ? problemasFuentes : [],

    // Guardado
    handleSubmitFinal,
    handleCancelar,
    creando,
    errorApi,
    clearErrorApi,
  }
}
