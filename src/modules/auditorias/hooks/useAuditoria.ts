'use client'

/**
 * Datos de la página de Auditoría: eventos con filtros y "cargar más",
 * usuarios para el filtro y registro de seguridad.
 */

import { useMemo, useState } from 'react'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { useDebounce } from '@/shared/hooks'

import {
  listarEventos,
  listarSeguridad,
  listarUsuarios,
  POR_PAGINA,
} from '../services/auditoria.service'
import type { FiltrosAuditoria } from '../types'

const FILTROS_INICIALES: FiltrosAuditoria = {
  usuarioId: null,
  grupo: null,
  accion: null,
  rango: '7d',
  busqueda: '',
}

export const auditoriaKeys = {
  eventos: (f: FiltrosAuditoria) => ['auditoria', 'eventos', f] as const,
  usuarios: ['auditoria', 'usuarios'] as const,
  seguridad: ['auditoria', 'seguridad'] as const,
}

const siguiente = (ultima: unknown[], paginas: unknown[][]) =>
  ultima.length === POR_PAGINA ? paginas.length : undefined

export function useAuditoria() {
  const [filtros, setFiltros] = useState<FiltrosAuditoria>(FILTROS_INICIALES)
  const busqueda = useDebounce(filtros.busqueda, 400)
  const efectivos = useMemo(
    () => ({ ...filtros, busqueda }),
    [filtros, busqueda]
  )

  const eventos = useInfiniteQuery({
    queryKey: auditoriaKeys.eventos(efectivos),
    queryFn: ({ pageParam }) => listarEventos(efectivos, pageParam),
    initialPageParam: 0,
    getNextPageParam: siguiente,
    staleTime: 30 * 1000,
  })

  const usuarios = useQuery({
    queryKey: auditoriaKeys.usuarios,
    queryFn: listarUsuarios,
    staleTime: 10 * 60 * 1000,
  })

  const cambiar = <K extends keyof FiltrosAuditoria>(
    campo: K,
    valor: FiltrosAuditoria[K]
  ) => setFiltros(prev => ({ ...prev, [campo]: valor }))

  const hayFiltros =
    !!filtros.usuarioId ||
    !!filtros.grupo ||
    !!filtros.accion ||
    filtros.rango !== FILTROS_INICIALES.rango ||
    !!filtros.busqueda

  return {
    filtros,
    cambiar,
    limpiar: () => setFiltros(FILTROS_INICIALES),
    hayFiltros,
    eventos: eventos.data?.pages.flat() ?? [],
    cargando: eventos.isLoading,
    error: eventos.error as Error | null,
    hayMas: !!eventos.hasNextPage,
    cargandoMas: eventos.isFetchingNextPage,
    cargarMas: () => void eventos.fetchNextPage(),
    usuarios: usuarios.data ?? [],
  }
}

export function useSeguridad(activo: boolean) {
  const q = useInfiniteQuery({
    queryKey: auditoriaKeys.seguridad,
    queryFn: ({ pageParam }) => listarSeguridad(pageParam),
    initialPageParam: 0,
    getNextPageParam: siguiente,
    enabled: activo,
    staleTime: 30 * 1000,
  })
  return {
    eventos: q.data?.pages.flat() ?? [],
    cargando: q.isLoading,
    hayMas: !!q.hasNextPage,
    cargandoMas: q.isFetchingNextPage,
    cargarMas: () => void q.fetchNextPage(),
  }
}
