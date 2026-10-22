/**
 * POST /api/auth/evento-seguridad
 * Registra eventos de seguridad (login, logout, intentos fallidos…) en
 * audit_log_seguridad. Es el ÚNICO punto de escritura de esa tabla: el
 * navegador ya no puede insertar directamente.
 *
 * - Eventos con sesión (login_exitoso, logout…): usuario y correo salen de
 *   la sesión, no del cuerpo de la petición.
 * - Eventos sin sesión (login_fallido, cuenta_bloqueada,
 *   password_reset_solicitado): se valida el correo y se limita por IP.
 */

import { NextResponse, type NextRequest } from 'next/server'

import { createRouteClient } from '@/lib/supabase/server-route'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

const CON_SESION = new Set([
  'login_exitoso',
  'logout',
  'password_reset_completado',
  'session_expirada',
])
const SIN_SESION = new Set([
  'login_fallido',
  'cuenta_bloqueada',
  'password_reset_solicitado',
])

/** Máximo de eventos sin sesión por IP en la ventana */
const LIMITE_POR_IP = 30
const VENTANA_MIN = 15

const CORREO = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/

function ipDe(req: NextRequest): string | null {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')
  return ip || null
}

export async function POST(req: NextRequest) {
  let cuerpo: { tipo?: unknown; email?: unknown; metadata?: unknown }
  try {
    cuerpo = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const tipo = typeof cuerpo.tipo === 'string' ? cuerpo.tipo : ''
  if (!CON_SESION.has(tipo) && !SIN_SESION.has(tipo)) {
    return NextResponse.json({ error: 'Tipo no permitido' }, { status: 400 })
  }

  // Solo números y textos cortos en metadata (nada anidado ni enorme)
  const metadata: Record<string, string | number | boolean> = {}
  if (cuerpo.metadata && typeof cuerpo.metadata === 'object') {
    for (const [k, v] of Object.entries(cuerpo.metadata).slice(0, 10)) {
      if (typeof v === 'number' || typeof v === 'boolean') metadata[k] = v
      else if (typeof v === 'string') metadata[k] = v.slice(0, 200)
    }
  }

  const ip = ipDe(req)
  const admin = createServiceRoleClient()
  let usuarioId: string | null = null
  let email: string

  if (CON_SESION.has(tipo)) {
    const supabase = await createRouteClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: 'Sin sesión' }, { status: 401 })
    }
    usuarioId = user.id
    email = user.email
  } else {
    const correo =
      typeof cuerpo.email === 'string' ? cuerpo.email.trim().toLowerCase() : ''
    if (!CORREO.test(correo)) {
      return NextResponse.json({ error: 'Correo inválido' }, { status: 400 })
    }
    email = correo

    // Freno contra spam: muchos eventos sin sesión desde la misma IP
    if (ip) {
      const desde = new Date(Date.now() - VENTANA_MIN * 60_000).toISOString()
      const { count } = await admin
        .from('audit_log_seguridad')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .in('tipo', [...SIN_SESION])
        .gte('fecha_evento', desde)
      if ((count ?? 0) >= LIMITE_POR_IP) {
        return NextResponse.json(
          { error: 'Demasiados eventos' },
          { status: 429 }
        )
      }
    }
  }

  const { error } = await admin.from('audit_log_seguridad').insert({
    tipo,
    usuario_email: email,
    usuario_id: usuarioId,
    ip_address: ip,
    user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
    metadata,
  })

  if (error) {
    return NextResponse.json({ error: 'No se pudo registrar' }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
