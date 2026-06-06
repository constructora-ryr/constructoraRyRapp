import { NextRequest, NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

/**
 * GET /api/abonos/comprobante?path=...
 *
 * Genera una URL firmada (1 hora) para un comprobante del bucket privado
 * 'comprobantes-abonos'.
 *
 * Seguridad:
 * 1. Requiere sesión autenticada.
 * 2. Requiere permiso 'ver' en el módulo abonos.
 * 3. Verifica que el path está registrado en abonos_historial.comprobante_url
 *    (impide que un usuario autenticado acceda a archivos aleatorios).
 * 4. La URL firmada expira en 1 hora.
 */
export async function GET(request: NextRequest) {
  // 1. Verificar sesión
  const supabase = await createRouteClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Verificar permiso 'ver' en módulo abonos
  const permisos = await getServerPermissions('abonos')
  if (!permisos.canView) {
    return NextResponse.json(
      { error: 'Acceso denegado. No tienes permisos para ver comprobantes.' },
      { status: 403 }
    )
  }

  // 3. Leer parámetro ?path=
  const path = request.nextUrl.searchParams.get('path')
  if (!path) {
    return NextResponse.json(
      { error: 'Falta el parámetro path' },
      { status: 400 }
    )
  }

  // 4. Verificar que el path existe en la BD (sin filtro de estado → acceso histórico)
  const { data: abono, error: dbError } = await supabase
    .from('abonos_historial')
    .select('id')
    .eq('comprobante_url', path)
    .limit(1)
    .maybeSingle()

  if (dbError || !abono) {
    return NextResponse.json(
      { error: 'Comprobante no encontrado o acceso denegado' },
      { status: 403 }
    )
  }

  // 4. Generar URL firmada con service_role (bypasea RLS de storage)
  const { data: signedData, error: signError } = await supabaseAdmin.storage
    .from('comprobantes-abonos')
    .createSignedUrl(path, 3600)

  if (signError || !signedData?.signedUrl) {
    logger.error('[comprobante] Error generando signed URL:', signError)
    return NextResponse.json(
      { error: 'No se pudo generar el enlace de descarga' },
      { status: 500 }
    )
  }

  // 5. Redirigir al signed URL (302 temporal)
  return NextResponse.redirect(signedData.signedUrl, { status: 302 })
}
