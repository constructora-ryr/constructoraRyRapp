import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'
import type { Rol } from '@/modules/usuarios/types'

interface InvitarUsuarioBody {
  email: string
  nombres: string
  apellidos: string
  telefono?: string
  rol: Rol
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que el solicitante es Administrador activo
    const supabase = await createRouteClient()
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser()

    if (!adminUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: adminPerfil } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('id', adminUser.id)
      .single()

    if (
      adminPerfil?.rol !== 'Administrador' ||
      adminPerfil?.estado !== 'Activo'
    ) {
      return NextResponse.json(
        { error: 'No tienes permisos para invitar usuarios' },
        { status: 403 }
      )
    }

    const body: InvitarUsuarioBody = await request.json()
    const { email, nombres, apellidos, telefono, rol } = body

    if (!email || !nombres || !apellidos || !rol) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const ROLES_VALIDOS: Rol[] = [
      'Administrador',
      'Contabilidad',
      'Administrador de Obra',
      'Gerencia',
    ]
    if (!ROLES_VALIDOS.includes(rol)) {
      return NextResponse.json(
        { error: `Rol inválido: "${rol}"` },
        { status: 400 }
      )
    }

    // URL base para el redirect del invite
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ??
      request.headers.get('origin') ??
      'http://localhost:3000'

    // Crear usuario vía invitación — el usuario recibirá un email para establecer su contraseña
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/bienvenida`,
        data: { nombres, apellidos, rol },
      })

    if (inviteError || !inviteData.user) {
      logger.error('❌ [INVITAR] Error enviando invitación:', inviteError)

      // Mensaje amigable para email duplicado
      if (inviteError?.message?.includes('already been registered')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado en el sistema' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: inviteError?.message ?? 'Error al enviar invitación' },
        { status: 500 }
      )
    }

    // Esperar al trigger handle_new_user (crea perfil automáticamente)
    await new Promise(resolve => setTimeout(resolve, 600))

    // Actualizar perfil con datos adicionales
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({
        telefono: telefono ?? null,
        creado_por: adminUser.id,
        // debe_cambiar_password permanece true (seteado por handle_new_user)
        // hasta que el usuario complete su primer login
      })
      .eq('id', inviteData.user.id)

    if (updateError) {
      logger.warn(
        '⚠️ [INVITAR] Error actualizando perfil (no crítico):',
        updateError
      )
    }

    // Obtener perfil completo
    const { data: usuarioCreado } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', inviteData.user.id)
      .single()

    logger.info(`✅ [INVITAR] Invitación enviada a ${email} con rol ${rol}`)

    return NextResponse.json({
      usuario: usuarioCreado,
      invitacion_enviada: true,
    })
  } catch (error) {
    logger.error('❌ [INVITAR] Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
