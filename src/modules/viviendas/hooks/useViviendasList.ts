import { useCallback, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { obtenerProyectosSimples } from '@/modules/proyectos/services/proyectos-consultas.service'
import { usePagination } from '@/shared/hooks/usePagination'

import type { FiltrosViviendas } from '../types'

import {
  useEliminarViviendaMutation,
  useViviendasQuery,
} from './useViviendasQuery'

/**
 * Hook para gestión del listado de viviendas
 * Refactorizado con React Query
 * Responsabilidades:
 * - Gestionar filtros y búsqueda
 * - Selección y eliminación
 * - Cargar proyectos para filtros
 */
export function useViviendasList() {
  const [modalEliminar, setModalEliminar] = useState(false)
  const [viviendaEliminar, setViviendaEliminar] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<FiltrosViviendas>({
    search: '',
    proyecto_id: '',
    manzana_id: undefined,
    estado: '',
  })

  // ✅ React Query hooks
  const {
    data: viviendas = [],
    isLoading: cargando,
    error,
    refetch,
  } = useViviendasQuery(filtros)
  const eliminarMutation = useEliminarViviendaMutation()

  // ✅ Proyectos para filtro con React Query (id + nombre solamente)
  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos', 'simples'],
    queryFn: obtenerProyectosSimples,
    staleTime: 5 * 60 * 1000,
  })

  const viviendasFiltradas = useMemo(() => {
    let resultado = [...viviendas]

    if (filtros.search) {
      const termino = filtros.search.toLowerCase()
      resultado = resultado.filter(
        vivienda =>
          vivienda.matricula_inmobiliaria?.toLowerCase().includes(termino) ||
          vivienda.nomenclatura?.toLowerCase().includes(termino) ||
          vivienda.numero.toLowerCase().includes(termino)
      )
    }

    if (filtros.proyecto_id) {
      resultado = resultado.filter(
        vivienda => vivienda.manzanas?.proyecto_id === filtros.proyecto_id
      )
    }

    if (filtros.manzana_id) {
      resultado = resultado.filter(
        vivienda => vivienda.manzana_id === filtros.manzana_id
      )
    }

    if (filtros.estado) {
      resultado = resultado.filter(
        vivienda => vivienda.estado === filtros.estado
      )
    }

    return resultado
  }, [viviendas, filtros])

  // ✅ Hook de paginación genérico (reutilizable)
  const paginacion = usePagination(viviendasFiltradas, {
    initialPage: 1,
    initialPageSize: 9, // Default: 9 cards (3×3 grid)
    autoScrollOnChange: true,
  })

  const abrirModalEliminar = useCallback((id: string) => {
    setViviendaEliminar(id)
    setModalEliminar(true)
  }, [])

  const confirmarEliminar = useCallback(async () => {
    if (!viviendaEliminar) return

    await eliminarMutation.mutateAsync(viviendaEliminar)
    setModalEliminar(false)
    setViviendaEliminar(null)
  }, [viviendaEliminar, eliminarMutation])

  const cancelarEliminar = useCallback(() => {
    setModalEliminar(false)
    setViviendaEliminar(null)
  }, [])

  const actualizarFiltros = useCallback(
    (nuevosFiltros: Partial<FiltrosViviendas>) => {
      setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
      paginacion.goToFirstPage() // Reset a página 1 al cambiar filtros
    },
    [paginacion]
  )

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      search: '',
      proyecto_id: '',
      manzana_id: undefined,
      estado: '',
    })
    paginacion.goToFirstPage() // Reset a página 1 al limpiar filtros
  }, [paginacion])

  const estadisticas = useMemo(() => {
    const total = viviendas.length
    const disponibles = viviendas.filter(v => v.estado === 'Disponible').length
    const asignadas = viviendas.filter(v => v.estado === 'Asignada').length
    const entregadas = viviendas.filter(v => v.estado === 'Entregada').length
    const propietario = viviendas.filter(v => v.estado === 'Propietario').length

    const valorTotal = viviendas.reduce(
      (sum, v) => sum + (v.valor_total || 0),
      0
    )

    return {
      total,
      disponibles,
      asignadas,
      entregadas,
      propietario,
      valorTotal,
    }
  }, [viviendas])

  return {
    // ✅ Para CARDS: viviendas paginadas (hook maneja paginación)
    viviendas: paginacion.items,
    // ✅ Para TABLA: todas las viviendas filtradas (TanStack Table maneja paginación)
    viviendasFiltradas,
    todasLasViviendas: viviendas,
    cargando,
    error: error?.message || null,

    modalEliminar,
    viviendaEliminar,
    abrirModalEliminar,
    confirmarEliminar,
    cancelarEliminar,

    filtros,
    actualizarFiltros,
    limpiarFiltros,

    refrescar: refetch,

    estadisticas,
    totalFiltradas: viviendasFiltradas.length,
    proyectos,

    // ✅ PAGINACIÓN (solo para cards) - Usando hook genérico
    paginaActual: paginacion.currentPage,
    totalPaginas: paginacion.totalPages,
    itemsPorPagina: paginacion.pageSize,
    cambiarPagina: paginacion.setPage,
    cambiarItemsPorPagina: paginacion.setPageSize,
  }
}
