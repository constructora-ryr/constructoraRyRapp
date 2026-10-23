/**
 * useNuevoClienteAccordion — orquesta la creación de cliente en 5 pasos:
 * estado de cada paso, validación (compartida con editar), resúmenes y el
 * guardado del cliente con su interés inicial.
 */

import { useCallback, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import type {
  SectionStatus,
  SummaryItem,
} from '@/shared/components/accordion-wizard'

import {
  clienteFormSchema,
  FIELDS_PASO_1_NUEVO_CLIENTE,
  FIELDS_PASO_2_NUEVO_CLIENTE,
  PASOS_CLIENTE,
  type ClienteFormValues,
} from '../schemas/nuevo-cliente-accordion.schema'
import { interesesService } from '../services/intereses.service'
import type { CrearClienteDTO, EstadoCivil, TipoDocumento } from '../types'
import { sanitizeCrearClienteDTO } from '../utils/sanitize-cliente.utils'
import {
  validarOpcionales,
  validarPasoContacto,
  validarPasoPersonal,
  type FormularioCliente,
} from '../utils/validacion-pasos-cliente'

import { useCrearClienteMutation } from './useClientesQuery'

export { PASOS_CLIENTE }

const TOTAL = PASOS_CLIENTE.length

export function useNuevoClienteAccordion() {
  const router = useRouter()
  const crearMutation = useCrearClienteMutation()

  const [pasoActual, setPasoActual] = useState(1)
  const [completados, setCompletados] = useState<Set<number>>(new Set())
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    mode: 'onTouched',
    defaultValues: {
      nombres: '',
      apellidos: '',
      tipo_documento: 'CC',
      numero_documento: '',
      fecha_nacimiento: '',
      estado_civil: '',
      telefono: '',
      telefono_alternativo: '',
      email: '',
      direccion: '',
      departamento: '',
      ciudad: '',
      proyecto_interes_id: '',
      vivienda_interes_id: '',
      notas_interes: '',
      notas: '',
    },
  })
  const { register, watch, setValue, getValues, setError, formState } = form
  const formData = watch()
  const f = form as unknown as FormularioCliente

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
  const resumenes = useMemo(
    (): Record<number, SummaryItem[]> => ({
      1: [
        {
          label: 'Nombre',
          value:
            `${formData.nombres} ${formData.apellidos}`.trim() || undefined,
        },
        {
          label: 'Documento',
          value: formData.numero_documento
            ? `${formData.tipo_documento} ${formData.numero_documento}`
            : undefined,
        },
      ],
      2: [
        { label: 'Teléfono', value: formData.telefono || undefined },
        { label: 'Correo', value: formData.email || undefined },
        { label: 'Ciudad', value: formData.ciudad || undefined },
      ],
      3: [
        {
          label: 'Interés',
          value: formData.proyecto_interes_id
            ? formData.vivienda_interes_id
              ? 'Proyecto y casa elegidos'
              : 'Proyecto elegido'
            : 'Sin interés definido',
        },
      ],
      4: [
        {
          label: 'Notas',
          value: formData.notas ? 'Con notas' : 'Sin notas',
        },
      ],
    }),
    [formData]
  )

  // ── Validación ──────────────────────────────────────
  const validarPaso = useCallback(
    async (paso: number): Promise<boolean> => {
      setIsValidating(true)
      try {
        if (paso === 1)
          return await validarPasoPersonal(f, FIELDS_PASO_1_NUEVO_CLIENTE)
        if (paso === 2)
          return await validarPasoContacto(f, FIELDS_PASO_2_NUEVO_CLIENTE)
        if (paso === 3) return await validarOpcionales(f, ['notas_interes'])
        if (paso === 4) return await validarOpcionales(f, ['notas'])
        return true
      } finally {
        setIsValidating(false)
      }
    },
    [f]
  )

  // ── Navegación ──────────────────────────────────────
  const reabrirDesde = useCallback((paso: number) => {
    setCompletados(prev => new Set([...prev].filter(p => p < paso)))
    setPasoActual(paso)
  }, [])

  const irSiguiente = useCallback(async () => {
    if (!(await validarPaso(pasoActual))) return
    setCompletados(prev => new Set(prev).add(pasoActual))
    setPasoActual(prev => Math.min(prev + 1, TOTAL))
  }, [pasoActual, validarPaso])

  const irAtras = useCallback(
    () => setPasoActual(prev => Math.max(prev - 1, 1)),
    []
  )

  const irAPaso = useCallback(
    (paso: number) => {
      if (completados.has(paso)) reabrirDesde(paso)
    },
    [completados, reabrirDesde]
  )

  // ── Guardar ─────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const v = getValues()
    const dto: CrearClienteDTO = {
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      tipo_documento: v.tipo_documento as TipoDocumento,
      numero_documento: v.numero_documento.trim(),
      fecha_nacimiento: v.fecha_nacimiento || undefined,
      estado_civil: (v.estado_civil || undefined) as EstadoCivil | undefined,
      telefono: v.telefono || undefined,
      telefono_alternativo: v.telefono_alternativo || undefined,
      email: v.email || undefined,
      direccion: v.direccion || undefined,
      departamento: v.departamento,
      ciudad: v.ciudad,
      notas: v.notas || undefined,
    }

    let cliente
    try {
      cliente = await crearMutation.mutateAsync(sanitizeCrearClienteDTO(dto))
    } catch (error) {
      // El toast de error lo muestra la mutación
      if (error instanceof Error && error.message.includes('documento')) {
        reabrirDesde(1)
        setError('numero_documento', { type: 'manual', message: error.message })
      }
      return
    }

    // El interés se guarda aparte: si falla, el cliente ya quedó creado
    if (v.proyecto_interes_id) {
      try {
        await interesesService.crearInteres({
          cliente_id: cliente.id,
          proyecto_id: v.proyecto_interes_id,
          vivienda_id: v.vivienda_interes_id || undefined,
          notas: v.notas_interes || undefined,
        })
      } catch {
        toast.warning('El cliente se creó, pero no se guardó su interés', {
          description: 'Agrégalo desde la pestaña Intereses de su detalle.',
        })
      }
    }

    setShowSuccess(true)
    setTimeout(() => router.push('/clientes'), 1200)
  }, [getValues, crearMutation, reabrirDesde, setError, router])

  return {
    pasos: PASOS_CLIENTE,
    pasoActual,
    getEstadoPaso,
    irSiguiente,
    irAtras,
    irAPaso,
    resumenes,

    register,
    errors: formState.errors,
    setValue,
    watch,
    formData,

    handleSubmit,
    isSubmitting: crearMutation.isPending,
    isValidating,
    showSuccess,
  }
}
