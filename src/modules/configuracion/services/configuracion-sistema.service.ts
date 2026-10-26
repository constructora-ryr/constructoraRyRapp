/**
 * Ajustes generales del sistema (tabla `configuracion_sistema`).
 * Lectura para todo usuario con sesión; escritura solo Administrador (RLS).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import { LIMITE_POR_DEFECTO_MIN } from '@/lib/sesion/reloj-actividad'
import { supabase } from '@/lib/supabase/client'

// La tabla aún no está en database.types (regenerar tipos la incluye)
const db = supabase as unknown as SupabaseClient

const CLAVE_INACTIVIDAD = 'inactividad_minutos'

/** Opciones que ofrece la pantalla de configuración */
export const OPCIONES_INACTIVIDAD_MIN = [15, 30, 45, 60, 90, 120, 240] as const

export async function obtenerLimiteInactividad(): Promise<number> {
  const { data, error } = await db
    .from('configuracion_sistema')
    .select('valor')
    .eq('clave', CLAVE_INACTIVIDAD)
    .maybeSingle()
  if (error) throw new Error(error.message)
  const n = Number(data?.valor)
  return Number.isFinite(n) && n > 0 ? n : LIMITE_POR_DEFECTO_MIN
}

export async function actualizarLimiteInactividad(minutos: number) {
  const { data, error } = await db
    .from('configuracion_sistema')
    .update({ valor: minutos })
    .eq('clave', CLAVE_INACTIVIDAD)
    .select('clave')
  if (error) throw new Error(error.message)
  // Con RLS, un usuario sin permiso no recibe error: simplemente 0 filas
  if (!data?.length) {
    throw new Error('Solo un administrador puede cambiar este ajuste.')
  }
}
