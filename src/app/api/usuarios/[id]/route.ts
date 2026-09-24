import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

/**
 * DELETE /api/usuarios/[id]
 * Elimina un usuario con invitación pendiente (nunca inició sesión).
 * Llama auth.admin.deleteUser → CASCADE borra public.usuarios automáticamente.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Verificar autenticación del solicitante
    const supabase = await createRouteClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Verificar que el solicitante es Administrador activo
    const { data: caller } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('id', user.id)
      .single()

    if (caller?.rol !== 'Administrador' || caller?.estado !== 'Activo') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar usuarios' },
        { status: 403 }
      )
    }

    // 3. Protección: no puede eliminarse a sí mismo
    if (id === user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminarte a ti mismo' },
        { status: 400 }
      )
    }

    // 4. Verificar que el usuario objetivo tiene invitación pendiente
    //    (nunca inició sesión = ultimo_login IS NULL y debe_cambiar_password = true)
    const { data: target } = await supabaseAdmin
      .from('usuarios')
      .select('ultimo_login, debe_cambiar_password, nombres, apellidos')
      .eq('id', id)
      .single()

    if (!target) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (target.ultimo_login !== null || !target.debe_cambiar_password) {
      return NextResponse.json(
        {
          error:
            'Solo se pueden eliminar usuarios con invitación pendiente que nunca hayan iniciado sesión',
        },
        { status: 400 }
      )
    }

    // 5. Eliminar de public.usuarios primero (evita depender del CASCADE)
    const { error: deletePublicError } = await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (deletePublicError) {
      logger.error(
        '❌ [ELIMINAR USUARIO] Error eliminando de public.usuarios:',
        deletePublicError
      )
      return NextResponse.json(
        { error: deletePublicError.message },
        { status: 500 }
      )
    }

    // 6. Eliminar de auth.users (limpia la cuenta de autenticación)
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(id)

    if (deleteAuthError) {
      // La fila pública ya fue eliminada; loguear pero no fallar (el usuario
      // no podrá ingresar de todos modos sin su perfil en public.usuarios)
      logger.error(
        '⚠️ [ELIMINAR USUARIO] public.usuarios eliminado pero auth.users falló:',
        deleteAuthError
      )
    }

    logger.info(
      `✅ [ELIMINAR USUARIO] Invitación cancelada: ${target.nombres} ${target.apellidos} (${id})`
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('❌ [ELIMINAR USUARIO] Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
