'use client'

import { useCallback, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { FiltrosAuditoria } from '../types'

import {
  auditoriasKeys,
  useAuditoriasEstadisticasQuery,
  useAuditoriasListQuery,
} from './useAuditoriasQuery'

export function useAuditorias() {
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({ busqueda: '' })
  const [paginaActual, setPaginaActual] = useState(1)

  const queryClient = useQueryClient()

  const {
    data: listData,
    isLoading: cargandoLista,
    error: errorLista,
  } = useAuditoriasListQuery(filtros, paginaActual)

  const { data: estadisticas = null } = useAuditoriasEstadisticasQuery()

  const registros = listData?.datos ?? []
  const totalRegistros = listData?.total ?? 0
  const totalPaginas = listData?.totalPaginas ?? 0
  const cargando = cargandoLista
  const error = errorLista instanceof Error ? errorLista.message : null

  const aplicarFiltros = useCallback(
    (nuevosFiltros: Partial<FiltrosAuditoria>) => {
      setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
      setPaginaActual(1)
    },
    []
  )

  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: '' })
    setPaginaActual(1)
  }, [])

  const cambiarPagina = useCallback((pagina: number) => {
    setPaginaActual(pagina)
  }, [])

  const refrescar = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: auditoriasKeys.all })
  }, [queryClient])

  return {
    registros,
    estadisticas,
    cargando,
    error,
    filtros,
    paginaActual,
    totalRegistros,
    totalPaginas,
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    refrescar,
  }
}
