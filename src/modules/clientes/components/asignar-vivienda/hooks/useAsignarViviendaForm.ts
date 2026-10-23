/**
 * Hook para formulario de Asignar Vivienda
 * ✅ React Hook Form + Zod (ESTÁNDAR DE LA APLICACIÓN)
 * ✅ Validación por paso
 * ✅ Sistema touchedFields (no mostrar errores hasta interacción)
 */

import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  esCreditoHipotecario,
  esCuotaInicial,
  esSubsidioCajaCompensacion,
  esSubsidioMiCasaYa,
} from '@/shared/constants/fuentes-pago.constants'

import type { AsignarViviendaFormData } from '../schemas'
import { asignarViviendaSchema } from '../schemas'

interface UseAsignarViviendaFormProps {
  initialData?: Partial<AsignarViviendaFormData>
  currentStep: number
}

export function useAsignarViviendaForm({
  initialData,
  currentStep: _currentStep,
}: UseAsignarViviendaFormProps) {
  // ============================================
  // REACT HOOK FORM CON ZOD
  // ============================================

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting, isValid },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<AsignarViviendaFormData>({
    resolver: zodResolver(asignarViviendaSchema),
    mode: 'onChange', // Validar mientras escribe
    defaultValues: {
      proyecto_id: initialData?.proyecto_id || '',
      vivienda_id: initialData?.vivienda_id || '',
      valor_negociado: initialData?.valor_negociado || 0,
      aplicar_descuento: initialData?.aplicar_descuento || false,
      descuento_aplicado: initialData?.descuento_aplicado || 0,
      tipo_descuento: initialData?.tipo_descuento || '',
      motivo_descuento: initialData?.motivo_descuento || '',
      // Se llena con el total de la casa al elegirla (ver useAsignarViviendaV2)
      valor_escritura_publica: initialData?.valor_escritura_publica || 0,
      notas: initialData?.notas || '',
      fuentes: initialData?.fuentes || [],
      valor_total: initialData?.valor_total || 0,
    },
  })

  // ============================================
  // VALORES OBSERVADOS
  // ============================================

  const proyecto_id = watch('proyecto_id')
  const vivienda_id = watch('vivienda_id')
  const valor_negociado = watch('valor_negociado')
  const aplicar_descuento = watch('aplicar_descuento')
  const descuento_aplicado = watch('descuento_aplicado')
  const tipo_descuento = watch('tipo_descuento')
  const motivo_descuento = watch('motivo_descuento')
  const valor_escritura_publica = watch('valor_escritura_publica')
  const notas = watch('notas')
  const fuentes = watch('fuentes')
  const valor_total = watch('valor_total')

  // ============================================
  // VALIDACIÓN POR PASO
  // ============================================

  // Validar SOLO campos del paso actual
  const validarPaso = async (step: number): Promise<boolean> => {
    let isValid = false

    switch (step) {
      case 1:
        // Validar paso 1 (incluir todos los campos de descuento)
        isValid = await trigger([
          'proyecto_id',
          'vivienda_id',
          'valor_negociado',
          'aplicar_descuento',
          'descuento_aplicado',
          'tipo_descuento',
          'motivo_descuento',
          'valor_escritura_publica',
        ])
        break

      case 2:
        // Validar paso 2
        isValid = await trigger(['fuentes', 'valor_total'])
        break

      case 3:
        // Paso 3 es solo revisión, no tiene validación
        isValid = true
        break

      default:
        isValid = false
    }

    return isValid
  }

  // ============================================
  // PASO 1: HELPERS
  // ============================================

  const paso1Valido = () => {
    const descuento = descuento_aplicado ?? 0
    return (
      !!proyecto_id &&
      !!vivienda_id &&
      valor_negociado > 0 &&
      descuento >= 0 &&
      descuento < valor_negociado
    )
  }

  const camposCompletadosPaso1 = () => {
    const descuento = descuento_aplicado ?? 0
    return [
      !!proyecto_id,
      !!vivienda_id,
      valor_negociado > 0,
      descuento >= 0 && descuento < valor_negociado,
    ].filter(Boolean).length
  }

  const porcentajeProgresoPaso1 = () => {
    return Math.round((camposCompletadosPaso1() / 4) * 100)
  }

  // ============================================
  // PASO 2: HELPERS
  // ============================================

  const totalFuentes = fuentes.reduce(
    (acc: number, f: { monto_aprobado?: number | null }) =>
      acc + (f.monto_aprobado ?? 0),
    0
  )
  const diferencia = valor_total - totalFuentes
  const sumaCierra = Math.abs(diferencia) < 0.01

  const paso2Valido = () => {
    return (
      fuentes.length > 0 &&
      sumaCierra &&
      fuentes.every(
        (f: {
          tipo?: string
          monto_aprobado?: number | null
          entidad?: string | null
          numero_referencia?: string | null
          fecha_acta?: string | null
        }) => {
          // Validar monto obligatorio para todas las fuentes
          const montoValido = (f.monto_aprobado ?? 0) > 0

          // Cuota Inicial: solo requiere monto
          if (esCuotaInicial(f.tipo)) {
            return montoValido
          }

          // Subsidio Mi Casa Ya: requiere monto, entidad NO es obligatoria, numero_referencia es opcional
          if (esSubsidioMiCasaYa(f.tipo)) {
            return montoValido
          }

          // Crédito Hipotecario: requiere monto, entidad (banco), numero_referencia
          if (esCreditoHipotecario(f.tipo)) {
            const entidadValida = f.entidad && f.entidad.trim() !== ''
            const numeroValido =
              f.numero_referencia && f.numero_referencia.trim() !== ''
            return montoValido && entidadValida && numeroValido
          }

          // Subsidio Caja Compensación: requiere monto, entidad (caja), numero_referencia (acta), fecha_acta
          if (esSubsidioCajaCompensacion(f.tipo)) {
            const entidadValida = f.entidad && f.entidad.trim() !== ''
            const numeroValido =
              f.numero_referencia && f.numero_referencia.trim() !== ''
            const fechaActaValida = f.fecha_acta && f.fecha_acta.trim() !== ''
            return (
              montoValido && entidadValida && numeroValido && fechaActaValida
            )
          }

          // Fallback: requiere monto, entidad y número
          const entidadValida = f.entidad && f.entidad.trim() !== ''
          const numeroValido =
            f.numero_referencia && f.numero_referencia.trim() !== ''
          return montoValido && entidadValida && numeroValido
        }
      )
    )
  }

  // ============================================
  // RESET AL CAMBIAR INITIALDATA
  // ============================================

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset]) // reset de React Hook Form es estable por definición

  // ============================================
  // RETURN
  // ============================================

  return {
    // React Hook Form
    register,
    handleSubmit,
    errors,
    touchedFields, // ✅ SISTEMA ESTÁNDAR: mostrar error solo si touched
    isSubmitting,
    isValid,
    setValue,
    watch,
    trigger,
    reset,

    // Valores observados
    proyecto_id,
    vivienda_id,
    valor_negociado,
    aplicar_descuento,
    descuento_aplicado,
    tipo_descuento,
    motivo_descuento,
    valor_escritura_publica,
    notas,
    fuentes,
    valor_total,

    // Validación por paso
    validarPaso,
    paso1Valido: paso1Valido(),
    paso2Valido: paso2Valido(),

    // Progreso Paso 1
    camposCompletadosPaso1: camposCompletadosPaso1(),
    porcentajeProgresoPaso1: porcentajeProgresoPaso1(),

    // Progreso Paso 2
    totalFuentes,
    diferencia,
    sumaCierra,
  }
}
