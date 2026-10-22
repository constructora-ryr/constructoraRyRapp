/**
 * Lectura de la auditoría (solo administradores, por RLS) y del registro de
 * seguridad (inicios de sesión, intentos fallidos, bloqueos).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase/client'

import { GRUPOS } from '../config/presentacion'
import type {
  EventoAuditoria,
  EventoSeguridad,
  FiltrosAuditoria,
  RangoFechas,
} from '../types'

export const POR_PAGINA = 40

// `auditoria` aún no está en database.types (regenerar tipos la incluirá)
const db = supabase as unknown as SupabaseClient

function desde(rango: RangoFechas): string | null {
  if (rango === 'todo') return null
  const fecha = new Date()
  if (rango === 'hoy') fecha.setHours(0, 0, 0, 0)
  else fecha.setDate(fecha.getDate() - (rango === '7d' ? 7 : 30))
  return fecha.toISOString()
}

export async function listarEventos(
  filtros: FiltrosAuditoria,
  pagina: number
): Promise<EventoAuditoria[]> {
  let query = db
    .from('auditoria')
    .select('*')
    .order('fecha', { ascending: false })
    .order('id', { ascending: false })
    .range(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA - 1)

  if (filtros.usuarioId) query = query.eq('usuario_id', filtros.usuarioId)
  if (filtros.accion) query = query.eq('accion', filtros.accion)
  const grupo = GRUPOS.find(g => g.id === filtros.grupo)
  if (grupo) query = query.in('tabla', grupo.tablas)
  const inicio = desde(filtros.rango)
  if (inicio) query = query.gte('fecha', inicio)
  const texto = filtros.busqueda.trim()
  if (texto) {
    const t = texto.replace(/[%,()]/g, ' ')
    query = query.or(`etiqueta.ilike.%${t}%,usuario_nombre.ilike.%${t}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as EventoAuditoria[]
}

/** Usuarios que aparecen en la auditoría (para el filtro "Quién") */
export async function listarUsuarios(): Promise<
  { id: string; nombre: string }[]
> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombres, apellidos, email')
    .order('nombres')
  if (error) throw error
  return (data ?? []).map(u => ({
    id: u.id,
    nombre: `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.email,
  }))
}

export async function listarSeguridad(
  pagina: number
): Promise<EventoSeguridad[]> {
  const { data, error } = await supabase
    .from('audit_log_seguridad')
    .select(
      'id, tipo, usuario_email, ip_address, user_agent, fecha_evento, metadata'
    )
    .order('fecha_evento', { ascending: false })
    .range(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA - 1)
  if (error) throw error
  return (data ?? []) as unknown as EventoSeguridad[]
}
