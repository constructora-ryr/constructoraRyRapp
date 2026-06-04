import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { createRouteClient } from '@/lib/supabase/server-route'

/**
 * Auth Callback Route
 * Maneja el intercambio de código PKCE y tokens OTP (invitaciones, magic links).
 *
 * Flujo de invitación:
 *   1. Admin llama inviteUserByEmail() → Supabase envía email
 *   2. Usuario hace clic → llega aquí con ?code=xxx o ?token_hash=xxx&type=invite
 *   3. Se intercambia por sesión → redirect a /bienvenida
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'invite' | 'recovery' | null
  const next = searchParams.get('next') ?? '/bienvenida'

  const supabase = await createRouteClient()

  // Flujo PKCE (code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Flujo OTP (token_hash) — invitaciones y magic links
  if (tokenHash && type) {
    // Si hay sesión activa (ej: admin abre su propio link de invitación),
    // cerrarla primero para que el nuevo usuario tome la sesión correctamente.
    if (type === 'invite') {
      await supabase.auth.signOut()
    }
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error: enlace inválido o expirado
  return NextResponse.redirect(`${origin}/login?error=invite_expired`)
}
