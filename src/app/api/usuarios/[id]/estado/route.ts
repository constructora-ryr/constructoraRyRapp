import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'
import type { EstadoUsuario } from '@/modules/usuarios/types'

// sesiones_activas no está en el schema de tipos generado del cliente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminRaw = supabaseAdmin as any

const ESTADOS_PERMITIDOS: EstadoUsuario[] = ['Activo', 'Inactivo']

export async function PATCH(
  request: NextRequest,
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
        { error: 'No tienes permisos para cambiar el estado de usuarios' },
        { status: 403 }
      )
    }

    // 3. Validar body
    const { nuevoEstado }: { nuevoEstado: EstadoUsuario } = await request.json()

    if (!ESTADOS_PERMITIDOS.includes(nuevoEstado)) {
      return NextResponse.json(
        { error: `Estado inválido: "${nuevoEstado}"` },
        { status: 400 }
      )
    }

    // 4. Protección: no puede inactivarse a sí mismo
    if (id === user.id && nuevoEstado === 'Inactivo') {
      return NextResponse.json(
        { error: 'No puedes inactivarte a ti mismo' },
        { status: 400 }
      )
    }

    // 5. Protección: no inactivar al único Administrador activo
    if (nuevoEstado === 'Inactivo') {
      const { data: target } = await supabaseAdmin
        .from('usuarios')
        .select('rol')
        .eq('id', id)
        .single()

      if (target?.rol === 'Administrador') {
        const { count } = await supabaseAdmin
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('rol', 'Administrador')
          .eq('estado', 'Activo')

        if ((count ?? 0) <= 1) {
          return NextResponse.json(
            {
              error:
                'No puedes inactivar al único administrador activo del sistema',
            },
            { status: 400 }
          )
        }
      }
    }

    // 6. Actualizar estado con service role (bypasa RLS)
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (updateError) {
      logger.error('❌ [ESTADO] Error actualizando estado:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // 7. Si inactivando: revocar sesiones + broadcast inmediato al cliente
    if (nuevoEstado === 'Inactivo') {
      const { error: revokeError } = await adminRaw
        .from('sesiones_activas')
        .update({ revocada: true })
        .eq('user_id', id)
        .eq('revocada', false)

      if (revokeError) {
        logger.warn(
          '⚠️ [ESTADO] Error revocando sesiones (no crítico):',
          revokeError
        )
      }

      // Broadcast Realtime: notifica al cliente activo para mostrar overlay al instante
      // Se usa channel broadcast (no postgres_changes) para evitar restricciones de RLS
      try {
        await new Promise<void>(resolve => {
          const ch = adminRaw.channel(`cuenta-estado-${id}`)
          const timeout = setTimeout(() => {
            adminRaw.removeChannel(ch).catch(() => null)
            resolve()
          }, 3000)
          ch.subscribe(async (status: string) => {
            if (status !== 'SUBSCRIBED') return
            clearTimeout(timeout)
            await ch
              .send({
                type: 'broadcast',
                event: 'cuenta_desactivada',
                payload: { userId: id },
              })
              .catch(() => null)
            await adminRaw.removeChannel(ch).catch(() => null)
            resolve()
          })
        })
      } catch {
        // broadcast no crítico — el polling de 5s actúa como respaldo
      }

      logger.info(
        `✅ [ESTADO] Usuario ${id} inactivado, sesiones revocadas y broadcast enviado`
      )
    } else {
      logger.info(`✅ [ESTADO] Usuario ${id} activado`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('❌ [ESTADO] Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
