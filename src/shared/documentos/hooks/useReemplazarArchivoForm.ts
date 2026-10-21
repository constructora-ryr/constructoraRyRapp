'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { logger } from '@/lib/utils/logger'

import { validarArchivoDocumento } from '../config/tipos-archivo'
import { DocumentosService } from '../services/documentos.service'
import { type TipoEntidad } from '../types'

interface UseReemplazarArchivoFormProps {
  tipoEntidad?: TipoEntidad
  onSuccess?: () => void | Promise<void>
  onClose?: () => void
}

export type ProgresoFase =
  | 'idle'
  | 'validando'
  | 'descargando'
  | 'creando-backup'
  | 'subiendo'
  | 'actualizando'
  | 'finalizando'

export interface ProgresoReemplazo {
  fase: ProgresoFase
  porcentaje: number
  mensaje: string
}

export function useReemplazarArchivoForm({
  tipoEntidad = 'proyecto',
  onSuccess,
  onClose,
}: UseReemplazarArchivoFormProps = {}) {
  // Estados del reemplazo
  const [reemplazando, setReemplazando] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoReemplazo>({
    fase: 'idle',
    porcentaje: 0,
    mensaje: '',
  })

  // Estados del formulario
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null)
  const [justificacion, setJustificacion] = useState('')
  const [password, setPassword] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Validaciones
  const isFormValid =
    nuevoArchivo !== null && justificacion.length >= 10 && password.length > 0
  const isSubmitDisabled = reemplazando || !isFormValid

  // Handlers de drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) elegirArchivo(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) elegirArchivo(file)
    // Permite volver a elegir el mismo archivo tras un error
    e.target.value = ''
  }

  const elegirArchivo = (file: File) => {
    const error = validarArchivoDocumento(file, tipoEntidad)
    if (error) {
      toast.error('No se puede usar este archivo', { description: error })
      return
    }
    setNuevoArchivo(file)
  }

  const removeFile = () => {
    setNuevoArchivo(null)
  }

  // Handler de submit con progreso
  const handleSubmit = async (
    e: React.FormEvent,
    documento: {
      id: string
      nombre_archivo: string
      url_storage: string
      tamano_bytes: number
      version: number
    }
  ) => {
    e.preventDefault()

    if (!nuevoArchivo || !justificacion) return

    setReemplazando(true)

    try {
      // Fase 1: Validando contraseña
      setProgreso({
        fase: 'validando',
        porcentaje: 10,
        mensaje: 'Validando credenciales de administrador...',
      })
      await new Promise(resolve => setTimeout(resolve, 300))

      // Fase 2: Descargando archivo original
      setProgreso({
        fase: 'descargando',
        porcentaje: 25,
        mensaje: 'Descargando archivo original...',
      })
      await new Promise(resolve => setTimeout(resolve, 400))

      // Fase 3: Creando backup
      setProgreso({
        fase: 'creando-backup',
        porcentaje: 45,
        mensaje: 'Creando backup del archivo anterior...',
      })
      await new Promise(resolve => setTimeout(resolve, 500))

      // Fase 4: Subiendo nuevo archivo
      setProgreso({
        fase: 'subiendo',
        porcentaje: 65,
        mensaje: 'Subiendo nuevo archivo...',
      })
      await new Promise(resolve => setTimeout(resolve, 400))

      // Llamada al servicio genérico ✅
      await DocumentosService.reemplazarArchivoSeguro(
        documento.id,
        nuevoArchivo,
        justificacion,
        password,
        tipoEntidad // ← Parámetro genérico
      )

      // Fase 5: Actualizando base de datos
      setProgreso({
        fase: 'actualizando',
        porcentaje: 85,
        mensaje: 'Actualizando registros...',
      })
      await new Promise(resolve => setTimeout(resolve, 300))

      // Fase 6: Finalizando
      setProgreso({
        fase: 'finalizando',
        porcentaje: 100,
        mensaje: 'Proceso completado exitosamente',
      })
      await new Promise(resolve => setTimeout(resolve, 200))

      toast.success('Archivo reemplazado exitosamente', {
        description:
          'El archivo anterior fue respaldado y el nuevo está activo',
      })

      await onSuccess?.()
      resetForm()
      onClose?.()
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al reemplazar archivo', {
        description: errorMsg,
      })
      logger.error('Error en reemplazo:', error)
    } finally {
      setReemplazando(false)
      setProgreso({
        fase: 'idle',
        porcentaje: 0,
        mensaje: '',
      })
    }
  }

  // Reset form
  const resetForm = () => {
    setNuevoArchivo(null)
    setJustificacion('')
    setPassword('')
    setDragActive(false)
  }

  // Close handler
  const handleClose = () => {
    if (!reemplazando) {
      resetForm()
      onClose?.()
    }
  }

  return {
    // Estados
    nuevoArchivo,
    justificacion,
    password,
    dragActive,
    reemplazando,
    progreso,

    // Validaciones
    isFormValid,
    isSubmitDisabled,

    // Setters
    setNuevoArchivo,
    setJustificacion,
    setPassword,

    // Handlers
    handleDrag,
    handleDrop,
    handleFileChange,
    removeFile,
    handleSubmit,
    handleClose,
    resetForm,
  }
}
