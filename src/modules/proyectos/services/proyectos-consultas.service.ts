import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type { Proyecto } from '../types'

import {
  transformarProyectoDeDB,
  type ProyectoConManzanasDB,
} from './proyectos-helpers.service'

/**
 * Obtiene todos los proyectos de la base de datos
 * @param incluirArchivados - Si es true, incluye proyectos archivados. Por defecto false.
 */
export async function obtenerProyectos(
  incluirArchivados = false
): Promise<Proyecto[]> {
  let query = supabase.from('proyectos').select(
    `
      *,
      manzanas (
        id,
        nombre,
        numero_viviendas
      )
    `
  )

  if (!incluirArchivados) {
    query = query.eq('archivado', false)
  }

  const { data, error } = await query.order('fecha_creacion', {
    ascending: false,
  })

  if (error) {
    logger.error('Error al obtener proyectos:', error)
    throw new Error(`Error al obtener proyectos: ${error.message}`)
  }

  return (data || []).map(d =>
    transformarProyectoDeDB(d as unknown as ProyectoConManzanasDB)
  )
}

/**
 * Obtiene un proyecto específico por su ID con conteos reales de viviendas por manzana
 */
export async function obtenerProyecto(id: string): Promise<Proyecto | null> {
  const { data, error } = await supabase
    .from('proyectos')
    .select(
      `
        *,
        manzanas (
          id,
          nombre,
          numero_viviendas
        )
      `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    logger.error('Error al obtener proyecto:', error)
    throw new Error(`Error al obtener proyecto: ${error.message}`)
  }

  const proyecto = transformarProyectoDeDB(
    data as unknown as ProyectoConManzanasDB
  )

  // Batch-fetch real vivienda counts per manzana
  const manzanaIds = proyecto.manzanas.map(m => m.id)
  if (manzanaIds.length > 0) {
    const { data: viviendas } = await supabase
      .from('viviendas')
      .select('manzana_id, estado')
      .in('manzana_id', manzanaIds)

    if (viviendas) {
      type ConteoManzana = {
        creadas: number
        disponibles: number
        asignadas: number
        vendidas: number
      }
      const conteos = new Map<string, ConteoManzana>()
      for (const v of viviendas) {
        if (!conteos.has(v.manzana_id)) {
          conteos.set(v.manzana_id, {
            creadas: 0,
            disponibles: 0,
            asignadas: 0,
            vendidas: 0,
          })
        }
        const c = conteos.get(v.manzana_id)
        if (!c) continue
        c.creadas++
        if (v.estado === 'Disponible') c.disponibles++
        else if (v.estado === 'Asignada') c.asignadas++
        else if (v.estado === 'Entregada' || v.estado === 'Propietario')
          c.vendidas++
      }

      proyecto.manzanas = proyecto.manzanas.map(m => ({
        ...m,
        viviendasCreadas: conteos.get(m.id)?.creadas ?? 0,
        viviendasDisponibles: conteos.get(m.id)?.disponibles ?? 0,
        viviendasAsignadas: conteos.get(m.id)?.asignadas ?? 0,
        viviendasVendidas: conteos.get(m.id)?.vendidas ?? 0,
      }))
    }
  }

  return proyecto
}

/**
 * Verifica si ya existe un proyecto con el mismo nombre (case-insensitive)
 */
export async function verificarNombreDuplicado(
  nombre: string,
  excludeId?: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('id, nombre')
    .ilike('nombre', nombre)

  if (error) {
    logger.error('Error al verificar nombre duplicado:', error)
    throw new Error(`Error al verificar nombre: ${error.message}`)
  }

  const duplicados = excludeId
    ? data?.filter(p => p.id !== excludeId) || []
    : data || []

  return duplicados.length > 0
}

export interface ManzanaEditableResult {
  id: string
  nombre: string
  esEditable: boolean
  cantidadViviendas: number
}

/**
 * Valida qué manzanas pueden editarse (las que no tienen viviendas creadas).
 * Hace dos queries batch: uno para obtener manzanas, otro para contar viviendas.
 */
export async function validarManzanasEditables(
  manzanasIds: string[]
): Promise<Map<string, ManzanaEditableResult>> {
  const result = new Map<string, ManzanaEditableResult>()
  if (manzanasIds.length === 0) return result

  const { data: manzanas, error: manzanasError } = await supabase
    .from('manzanas')
    .select('id, nombre')
    .in('id', manzanasIds)

  if (manzanasError) {
    logger.error('Error obteniendo manzanas:', manzanasError)
    throw new Error(`Error al obtener manzanas: ${manzanasError.message}`)
  }

  // Manzanas nuevas (aún no en DB)
  const manzanasEnDB = new Set((manzanas ?? []).map(m => m.id))
  for (const id of manzanasIds) {
    if (!manzanasEnDB.has(id)) {
      result.set(id, {
        id,
        nombre: '(Nueva)',
        esEditable: true,
        cantidadViviendas: 0,
      })
    }
  }

  if (!manzanas || manzanas.length === 0) return result

  const idsEnDB = manzanas.map(m => m.id)
  const { data: conteos, error: conteosError } = await supabase
    .from('viviendas')
    .select('manzana_id')
    .in('manzana_id', idsEnDB)

  if (conteosError) {
    logger.error('Error contando viviendas:', conteosError)
    throw new Error(`Error al contar viviendas: ${conteosError.message}`)
  }

  const conteosPorManzana = new Map<string, number>()
  for (const row of conteos ?? []) {
    conteosPorManzana.set(
      row.manzana_id,
      (conteosPorManzana.get(row.manzana_id) ?? 0) + 1
    )
  }

  for (const manzana of manzanas) {
    const cantidadViviendas = conteosPorManzana.get(manzana.id) ?? 0
    result.set(manzana.id, {
      id: manzana.id,
      nombre: manzana.nombre,
      esEditable: cantidadViviendas === 0,
      cantidadViviendas,
    })
  }

  return result
}

/**
 * Obtiene la lista mínima de proyectos (id + nombre) para poblar selectores de filtro.
 * Usa select reducido para evitar joins innecesarios.
 */
export interface ProyectoSimple {
  id: string
  nombre: string
}

export async function obtenerProyectosSimples(): Promise<ProyectoSimple[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('id, nombre')
    .eq('archivado', false)
    .order('nombre')

  if (error) {
    logger.error('Error al obtener proyectos simples:', error)
    throw new Error(`Error al obtener proyectos: ${error.message}`)
  }

  return (data ?? []) as ProyectoSimple[]
}
