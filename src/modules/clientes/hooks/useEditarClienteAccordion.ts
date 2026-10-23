/**
 * useEditarClienteAccordion — Hook de edición de cliente
 * con Accordion Wizard (3 pasos: Personal, Contacto, Notas).
 *
 * ✅ Carga datos existentes con useClienteQuery
 * ✅ Zod + async validation (documento duplicado)
 * ✅ Detección de cambios en tiempo real
 * ✅ Modal de confirmación + submit
 * ✅ Sanitización antes de guardar
 * ✅ Guard de cambios no guardados (useUnsavedChanges)
 *
 * Reglas de negocio: utils/validacion-pasos-cliente (compartidas con crear).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, FileText, Mail, MapPin, Phone, User } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useRouter } from 'next/navigation'

import { useUnsavedChanges } from '@/contexts/unsaved-changes-context'
import { getShortId } from '@/lib/utils/slug.utils'
import type {
  SectionStatus,
  SummaryItem,
} from '@/shared/components/accordion-wizard'
import type { CambioDetectado } from '@/shared/components/modulos/ConfirmarCambiosModal'

import {
  CATEGORIAS_CAMBIOS_CLIENTE,
  editarClienteSchema,
  FIELDS_PASO_1_EDITAR_CLIENTE as FIELDS_PASO_1,
  FIELDS_PASO_2_EDITAR_CLIENTE as FIELDS_PASO_2,
  PASOS_CLIENTE_EDICION,
  type EditarClienteFormValues,
} from '../schemas/editar-cliente-accordion.schema'
import type { ActualizarClienteDTO, EstadoCivil, TipoDocumento } from '../types'
import { sanitizeActualizarClienteDTO } from '../utils/sanitize-cliente.utils'
import {
  validarOpcionales,
  validarPasoContacto,
  validarPasoPersonal,
  type FormularioCliente,
} from '../utils/validacion-pasos-cliente'

import {
  useActualizarClienteMutation,
  useClienteQuery,
} from './useClientesQuery'

export { CATEGORIAS_CAMBIOS_CLIENTE, PASOS_CLIENTE_EDICION }

// ── Hook principal ────────────────────────────────────
export function useEditarClienteAccordion(clienteId: string) {
  const router = useRouter()
  const actualizarMutation = useActualizarClienteMutation()
  const { setHasUnsavedChanges, setMessage } = useUnsavedChanges()

  // Cargar datos del cliente
  const { data: cliente, isLoading, isError } = useClienteQuery(clienteId)

  const [pasoActual, setPasoActual] = useState(1)
  const [pasosCompletados, setPasosCompletados] = useState<Set<number>>(
    new Set()
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [datosOriginales, setDatosOriginales] =
    useState<EditarClienteFormValues | null>(null)

  // ── Formulario ──────────────────────────────────────
  const {
    register,
    watch,
    setValue,
    trigger,
    setError,
    getValues,
    reset,
    formState: { errors },
  } = useForm<EditarClienteFormValues>({
    resolver: zodResolver(editarClienteSchema),
    mode: 'onChange',
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
      notas: '',
    },
  })

  // ── Inicializar formulario con datos del cliente ────
  useEffect(() => {
    if (cliente && !datosOriginales) {
      const valores: EditarClienteFormValues = {
        nombres: cliente.nombres || '',
        apellidos: cliente.apellidos || '',
        tipo_documento: cliente.tipo_documento || 'CC',
        numero_documento: cliente.numero_documento || '',
        fecha_nacimiento: cliente.fecha_nacimiento || '',
        estado_civil: cliente.estado_civil || '',
        telefono: cliente.telefono || '',
        telefono_alternativo: cliente.telefono_alternativo || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        departamento: cliente.departamento || '',
        ciudad: cliente.ciudad || '',
        notas: cliente.notas || '',
      }
      reset(valores)
      setDatosOriginales(valores)
      // En edición todos los pasos están disponibles de inmediato; el paso 1
      // arranca activo y los demás se muestran como completados (con resumen).
      setPasosCompletados(new Set([2, 3]))
    }
  }, [cliente, datosOriginales, reset])

  const formData = watch()

  // ── Detección de cambios ────────────────────────────
  const cambiosDetectados = useMemo((): CambioDetectado[] => {
    if (!datosOriginales) return []

    const cambios: CambioDetectado[] = []

    const detectar = (
      campo: keyof EditarClienteFormValues,
      label: string,
      icono: import('lucide-react').LucideIcon,
      categoria: string
    ) => {
      const anterior = datosOriginales[campo] || ''
      const nuevo = formData[campo] || ''
      if (anterior !== nuevo) {
        cambios.push({
          campo,
          label,
          valorAnterior: anterior,
          valorNuevo: nuevo,
          icono,
          categoria,
        })
      }
    }

    // Paso 1: Personal
    detectar('nombres', 'Nombres', User, 'personal')
    detectar('apellidos', 'Apellidos', User, 'personal')
    detectar('tipo_documento', 'Tipo Documento', Building2, 'personal')
    detectar('numero_documento', 'Número Documento', Building2, 'personal')
    detectar('fecha_nacimiento', 'Fecha Nacimiento', User, 'personal')
    detectar('estado_civil', 'Estado Civil', User, 'personal')

    // Paso 2: Contacto
    detectar('telefono', 'Teléfono', Phone, 'contacto')
    detectar('telefono_alternativo', 'Teléfono Alternativo', Phone, 'contacto')
    detectar('email', 'Correo Electrónico', Mail, 'contacto')
    detectar('direccion', 'Dirección', MapPin, 'contacto')
    detectar('departamento', 'Departamento', MapPin, 'contacto')
    detectar('ciudad', 'Ciudad', MapPin, 'contacto')

    // Paso 3: Notas
    detectar('notas', 'Notas', FileText, 'notas')

    return cambios
  }, [formData, datosOriginales])

  const hayCambios = cambiosDetectados.length > 0

  // ── Guard de navegación: avisa si hay cambios sin guardar ──────────
  useEffect(() => {
    const nombre = cliente?.nombre_completo
      ? `"${cliente.nombre_completo}"`
      : 'este cliente'
    setHasUnsavedChanges(hayCambios)
    setMessage(
      hayCambios ? `El cliente ${nombre} tiene cambios sin guardar.` : null
    )
  }, [hayCambios, cliente, setHasUnsavedChanges, setMessage])

  useEffect(() => {
    return () => {
      setHasUnsavedChanges(false)
      setMessage(null)
    }
  }, [setHasUnsavedChanges, setMessage])

  const cambiosPorPaso = useMemo(
    () => ({
      paso1: cambiosDetectados.filter(c => c.categoria === 'personal').length,
      paso2: cambiosDetectados.filter(c => c.categoria === 'contacto').length,
      paso3: cambiosDetectados.filter(c => c.categoria === 'notas').length,
    }),
    [cambiosDetectados]
  )

  // ── Estado de sección ───────────────────────────────
  const getEstadoPaso = useCallback(
    (paso: number): SectionStatus => {
      if (paso === pasoActual) return 'active' // activo siempre gana
      if (pasosCompletados.has(paso)) return 'completed'
      return 'pending'
    },
    [pasoActual, pasosCompletados]
  )

  // ── Resúmenes ───────────────────────────────────────
  const summaryPaso1: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Nombre',
        value:
          formData.nombres && formData.apellidos
            ? `${formData.nombres} ${formData.apellidos}`
            : undefined,
      },
      {
        label: 'Documento',
        value: formData.numero_documento
          ? `${formData.tipo_documento} ${formData.numero_documento}`
          : undefined,
      },
    ],
    [
      formData.nombres,
      formData.apellidos,
      formData.tipo_documento,
      formData.numero_documento,
    ]
  )

  const summaryPaso2: SummaryItem[] = useMemo(() => {
    const contacto = formData.telefono || formData.email
    return [
      { label: 'Contacto', value: contacto || undefined },
      {
        label: 'Ubicación',
        value:
          formData.ciudad && formData.departamento
            ? `${formData.ciudad}, ${formData.departamento}`
            : undefined,
      },
    ]
  }, [
    formData.telefono,
    formData.email,
    formData.ciudad,
    formData.departamento,
  ])

  const summaryPaso3: SummaryItem[] = useMemo(
    () => [
      {
        label: 'Notas',
        value: formData.notas ? 'Con observaciones' : 'Sin notas',
      },
    ],
    [formData.notas]
  )

  // ── Progreso ────────────────────────────────────────
  const progress = useMemo(() => {
    return Math.round(
      (pasosCompletados.size / PASOS_CLIENTE_EDICION.length) * 100
    )
  }, [pasosCompletados.size])

  // ── Validación por paso (compartida con crear) ───────
  const validarPasoActual = useCallback(async (): Promise<boolean> => {
    const f = { getValues, trigger, setError } as unknown as FormularioCliente
    setIsValidating(true)
    try {
      if (pasoActual === 1)
        return await validarPasoPersonal(f, FIELDS_PASO_1, clienteId)
      if (pasoActual === 2) return await validarPasoContacto(f, FIELDS_PASO_2)
      if (pasoActual === 3) return await validarOpcionales(f, ['notas'])
      return true
    } finally {
      setIsValidating(false)
    }
  }, [pasoActual, trigger, getValues, setError, clienteId])

  // ── Navegación ──────────────────────────────────────
  const irSiguiente = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return
    setPasosCompletados(prev => new Set(prev).add(pasoActual))
    setPasoActual(prev => Math.min(prev + 1, PASOS_CLIENTE_EDICION.length))
  }, [pasoActual, validarPasoActual])

  const irAtras = useCallback(() => {
    setPasoActual(prev => Math.max(prev - 1, 1))
  }, [])

  const irAPaso = useCallback(
    (paso: number) => {
      // En edición: navegación libre sin validar pasos anteriores.
      // Añadir el paso actual a completados para que muestre resumen.
      setPasosCompletados(prev => new Set(prev).add(pasoActual))
      setPasoActual(paso)
    },
    [pasoActual]
  )

  // ── Submit: interceptar para mostrar modal ──────────
  const handleSubmit = useCallback(async () => {
    const valido = await validarPasoActual()
    if (!valido) return
    setPasosCompletados(prev => new Set(prev).add(pasoActual))
    setMostrarConfirmacion(true)
  }, [pasoActual, validarPasoActual])

  // ── Confirmar actualización ─────────────────────────
  const confirmarActualizacion = useCallback(async () => {
    setMostrarConfirmacion(false)
    setIsSubmitting(true)
    try {
      const values = getValues()

      const dto: ActualizarClienteDTO = {
        nombres: values.nombres,
        apellidos: values.apellidos,
        tipo_documento: values.tipo_documento as TipoDocumento,
        numero_documento: values.numero_documento,
        fecha_nacimiento: values.fecha_nacimiento || null,
        estado_civil: (values.estado_civil || null) as EstadoCivil | null,
        telefono: values.telefono || null,
        telefono_alternativo: values.telefono_alternativo || null,
        email: values.email || null,
        direccion: values.direccion || null,
        departamento: values.departamento,
        ciudad: values.ciudad,
        notas: values.notas || null,
      }

      const sanitized = sanitizeActualizarClienteDTO(dto)
      await actualizarMutation.mutateAsync({ id: clienteId, datos: sanitized })

      setHasUnsavedChanges(false)
      setMessage(null)
      setShowSuccess(true)
      // Redirigir al detalle del cliente, no a la lista
      setTimeout(() => router.push(`/clientes/${getShortId(clienteId)}`), 1800)
    } catch (error) {
      if (error instanceof Error && error.message.includes('documento')) {
        setError('numero_documento', { type: 'manual', message: error.message })
        setPasoActual(1)
        setPasosCompletados(new Set())
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [
    getValues,
    actualizarMutation,
    clienteId,
    router,
    setError,
    setHasUnsavedChanges,
    setMessage,
  ])

  const cancelarConfirmacion = useCallback(() => {
    setMostrarConfirmacion(false)
  }, [])

  return {
    // Loading state
    isLoading,
    isError,
    clienteNombre: cliente?.nombre_completo || '',

    // Pasos
    pasos: PASOS_CLIENTE_EDICION,
    pasoActual,
    getEstadoPaso,
    progress,

    // Navegación
    irSiguiente,
    irAtras,
    irAPaso,

    // Resúmenes
    summaryPaso1,
    summaryPaso2,
    summaryPaso3,

    // Form
    register,
    errors,
    setValue,
    watch,

    // Submit
    handleSubmit,
    isSubmitting,
    isValidating,
    showSuccess,

    // Confirmación modal
    mostrarConfirmacion,
    cambiosGenericos: cambiosDetectados,
    categoriasConfig: CATEGORIAS_CAMBIOS_CLIENTE,
    confirmarActualizacion,
    cancelarConfirmacion,
    hayCambios,
    cambiosPorPaso,
  }
}
