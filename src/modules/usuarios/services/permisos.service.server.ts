/**
 * Versión server-side de permisos.service.ts.
 * Usa createServerSupabaseClient (cookies del usuario) en lugar del cliente browser.
 * Solo importar desde Server Components o funciones server-only.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server'

import type { PermisoRol } from './permisos.service'

/**
 * Obtiene los permisos activos de un rol desde el servidor.
 * Equivalente server-side de obtenerPermisosPorRol.
 */
export async function obtenerPermisosPorRolServer(
  rol: string
): Promise<PermisoRol[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('permisos_rol')
    .select('*')
    .eq('rol', rol)
    .eq('permitido', true)
    .order('modulo', { ascending: true })
    .order('accion', { ascending: true })

  if (error) {
    // No lanzar — simplemente devolver vacío para no bloquear el render
    return []
  }

  return data || []
}
