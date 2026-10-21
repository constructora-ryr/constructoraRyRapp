'use client'

import { useCallback, useMemo, useState } from 'react'

import { useAbonosQuery, type AbonoConInfo } from './useAbonosQuery'

// Re-export para consumidores externos
export type { AbonoConInfo }

export type RangoFecha =
  | 'todo'
  | 'este-mes'
  | 'mes-anterior'
  | 'ultimos-3-meses'
  | 'este-ano'
  | 'personalizado'

/** Estado visible del abono (ver ABONO_ESTADO_BADGE) */
export type EstadoAbonoVisible = 'Activo' | 'Anulado' | 'Renuncia'
export type EstadoAbonoFiltro = EstadoAbonoVisible | 'Todos'

export interface FiltrosAbonos {
  busqueda: string
  fuente: string // nombre de fuente o 'todas'
  entidad: string // nombre de entidad o 'todas'
  rango: RangoFecha
  fechaDesde: string // YYYY-MM-DD, solo para 'personalizado'
  fechaHasta: string // YYYY-MM-DD, solo para 'personalizado'
  estado: EstadoAbonoFiltro
}

export interface EstadisticasAbonos {
  /** Conteo por estado con los demás filtros aplicados (tarjetas de filtro) */
  conteos: Record<EstadoAbonoFiltro, number>
  /** Suma de lo filtrado sin contar anulados */
  montoFiltrado: number
  /** Recaudo por tipo de fuente (mayor primero), sin aplicar el filtro de fuente */
  porFuente: { tipo: string; monto: number }[]
  /** 'YYYY-MM' → recibos y monto de lo filtrado (separadores de la tabla) */
  porMes: Record<string, { recibos: number; monto: number }>
  /** Encabezado (sin filtros, solo abonos vigentes) */
  totalRecaudado: number
  recaudadoEsteAnio: number
  /** fecha_abono del abono vigente más reciente */
  ultimoAbono: string | null
}

const FILTROS_INICIALES: FiltrosAbonos = {
  busqueda: '',
  fuente: 'todas',
  entidad: 'todas',
  rango: 'todo',
  fechaDesde: '',
  fechaHasta: '',
  estado: 'Activo',
}

/** Un abono anulado cuenta como anulado aunque sea de una renuncia */
export function estadoVisibleAbono(a: AbonoConInfo): EstadoAbonoVisible {
  if (a.estado === 'Anulado') return 'Anulado'
  if (a.negociacion?.estado === 'Cerrada por Renuncia') return 'Renuncia'
  return 'Activo'
}

const pad = (n: number) => String(n).padStart(2, '0')
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** [desde, hasta] en YYYY-MM-DD; null = sin límite */
function limitesRango(f: FiltrosAbonos): [string | null, string | null] | null {
  const ahora = new Date()
  const y = ahora.getFullYear()
  const m = ahora.getMonth()
  switch (f.rango) {
    case 'todo':
      return null
    case 'este-mes':
      return [toDateStr(new Date(y, m, 1)), toDateStr(new Date(y, m + 1, 0))]
    case 'mes-anterior':
      return [toDateStr(new Date(y, m - 1, 1)), toDateStr(new Date(y, m, 0))]
    case 'ultimos-3-meses':
      return [
        toDateStr(new Date(y, m - 2, 1)),
        toDateStr(new Date(y, m + 1, 0)),
      ]
    case 'este-ano':
      return [`${y}-01-01`, `${y}-12-31`]
    case 'personalizado':
      return [f.fechaDesde || null, f.fechaHasta || null]
  }
}

/**
 * 🎣 HOOK: useAbonosList
 *
 * Wrapper de presentación sobre useAbonosQuery (React Query).
 * Filtra en memoria; el orden y la paginación los hace la tabla.
 */
export function useAbonosList(initialBusqueda = '') {
  const {
    abonos,
    cargando: isLoading,
    error: queryError,
    refrescar,
  } = useAbonosQuery()

  const [filtros, setFiltros] = useState<FiltrosAbonos>({
    ...FILTROS_INICIALES,
    busqueda: initialBusqueda,
  })

  // Búsqueda + período: base común de tarjetas, barra de fuentes y tabla
  const abonosBase = useMemo(() => {
    const termino = filtros.busqueda.toLowerCase().trim()
    const limites = limitesRango(filtros)

    return abonos.filter(abono => {
      // Búsqueda: nombre, CC, RYR-15, "A17", proyecto
      if (termino) {
        const nombreCompleto =
          `${abono.cliente.nombres} ${abono.cliente.apellidos}`.toLowerCase()
        const viviendaRef =
          `${abono.vivienda.manzana.identificador}${abono.vivienda.numero}`.toLowerCase()
        const coincide =
          nombreCompleto.includes(termino) ||
          abono.cliente.numero_documento.toLowerCase().includes(termino) ||
          abono.numero_recibo.toLowerCase().includes(termino) ||
          viviendaRef.includes(termino) ||
          abono.proyecto.nombre.toLowerCase().includes(termino)
        if (!coincide) return false
      }

      if (limites) {
        const fecha = abono.fecha_abono.substring(0, 10)
        const [desde, hasta] = limites
        if (desde && fecha < desde) return false
        if (hasta && fecha > hasta) return false
      }

      return true
    })
  }, [abonos, filtros])

  const coincideFuente = useCallback(
    (a: AbonoConInfo) =>
      (filtros.fuente === 'todas' || a.fuente_pago.tipo === filtros.fuente) &&
      (filtros.entidad === 'todas' ||
        a.fuente_pago.entidad === filtros.entidad),
    [filtros.fuente, filtros.entidad]
  )
  const coincideEstado = useCallback(
    (a: AbonoConInfo) =>
      filtros.estado === 'Todos' || estadoVisibleAbono(a) === filtros.estado,
    [filtros.estado]
  )

  // Todos los filtros menos el estado: base de los conteos de las tarjetas
  const abonosSinEstado = useMemo(
    () => abonosBase.filter(coincideFuente),
    [abonosBase, coincideFuente]
  )

  const abonosFiltrados = useMemo(
    () => abonosSinEstado.filter(coincideEstado),
    [abonosSinEstado, coincideEstado]
  )

  const estadisticas = useMemo<EstadisticasAbonos>(() => {
    const conteos: Record<EstadoAbonoFiltro, number> = {
      Todos: abonosSinEstado.length,
      Activo: 0,
      Anulado: 0,
      Renuncia: 0,
    }
    abonosSinEstado.forEach(a => {
      conteos[estadoVisibleAbono(a)]++
    })

    const sumar = (lista: AbonoConInfo[]) =>
      lista.reduce(
        (sum, a) => (a.estado === 'Anulado' ? sum : sum + Number(a.monto)),
        0
      )

    // Barra de fuentes: todos los filtros menos fuente/entidad, para que el
    // segmento elegido se resalte en vez de ocupar el 100 %
    const montos = new Map<string, number>()
    abonosBase
      .filter(a => a.estado !== 'Anulado' && coincideEstado(a))
      .forEach(a => {
        const tipo = a.fuente_pago.tipo
        montos.set(tipo, (montos.get(tipo) ?? 0) + Number(a.monto))
      })
    const porFuente = Array.from(montos, ([tipo, monto]) => ({ tipo, monto }))
      .filter(f => f.monto > 0)
      .sort((x, y) => y.monto - x.monto)

    // Separadores por mes de la tabla (sobre lo filtrado, todas las páginas)
    const porMes: EstadisticasAbonos['porMes'] = {}
    abonosFiltrados.forEach(a => {
      const mes = a.fecha_abono.substring(0, 7)
      const g = (porMes[mes] ??= { recibos: 0, monto: 0 })
      g.recibos++
      if (a.estado !== 'Anulado') g.monto += Number(a.monto)
    })

    // Encabezado: recaudo vigente, sin filtros
    const vigentes = abonos.filter(a => estadoVisibleAbono(a) === 'Activo')
    const anio = String(new Date().getFullYear())
    const ultimoAbono = vigentes.reduce<string | null>(
      (max, a) => (!max || a.fecha_abono > max ? a.fecha_abono : max),
      null
    )

    return {
      conteos,
      montoFiltrado: sumar(abonosFiltrados),
      porFuente,
      porMes,
      totalRecaudado: sumar(vigentes),
      recaudadoEsteAnio: sumar(
        vigentes.filter(a => a.fecha_abono.startsWith(anio))
      ),
      ultimoAbono,
    }
  }, [abonos, abonosBase, abonosSinEstado, abonosFiltrados, coincideEstado])

  // ─── Control de filtros ───────────────────────────────────────────────────
  const actualizarFiltros = useCallback(
    (nuevosFiltros: Partial<FiltrosAbonos>) => {
      setFiltros(prev => ({
        ...prev,
        ...nuevosFiltros,
        // Al cambiar fuente, resetear entidad para no quedar con filtro huérfano
        ...(nuevosFiltros.fuente !== undefined &&
        nuevosFiltros.entidad === undefined
          ? { entidad: 'todas' }
          : {}),
      }))
    },
    []
  )

  const limpiarFiltros = useCallback(() => setFiltros(FILTROS_INICIALES), [])

  const hayFiltros =
    filtros.busqueda.trim() !== '' ||
    filtros.fuente !== 'todas' ||
    filtros.entidad !== 'todas' ||
    filtros.rango !== 'todo' ||
    filtros.estado !== FILTROS_INICIALES.estado

  const fuentesUnicas = useMemo(() => {
    const set = new Set<string>()
    abonos.forEach(a => {
      if (a.fuente_pago.tipo) set.add(a.fuente_pago.tipo)
    })
    return Array.from(set).sort()
  }, [abonos])

  // Entidades únicas según la fuente actualmente seleccionada
  const entidadesUnicas = useMemo(() => {
    const base =
      filtros.fuente !== 'todas'
        ? abonos.filter(a => a.fuente_pago.tipo === filtros.fuente)
        : abonos
    const set = new Set<string>()
    base.forEach(a => {
      if (a.fuente_pago.entidad) set.add(a.fuente_pago.entidad)
    })
    return Array.from(set).sort()
  }, [abonos, filtros.fuente])

  return {
    abonos: abonosFiltrados,
    totalSinFiltrar: abonos.length,
    estadisticas,
    fuentesUnicas,
    entidadesUnicas,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    hayFiltros,
    isLoading,
    error: queryError?.message ?? null,
    refetch: refrescar,
  }
}
