/**
 * 🗑️ HOOK: useDocumentosEliminados
 *
 * Lógica de negocio para la Papelera de Documentos (Admin Only)
 * - Cargar documentos eliminados (soft delete)
 * - Restaurar documento (estado = 'activo')
 * - Eliminar definitivo (DELETE físico BD + Storage)
 */

import { useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'

import { DocumentosEliminacionService } from '../services/documentos-eliminacion.service'
import { DocumentosService } from '../services/documentos.service'

// Tipo unificado para documentos eliminados de cualquier módulo
type DocumentoEliminadoUnificado = {
  id: string
  titulo: string
  version: number
  fecha_actualizacion: string
  metadata?: Record<string, unknown>
  modulo: 'proyectos' | 'viviendas' | 'clientes'
  entidad_nombre?: string // Nombre del proyecto/vivienda/cliente
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
  // Joined data that may be present depending on the query
  proyectos?: { nombre: string } | null
  vivienda?: {
    numero_vivienda?: string
    numero?: string
    manzana?: { nombre: string } | null
    negociacion?: {
      cliente?: { nombres: string; apellidos: string } | null
    } | null
  } | null
  manzana?: { nombre: string } | null
  numero_vivienda?: string
  numero?: string
  cliente?: {
    nombres: string
    apellidos: string
    negociaciones?: Array<{
      vivienda?: { numero: string; manzana?: { nombre: string } }
    }>
  } | null
  [key: string]: unknown
}

// Tipos para estado de modales
interface ModalState {
  isOpen: boolean
  documentoId: string
  titulo: string
  modulo?: string
}

export function useDocumentosEliminados() {
  const { perfil, user } = useAuth()
  const queryClient = useQueryClient()

  // Estados locales UI
  const [busqueda, setBusqueda] = useState('')
  const [moduloFiltro, setModuloFiltro] = useState<
    'todos' | 'proyectos' | 'viviendas' | 'clientes'
  >('todos')
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [ordenamiento, setOrdenamiento] = useState<
    'recientes' | 'antiguos' | 'alfabetico'
  >('recientes')

  // 🆕 Estados para modales custom
  const [modalRestaurar, setModalRestaurar] = useState<ModalState>({
    isOpen: false,
    documentoId: '',
    titulo: '',
  })

  const [modalEliminar, setModalEliminar] = useState<ModalState>({
    isOpen: false,
    documentoId: '',
    titulo: '',
  })

  const [confirmacionTexto, setConfirmacionTexto] = useState('')

  // ✅ REACT QUERY: Cargar documentos eliminados de PROYECTOS
  const {
    data: documentosProyectos = [],
    isLoading: cargandoProyectos,
    error: errorProyectos,
  } = useQuery({
    queryKey: ['documentos-eliminados-proyectos'],
    queryFn: () => DocumentosService.obtenerDocumentosEliminados('proyecto'),
    enabled: !!user && perfil?.rol === 'Administrador',
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // ✅ REACT QUERY: Cargar documentos eliminados de VIVIENDAS
  const {
    data: documentosViviendas = [],
    isLoading: cargandoViviendas,
    error: errorViviendas,
  } = useQuery({
    queryKey: ['documentos-eliminados-viviendas'],
    queryFn: () =>
      DocumentosEliminacionService.obtenerDocumentosEliminados('vivienda'),
    enabled: !!user && perfil?.rol === 'Administrador',
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // ✅ REACT QUERY: Cargar documentos eliminados de CLIENTES
  const {
    data: documentosClientes = [],
    isLoading: cargandoClientes,
    error: errorClientes,
  } = useQuery({
    queryKey: ['documentos-eliminados-clientes'],
    queryFn: () =>
      DocumentosEliminacionService.obtenerDocumentosEliminados('cliente'),
    enabled: !!user && perfil?.rol === 'Administrador',
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // ✅ Unificar documentos de todos los módulos con metadata
  const documentosUnificados: DocumentoEliminadoUnificado[] = useMemo(() => {
    const docProyectos = (
      documentosProyectos as unknown as DocumentoEliminadoUnificado[]
    ).map(doc => ({
      ...doc,
      modulo: 'proyectos' as const,
      entidad_nombre: doc.proyectos?.nombre || 'Proyecto sin nombre',
    }))

    const docViviendas = (
      documentosViviendas as unknown as DocumentoEliminadoUnificado[]
    ).map(doc => {
      const manzana = doc.vivienda?.manzana || doc.manzana
      const numero = doc.vivienda?.numero || doc.numero
      const clienteNeg = doc.vivienda?.negociacion?.cliente

      // Código compacto: letra manzana + número vivienda (ej: "DTEST-02")
      const codigoVivienda =
        manzana?.nombre && numero
          ? `${manzana.nombre}${numero}`
          : numero || 'Vivienda sin identificar'

      // Nombre del cliente asignado (vía negociación activa)
      const nombreCliente = clienteNeg
        ? `${clienteNeg.nombres} ${clienteNeg.apellidos}`.trim()
        : null

      const entidad_nombre = nombreCliente
        ? `${codigoVivienda} - ${nombreCliente}`
        : codigoVivienda

      return {
        ...doc,
        modulo: 'viviendas' as const,
        entidad_nombre,
      }
    })

    const docClientes = (
      documentosClientes as unknown as DocumentoEliminadoUnificado[]
    ).map(doc => {
      const nombreCliente = doc.cliente
        ? `${doc.cliente.nombres} ${doc.cliente.apellidos}`.trim()
        : 'Cliente sin identificar'

      const negociaciones = doc.cliente?.negociaciones

      const negConVivienda = negociaciones?.find(n => n.vivienda?.numero)
      const codigoVivienda = negConVivienda?.vivienda
        ? `${negConVivienda.vivienda.manzana?.nombre ?? ''}${negConVivienda.vivienda.numero}`
        : null

      const entidad_nombre = codigoVivienda
        ? `${codigoVivienda} - ${nombreCliente}`
        : nombreCliente

      return { ...doc, modulo: 'clientes' as const, entidad_nombre }
    })

    return [
      ...docProyectos,
      ...docViviendas,
      ...docClientes,
    ] as DocumentoEliminadoUnificado[]
  }, [documentosProyectos, documentosViviendas, documentosClientes])

  const cargando = cargandoProyectos || cargandoViviendas || cargandoClientes
  const error = errorProyectos || errorViviendas || errorClientes

  // ✅ MUTATION: Restaurar documento (detecta módulo automáticamente)
  const restaurarMutation = useMutation({
    mutationFn: async ({
      documentoId,
      modulo,
    }: {
      documentoId: string
      modulo: string
    }) => {
      const tipoEntidad =
        modulo === 'proyectos'
          ? 'proyecto'
          : modulo === 'viviendas'
            ? 'vivienda'
            : 'cliente'
      return DocumentosService.restaurarDocumentoEliminado(
        documentoId,
        tipoEntidad
      )
    },
    onSuccess: async () => {
      toast.success('✅ Documento restaurado correctamente')

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ['documentos-eliminados-proyectos'],
        }),
        queryClient.refetchQueries({
          queryKey: ['documentos-eliminados-viviendas'],
        }),
        queryClient.refetchQueries({
          queryKey: ['documentos-eliminados-clientes'],
        }),
        queryClient.refetchQueries({ queryKey: ['documentos'] }),
        queryClient.refetchQueries({ queryKey: ['documentos-vivienda'] }),
        queryClient.refetchQueries({ queryKey: ['documentos-cliente'] }),
        queryClient.refetchQueries({ queryKey: ['versiones-documento'] }),
        queryClient.refetchQueries({ queryKey: ['versiones-eliminadas'] }),
        queryClient.refetchQueries({ queryKey: ['documentos-pendientes'] }),
        // 🗑️ Actualizar contador del sidebar
        queryClient.refetchQueries({ queryKey: ['papelera-count-proyectos'] }),
        queryClient.refetchQueries({ queryKey: ['papelera-count-viviendas'] }),
        queryClient.refetchQueries({ queryKey: ['papelera-count-clientes'] }),
      ])
    },
    onError: (error: unknown) => {
      logger.error('Error al restaurar documento:', error)
      const msg =
        error instanceof Error
          ? error.message
          : 'Error al restaurar el documento'
      toast.error(msg)
    },
  })

  // ✅ MUTATION: Eliminar definitivo (detecta módulo automáticamente)
  const eliminarDefinitivoMutation = useMutation({
    mutationFn: async ({
      documentoId,
      modulo,
    }: {
      documentoId: string
      modulo: string
    }) => {
      const tipoEntidad =
        modulo === 'proyectos'
          ? 'proyecto'
          : modulo === 'viviendas'
            ? 'vivienda'
            : 'cliente'
      return DocumentosService.eliminarDefinitivo(documentoId, tipoEntidad)
    },
    onSuccess: () => {
      toast.success('🗑️ Documento eliminado permanentemente')
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados-proyectos'],
      })
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados-viviendas'],
      })
      queryClient.invalidateQueries({
        queryKey: ['documentos-eliminados-clientes'],
      })
      // 🗑️ Actualizar contador del sidebar
      queryClient.invalidateQueries({ queryKey: ['papelera-count-proyectos'] })
      queryClient.invalidateQueries({ queryKey: ['papelera-count-viviendas'] })
      queryClient.invalidateQueries({ queryKey: ['papelera-count-clientes'] })
    },
    onError: (error: unknown) => {
      logger.error('Error al eliminar definitivamente:', error)
      const msg =
        error instanceof Error
          ? error.message
          : 'Error al eliminar el documento'
      toast.error(msg)
    },
  })

  // ✅ FILTROS AVANZADOS: Módulo, búsqueda, fechas, ordenamiento
  const documentosFiltrados = useMemo(() => {
    let resultado = [...documentosUnificados]

    // Filtro por módulo
    if (moduloFiltro !== 'todos') {
      resultado = resultado.filter(doc => doc.modulo === moduloFiltro)
    }

    // Filtro por búsqueda global (título, entidad)
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase()
      resultado = resultado.filter(
        doc =>
          doc.titulo?.toLowerCase().includes(termino) ||
          doc.entidad_nombre?.toLowerCase().includes(termino) ||
          doc.usuario?.nombres?.toLowerCase().includes(termino) ||
          doc.usuario?.apellidos?.toLowerCase().includes(termino)
      )
    }

    // Filtro por rango de fechas
    if (fechaDesde) {
      resultado = resultado.filter(
        doc => new Date(doc.fecha_actualizacion) >= new Date(fechaDesde)
      )
    }
    if (fechaHasta) {
      resultado = resultado.filter(
        doc =>
          new Date(doc.fecha_actualizacion) <=
          new Date(fechaHasta + 'T23:59:59')
      )
    }

    // Ordenamiento
    if (ordenamiento === 'recientes') {
      resultado.sort(
        (a, b) =>
          new Date(b.fecha_actualizacion).getTime() -
          new Date(a.fecha_actualizacion).getTime()
      )
    } else if (ordenamiento === 'antiguos') {
      resultado.sort(
        (a, b) =>
          new Date(a.fecha_actualizacion).getTime() -
          new Date(b.fecha_actualizacion).getTime()
      )
    } else if (ordenamiento === 'alfabetico') {
      resultado.sort((a, b) => a.titulo.localeCompare(b.titulo))
    }

    return resultado
  }, [
    documentosUnificados,
    moduloFiltro,
    busqueda,
    fechaDesde,
    fechaHasta,
    ordenamiento,
  ])

  // ✅ ESTADÍSTICAS
  const estadisticas = useMemo(() => {
    return {
      total: documentosUnificados.length,
      filtrados: documentosFiltrados.length,
      porModulo: {
        proyectos: documentosUnificados.filter(d => d.modulo === 'proyectos')
          .length,
        viviendas: documentosUnificados.filter(d => d.modulo === 'viviendas')
          .length,
        clientes: documentosUnificados.filter(d => d.modulo === 'clientes')
          .length,
      },
    }
  }, [documentosUnificados, documentosFiltrados])

  // ✅ ACCIONES (con módulo)
  const handleRestaurar = async (
    documentoId: string,
    titulo: string,
    modulo: string
  ) => {
    setModalRestaurar({ isOpen: true, documentoId, titulo, modulo })
  }

  const confirmarRestaurar = async () => {
    if (!modalRestaurar.modulo) {
      toast.error('❌ Error: Módulo no especificado')
      return
    }

    await restaurarMutation.mutateAsync({
      documentoId: modalRestaurar.documentoId,
      modulo: modalRestaurar.modulo,
    })
    setModalRestaurar({ isOpen: false, documentoId: '', titulo: '' })
  }

  const handleEliminarDefinitivo = async (
    documentoId: string,
    titulo: string,
    modulo: string
  ) => {
    setModalEliminar({ isOpen: true, documentoId, titulo, modulo })
    setConfirmacionTexto('')
  }

  const confirmarEliminarDefinitivo = async () => {
    if (confirmacionTexto !== 'ELIMINAR') {
      toast.error('❌ Debes escribir "ELIMINAR" en mayúsculas para confirmar')
      return
    }

    if (!modalEliminar.modulo) {
      toast.error('❌ Error: Módulo no especificado')
      return
    }

    await eliminarDefinitivoMutation.mutateAsync({
      documentoId: modalEliminar.documentoId,
      modulo: modalEliminar.modulo,
    })
    setModalEliminar({ isOpen: false, documentoId: '', titulo: '' })
    setConfirmacionTexto('')
  }

  return {
    // Data
    documentos: documentosFiltrados,
    documentosOriginales: documentosUnificados,
    cargando,
    error: error as Error | null,
    estadisticas,

    // Filtros avanzados
    busqueda,
    setBusqueda,
    moduloFiltro,
    setModuloFiltro,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    ordenamiento,
    setOrdenamiento,

    // Acciones
    handleRestaurar,
    handleEliminarDefinitivo,
    refrescar: () => {
      queryClient.refetchQueries({
        queryKey: ['documentos-eliminados-proyectos'],
      })
      queryClient.refetchQueries({
        queryKey: ['documentos-eliminados-viviendas'],
      })
      queryClient.refetchQueries({
        queryKey: ['documentos-eliminados-clientes'],
      })
    },

    // Estados de mutations
    restaurando: restaurarMutation.isPending
      ? modalRestaurar.documentoId
      : null,
    eliminando: eliminarDefinitivoMutation.isPending
      ? modalEliminar.documentoId
      : null,

    // 🆕 Modales custom
    modalRestaurar,
    setModalRestaurar,
    confirmarRestaurar,
    modalEliminar,
    setModalEliminar,
    confirmarEliminarDefinitivo,
    confirmacionTexto,
    setConfirmacionTexto,
  }
}
