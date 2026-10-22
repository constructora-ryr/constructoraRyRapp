/**
 * ============================================
 * SUPABASE ADMIN CLIENT
 * ============================================
 *
 * Cliente de Supabase con SERVICE_ROLE_KEY.
 * BYPASEA RLS - Solo usar en server-side.
 *
 * CASOS DE USO:
 * - Actualizar user metadata (JWT)
 * - Operaciones administrativas
 * - Sign out global de usuarios
 *
 * ⚠️ NUNCA exponer en cliente
 */

import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

// Ya validadas arriba: aquí TypeScript las conoce como string
const URL_SUPABASE: string = supabaseUrl
const LLAVE_SERVICIO: string = supabaseServiceRoleKey

/**
 * Cliente Admin de Supabase
 * ⚠️ Solo usar en server-side (API routes, server components, middleware)
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Cliente admin que identifica al usuario que hizo la acción. La auditoría
 * (trigger registrar_auditoria) lee la cabecera `x-auditoria-usuario`, y solo
 * la acepta en peticiones con service role. Usar en las rutas que escriben
 * datos en nombre de un usuario ya verificado.
 */
export function adminComo(usuarioId: string) {
  return createClient<Database>(URL_SUPABASE, LLAVE_SERVICIO, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'x-auditoria-usuario': usuarioId } },
  })
}

/**
 * Verificar que el cliente admin está configurado correctamente
 */
export function isAdminClientReady(): boolean {
  return !!supabaseUrl && !!supabaseServiceRoleKey
}
