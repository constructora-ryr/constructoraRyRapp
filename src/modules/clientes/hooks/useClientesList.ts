/**
 * ============================================
 * HOOK: Lista de Clientes (UI Logic)
 * ============================================
 *
 * Gestión de la lista de clientes con React Query.
 * Responsabilidades:
 * - Gestionar filtros y búsqueda
 * - Control de modales (crear, editar, eliminar)
 * - Selección de clientes
 * - Estadísticas computadas
 */

import { useCallback, useMemo, useState } from 'react'

import { logger } from '@/lib/utils/logger'

import type { ClienteResumen, FiltrosClientes } from '../types'

import {
  useClientesQuery,
  useEliminarClienteMutation,
  useEstadisticasClientesQuery,
} from './useClientesQuery'

export function useClientesList() {
  // =====================================================
  // ESTADO LOCAL (UI)
  // =====================================================

  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [clienteEditar, setClienteEditar] = useState<ClienteResumen | null>(
    null
  ) // ✅ Objeto completo
  const [clienteEliminar, setClienteEliminar] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<FiltrosClientes>({
    estado: [],
    busqueda: '',
  })

  // =====================================================
  // REACT QUERY
  // =====================================================

  const {
    data: clientes = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useClientesQuery(filtros)

  const { data: estadisticas } = useEstadisticasClientesQuery()

  const eliminarMutation = useEliminarClienteMutation()

  // =====================================================
  // CLIENTES FILTRADOS (búsqueda local adicional)
  // =====================================================

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes]

    // Filtro client-side por estado para evitar flash durante placeholderData:
    // mientras llega la nueva query, React Query muestra datos del query anterior
    // que pueden tener estados incorrectos respecto al filtro actual
    if ((filtros.estado?.length ?? 0) > 0) {
      resultado = resultado.filter(c =>
        (filtros.estado as string[]).includes(c.estado)
      )
    }

    // Cuando se filtra por 'Activo', excluir los que ya son propietarios derivados
    // (estado=Activo en BD pero saldo_pendiente=0 → UI los muestra como Propietario)
    if (filtros.estado?.length === 1 && filtros.estado[0] === 'Activo') {
      resultado = resultado.filter(c => (c.vivienda?.saldo_pendiente ?? 1) > 0)
    }

    // Búsqueda local adicional (por si no está en filtros del servidor)
    if (filtros.busqueda) {
      const terminoBusqueda = filtros.busqueda.toLowerCase().trim()
      resultado = resultado.filter(cliente => {
        // Búsqueda en campos básicos
        const matchBasico =
          cliente.nombre_completo.toLowerCase().includes(terminoBusqueda) ||
          cliente.numero_documento.toLowerCase().includes(terminoBusqueda) ||
          cliente.telefono?.toLowerCase().includes(terminoBusqueda) ||
          cliente.email?.toLowerCase().includes(terminoBusqueda)

        // Búsqueda en vivienda (A-1, A-2, etc.)
        const matchVivienda = cliente.vivienda
          ? `${cliente.vivienda.nombre_manzana}-${cliente.vivienda.numero_vivienda}`
              .toLowerCase()
              .includes(terminoBusqueda)
          : false

        // Búsqueda en interés (A-1, A-2, etc.)
        const matchInteres = cliente.interes
          ? `${cliente.interes.nombre_manzana}-${cliente.interes.numero_vivienda}`
              .toLowerCase()
              .includes(terminoBusqueda)
          : false

        // Búsqueda en proyecto
        const matchProyecto =
          cliente.vivienda?.nombre_proyecto
            ?.toLowerCase()
            .includes(terminoBusqueda) ||
          cliente.interes?.nombre_proyecto
            ?.toLowerCase()
            .includes(terminoBusqueda)

        return matchBasico || matchVivienda || matchInteres || matchProyecto
      })
    }

    // ⭐ ORDENAR POR VIVIENDA (orden base natural)
    resultado.sort((a, b) => {
      // Función para obtener el identificador de vivienda
      const getViviendaId = (cliente: ClienteResumen): string => {
        if (cliente.estado === 'Activo' && cliente.vivienda) {
          const manzana = cliente.vivienda.nombre_manzana || ''
          const numero = cliente.vivienda.numero_vivienda || ''
          return `${manzana}${numero}`
        } else if (cliente.estado === 'Interesado' && cliente.interes) {
          const manzana = cliente.interes.nombre_manzana || ''
          const numero = cliente.interes.numero_vivienda || ''
          return `${manzana}${numero}`
        }
        return ''
      }

      const viviendaA = getViviendaId(a)
      const viviendaB = getViviendaId(b)

      // Si alguno está vacío, ponerlo al final
      if (!viviendaA && viviendaB) return 1
      if (viviendaA && !viviendaB) return -1
      if (!viviendaA && !viviendaB) return 0

      // Ordenar alfabéticamente con sensibilidad numérica (A1, A2, A3, A10)
      return viviendaA.localeCompare(viviendaB, undefined, { numeric: true })
    })

    return resultado
  }, [clientes, filtros.busqueda, filtros.estado])

  // =====================================================
  // ESTADÍSTICAS COMPUTADAS
  // =====================================================

  const estadisticasComputadas = useMemo(() => {
    if (estadisticas) return estadisticas

    // Fallback: calcular desde clientes cargados
    return {
      total: clientes.length,
      interesados: clientes.filter(c => c.estado === 'Interesado').length,
      activos: clientes.filter(
        c => c.estado === 'Activo' && (c.vivienda?.saldo_pendiente ?? 1) > 0
      ).length,
      inactivos: clientes.filter(c => c.estado === 'Inactivo').length,
      renunciaron: clientes.filter(c => c.estado === 'Renunci\u00f3').length,
      propietarios: clientes.filter(
        c =>
          c.estado === 'Propietario' ||
          (c.estado === 'Activo' && (c.vivienda?.saldo_pendiente ?? 1) === 0)
      ).length,
    }
  }, [clientes, estadisticas])

  // =====================================================
  // ACCIONES DE MODALES
  // =====================================================

  const abrirModalCrear = useCallback(() => {
    setModalCrear(true)
    setModalEditar(false)
    setClienteEditar(null)
  }, [])

  const abrirModalEditar = useCallback((cliente: ClienteResumen) => {
    setClienteEditar(cliente)
    setModalEditar(true)
    setModalCrear(false)
  }, [])

  const cerrarModal = useCallback(() => {
    setModalCrear(false)
    setModalEditar(false)
    setClienteEditar(null)
  }, [])

  const abrirModalEliminar = useCallback((id: string) => {
    setClienteEliminar(id)
    setModalEliminar(true)
  }, [])

  const confirmarEliminar = useCallback(async () => {
    if (!clienteEliminar) return

    try {
      await eliminarMutation.mutateAsync(clienteEliminar)
      setModalEliminar(false)
      setClienteEliminar(null)
    } catch (error) {
      // Error ya manejado por mutation
      logger.error('Error eliminando cliente:', error)
    }
  }, [clienteEliminar, eliminarMutation])

  const cancelarEliminar = useCallback(() => {
    setModalEliminar(false)
    setClienteEliminar(null)
  }, [])

  // =====================================================
  // ACCIONES DE FILTROS
  // =====================================================

  const actualizarFiltros = useCallback(
    (nuevosFiltros: Partial<FiltrosClientes>) => {
      setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
    },
    []
  )

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      estado: [],
      busqueda: '',
    })
  }, [])

  const aplicarBusqueda = useCallback((termino: string) => {
    setFiltros(prev => ({ ...prev, busqueda: termino }))
  }, [])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Datos
    clientes: clientesFiltrados,
    clientesFiltrados,
    todosLosClientes: clientes,
    isLoading,
    isFetching,
    error: error?.message || null,
    estadisticas: estadisticasComputadas,

    // Modales
    modalCrear,
    modalEditar,
    modalEliminar,
    clienteEditar,
    clienteEliminar,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,

    // Filtros
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    aplicarBusqueda,

    // Acciones
    refrescar: refetch,

    // Contadores
    totalFiltrados: clientesFiltrados.length,
  }
}
