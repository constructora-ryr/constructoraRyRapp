import { NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'

/**
 * PATCH /api/historial/ocultar
 * Body: { evento_id: string }
 *
 * Oculta (soft-hide) un evento de audit_log para que no aparezca
 * en el historial visual del cliente. El registro sigue existiendo
 * en BD para preservar la trazabilidad de auditoría.
 *
 * Solo Administradores pueden llamar este endpoint.
 */
export async function PATCH(req: NextRequest) {
  try {
    // ── Auth: sesión válida ──────────────────────────────────
    const supabase = await createRouteClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // ── Autorización: solo Administrador ────────────────────
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden ocultar eventos' },
        { status: 403 }
      )
    }

    // ── Validar body ─────────────────────────────────────────
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

    // ── Verificar que el evento existe ───────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auditLogAdmin = supabaseAdmin.from('audit_log') as any
    const { data: evento, error: fetchError } = await auditLogAdmin
      .select('id, oculto')
      .eq('id', evento_id)
      .single()

    if (fetchError || !evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if ((evento as { oculto: boolean }).oculto) {
      return NextResponse.json(
        { error: 'El evento ya está oculto' },
        { status: 409 }
      )
    }

    // ── Ocultar evento ───────────────────────────────────────
    const { error: updateError } = await auditLogAdmin
      .update({
        oculto: true,
        oculto_por: user.id,
        oculto_en: new Date().toISOString(),
      })
      .eq('id', evento_id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al ocultar el evento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
