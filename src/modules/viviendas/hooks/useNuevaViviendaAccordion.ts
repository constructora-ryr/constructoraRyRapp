/**
 * useNuevaViviendaAccordion — orquesta la creación de vivienda en 5 pasos:
 * estado de cada paso, validación por paso (incluidas las reglas cruzadas),
 * resúmenes de los pasos cerrados y el guardado.
 */

import { useCallback, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import type {
  SectionStatus,
  SummaryItem,
} from '@/shared/components/accordion-wizard'

import {
  FIELDS_PASO_1,
  FIELDS_PASO_2,
  FIELDS_PASO_3,
  FIELDS_PASO_4,
  nuevaViviendaAccordionSchema,
  PASOS_VIVIENDA,
} from '../schemas/nueva-vivienda-accordion.schema'
import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { viviendasService } from '../services/viviendas.service'
import type { ViviendaFormData } from '../types'
import { formatCurrency } from '../utils'

import { useNombresUbicacion } from './usePasoUbicacion'
import { useViviendaFinanciero } from './useViviendaFinanciero'
import { useCrearViviendaMutation } from './useViviendasQuery'

export type { ViviendaFormValues } from '../schemas/nueva-vivienda-accordion.schema'
export { PASOS_VIVIENDA }

const TOTAL_PASOS = PASOS_VIVIENDA.length
const CAMPOS_POR_PASO: Record<number, readonly (keyof ViviendaSchemaType)[]> = {
  1: FIELDS_PASO_1,
  2: FIELDS_PASO_2,
  3: FIELDS_PASO_3,
  4: FIELDS_PASO_4,
}

export function useNuevaViviendaAccordion() {
  const router = useRouter()
  const crearMutation = useCrearViviendaMutation({ showToast: false })

  const [pasoActual, setPasoActual] = useState(1)
  const [completados, setCompletados] = useState<Set<number>>(new Set())
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    watch,
    setValue,
    trigger,
    setError,
    getValues,
    formState: { errors },
  } = useForm<ViviendaSchemaType>({
    resolver: zodResolver(
      nuevaViviendaAccordionSchema
    ) as unknown as Resolver<ViviendaSchemaType>,
    mode: 'onTouched',
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
      area_lote: '' as unknown as number,
      area_construida: '' as unknown as number,
      tipo_vivienda: 'Regular',
      valor_base: 0,
      es_esquinera: false,
      recargo_esquinera: 0,
    },
  })

  const formData = watch()
  const nombres = useNombresUbicacion(formData.proyecto_id, formData.manzana_id)
  const financiero = useViviendaFinanciero({
    valor_base: formData.valor_base ?? 0,
    es_esquinera: formData.es_esquinera ?? false,
    recargo_esquinera: formData.recargo_esquinera ?? 0,
  })

  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus =>
      completados.has(paso)
        ? 'completed'
        : paso === pasoActual
          ? 'active'
          : 'pending',
    [pasoActual, completados]
  )

  // ── Resúmenes de los pasos cerrados ─────────────────
  const resumenes = useMemo((): Record<number, SummaryItem[]> => {
    const linderos = [
      formData.lindero_norte,
      formData.lindero_sur,
      formData.lindero_oriente,
      formData.lindero_occidente,
    ].filter(Boolean).length
    return {
      1: [
        { label: 'Proyecto', value: nombres.proyecto ?? undefined },
        {
          label: 'Manzana',
          value: nombres.manzana ? `Mz. ${nombres.manzana}` : undefined,
        },
        {
          label: 'Casa',
          value: formData.numero ? `#${formData.numero}` : undefined,
        },
      ],
      2: [{ label: 'Linderos', value: `${linderos} de 4 linderos` }],
      3: [
        {
          label: 'Matrícula',
          value: formData.matricula_inmobiliaria || undefined,
        },
        {
          label: 'Áreas',
          value: formData.area_lote
            ? `${formData.area_lote} / ${formData.area_construida} m²`
            : undefined,
        },
      ],
      4: [
        {
          label: 'Valor total',
          value: formatCurrency(financiero.resumenFinanciero.valor_total),
        },
      ],
    }
  }, [formData, nombres, financiero.resumenFinanciero.valor_total])

  // ── Reglas que cruzan campos o consultan la BD ──────
  const validarReglasExtra = useCallback(
    async (paso: number): Promise<boolean> => {
      const valores = getValues()
      if (paso === 3) {
        if (Number(valores.area_construida) > Number(valores.area_lote)) {
          setError('area_construida', {
            type: 'manual',
            message: 'No puede ser mayor que el área del lote',
          })
          return false
        }
        try {
          const r = await viviendasService.verificarMatriculaUnica(
            valores.matricula_inmobiliaria.trim()
          )
          if (!r.esUnica && r.viviendaDuplicada) {
            setError('matricula_inmobiliaria', {
              type: 'manual',
              message: `Ya registrada en Mz. ${r.viviendaDuplicada.manzana} casa ${r.viviendaDuplicada.numero}`,
            })
            return false
          }
        } catch {
          // Sin red no se bloquea: el índice único de la BD lo impide al guardar
        }
      }
      if (paso === 4 && valores.es_esquinera && !valores.recargo_esquinera) {
        setError('recargo_esquinera', {
          type: 'manual',
          message: 'Elige el recargo de la esquinera',
        })
        return false
      }
      return true
    },
    [getValues, setError]
  )

  const validarPaso = useCallback(
    async (paso: number): Promise<boolean> => {
      const campos = CAMPOS_POR_PASO[paso]
      if (!campos) return true
      setIsValidating(true)
      try {
        return (await trigger([...campos])) && (await validarReglasExtra(paso))
      } finally {
        setIsValidating(false)
      }
    },
    [trigger, validarReglasExtra]
  )

  // ── Navegación ──────────────────────────────────────
  const reabrirDesde = useCallback((paso: number) => {
    setCompletados(prev => new Set([...prev].filter(p => p < paso)))
    setPasoActual(paso)
  }, [])

  const irSiguiente = useCallback(async () => {
    if (!(await validarPaso(pasoActual))) return
    setCompletados(prev => new Set(prev).add(pasoActual))
    setPasoActual(prev => Math.min(prev + 1, TOTAL_PASOS))
  }, [pasoActual, validarPaso])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      if (completados.has(paso)) reabrirDesde(paso)
    },
    [completados, reabrirDesde]
  )

  // ── Guardar ─────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const valores = getValues()
    const datos = {
      ...valores,
      area_lote: Number(valores.area_lote),
      area_construida: Number(valores.area_construida),
      valor_base: Number(valores.valor_base),
      recargo_esquinera: valores.es_esquinera
        ? Number(valores.recargo_esquinera) || 0
        : 0,
    } as unknown as ViviendaFormData

    try {
      await crearMutation.mutateAsync(datos)
      setShowSuccess(true)
      setTimeout(() => router.push('/viviendas'), 1200)
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'No se pudo crear la vivienda'
      toast.error('No se pudo crear la vivienda', { description: mensaje })
      // Llevar al paso del campo en conflicto, con el error en el campo
      if (mensaje.includes('matrícula')) {
        reabrirDesde(3)
        setError('matricula_inmobiliaria', { type: 'manual', message: mensaje })
      } else if (mensaje.includes('casa')) {
        reabrirDesde(1)
        setError('numero', { type: 'manual', message: mensaje })
      }
    }
  }, [getValues, crearMutation, router, reabrirDesde, setError])

  return {
    pasos: PASOS_VIVIENDA,
    pasoActual,
    getEstadoPaso,
    irSiguiente,
    irAtras,
    irAPaso,
    resumenes,
    nombres,

    register,
    errors,
    setValue,
    watch,
    formData,

    ...financiero,

    handleSubmit,
    isSubmitting: crearMutation.isPending,
    isValidating,
    showSuccess,
  }
}
