'use client'

import { useMemo, useState } from 'react'

import type { NegociacionConAbonos } from '../types'

import { useNegociacionesAbonos } from './index'

/** Etapa del pago, que es también el filtro de las tarjetas */
export type EtapaPago = 'todos' | 'sin_abonos' | 'en_curso' | 'avanzados'

/** A partir de este % se considera que al cliente le falta poco */
export const UMBRAL_AVANZADO = 80

export function etapaDePago(
  n: NegociacionConAbonos
): Exclude<EtapaPago, 'todos'> {
  if ((n.total_abonado || 0) <= 0) return 'sin_abonos'
  return (n.porcentaje_pagado || 0) >= UMBRAL_AVANZADO
    ? 'avanzados'
    : 'en_curso'
}

/** Texto en que se busca: nombre, cédula, proyecto y vivienda ("A1", "a 1") */
function textoBusqueda(n: NegociacionConAbonos): string {
  const manzana = n.vivienda.manzana?.nombre || ''
  const numero = n.vivienda.numero || ''
  return [
    `${n.cliente.nombres} ${n.cliente.apellidos}`,
    n.cliente.numero_documento,
    n.proyecto?.nombre || '',
    `${manzana}${numero}`,
    `${manzana} ${numero}`,
  ]
    .join(' ')
    .toLowerCase()
}

/**
 * Lista de clientes con negociación activa para elegir a quién registrarle
 * un abono: búsqueda, proyecto y etapa del pago. El orden y la paginación
 * los maneja la tabla.
 */
export function useNegociacionesList() {
  const { negociaciones, isLoading, error, estadisticas } =
    useNegociacionesAbonos()

  const [busqueda, setBusqueda] = useState('')
  const [proyectoFiltro, setProyectoFiltro] = useState('todos')
  const [etapa, setEtapa] = useState<EtapaPago>('todos')

  const proyectosDisponibles = useMemo(() => {
    const nombres = negociaciones
      .map(n => n.proyecto?.nombre)
      .filter((n): n is string => Boolean(n))
    return [...new Set(nombres)].sort((a, b) => a.localeCompare(b, 'es'))
  }, [negociaciones])

  // Búsqueda + proyecto (las tarjetas cuentan sobre esto)
  const porBusqueda = useMemo(() => {
    const termino = busqueda.toLowerCase().trim()
    return negociaciones.filter(n => {
      if (proyectoFiltro !== 'todos' && n.proyecto?.nombre !== proyectoFiltro)
        return false
      if (!termino) return true
      const texto = textoBusqueda(n)
      return (
        texto.includes(termino) ||
        texto.replace(/\s/g, '').includes(termino.replace(/\s/g, ''))
      )
    })
  }, [negociaciones, busqueda, proyectoFiltro])

  const conteos = useMemo(() => {
    const c: Record<EtapaPago, number> = {
      todos: porBusqueda.length,
      sin_abonos: 0,
      en_curso: 0,
      avanzados: 0,
    }
    porBusqueda.forEach(n => c[etapaDePago(n)]++)
    return c
  }, [porBusqueda])

  const negociacionesFiltradas = useMemo(
    () =>
      etapa === 'todos'
        ? porBusqueda
        : porBusqueda.filter(n => etapaDePago(n) === etapa),
    [porBusqueda, etapa]
  )

  // Avance de toda la cartera (recaudado / total a pagar)
  const porcentajeCartera =
    estadisticas.totalVentas > 0
      ? Math.round((estadisticas.totalAbonado / estadisticas.totalVentas) * 100)
      : 0

  const hayFiltros =
    busqueda.trim().length > 0 ||
    proyectoFiltro !== 'todos' ||
    etapa !== 'todos'

  const limpiarFiltros = () => {
    setBusqueda('')
    setProyectoFiltro('todos')
    setEtapa('todos')
  }

  return {
    negociaciones,
    negociacionesFiltradas,
    proyectosDisponibles,
    conteos,
    porcentajeCartera,
    busqueda,
    setBusqueda,
    proyectoFiltro,
    setProyectoFiltro,
    etapa,
    setEtapa,
    hayFiltros,
    limpiarFiltros,
    isLoading,
    error,
    estadisticas,
  }
}
