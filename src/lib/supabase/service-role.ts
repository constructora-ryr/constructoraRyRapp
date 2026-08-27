import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

/**
 * Cliente Supabase con service_role key.
 * Bypasa RLS — SOLO usar en API Routes y funciones server-side.
 * NUNCA importar desde componentes client-side.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
