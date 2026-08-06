import { NextRequest, NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

const BUCKET = 'comprobantes-abonos'

/**
 * POST /api/negociaciones/procesar-devolucion-excedente
 *
 * Registra la devolución del excedente financiero a un cliente.
 * El excedente ocurre cuando la suma de fuentes > valor_total_pagar.
 * Sube el comprobante al bucket comprobantes-abonos y actualiza la negociación.
 *
 * Body: multipart/form-data
 *   - negociacion_id: string
 *   - monto: number
 *   - fecha: string (YYYY-MM-DD)
 *   - metodo: string
 *   - numero_comprobante?: string
 *   - notas?: string
 *   - comprobante: File
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Requiere permiso de editar negociaciones (o ser admin)
    const permisos = await getServerPermissions('negociaciones')
    if (!permisos.canEdit && !permisos.isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para registrar devoluciones' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const negociacion_id = formData.get('negociacion_id') as string | null
    const monto = Number(formData.get('monto'))
    const fecha = formData.get('fecha') as string | null
    const metodo = formData.get('metodo') as string | null
    const numero_comprobante =
      (formData.get('numero_comprobante') as string | null)?.trim() || null
    const notas = (formData.get('notas') as string | null)?.trim() || null
    const comprobanteFile = formData.get('comprobante') as File | null

    // Validaciones
    if (!negociacion_id || !monto || !fecha || !metodo || !comprobanteFile) {
      return NextResponse.json(
        {
          error:
            'Faltan campos obligatorios: negociacion_id, monto, fecha, metodo, comprobante',
        },
        { status: 400 }
      )
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a cero' },
        { status: 400 }
      )
    }

    // Verificar que la negociación existe
    const { data: negRaw, error: negError } = await supabaseAdmin
      .from('negociaciones')
      .select('id, cliente_id, valor_total_pagar, valor_total')
      .eq('id', negociacion_id)
      .single()

    if (negError || !negRaw) {
      return NextResponse.json(
        { error: 'Negociación no encontrada' },
        { status: 404 }
      )
    }

    // Cast para acceder a los campos nuevos (existirán en BD tras la migración)
    const neg = negRaw as typeof negRaw & {
      excedente_devolucion_estado?: string | null
      cliente_id: string
    }

    if (neg.excedente_devolucion_estado === 'procesada') {
      return NextResponse.json(
        { error: 'La devolución ya fue procesada anteriormente' },
        { status: 409 }
      )
    }

    // Subir comprobante al bucket
    const ext = comprobanteFile.name.split('.').pop() ?? 'pdf'
    const filePath = `negociaciones/${negociacion_id}/devolucion-excedente/${Date.now()}.${ext}`

    const arrayBuffer = await comprobanteFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: comprobanteFile.type,
        upsert: false,
      })

    if (uploadError) {
      logger.error(
        '❌ Error subiendo comprobante devolución excedente:',
        uploadError
      )
      return NextResponse.json(
        { error: `Error al subir comprobante: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Actualizar negociación — cast necesario porque los campos nuevos aún no
    // están en database.types.ts (se generan tras aplicar la migración)
    const updatePayload = {
      excedente_devolucion_estado: 'procesada',
      excedente_devolucion_monto: monto,
      excedente_devolucion_fecha: fecha,
      excedente_devolucion_metodo: metodo,
      excedente_devolucion_numero_comprobante: numero_comprobante,
      excedente_devolucion_comprobante_url: filePath,
      excedente_devolucion_notas: notas,
      excedente_devolucion_procesado_por: user.email ?? user.id,
      excedente_devolucion_procesado_en: new Date().toISOString(),
    }

    const { error: updateError } = await supabaseAdmin
      .from('negociaciones')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updatePayload as any)
      .eq('id', negociacion_id)

    if (updateError) {
      // Si falla el update, limpiar el archivo subido (best-effort)
      void supabaseAdmin.storage.from(BUCKET).remove([filePath])
      logger.error(
        '❌ Error actualizando negociación con devolución:',
        updateError
      )
      return NextResponse.json(
        { error: 'Error al registrar la devolución' },
        { status: 500 }
      )
    }

    // Registrar en audit_log (fire-and-forget) para que aparezca en historial del cliente
    void (async () => {
      try {
        // Obtener nombre del usuario para mostrar en historial
        const { data: usuarioPerfil } = await supabaseAdmin
          .from('usuarios')
          .select('nombres, apellidos')
          .eq('id', user.id)
          .single()

        const procesadoPor = usuarioPerfil
          ? `${usuarioPerfil.nombres ?? ''} ${usuarioPerfil.apellidos ?? ''}`.trim()
          : (user.email ?? user.id)

        // Obtener datos de vivienda y proyecto para el historial
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: contexto } = (await (supabaseAdmin as any)
          .from('negociaciones')
          .select(
            `id,
             viviendas!inner(numero, manzanas!inner(identificador)),
             proyectos!inner(nombre)`
          )
          .eq('id', negociacion_id)
          .single()) as { data: Record<string, unknown> | null }

        const vivienda = contexto?.viviendas as Record<string, unknown> | null
        const manzanas = vivienda?.manzanas as Record<string, unknown> | null
        const proyectos = contexto?.proyectos as Record<string, unknown> | null

        const viviendaNumero = vivienda?.numero ? String(vivienda.numero) : null
        const manzanaNombre = manzanas?.identificador
          ? String(manzanas.identificador)
          : null
        const proyectoNombre = proyectos?.nombre
          ? String(proyectos.nombre)
          : null

        await supabaseAdmin.from('audit_log').insert({
          tabla: 'negociaciones',
          accion: 'UPDATE',
          registro_id: negociacion_id,
          modulo: 'excedente_devolucion_procesada',
          usuario_id: user.id,
          usuario_email: user.email ?? '',
          metadata: {
            cliente_id: neg.cliente_id,
            monto_devuelto: monto,
            metodo_devolucion: metodo,
            numero_comprobante: numero_comprobante,
            fecha_devolucion: fecha,
            notas_cierre: notas,
            procesado_por: procesadoPor,
            vivienda_numero: viviendaNumero,
            manzana_nombre: manzanaNombre,
            proyecto_nombre: proyectoNombre,
            comprobante_path: filePath,
          },
        })
      } catch (auditErr) {
        logger.error(
          '⚠️ Error registrando audit_log de devolución excedente:',
          auditErr
        )
      }
    })()

    return NextResponse.json({ ok: true, comprobante_path: filePath })
  } catch (err) {
    logger.error('❌ Error inesperado en procesar-devolucion-excedente:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
