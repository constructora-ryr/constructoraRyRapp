import { NextRequest, NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import type { Json } from '@/lib/supabase/database.types'
import { createRouteClient } from '@/lib/supabase/server-route'
import { formatDateForDB } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

/**
 * PATCH /api/viviendas/escriturar
 * Body: { vivienda_id: string; fecha_escritura: string } (fecha en formato YYYY-MM-DD)
 *
 * Marca una vivienda como Escriturada (estado 'Entregada' en BD).
 * Solo es válido cuando la vivienda está en estado 'Asignada'.
 */
export async function PATCH(request: NextRequest) {
  const supabase = await createRouteClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const permisos = await getServerPermissions('viviendas')
  if (!permisos.canEdit) {
    return NextResponse.json(
      { error: 'No tienes permisos para modificar viviendas' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { vivienda_id, fecha_escritura } = body

  if (!vivienda_id || !fecha_escritura) {
    return NextResponse.json(
      { error: 'Se requiere vivienda_id y fecha_escritura' },
      { status: 400 }
    )
  }

  // Verificar que la vivienda existe y está Asignada
  const { data: vivienda, error: fetchError } = await supabase
    .from('viviendas')
    .select(
      'id, estado, numero, manzana_id, cliente_id, manzanas(nombre, proyectos(nombre))'
    )
    .eq('id', vivienda_id)
    .single()

  if (fetchError || !vivienda) {
    return NextResponse.json(
      { error: 'Vivienda no encontrada' },
      { status: 404 }
    )
  }

  if (vivienda.estado !== 'Asignada') {
    return NextResponse.json(
      {
        error: `Solo se puede escriturar una vivienda Asignada. Estado actual: ${vivienda.estado}`,
      },
      { status: 400 }
    )
  }

  const fechaDB = formatDateForDB(fecha_escritura)

  const { data: viviendaActualizada, error: updateError } = await supabase
    .from('viviendas')
    .update({ estado: 'Entregada', fecha_entrega: fechaDB })
    .eq('id', vivienda_id)
    .select()
    .single()

  if (updateError) {
    logger.error('Error al escriturar vivienda:', updateError)
    return NextResponse.json(
      { error: 'Error al actualizar la vivienda: ' + updateError.message },
      { status: 500 }
    )
  }

  // Audit log (fire-and-forget)
  void (async () => {
    try {
      const manzanas = vivienda.manzanas as {
        nombre: string
        proyectos: { nombre: string }
      } | null
      await supabase.from('audit_log').insert({
        accion: 'UPDATE',
        tabla: 'viviendas',
        registro_id: vivienda_id,
        usuario_id: user.id,
        usuario_email: user.email ?? '',
        datos_nuevos: {
          estado: 'Entregada',
          fecha_entrega: fechaDB,
        } as unknown as Json,
        metadata: {
          accion_descripcion: 'Vivienda marcada como Escriturada',
          vivienda_numero: vivienda.numero,
          manzana_nombre: manzanas?.nombre ?? null,
          proyecto_nombre: manzanas?.proyectos?.nombre ?? null,
          fecha_escritura: fechaDB,
        } as unknown as Json,
        modulo: 'viviendas',
      })
    } catch (auditError) {
      logger.error('Error registrando audit de escritura:', auditError)
    }
  })()

  return NextResponse.json({
    success: true,
    vivienda: viviendaActualizada,
    message: 'Vivienda marcada como Escriturada',
  })
}
