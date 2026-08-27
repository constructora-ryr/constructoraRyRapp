import { createClient } from '@supabase/supabase-js'

import { NextRequest, NextResponse } from 'next/server'

import { createRouteClient } from '@/lib/supabase/server-route'

// Cliente sin tipos para tabla sesiones_activas (no está en el schema generado hasta correr la migración)
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * DELETE /api/auth/sesiones/[id]
 * Revoca una sesión activa. Solo puede revocar sus propias sesiones.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sesionId } = await params

    const supabase = await createRouteClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Verificar que la sesión pertenece al usuario (security check)
    const { data: sesion, error: fetchError } = await admin
      .from('sesiones_activas')
      .select('id, user_id')
      .eq('id', sesionId)
      .single()

    if (fetchError || !sesion) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    if ((sesion as { user_id: string }).user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { error: updateError } = await admin
      .from('sesiones_activas')
      .update({ revocada: true })
      .eq('id', sesionId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
