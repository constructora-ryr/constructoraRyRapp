import React, {
  DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { useDocumentoIdentidad } from '@/modules/clientes/documentos/hooks/useDocumentoIdentidad'

import {
  formatosArchivo,
  validarArchivoDocumento,
} from '../config/tipos-archivo'
import type { DocumentoFormData } from '../schemas/documento.schema'
import { documentoFormSchema } from '../schemas/documento.schema'
import type { TipoEntidad } from '../types'
import type { TipoDocumentoValidacion } from '../types/tipos-documento'
import { obtenerInfoTipoDocumento } from '../types/tipos-documento'

import {
  useCategoriasQuery,
  useSubirDocumentoMutation,
} from './useDocumentosQuery'

interface UseDocumentoUploadProps {
  entidadId: string
  tipoEntidad: TipoEntidad
  carpetaId?: string | null
  metadata?: Record<string, unknown> | null // ✅ NUEVO: Metadata para vincular con requisitos
  onSuccess?: () => void
}

export function useDocumentoUpload({
  entidadId,
  tipoEntidad,
  carpetaId,
  metadata, // ✅ NUEVO
  onSuccess,
}: UseDocumentoUploadProps) {
  // Estado local
  const [isDragging, setIsDragging] = useState(false)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(
    null
  )
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ NUEVO: Extraer tipo_documento y fuente_pago_id de metadata
  const tipoDocumento =
    (metadata?.tipo_documento as TipoDocumentoValidacion | undefined) || null
  const fuentePagoId = metadata?.fuente_pago_id as string | undefined
  const infoTipoDocumento = obtenerInfoTipoDocumento(tipoDocumento)

  // Auth
  const { user } = useAuth()

  // ✅ Convertir tipoEntidad a moduleName para categorías
  const modulosCategorias: Record<
    TipoEntidad,
    'proyectos' | 'clientes' | 'viviendas'
  > = {
    proyecto: 'proyectos',
    vivienda: 'viviendas',
    cliente: 'clientes',
  }

  const moduloCategoria = modulosCategorias[tipoEntidad]

  // Categorías desde React Query
  const { categorias = [] } = useCategoriasQuery(user?.id, moduloCategoria)

  // ✅ Validar si ya existe documento de identidad (solo para clientes)
  // Siempre llamar al hook, pero pasar clienteId vacío si no es cliente
  const { tieneCedula: yaExisteDocumentoIdentidad } = useDocumentoIdentidad({
    clienteId: tipoEntidad === 'cliente' ? entidadId : '', // Vacío si no es cliente
  })

  // Mutation para subir documento (GENÉRICO)
  const { mutateAsync: subirDocumento, isPending: subiendoDocumento } =
    useSubirDocumentoMutation(entidadId, tipoEntidad)

  // ✅ Detectar si viene desde contexto de cédula
  const autoCheckIdentidad = metadata?.auto_check_identidad === true

  // Form con validaciones Zod (sin validación de archivo aquí - se valida en handleFileChange)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoFormSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      categoria_id: '',
      fecha_documento: undefined,
      fecha_vencimiento: undefined,
      es_documento_identidad: autoCheckIdentidad, // ✅ Pre-marcar si viene desde contexto de cédula
      metadata: {},
    },
    mode: 'onChange', // Validar mientras el usuario escribe
  })

  const esDocumentoIdentidad = watch('es_documento_identidad')
  const categoriaSeleccionada = watch('categoria_id')

  // ✅ Buscar categoría "Documentos de Identidad" automáticamente
  const categoriaIdentidad = categorias.find(
    c =>
      c.nombre === 'Documentos de Identidad' ||
      c.nombre.toLowerCase().includes('identidad') ||
      c.nombre.toLowerCase().includes('cédula') ||
      c.nombre.toLowerCase().includes('cedula')
  )

  // ✅ Auto-seleccionar categoría cuando marca como documento de identidad
  // useEffect para observar cambios en esDocumentoIdentidad
  useEffect(() => {
    if (esDocumentoIdentidad && categoriaIdentidad && !categoriaSeleccionada) {
      setValue('categoria_id', categoriaIdentidad.id)
    }
  }, [
    esDocumentoIdentidad,
    categoriaIdentidad,
    categoriaSeleccionada,
    setValue,
  ])

  // ✅ NUEVO: Auto-seleccionar categoría sugerida desde metadata
  useEffect(() => {
    if (infoTipoDocumento?.categoria_sugerida) {
      // Verificar que la categoría existe en la lista
      const categoriaExiste = categorias.some(
        c => c.id === infoTipoDocumento.categoria_sugerida
      )

      if (categoriaExiste) {
        setValue('categoria_id', infoTipoDocumento.categoria_sugerida)
      }
    }
  }, [infoTipoDocumento, categorias, setValue])

  // ✅ Deshabilitar checkbox si ya existe documento de identidad (solo clientes)
  const checkboxDeshabilitado =
    tipoEntidad === 'cliente' && yaExisteDocumentoIdentidad

  // Validación de archivo
  const validarArchivo = useCallback(
    (file: File): boolean => {
      const error = validarArchivoDocumento(file, tipoEntidad)
      setErrorArchivo(error)
      return error === null
    },
    [tipoEntidad]
  )

  // Handlers de archivo
  const handleArchivoSeleccionado = useCallback(
    (file: File) => {
      if (validarArchivo(file)) {
        setArchivoSeleccionado(file)

        // Autocompletar título con nombre del archivo (sin extensión)
        if (!watch('titulo')) {
          const nombreSinExtension = file.name.replace(/\.[^/.]+$/, '')
          setValue('titulo', nombreSinExtension)
        }
      }
    },
    [validarArchivo, watch, setValue]
  )

  const limpiarArchivo = useCallback(() => {
    setArchivoSeleccionado(null)
    setErrorArchivo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleArchivoSeleccionado(files[0])
      }
    },
    [handleArchivoSeleccionado]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleArchivoSeleccionado(files[0])
      }
    },
    [handleArchivoSeleccionado]
  )

  const handleClickSelectFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Submit
  const onSubmit = useCallback(
    async (data: DocumentoFormData) => {
      if (!archivoSeleccionado) {
        setErrorArchivo('Debes seleccionar un archivo')
        return
      }

      if (!user) {
        logger.error('Usuario no autenticado')
        return
      }

      // ✅ VALIDACIÓN CRÍTICA: Bloquear si intenta subir documento de identidad cuando ya existe uno
      if (
        tipoEntidad === 'cliente' &&
        data.es_documento_identidad &&
        yaExisteDocumentoIdentidad
      ) {
        setErrorArchivo(
          'Ya existe un documento de identidad para este cliente. Elimina el anterior antes de subir uno nuevo.'
        )
        return
      }

      try {
        await subirDocumento({
          archivo: archivoSeleccionado,
          titulo: data.titulo,
          descripcion: data.descripcion,
          categoriaId: data.categoria_id ?? undefined,
          carpetaId: carpetaId ?? null,
          fechaDocumento: data.fecha_documento ?? undefined,
          fechaVencimiento: data.fecha_vencimiento,
          esDocumentoIdentidad: data.es_documento_identidad,
          userId: user.id,
          // ✅ Metadata completa: incluye requisito_config_id, fuente_pago_id, tipo_documento, etc.
          ...(metadata
            ? {
                metadata: {
                  ...metadata,
                  tipo_documento: tipoDocumento,
                  fuente_pago_id: fuentePagoId,
                },
              }
            : {}),
        })

        // Reset form
        reset()
        limpiarArchivo()
        onSuccess?.()
      } catch (error) {
        logger.error('Error al subir documento:', error)
      }
    },
    [
      archivoSeleccionado,
      user,
      subirDocumento,
      reset,
      limpiarArchivo,
      onSuccess,
      tipoEntidad,
      yaExisteDocumentoIdentidad,
      fuentePagoId,
      metadata,
      tipoDocumento,
      carpetaId,
    ]
  )

  // Helpers - ninguno por ahora

  return {
    // Estado
    formatos: formatosArchivo(tipoEntidad),
    isDragging,
    archivoSeleccionado,
    errorArchivo,
    subiendoDocumento,
    categorias,

    // Requisito al que se vincula (si viene de uno)
    tipoDocumento,
    infoTipoDocumento,

    // Documento de identidad (solo clientes)
    esDocumentoIdentidad,
    categoriaIdentidad,
    checkboxDeshabilitado,
    yaExisteDocumentoIdentidad,

    // Refs
    fileInputRef,

    // Form
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    setValue,
    watch,

    // Handlers de archivo
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleClickSelectFile,
    limpiarArchivo,
  }
}
