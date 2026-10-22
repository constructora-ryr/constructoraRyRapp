/**
 * Historial del cliente: eventos de audit_log (humanizados) + notas
 * manuales en una sola línea de tiempo, con búsqueda, categoría,
 * agrupación por día y ocultar/restaurar eventos (admins).
 */

'use client'

import { useCallback, useMemo, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { historialClienteService } from '../services/historial-cliente.service'
import { notasHistorialService } from '../services/notas-historial.service'
import type { EventoHistorialCliente } from '../types/historial.types'
import {
  agruparPorDia,
  calcularResumen,
  contarPorCategoria,
  esEventoVisible,
  filtrarEventos,
} from '../utils/historial-timeline.utils'
import { humanizarEventos } from '../utils/humanizador-eventos'
import { convertirNotasAEventos } from '../utils/notas-a-eventos.utils'

interface UseHistorialClienteProps {
  clienteId: string
  habilitado?: boolean
  limit?: number
}

export function useHistorialCliente({
  clienteId,
  habilitado = true,
  limit = 200,
}: UseHistorialClienteProps) {
  const queryClient = useQueryClient()

  const [busqueda, setBusqueda] = useState('')
  // Tabla de audit_log ('clientes', 'negociaciones'…), 'notas' o 'todos'
  const [categoria, setCategoria] = useState('todos')
  // Solo admins: incluir eventos ocultos
  const [mostrarOcultos, setMostrarOcultos] = useState(false)

  const queryKeyEventos = [
    'historial-cliente',
    clienteId,
    limit,
    mostrarOcultos,
  ] as const

  const eventosQuery = useQuery({
    queryKey: queryKeyEventos,
    queryFn: () =>
      historialClienteService.obtenerHistorial(
        clienteId,
        limit,
        mostrarOcultos
      ),
    enabled: habilitado && !!clienteId,
    refetchOnWindowFocus: false,
    // Siempre fresco al abrir la pestaña: otros módulos registran eventos
    staleTime: 0,
  })

  const notasQuery = useQuery({
    queryKey: ['notas-historial-cliente', clienteId],
    queryFn: () => notasHistorialService.obtenerNotasCliente(clienteId),
    enabled: habilitado && !!clienteId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })

  // Eventos + notas, del más reciente al más antiguo
  const todosLosEventos = useMemo(() => {
    const eventos = humanizarEventos(eventosQuery.data ?? []).filter(
      esEventoVisible
    )
    const notas = convertirNotasAEventos(notasQuery.data ?? [])
    return [...eventos, ...notas].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
  }, [eventosQuery.data, notasQuery.data])

  const eventosFiltrados = useMemo(
    () => filtrarEventos(todosLosEventos, { categoria, busqueda }),
    [todosLosEventos, categoria, busqueda]
  )

  const eventosAgrupados = useMemo(
    () => agruparPorDia(eventosFiltrados),
    [eventosFiltrados]
  )

  const estadisticas = useMemo(
    () => ({
      ...calcularResumen(todosLosEventos),
      filtrados: eventosFiltrados.length,
    }),
    [todosLosEventos, eventosFiltrados]
  )

  // Cuántos eventos hay por categoría (para los filtros)
  const conteoPorCategoria = useMemo(
    () => contarPorCategoria(todosLosEventos),
    [todosLosEventos]
  )

  const limpiarFiltros = useCallback(() => {
    setBusqueda('')
    setCategoria('todos')
  }, [])

  /** Cambia `oculto` en caché al instante y revierte si el servidor falla */
  const cambiarOculto = async (eventoId: string, ocultar: boolean) => {
    const anterior =
      queryClient.getQueryData<EventoHistorialCliente[]>(queryKeyEventos)

    queryClient.setQueryData<EventoHistorialCliente[]>(
      queryKeyEventos,
      (old = []) =>
        ocultar && !mostrarOcultos
          ? old.filter(e => e.id !== eventoId)
          : old.map(e => (e.id === eventoId ? { ...e, oculto: ocultar } : e))
    )

    try {
      if (ocultar) await historialClienteService.ocultarEvento(eventoId)
      else await historialClienteService.restaurarEvento(eventoId)
      toast.success(
        ocultar ? 'Evento ocultado del historial' : 'Evento restaurado'
      )
    } catch (err) {
      queryClient.setQueryData(queryKeyEventos, anterior)
      toast.error(
        err instanceof Error
          ? err.message
          : ocultar
            ? 'No se pudo ocultar el evento'
            : 'No se pudo restaurar el evento'
      )
    }
  }

  return {
    eventosAgrupados,
    estadisticas,
    conteoPorCategoria,
    isLoading: eventosQuery.isLoading || notasQuery.isLoading,
    error: eventosQuery.error || notasQuery.error,
    refetch: () => {
      eventosQuery.refetch()
      notasQuery.refetch()
    },

    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    limpiarFiltros,

    mostrarOcultos,
    setMostrarOcultos,
    ocultarEvento: (id: string) => cambiarOculto(id, true),
    restaurarEvento: (id: string) => cambiarOculto(id, false),
  }
}
