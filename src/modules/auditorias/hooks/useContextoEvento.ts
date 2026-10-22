'use client'

/**
 * Contexto para el detalle de un evento: la fila como está hoy (para ver el
 * archivo y los datos principales en ediciones), el nombre del cliente
 * relacionado y una función que traduce ids de usuario o categoría a nombre.
 */

import { useCallback } from 'react'

import type { SupabaseClient } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/client'

import { REFERENCIAS } from '../config/detalle'
import type { EventoAuditoria } from '../types'

const db = supabase as unknown as SupabaseClient

/** Ids de categoría que aparecen en el evento o en la fila */
function idsCategoria(...fuentes: (Record<string, unknown> | null)[]) {
  const ids = new Set<string>()
  for (const f of fuentes) {
    const v = f?.categoria_id
    if (typeof v === 'string') ids.add(v)
  }
  return [...ids]
}

export function useContextoEvento(
  evento: EventoAuditoria,
  usuarios: { id: string; nombre: string }[]
) {
  const { data: fila = null, isLoading: cargandoFila } = useQuery({
    queryKey: ['auditoria', 'fila', evento.tabla, evento.registro_id],
    enabled: !!evento.registro_id && evento.accion !== 'ELIMINAR',
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data } = await db
        .from(evento.tabla)
        .select('*')
        .eq('id', evento.registro_id)
        .maybeSingle()
      return (data ?? null) as Record<string, unknown> | null
    },
  })

  const cambioCategoria = evento.cambios?.categoria_id
  const ids = idsCategoria(evento.datos, fila, {
    categoria_id: cambioCategoria?.antes,
  }).concat(
    typeof cambioCategoria?.despues === 'string'
      ? [cambioCategoria.despues]
      : []
  )

  const { data: categorias = {} } = useQuery({
    queryKey: ['auditoria', 'categorias', ids],
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from('categorias_documento')
        .select('id, nombre')
        .in('id', ids)
      return Object.fromEntries((data ?? []).map(c => [c.id, c.nombre]))
    },
  })

  const { data: cliente = null } = useQuery({
    queryKey: ['auditoria', 'cliente', evento.cliente_id],
    enabled: !!evento.cliente_id,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from('clientes')
        .select('nombres, apellidos')
        .eq('id', evento.cliente_id as string)
        .maybeSingle()
      return data ? `${data.nombres} ${data.apellidos}`.trim() : null
    },
  })

  /** Nombre para un id de usuario o categoría; null si el campo no es referencia */
  const nombreRef = useCallback(
    (campo: string, valor: unknown): string | null => {
      const tipo = REFERENCIAS[campo]
      if (!tipo || typeof valor !== 'string') return null
      if (tipo === 'usuario')
        return usuarios.find(u => u.id === valor)?.nombre ?? null
      return (categorias as Record<string, string>)[valor] ?? null
    },
    [usuarios, categorias]
  )

  return { fila, cargandoFila, nombreRef, cliente }
}
