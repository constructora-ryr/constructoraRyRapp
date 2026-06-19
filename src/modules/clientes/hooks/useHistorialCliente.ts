/**
 * Hook para gestionar historial de cliente
 * Carga eventos de audit_log y los humaniza para mostrar en timeline
 */

'use client'

import { useMemo, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { formatDateForDisplay } from '@/lib/utils/date.utils'

import { historialClienteService } from '../services/historial-cliente.service'
import { notasHistorialService } from '../services/notas-historial.service'
import type {
  EventoHistorialHumanizado,
  FiltrosHistorial,
  GrupoEventosPorFecha,
} from '../types/historial.types'
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

  // ========== ESTADO ==========
  const [filtros, setFiltros] = useState<FiltrosHistorial>({})
  const [busqueda, setBusqueda] = useState('')
  const [tipoEvento, setTipoEvento] = useState('')
  const [modulo, setModulo] = useState('')
  const [usuarioFiltro, setUsuarioFiltro] = useState('')
  // Filtro por categoría (tabla: 'clientes' | 'negociaciones' | etc. | 'notas' | 'todos')
  const [categoria, setCategoria] = useState('todos')
  // Toggle para que admins vean eventos ocultos
  const [mostrarOcultos, setMostrarOcultos] = useState(false)

  // ========== QUERIES (Eventos automáticos + Notas manuales) ==========
  const {
    data: eventosRaw = [],
    isLoading: isLoadingEventos,
    error: errorEventos,
    refetch: refetchEventos,
  } = useQuery({
    queryKey: ['historial-cliente', clienteId, limit, mostrarOcultos],
    queryFn: () =>
      historialClienteService.obtenerHistorial(
        clienteId,
        limit,
        mostrarOcultos
      ),
    enabled: habilitado && !!clienteId,
    refetchOnWindowFocus: false,
    staleTime: 0,
  })

  const {
    data: notasRaw = [],
    isLoading: isLoadingNotas,
    error: errorNotas,
    refetch: refetchNotas,
  } = useQuery({
    queryKey: ['notas-historial-cliente', clienteId],
    queryFn: () => notasHistorialService.obtenerNotasCliente(clienteId),
    enabled: habilitado && !!clienteId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos - optimizado
  })

  // ========== HUMANIZAR EVENTOS + CONVERTIR NOTAS ==========
  const eventosHumanizados = useMemo(() => {
    const CAMPOS_UI = new Set(['es_importante', 'anclado_at'])

    return humanizarEventos(eventosRaw).filter(ev => {
      // Excluir reemplazos de archivo del historial visual
      if (
        ev.tipo === 'documento_actualizado' &&
        (ev.metadata?.tipo_operacion as string | undefined) ===
          'REEMPLAZO_ARCHIVO'
      )
        return false

      // Excluir ediciones de documento cuyo diff solo contenga campos de UI
      if (
        ev.tipo === 'documento_actualizado' &&
        (ev.metadata?.tipo_operacion as string | undefined) ===
          'edicion_documento'
      ) {
        const cambios = ev.metadata?.cambios as
          | Record<string, unknown>
          | undefined
        if (cambios) {
          const camposModificados = Object.keys(cambios)
          if (
            camposModificados.length > 0 &&
            camposModificados.every(c => CAMPOS_UI.has(c))
          ) {
            return false
          }
        }
      }

      // Ocultar negociaciones creadas como destino de traslado
      // (ya están representadas en el evento 'traslado_vivienda')
      if (ev.tipo === 'negociacion_traslado_interna') return false

      return true
    })
  }, [eventosRaw])

  const notasComoEventos = useMemo(() => {
    return convertirNotasAEventos(notasRaw)
  }, [notasRaw])

  // ========== UNIFICAR EVENTOS + NOTAS EN TIMELINE ==========
  const todosLosEventos = useMemo(() => {
    return [...eventosHumanizados, ...notasComoEventos].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })
  }, [eventosHumanizados, notasComoEventos])

  // ========== USUARIOS DISPONIBLES ==========
  const usuariosDisponibles = useMemo(() => {
    const usuariosMap = new Map<string, { id: string; email: string }>()

    todosLosEventos.forEach(evento => {
      if (evento.usuario.id && evento.usuario.email) {
        usuariosMap.set(evento.usuario.id, {
          id: evento.usuario.id,
          email: evento.usuario.email,
        })
      }
    })

    return Array.from(usuariosMap.values()).sort((a, b) =>
      a.email.localeCompare(b.email)
    )
  }, [todosLosEventos])

  // ========== FILTRAR Y BUSCAR ==========
  const eventosFiltrados = useMemo(() => {
    let eventos = todosLosEventos

    // Filtrar por categoría (tabla) - nuevo sistema simplificado
    if (categoria && categoria !== 'todos') {
      if (categoria === 'notas') {
        eventos = eventos.filter(e => e.tabla === 'notas')
      } else {
        eventos = eventos.filter(e => e.tabla === categoria)
      }
    }

    // Filtrar por tipo de evento (CREATE, UPDATE, DELETE)
    if (tipoEvento) {
      eventos = eventos.filter(e => e.accion === tipoEvento)
    }

    // Filtrar por módulo
    if (modulo) {
      eventos = eventos.filter(e => e.metadata?.modulo === modulo)
    }

    // Filtrar por usuario
    if (usuarioFiltro) {
      eventos = eventos.filter(e => e.usuario.id === usuarioFiltro)
    }

    // Filtrar por tipo (legacy - mantener compatibilidad)
    if (filtros.tipo && filtros.tipo.length > 0) {
      eventos = eventos.filter(e => filtros.tipo?.includes(e.tipo) ?? false)
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const terminoLower = busqueda.toLowerCase()
      eventos = eventos.filter(e => {
        const textoEvento = `
          ${e.titulo}
          ${e.descripcion}
          ${e.usuario.email}
          ${e.usuario.nombres || ''}
        `.toLowerCase()

        return textoEvento.includes(terminoLower)
      })
    }

    // Filtrar por fechas
    if (filtros.fecha_desde) {
      const fechaDesde = new Date(filtros.fecha_desde)
      eventos = eventos.filter(e => new Date(e.fecha) >= fechaDesde)
    }

    if (filtros.fecha_hasta) {
      const fechaHasta = new Date(filtros.fecha_hasta)
      eventos = eventos.filter(e => new Date(e.fecha) <= fechaHasta)
    }

    return eventos
  }, [
    todosLosEventos,
    filtros,
    busqueda,
    tipoEvento,
    modulo,
    usuarioFiltro,
    categoria,
  ])

  // ========== AGRUPAR POR FECHA ==========
  const eventosAgrupados = useMemo(() => {
    const grupos: Record<string, EventoHistorialHumanizado[]> = {}

    eventosFiltrados.forEach(evento => {
      const fecha = new Date(evento.fecha)
      const fechaKey = fecha.toISOString().split('T')[0] // YYYY-MM-DD

      if (!grupos[fechaKey]) {
        grupos[fechaKey] = []
      }

      grupos[fechaKey].push(evento)
    })

    // Convertir a array y ordenar
    const gruposArray: GrupoEventosPorFecha[] = Object.entries(grupos).map(
      ([fecha, eventos]) => ({
        fecha,
        fechaFormateada: formatearFechaRelativa(fecha),
        eventos,
        total: eventos.length,
      })
    )

    // Ordenar por fecha descendente (más reciente primero)
    gruposArray.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime()
      const fechaB = new Date(b.fecha).getTime()
      return fechaB - fechaA
    })

    return gruposArray
  }, [eventosFiltrados])

  // ========== ESTADÍSTICAS ==========
  const estadisticas = useMemo(() => {
    const total = todosLosEventos.length
    const porTipo: Record<string, number> = {}
    const porColor: Record<string, number> = {}

    // Métricas temporales
    const ahora = new Date()
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - 7)
    const inicioMes = new Date(ahora)
    inicioMes.setDate(1)

    let estaSemana = 0
    let esteMes = 0
    let criticos = 0

    todosLosEventos.forEach(evento => {
      const fechaEvento = new Date(evento.fecha)

      // Contar por tipo
      porTipo[evento.tipo] = (porTipo[evento.tipo] || 0) + 1

      // Contar por color
      porColor[evento.color] = (porColor[evento.color] || 0) + 1

      // Contar temporales
      if (fechaEvento >= inicioSemana) estaSemana++
      if (fechaEvento >= inicioMes) esteMes++

      // Contar críticos (DELETE o acciones de renuncias/eliminación)
      if (evento.accion === 'DELETE' || evento.color === 'red') criticos++
    })

    // Primer evento (el más antiguo = elemento al final del array ya ordenado desc)
    const primerEvento =
      todosLosEventos.length > 0
        ? todosLosEventos[todosLosEventos.length - 1].fecha
        : null

    return {
      total,
      porTipo,
      porColor,
      filtrados: eventosFiltrados.length,
      grupos: eventosAgrupados.length,
      estaSemana,
      esteMes,
      criticos,
      primerEvento,
    }
  }, [todosLosEventos, eventosFiltrados, eventosAgrupados])

  // ========== FUNCIONES DE FILTRADO ==========
  const aplicarFiltros = (nuevosFiltros: Partial<FiltrosHistorial>) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }))
  }

  const limpiarFiltros = () => {
    setFiltros({})
    setBusqueda('')
    setTipoEvento('')
    setModulo('')
    setUsuarioFiltro('')
    setCategoria('todos')
  }

  const tieneAplicados =
    Object.keys(filtros).length > 0 ||
    busqueda.trim() !== '' ||
    tipoEvento !== '' ||
    modulo !== '' ||
    usuarioFiltro !== '' ||
    categoria !== 'todos'

  // ========== RETORNO ==========
  return {
    // Datos
    eventosRaw,
    eventosHumanizados,
    notasRaw,
    todosLosEventos,
    eventosFiltrados,
    eventosAgrupados,
    estadisticas,
    usuariosDisponibles,

    // Estados
    isLoading: isLoadingEventos || isLoadingNotas,
    error: errorEventos || errorNotas,

    // Filtros y búsqueda
    filtros,
    busqueda,
    tipoEvento,
    modulo,
    usuarioFiltro,
    categoria,
    setBusqueda,
    setTipoEvento,
    setModulo,
    setUsuarioFiltro,
    setCategoria,
    aplicarFiltros,
    limpiarFiltros,
    tieneAplicados,

    // Toggle ocultos (solo admins)
    mostrarOcultos,
    setMostrarOcultos,

    // Acciones
    refetch: () => {
      refetchEventos()
      refetchNotas()
    },

    ocultarEvento: async (eventoId: string) => {
      const queryKey = ['historial-cliente', clienteId, limit, mostrarOcultos]
      const prevData =
        queryClient.getQueryData<
          import('../types/historial.types').EventoHistorialCliente[]
        >(queryKey)

      queryClient.setQueryData(
        queryKey,
        (
          old: import('../types/historial.types').EventoHistorialCliente[] = []
        ) =>
          mostrarOcultos
            ? old.map(e => (e.id === eventoId ? { ...e, oculto: true } : e))
            : old.filter(e => e.id !== eventoId)
      )

      try {
        await historialClienteService.ocultarEvento(eventoId)
        toast.success('Evento ocultado del historial')
      } catch (err) {
        queryClient.setQueryData(queryKey, prevData)
        toast.error(
          err instanceof Error ? err.message : 'No se pudo ocultar el evento'
        )
      }
    },

    restaurarEvento: async (eventoId: string) => {
      const queryKey = ['historial-cliente', clienteId, limit, mostrarOcultos]
      const prevData =
        queryClient.getQueryData<
          import('../types/historial.types').EventoHistorialCliente[]
        >(queryKey)

      queryClient.setQueryData(
        queryKey,
        (
          old: import('../types/historial.types').EventoHistorialCliente[] = []
        ) => old.map(e => (e.id === eventoId ? { ...e, oculto: false } : e))
      )

      try {
        await historialClienteService.restaurarEvento(eventoId)
        toast.success('Evento restaurado en el historial')
      } catch (err) {
        queryClient.setQueryData(queryKey, prevData)
        toast.error(
          err instanceof Error ? err.message : 'No se pudo restaurar el evento'
        )
      }
    },
  }
}

/**
 * Formatear fecha relativa (Hoy, Ayer, fecha completa)
 */
function formatearFechaRelativa(fechaStr: string): string {
  const fecha = new Date(fechaStr + 'T12:00:00') // Agregar hora para evitar timezone shift
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)

  const fechaInput = new Date(fecha)
  fechaInput.setHours(0, 0, 0, 0)

  if (fechaInput.getTime() === hoy.getTime()) {
    return 'Hoy'
  }

  if (fechaInput.getTime() === ayer.getTime()) {
    return 'Ayer'
  }

  // Fecha completa: "15 de noviembre de 2025"
  return formatDateForDisplay(fechaStr)
}
