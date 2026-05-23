/**
 * ============================================
 * API ROUTE: Invalidar Sesiones por Cambio de Permisos
 * ============================================
 *
 * POST /api/auth/invalidar-sesiones
 *
 * Fuerza cierre de sesión de usuarios cuando cambian los permisos de su rol.
 * Esto asegura que vean los permisos actualizados en su próximo login.
 *
 * REQUIERE: Usuario autenticado con rol Administrador
 */

import { NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/server'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'
import { invalidarSesionPorCambioPermisos } from '@/modules/usuarios/services/permisos-jwt.service'
import type { Rol } from '@/modules/usuarios/types'

export async function POST(request: Request) {
  try {
    // 1. Verificar sesión activa
    const supabase = await createRouteClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Solo Administrador puede invalidar sesiones de otros
    if (!(await isAdmin())) {
      return NextResponse.json(
        {
          error:
            'Acceso denegado. Solo el Administrador puede invalidar sesiones.',
        },
        { status: 403 }
      )
    }

    // 3. Validar body
    const { rol } = await request.json()

    const ROLES_VALIDOS: Rol[] = [
      'Administrador',
      'Contabilidad',
      'Administrador de Obra',
      'Gerencia',
    ]

    if (!rol || !ROLES_VALIDOS.includes(rol as Rol)) {
      return NextResponse.json(
        {
          error: `Rol inválido o ausente. Valores permitidos: ${ROLES_VALIDOS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // 4. Invalidar sesiones de usuarios con ese rol
    await invalidarSesionPorCambioPermisos(rol as Rol)

    return NextResponse.json({
      success: true,
      message: `Sesiones invalidadas para rol: ${rol}`,
    })
  } catch (error) {
    logger.error('❌ [API] Error invalidando sesiones:', error)

    return NextResponse.json(
      {
        error: 'Error invalidando sesiones',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
