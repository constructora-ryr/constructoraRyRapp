'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAbonosQuery, type AbonoConInfo } from './useAbonosQuery'

// Re-export para consumidores externos
export type { AbonoConInfo }

export const PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number]

export type RangoFecha =
  | 'todo'
  | 'este-mes'
  | 'mes-anterior'
  | 'ultimos-3-meses'
  | 'este-ano'
  | 'personalizado'

export interface FiltrosAbonos {
  busqueda: string
  fuente: string // nombre de fuente o 'todas'
  rango: RangoFecha
  fechaDesde: string // YYYY-MM-DD, solo para 'personalizado'
  fechaHasta: string // YYYY-MM-DD, solo para 'personalizado'
  mostrarActivos: boolean
  mostrarAnulados: boolean
  mostrarRenunciados: boolean
}

export interface EstadisticasAbonos {
  totalAbonos: number
  montoTotal: number
  montoEsteMes: number
  abonosEsteMes: number
}

/**
 * 🎣 HOOK: useAbonosList
 *
 * Wrapper de presentación sobre useAbonosQuery (React Query).
 * Agrega filtrado local, paginación, estadísticas y meses disponibles.
 */
export function useAbonosList() {
  const {
    abonos,
    cargando: isLoading,
    error: queryError,
    refrescar,
  } = useAbonosQuery()

  const [filtros, setFiltros] = useState<FiltrosAbonos>({
    busqueda: '',
    fuente: 'todas',
    rango: 'todo',
    fechaDesde: '',
    fechaHasta: '',
    mostrarActivos: true,
    mostrarAnulados: false,
    mostrarRenunciados: false,
  })

  const [paginaActual, setPaginaActual] = useState(1)
  const [pageSize, setPageSize] = useState<PageSizeOption>(PAGE_SIZE)

  // Desestructurar para deps primitivas en useEffect
  const {
    busqueda,
    fuente,
    rango,
    fechaDesde,
    fechaHasta,
    mostrarActivos,
    mostrarAnulados,
    mostrarRenunciados,
  } = filtros

  // Resetear a página 1 al cambiar cualquier filtro o tamaño de página
  useEffect(() => {
    setPaginaActual(1)
  }, [
    busqueda,
    fuente,
    rango,
    fechaDesde,
    fechaHasta,
    mostrarActivos,
    mostrarAnulados,
    mostrarRenunciados,
    pageSize,
  ])

  /**
   * 🔍 Filtrar abonos según criterios
   */
  const abonosFiltrados = useMemo(() => {
    let resultado = [...abonos]

    // Filtrado por categoría (checklist): activos, anulados, renunciados
    resultado = resultado.filter(a => {
      const esAnulado = a.estado === 'Anulado'
      const esDeRenuncia = a.negociacion?.estado === 'Cerrada por Renuncia'

      // Anulados tienen prioridad: un abono anulado de renuncia → anulado
      if (esAnulado) return filtros.mostrarAnulados
      if (esDeRenuncia) return filtros.mostrarRenunciados
      return filtros.mostrarActivos
    })

    // Filtro por búsqueda (nombre, CC, RYR-XXXX, vivienda, proyecto)
    if (filtros.busqueda.trim()) {
      const termino = filtros.busqueda.toLowerCase().trim()
      resultado = resultado.filter(abono => {
        const nombreCompleto =
          `${abono.cliente.nombres} ${abono.cliente.apellidos}`.toLowerCase()
        const documento = abono.cliente.numero_documento.toLowerCase()
        const recibo = abono.numero_recibo.toLowerCase()
        // Vivienda: acepta "A17", "17", "a", "mz.a casa 17"…
        const viviendaRef =
          `${abono.vivienda.manzana.identificador}${abono.vivienda.numero}`.toLowerCase()
        const proyectoNombre = abono.proyecto.nombre.toLowerCase()
        const reciboMatch = recibo.includes(termino)
        return (
          nombreCompleto.includes(termino) ||
          documento.includes(termino) ||
          reciboMatch ||
          viviendaRef.includes(termino) ||
          proyectoNombre.includes(termino)
        )
      })
    }

    // Filtro por fuente de pago
    if (filtros.fuente && filtros.fuente !== 'todas') {
      resultado = resultado.filter(
        abono => abono.fuente_pago.tipo === filtros.fuente
      )
    }

    // Filtro por rango de fecha
    if (filtros.rango !== 'todo') {
      const ahora = new Date()
      let desde: Date | null = null
      let hasta: Date | null = null

      if (filtros.rango === 'este-mes') {
        desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
        hasta = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
      } else if (filtros.rango === 'mes-anterior') {
        desde = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
        hasta = new Date(ahora.getFullYear(), ahora.getMonth(), 0)
      } else if (filtros.rango === 'ultimos-3-meses') {
        desde = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1)
        hasta = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0)
      } else if (filtros.rango === 'este-ano') {
        desde = new Date(ahora.getFullYear(), 0, 1)
        hasta = new Date(ahora.getFullYear(), 11, 31)
      } else if (filtros.rango === 'personalizado') {
        desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null
        hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null
      }

      resultado = resultado.filter(abono => {
        const fecha = new Date(abono.fecha_abono)
        if (desde && fecha < desde) return false
        if (hasta && fecha > hasta) return false
        return true
      })
    }

    return resultado
  }, [abonos, filtros])

  // ─── Paginación ──────────────────────────────────────────────────────────
  const totalFiltrado = abonosFiltrados.length
  const totalPaginas = Math.max(1, Math.ceil(totalFiltrado / pageSize))

  const abonosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * pageSize
    return abonosFiltrados.slice(inicio, inicio + pageSize)
  }, [abonosFiltrados, paginaActual, pageSize])

  // ─── Estadísticas (sobre el total filtrado, no solo la página actual) ───
  const estadisticas = useMemo<EstadisticasAbonos>(() => {
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    const abonosEsteMes = abonosFiltrados.filter(abono => {
      const fechaAbono = new Date(abono.fecha_abono)
      return fechaAbono >= inicioMes
    })

    return {
      totalAbonos: abonosFiltrados.length,
      montoTotal: abonosFiltrados.reduce(
        (sum, abono) => sum + Number(abono.monto),
        0
      ),
      montoEsteMes: abonosEsteMes.reduce(
        (sum, abono) => sum + Number(abono.monto),
        0
      ),
      abonosEsteMes: abonosEsteMes.length,
    }
  }, [abonosFiltrados])

  // ─── Control de filtros ───────────────────────────────────────────────────
  const actualizarFiltros = (nuevosFiltros: Partial<FiltrosAbonos>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      fuente: 'todas',
      rango: 'todo',
      fechaDesde: '',
      fechaHasta: '',
      mostrarActivos: true,
      mostrarAnulados: false,
      mostrarRenunciados: false,
    })
  }

  const toggleMostrarActivos = useCallback(() => {
    setFiltros(prev => ({ ...prev, mostrarActivos: !prev.mostrarActivos }))
  }, [])

  const toggleMostrarAnulados = useCallback(() => {
    setFiltros(prev => ({ ...prev, mostrarAnulados: !prev.mostrarAnulados }))
  }, [])

  const toggleMostrarRenunciados = useCallback(() => {
    setFiltros(prev => ({
      ...prev,
      mostrarRenunciados: !prev.mostrarRenunciados,
    }))
  }, [])

  const fuentesUnicas = useMemo(() => {
    const set = new Set<string>()
    abonos.forEach(a => {
      if (a.fuente_pago.tipo) set.add(a.fuente_pago.tipo)
    })
    return Array.from(set).sort()
  }, [abonos])

  return {
    abonos: abonosPaginados,
    abonosCompletos: abonos,
    estadisticas,
    fuentesUnicas,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    toggleMostrarActivos,
    toggleMostrarAnulados,
    toggleMostrarRenunciados,
    paginaActual,
    totalPaginas,
    totalFiltrado,
    setPaginaActual,
    pageSize,
    setPageSize,
    isLoading,
    error: queryError?.message ?? null,
    refetch: refrescar,
  }
}
