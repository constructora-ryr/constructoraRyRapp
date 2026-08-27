import { createClient } from '@supabase/supabase-js'

import { NextResponse } from 'next/server'

import { createRouteClient } from '@/lib/supabase/server-route'

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Cliente sin tipos para tabla sesiones_activas (no está en el schema generado hasta correr la migración)
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface SesionRow {
  id: string
  dispositivo: string | null
  navegador: string | null
  ip: string | null
  created_at: string
  last_seen_at: string
  session_token: string
}

/**
 * GET /api/auth/sesiones
 * Devuelve las sesiones activas del usuario autenticado.
 * Incluye flag `es_actual` para identificar la sesión en curso.
 */
export async function GET() {
  try {
    const supabase = await createRouteClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    let hashActual: string | null = null
    if (session?.refresh_token) {
      hashActual = await hashToken(session.refresh_token)
    }

    const admin = createAdminClient()

    const { data: sesiones, error } = await admin
      .from('sesiones_activas')
      .select(
        'id, dispositivo, navegador, ip, created_at, last_seen_at, session_token'
      )
      .eq('user_id', user.id)
      .eq('revocada', false)
      .order('last_seen_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const sesionesPublicas = ((sesiones as SesionRow[]) ?? []).map(
      ({ session_token, ...rest }) => ({
        ...rest,
        es_actual: hashActual ? session_token === hashActual : false,
      })
    )

    return NextResponse.json({ sesiones: sesionesPublicas })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
