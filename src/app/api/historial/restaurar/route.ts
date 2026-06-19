import { NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

/**
 * PATCH /api/historial/restaurar
 * Body: { evento_id: string }
 *
 * Restaura (quita el soft-hide) de un evento de audit_log.
 * Solo Administradores pueden llamar este endpoint.
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createRouteClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden restaurar eventos' },
        { status: 403 }
      )
    }

    let body: { evento_id?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    }

    const { evento_id } = body
    if (!evento_id || typeof evento_id !== 'string') {
      return NextResponse.json(
        { error: 'evento_id es requerido' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auditLogAdmin = supabaseAdmin.from('audit_log') as any
    const { error: updateError } = await auditLogAdmin
      .update({
        oculto: false,
        oculto_por: null,
        oculto_en: null,
      })
      .eq('id', evento_id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al restaurar el evento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
