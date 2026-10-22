/**
 * usePasoUbicacion — datos del Paso 1: proyectos activos, manzanas con casas
 * por registrar y la cuadrícula de números (libres y ya creados).
 *
 * Usa las claves de viviendasKeys para que crear una vivienda invalide estos
 * datos (antes usaba claves sueltas y el número recién creado seguía libre).
 */

import { useEffect, useMemo, useRef } from 'react'

import { useQuery } from '@tanstack/react-query'
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form'

import type { ViviendaSchemaType } from '../schemas/vivienda.schemas'
import { viviendasService } from '../services/viviendas.service'

import { viviendasKeys } from './useViviendasQuery'

export interface NumeroCasa {
  numero: string
  ocupado: boolean
}

function useProyectosActivos(enabled = true) {
  return useQuery({
    queryKey: viviendasKeys.proyectos,
    queryFn: () => viviendasService.obtenerProyectos(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

function useManzanasProyecto(proyectoId: string, enabled = true) {
  return useQuery({
    queryKey: viviendasKeys.manzanas(proyectoId),
    queryFn: () => viviendasService.obtenerManzanasDisponibles(proyectoId),
    enabled: enabled && !!proyectoId,
    staleTime: 60 * 1000,
  })
}

/** Nombres legibles de la ubicación (para resúmenes); reutiliza la caché */
export function useNombresUbicacion(proyectoId: string, manzanaId: string) {
  const { data: proyectos = [] } = useProyectosActivos()
  const { data: manzanas = [] } = useManzanasProyecto(proyectoId)
  return {
    proyecto: proyectos.find(p => p.id === proyectoId)?.nombre ?? null,
    manzana: manzanas.find(m => m.id === manzanaId)?.nombre ?? null,
  }
}

interface UsePasoUbicacionProps {
  setValue: UseFormSetValue<ViviendaSchemaType>
  watch: UseFormWatch<ViviendaSchemaType>
  /** false en edición: la ubicación no cambia y no hace falta consultar */
  enabled?: boolean
}

export function usePasoUbicacion({
  setValue,
  watch,
  enabled = true,
}: UsePasoUbicacionProps) {
  const proyectoId = watch('proyecto_id')
  const manzanaId = watch('manzana_id')

  const { data: proyectos = [], isLoading: cargandoProyectos } =
    useProyectosActivos(enabled)
  const { data: manzanas = [], isLoading: cargandoManzanas } =
    useManzanasProyecto(proyectoId, enabled)
  const { data: viviendasManzana = [], isLoading: cargandoNumeros } = useQuery({
    queryKey: viviendasKeys.manzanaViviendas(manzanaId),
    queryFn: () => viviendasService.obtenerPorManzana(manzanaId),
    enabled: enabled && !!manzanaId,
    staleTime: 30 * 1000,
  })

  const manzana = useMemo(
    () => manzanas.find(m => m.id === manzanaId),
    [manzanas, manzanaId]
  )

  const numeros = useMemo((): NumeroCasa[] => {
    if (!manzana) return []
    const usados = new Set(viviendasManzana.map(v => String(v.numero)))
    return Array.from({ length: manzana.total_viviendas }, (_, i) => {
      const numero = String(i + 1)
      return { numero, ocupado: usados.has(numero) }
    })
  }, [manzana, viviendasManzana])

  // Al cambiar proyecto o manzana se limpia lo que dependía de ellos
  // (solo cuando cambia el usuario, no al montar con un valor existente)
  const proyectoPrevio = useRef(proyectoId)
  const manzanaPrevia = useRef(manzanaId)
  useEffect(() => {
    if (proyectoPrevio.current && proyectoPrevio.current !== proyectoId) {
      setValue('manzana_id', '')
      setValue('numero', '')
    }
    proyectoPrevio.current = proyectoId
  }, [proyectoId, setValue])
  useEffect(() => {
    if (manzanaPrevia.current && manzanaPrevia.current !== manzanaId) {
      setValue('numero', '')
    }
    manzanaPrevia.current = manzanaId
  }, [manzanaId, setValue])

  return {
    proyectos,
    manzanas,
    manzana,
    numeros,
    cargandoProyectos,
    cargandoManzanas,
    cargandoNumeros,
  }
}
