/**
 * useEditarVivienda - Hook PROFESIONAL para edición de viviendas
 * ✅ React Hook Form con Zod validation
 * ✅ React Query para mutations y cache
 * ✅ Wizard multi-paso con validación por paso
 * ✅ Separación de responsabilidades ESTRICTA
 *
 * Orquestador: delega en useEditarViviendaData y useEditarViviendaCalculos
 */

import { useCallback, useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { errorLog } from '@/lib/utils/logger'

import {
  paso1Schema,
  paso2Schema,
  paso3SchemaBase,
  paso4Schema,
  viviendaFullSchema,
  type ViviendaSchemaType,
} from '../schemas/vivienda.schemas'
import { viviendasService } from '../services/viviendas.service'
import type { Vivienda, ViviendaFormData } from '../types'

import {
  useEditarViviendaCalculos,
  type ImpactoFinanciero,
} from './useEditarViviendaCalculos'
import { useEditarViviendaData } from './useEditarViviendaData'

// ==================== TIPOS EXPORTADOS ====================

export interface NegociacionImpacto {
  id: string
  valor_negociado: number
  descuento_aplicado: number
  total_abonado: number
  saldo_pendiente: number
  estado: string
  cliente_id: string
  cliente_nombre: string
}

export type { ImpactoFinanciero }

// ==================== PASOS ====================

const PASOS = [
  {
    id: 1,
    key: 'ubicacion' as const,
    titulo: 'Ubicación',
    schema: paso1Schema,
  },
  { id: 2, key: 'linderos' as const, titulo: 'Linderos', schema: paso2Schema },
  { id: 3, key: 'legal' as const, titulo: 'Legal', schema: paso3SchemaBase },
  {
    id: 4,
    key: 'financiero' as const,
    titulo: 'Financiero',
    schema: paso4Schema,
  },
]

// ==================== PROPS ====================

interface UseEditarViviendaProps {
  vivienda: Vivienda | null
  onSuccess?: (viviendaActualizada: Vivienda) => void
  onCancel?: () => void
}

type FormData = ViviendaSchemaType

// ==================== HOOK ====================

export function useEditarVivienda({
  vivienda,
  onSuccess,
  onCancel,
}: UseEditarViviendaProps) {
  const _router = useRouter()

  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<number[]>([])
  const [validandoMatricula, setValidandoMatricula] = useState(false)
  const [hayFormularioConCambios, setHayFormularioConCambios] = useState(false)
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] =
    useState(false)
  const [mostrarModalImpacto, setMostrarModalImpacto] = useState(false)
  const [sincronizandoNegociacion, setSincronizandoNegociacion] =
    useState(false)
  const [estadoModal, setEstadoModal] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [impactoFinancieroSnapshot, setImpactoFinancieroSnapshot] =
    useState<ImpactoFinanciero | null>(null)

  const esViviendaAsignada = vivienda?.estado === 'Asignada'
  const esViviendaEntregada = vivienda?.estado === 'Entregada'
  const financieroBloqueado = esViviendaEntregada

  const {
    proyectos,
    cargandoProyectos,
    gastosNotariales,
    configuracionRecargos,
    manzanas,
    cargandoManzanas,
    negociacionActiva,
    actualizarMutation,
  } = useEditarViviendaData({ vivienda, esViviendaAsignada })

  const {
    register,
    formState: { errors, isDirty },
    setValue,
    watch,
    trigger,
    getValues,
    reset,
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(viviendaFullSchema) as Resolver<FormData>,
    mode: 'onChange',
    defaultValues: {
      proyecto_id: '',
      manzana_id: '',
      numero: '',
      lindero_norte: '',
      lindero_sur: '',
      lindero_oriente: '',
      lindero_occidente: '',
      matricula_inmobiliaria: '',
      nomenclatura: '',
      area_lote: 0,
      area_construida: 0,
      tipo_vivienda: '',
      valor_base: 0,
      es_esquinera: false,
      recargo_esquinera: 0,
    },
  })

  useEffect(() => {
    if (vivienda) {
      reset({
        proyecto_id: vivienda.manzanas?.proyecto_id || '',
        manzana_id: vivienda.manzana_id,
        numero: String(vivienda.numero),
        lindero_norte: vivienda.lindero_norte || '',
        lindero_sur: vivienda.lindero_sur || '',
        lindero_oriente: vivienda.lindero_oriente || '',
        lindero_occidente: vivienda.lindero_occidente || '',
        matricula_inmobiliaria: vivienda.matricula_inmobiliaria || '',
        nomenclatura: vivienda.nomenclatura || '',
        area_lote: vivienda.area_lote || 0,
        area_construida: vivienda.area_construida || 0,
        tipo_vivienda: vivienda.tipo_vivienda || '',
        valor_base: vivienda.valor_base || 0,
        es_esquinera: vivienda.es_esquinera || false,
        recargo_esquinera: vivienda.recargo_esquinera || 0,
      })
      setPasosCompletados([1])
    }
  }, [vivienda, reset])

  useEffect(() => {
    setHayFormularioConCambios(isDirty)
  }, [isDirty])

  const formData = watch()
  const esEsquinera = watch('es_esquinera') ?? false
  const valorBase = watch('valor_base') ?? 0
  const recargoEsquinera = watch('recargo_esquinera') ?? 0

  const {
    resumenFinanciero,
    previewData,
    cambiosDetectados,
    impactoFinanciero,
    manzanaSeleccionada,
  } = useEditarViviendaCalculos({
    vivienda,
    formData: formData as unknown as ViviendaFormData,
    esEsquinera,
    valorBase,
    recargoEsquinera,
    gastosNotariales,
    proyectos,
    manzanas,
    negociacionActiva,
    esViviendaAsignada,
  })

  const pasoActualConfig = PASOS.find(p => p.id === pasoActual) || PASOS[0]
  const totalPasos = PASOS.length
  const progreso = (pasoActual / totalPasos) * 100
  const esPrimerPaso = pasoActual === 1
  const esUltimoPaso = pasoActual === totalPasos

  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    const pasoConfig = PASOS.find(p => p.id === pasoActual)
    if (!pasoConfig) return true
    if (pasoActual === 1 && vivienda) return true

    const valido = await trigger(
      Object.keys(pasoConfig.schema.shape) as Array<keyof FormData>
    )

    if (pasoActual === 3 && valido) {
      const erroresEncontrados: Array<{ campo: string; mensaje: string }> = []
      const areaLote = Number(getValues('area_lote'))
      const areaConstruida = Number(getValues('area_construida'))
      const matricula = getValues('matricula_inmobiliaria')

      if (areaConstruida > areaLote) {
        erroresEncontrados.push({
          campo: 'area_construida',
          mensaje: 'El área construida no puede ser mayor al área del lote',
        })
      }

      if (matricula && matricula !== vivienda?.matricula_inmobiliaria) {
        setValidandoMatricula(true)
        try {
          const resultado = await viviendasService.verificarMatriculaUnica(
            matricula,
            vivienda?.id
          )
          if (!resultado.esUnica && resultado.viviendaDuplicada) {
            erroresEncontrados.push({
              campo: 'matricula_inmobiliaria',
              mensaje: `Esta matrícula ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`,
            })
          }
        } catch {
          erroresEncontrados.push({
            campo: 'matricula_inmobiliaria',
            mensaje: 'Error al validar la matrícula. Intenta nuevamente.',
          })
        } finally {
          setValidandoMatricula(false)
        }
      }

      if (erroresEncontrados.length > 0) {
        erroresEncontrados.forEach(err => {
          setError(err.campo as keyof FormData, {
            type: 'manual',
            message: err.mensaje,
          })
        })
        return false
      }
    }

    return valido
  }, [pasoActual, trigger, getValues, vivienda, setError])

  const irSiguiente = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return
    if (!pasosCompletados.includes(pasoActual)) {
      setPasosCompletados(prev => [...prev, pasoActual])
    }
    if (pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1)
    }
  }, [pasoActual, totalPasos, validarPasoActual, pasosCompletados])

  const irAtras = useCallback(() => {
    if (pasoActual > 1) setPasoActual(pasoActual - 1)
  }, [pasoActual])

  const irAPaso = useCallback(
    (paso: number) => {
      if (pasosCompletados.includes(paso) || paso === pasoActual) {
        setPasoActual(paso)
      } else {
        toast.warning('Completa el paso actual', {
          description: 'Debes completar el paso actual antes de avanzar',
        })
      }
    },
    [pasosCompletados, pasoActual]
  )

  const mostrarConfirmacion = useCallback(() => {
    if (impactoFinanciero) {
      setImpactoFinancieroSnapshot(impactoFinanciero)
      setMostrarModalImpacto(true)
      return
    }
    setMostrarModalConfirmacion(true)
  }, [impactoFinanciero])

  const confirmarYGuardar = useCallback(
    async (sincronizarNeg = false) => {
      if (!vivienda) return
      const data = getValues()

      const updateData: Partial<ViviendaFormData> = {
        lindero_norte: data.lindero_norte,
        lindero_sur: data.lindero_sur,
        lindero_oriente: data.lindero_oriente,
        lindero_occidente: data.lindero_occidente,
        matricula_inmobiliaria: data.matricula_inmobiliaria,
        nomenclatura: data.nomenclatura,
        area_lote: Number(data.area_lote),
        area_construida: Number(data.area_construida),
        tipo_vivienda: data.tipo_vivienda as ViviendaFormData['tipo_vivienda'],
      }

      if (!esViviendaEntregada) {
        updateData.valor_base = data.valor_base
        updateData.es_esquinera = data.es_esquinera
        updateData.recargo_esquinera = data.recargo_esquinera
      }

      setEstadoModal('loading')

      try {
        const viviendaActualizada = await actualizarMutation.mutateAsync({
          id: vivienda.id,
          data: updateData,
        })

        if (sincronizarNeg && impactoFinanciero && negociacionActiva) {
          setSincronizandoNegociacion(true)
          try {
            await viviendasService.sincronizarNegociacionConVivienda(
              negociacionActiva.id,
              data.valor_base
            )
            toast.info(
              'Valor de negociación actualizado. Recuerda redistribuir las fuentes de pago.',
              { duration: 6000 }
            )
          } catch {
            toast.error(
              'La vivienda se actualizó, pero hubo un error sincronizando la negociación.'
            )
          } finally {
            setSincronizandoNegociacion(false)
          }
        } else if (impactoFinanciero && !sincronizarNeg) {
          toast.warning(
            'El valor de la vivienda cambió pero la negociación mantiene el valor anterior.',
            { duration: 5000 }
          )
        }

        setEstadoModal('success')
        setHayFormularioConCambios(false)

        setTimeout(() => {
          setMostrarModalConfirmacion(false)
          setMostrarModalImpacto(false)
          setImpactoFinancieroSnapshot(null)
          setEstadoModal('idle')
          onSuccess?.(viviendaActualizada)
        }, 1200)
      } catch {
        errorLog('useEditarVivienda.confirmarYGuardar', 'Error en submit')
        setEstadoModal('error')
      }
    },
    [
      vivienda,
      actualizarMutation,
      onSuccess,
      getValues,
      esViviendaEntregada,
      impactoFinanciero,
      negociacionActiva,
    ]
  )

  const cancelar = useCallback(() => {
    if (hayFormularioConCambios) {
      toast.warning('¿Salir sin guardar?', {
        description: 'Los cambios no guardados se perderán.',
        action: {
          label: 'Sí, salir',
          onClick: () => {
            setPasoActual(1)
            setHayFormularioConCambios(false)
            onCancel?.()
          },
        },
        cancel: { label: 'Quedarse', onClick: () => undefined },
        duration: 6000,
      })
      return
    }
    setPasoActual(1)
    setHayFormularioConCambios(false)
    onCancel?.()
  }, [hayFormularioConCambios, onCancel])

  return {
    register,
    errors,
    setValue,
    watch,
    formData,
    pasoActual,
    pasoActualConfig,
    totalPasos,
    progreso,
    esPrimerPaso,
    esUltimoPaso,
    pasosCompletados,
    pasos: PASOS,
    previewData,
    resumenFinanciero,
    cambiosDetectados,
    proyectos,
    manzanas,
    manzanaSeleccionada,
    gastosNotariales,
    configuracionRecargos,
    cargandoProyectos,
    cargandoManzanas,
    validandoMatricula,
    submitting: actualizarMutation.isPending,
    hayFormularioConCambios,
    mostrarModalConfirmacion,
    setMostrarModalConfirmacion,
    estadoModal,
    setEstadoModal,
    mostrarModalImpacto,
    setMostrarModalImpacto,
    impactoFinanciero: impactoFinancieroSnapshot ?? impactoFinanciero,
    sincronizandoNegociacion,
    esViviendaAsignada,
    esViviendaEntregada,
    financieroBloqueado,
    negociacionActiva,
    irSiguiente,
    irAtras,
    irAPaso,
    cancelar,
    mostrarConfirmacion,
    confirmarYGuardar,
  }
}
