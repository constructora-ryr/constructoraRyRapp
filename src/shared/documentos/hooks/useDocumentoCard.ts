import { useCallback, useMemo, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import type { DocumentoProyecto } from '@/shared/documentos/types/documento.types'
import { useClickOutside } from '@/shared/hooks'

import type { TipoEntidad } from '../types/entidad.types'

import { useEliminarDocumento } from './useEliminarDocumento'
// ❌ ELIMINADO: DocumentosClienteService (servicio legacy eliminado)
// TODO: Migrar métodos obtenerEstadoProceso y esDocumentoDeProceso a servicio genérico

interface UseDocumentoCardProps {
  documento: DocumentoProyecto
  esDocumentoProyecto?: boolean
}

const ESTADO_PROCESO_NINGUNO = { esDeProceso: false } as const

export function useDocumentoCard({
  documento,
  esDocumentoProyecto = true,
}: UseDocumentoCardProps) {
  // 🔐 Auth y Permisos
  const { perfil } = useAuth()
  const { puede } = usePermisosQuery()
  const esAdmin = useMemo(() => perfil?.rol === 'Administrador', [perfil?.rol])
  const puedeEliminar = useMemo(() => puede('documentos', 'eliminar'), [puede])
  const puedeEditar = useMemo(
    () => esAdmin || puede('documentos', 'editar'),
    [esAdmin, puede]
  )
  const puedeArchivar = useMemo(
    () => esAdmin || puede('documentos', 'archivar'),
    [esAdmin, puede]
  )
  const puedeSubir = useMemo(
    () => esAdmin || puede('documentos', 'subir'),
    [esAdmin, puede]
  )

  // �️ Confirmación de eliminación inteligente
  const {
    abrirConfirmacion,
    cerrarConfirmacion,
    ejecutarEliminacion,
    confirmacion: confirmacionEliminar,
    eliminando,
  } = useEliminarDocumento()

  const abrirConfirmacionEliminar = useCallback(
    (doc: DocumentoProyecto, tipoEntidad: TipoEntidad = 'cliente') => {
      abrirConfirmacion(doc, tipoEntidad)
    },
    [abrirConfirmacion]
  )

  const cerrarConfirmacionEliminar = useCallback(() => {
    cerrarConfirmacion()
  }, [cerrarConfirmacion])

  // �📋 Estados de UI
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [modalReemplazarAbierto, setModalReemplazarAbierto] = useState(false)
  const [modalVersionesAbierto, setModalVersionesAbierto] = useState(false)
  const [modalNuevaVersionAbierto, setModalNuevaVersionAbierto] =
    useState(false)

  // 🔒 Protección por proceso: DESACTIVADA. El servicio que la calculaba
  // (DocumentosClienteService.esDocumentoDeProceso/obtenerEstadoProceso) se
  // eliminó y la verificación respondía siempre "no protegido", con un
  // efecto y 4 estados por fila. Se devuelven esos mismos valores fijos.
  // Para reactivarla, calcularla en UNA consulta para toda la lista (no por
  // fila) y pasarla como prop.
  const estaProtegido = false
  const procesoInfo: {
    pasoNombre?: string
    procesoCompletado: boolean
  } | null = null
  const estadoProceso: {
    esDeProceso: boolean
    estadoPaso?: 'Pendiente' | 'En Proceso' | 'Completado' | 'Omitido'
    nombrePaso?: string
  } = ESTADO_PROCESO_NINGUNO
  const verificando = false

  // 📅 Cálculos de fechas (memoizados)
  const estaProximoAVencer = useMemo(() => {
    if (!documento.fecha_vencimiento) return false
    const fechaVencimiento = new Date(documento.fecha_vencimiento)
    const fechaLimite = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return fechaVencimiento <= fechaLimite
  }, [documento.fecha_vencimiento])

  const estaVencido = useMemo(() => {
    if (!documento.fecha_vencimiento) return false
    return new Date(documento.fecha_vencimiento) < new Date()
  }, [documento.fecha_vencimiento])

  const diasParaVencer = useMemo(() => {
    if (!documento.fecha_vencimiento) return null
    const diff = new Date(documento.fecha_vencimiento).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }, [documento.fecha_vencimiento])

  // 📊 Propiedades del documento (memoizadas)
  // ✅ SIEMPRE mostrar "Nueva Versión" para documentos de proyectos (sin depender de etiquetas)
  const esDocumentoDeProceso = useMemo(() => {
    return esDocumentoProyecto
  }, [esDocumentoProyecto])

  // ✅ Solo mostrar "Ver Historial" si hay MÁS de 1 versión
  const tieneVersiones = useMemo(() => {
    return documento.version > 1
  }, [documento.version])

  // Usar hook compartido para cerrar al hacer click fuera
  const menuRef = useClickOutside<HTMLDivElement>(() => {
    setMenuAbierto(false)
  })

  const toggleMenu = useCallback(() => {
    setMenuAbierto(prev => !prev)
  }, [])

  const cerrarMenu = useCallback(() => {
    setMenuAbierto(false)
  }, [])

  const abrirModalVersiones = useCallback(() => {
    setModalVersionesAbierto(true)
    cerrarMenu()
  }, [cerrarMenu])

  const cerrarModalVersiones = useCallback(() => {
    setModalVersionesAbierto(false)
  }, [])

  const abrirModalNuevaVersion = useCallback(() => {
    setModalNuevaVersionAbierto(true)
    cerrarMenu()
  }, [cerrarMenu])

  const cerrarModalNuevaVersion = useCallback(() => {
    setModalNuevaVersionAbierto(false)
  }, [])

  const abrirModalEditar = useCallback(() => {
    setModalEditarAbierto(true)
    cerrarMenu()
  }, [cerrarMenu])

  const cerrarModalEditar = useCallback(() => {
    setModalEditarAbierto(false)
  }, [])

  const abrirModalReemplazar = useCallback(() => {
    setModalReemplazarAbierto(true)
    cerrarMenu()
  }, [cerrarMenu])

  const cerrarModalReemplazar = useCallback(() => {
    setModalReemplazarAbierto(false)
  }, [])

  return {
    // 🔐 Auth
    esAdmin,
    puedeEliminar,
    puedeEditar,
    puedeArchivar,
    puedeSubir,

    // 📋 Estados de UI - Menú
    menuAbierto,
    menuRef,
    toggleMenu,
    cerrarMenu,

    // 📋 Estados de UI - Modales
    modalEditarAbierto,
    abrirModalEditar,
    cerrarModalEditar,
    modalReemplazarAbierto,
    abrirModalReemplazar,
    cerrarModalReemplazar,
    modalVersionesAbierto,
    abrirModalVersiones,
    cerrarModalVersiones,
    modalNuevaVersionAbierto,
    abrirModalNuevaVersion,
    cerrarModalNuevaVersion,

    // 🔒 Protección de documentos
    estaProtegido,
    procesoInfo,
    estadoProceso,
    verificando,

    // 📅 Cálculos de fechas
    estaProximoAVencer,
    estaVencido,
    diasParaVencer,

    // 📊 Propiedades del documento
    esDocumentoDeProceso,
    tieneVersiones,

    // 🗑️ Confirmación de eliminación
    confirmacionEliminar,
    abrirConfirmacionEliminar,
    cerrarConfirmacionEliminar,
    ejecutarEliminacion,
    eliminando,
  }
}
