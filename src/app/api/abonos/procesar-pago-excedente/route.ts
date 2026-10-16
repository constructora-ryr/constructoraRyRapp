import { NextRequest, NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

/**
 * PATCH /api/abonos/procesar-pago-excedente
 * Marca un pago excedente como procesado (devolución realizada al cliente).
 * Solo admins.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createRouteClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const permisos = await getServerPermissions()
    if (!permisos.isAdmin) {
      return NextResponse.json(
        { error: 'Solo administradores pueden procesar devoluciones' },
        { status: 403 }
      )
    }

    const { id, fecha_procesado, comprobante_url, notas } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID del pago excedente es obligatorio' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('pagos_excedentes')
      .update({
        estado: 'procesado',
        fecha_procesado: fecha_procesado ?? new Date().toISOString(),
        comprobante_url: comprobante_url ?? null,
        notas: notas ?? null,
        procesado_por: user.id,
      })
      .eq('id', id)
      .eq('estado', 'pendiente')

    if (error) {
      logger.error('Error procesando pago excedente:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'
    logger.error(
      '❌ Error en PATCH /api/abonos/procesar-pago-excedente:',
      message
    )
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
