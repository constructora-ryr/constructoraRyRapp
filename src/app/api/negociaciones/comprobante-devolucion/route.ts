import { NextRequest, NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

/**
 * GET /api/negociaciones/comprobante-devolucion?path=...
 *
 * Genera una URL firmada (1 hora) para el comprobante del excedente devuelto,
 * almacenado en el bucket privado 'devoluciones-excedente'.
 *
 * Seguridad:
 * 1. Requiere sesión autenticada.
 * 2. Requiere permiso 'ver' en el módulo negociaciones.
 * 3. Verifica que el path está registrado en negociaciones.excedente_devolucion_comprobante_url.
 * 4. La URL firmada expira en 1 hora.
 */
export async function GET(request: NextRequest) {
  const supabase = await createRouteClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const permisos = await getServerPermissions('negociaciones')
  if (!permisos.canView) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const path = request.nextUrl.searchParams.get('path')
  if (!path) {
    return NextResponse.json(
      { error: 'Falta el parámetro path' },
      { status: 400 }
    )
  }

  // Verificar que el path pertenece a una negociación real
  const { data: neg, error: dbError } = await supabase
    .from('negociaciones')
    .select('id')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .eq('excedente_devolucion_comprobante_url' as any, path)
    .limit(1)
    .maybeSingle()

  if (dbError || !neg) {
    return NextResponse.json(
      { error: 'Comprobante no encontrado o acceso denegado' },
      { status: 403 }
    )
  }

  const { data: signedData, error: signError } = await supabaseAdmin.storage
    .from('devoluciones-excedente')
    .createSignedUrl(path, 3600)

  if (signError || !signedData?.signedUrl) {
    logger.error(
      '[comprobante-devolucion] Error generando signed URL:',
      signError
    )
    return NextResponse.json(
      { error: 'No se pudo generar el enlace de descarga' },
      { status: 500 }
    )
  }

  return NextResponse.redirect(signedData.signedUrl, { status: 302 })
}
