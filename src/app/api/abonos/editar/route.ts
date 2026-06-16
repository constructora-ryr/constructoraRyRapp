import { NextRequest, NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Json, TablesUpdate } from '@/lib/supabase/database.types'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

const METODOS_VALIDOS = [
  'Transferencia',
  'Efectivo',
  'Cheque',
  'Consignación',
  'PSE',
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
]

/**
 * PATCH /api/abonos/editar
 *
 * Edita campos de un abono existente.
 * Seguridad:
 *  1. Requiere sesión autenticada.
 *  2. Solo rol 'Administrador'.
 *  3. La negociación debe estar en estado 'Activa'.
 *  4. Valida que el nuevo monto no exceda el saldo disponible.
 *  5. Maneja reemplazo/eliminación de comprobante (best-effort).
 *  6. Los triggers de BD recalculan montos en fuentes_pago y negociaciones.
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createRouteClient()

    // 1. Autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // 2. Verificar permiso de editar abonos según permisos_rol
    const { data: usuarioPerfil } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    const permisos = await getServerPermissions('abonos')
    if (!permisos.canEdit) {
      return NextResponse.json(
        { error: 'Acceso denegado. No tienes permisos para editar abonos.' },
        { status: 403 }
      )
    }

    // 3. Leer body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    }

    const { abonoId, motivo } = body

    if (!abonoId || typeof abonoId !== 'string') {
      return NextResponse.json({ error: 'Falta abonoId' }, { status: 400 })
    }

    if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 5) {
      return NextResponse.json(
        { error: 'Motivo de cambio requerido (mínimo 5 caracteres)' },
        { status: 400 }
      )
    }

    // 4. Obtener abono actual (sólo columnas propias para evitar errores de join)
    const { data: abono, error: fetchError } = await supabase
      .from('abonos_historial')
      .select(
        'id, negociacion_id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_referencia, notas, comprobante_url, numero_recibo'
      )
      .eq('id', abonoId)
      .maybeSingle()

    if (fetchError || !abono) {
      return NextResponse.json(
        { error: 'Abono no encontrado' },
        { status: 404 }
      )
    }

    // 5. Verificar que la negociación esté activa
    // cliente_id se obtiene sincrónicamente aquí para GARANTIZAR que está
    // disponible en metadata del audit_log (no depende de joins async)
    const { data: negociacion, error: negError } = await supabase
      .from('negociaciones')
      .select('estado, cliente_id, fecha_negociacion')
      .eq('id', abono.negociacion_id)
      .single()

    if (negError || !negociacion) {
      return NextResponse.json(
        { error: 'Negociación no encontrada' },
        { status: 404 }
      )
    }

    const esAdmin = usuarioPerfil?.rol === 'Administrador'
    if (negociacion.estado !== 'Activa' && !esAdmin) {
      return NextResponse.json(
        {
          error: `No se puede editar un abono de una negociación en estado "${negociacion.estado}"`,
        },
        { status: 400 }
      )
    }

    // 6. Validar monto (si cambia)
    if (body.monto !== undefined) {
      const nuevoMonto = Number(body.monto)
      if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
        return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
      }

      const { data: fuente } = await supabase
        .from('fuentes_pago')
        .select('saldo_pendiente')
        .eq('id', abono.fuente_pago_id)
        .single()

      if (fuente) {
        // Saldo disponible = saldo actual + el monto del abono actual (que se liberará al actualizar)
        const saldoDisponible =
          (fuente.saldo_pendiente ?? 0) + (abono.monto ?? 0)
        if (nuevoMonto > saldoDisponible) {
          return NextResponse.json(
            {
              error: `El monto excede el saldo disponible de la fuente ($${saldoDisponible.toLocaleString('es-CO')})`,
            },
            { status: 400 }
          )
        }
      }
    }

    // 7. Validar fecha_abono (si cambia): no puede ser anterior al inicio de la negociación
    if (body.fecha_abono !== undefined && negociacion.fecha_negociacion) {
      const fechaNeg = negociacion.fecha_negociacion.slice(0, 10)
      if (String(body.fecha_abono) < fechaNeg) {
        return NextResponse.json(
          {
            error: `La fecha del abono no puede ser anterior al inicio de la negociación (${fechaNeg})`,
          },
          { status: 400 }
        )
      }
    }

    // 8b. Validar metodo_pago (si cambia)
    if (body.metodo_pago !== undefined && body.metodo_pago !== null) {
      if (
        typeof body.metodo_pago !== 'string' ||
        !METODOS_VALIDOS.includes(body.metodo_pago)
      ) {
        return NextResponse.json(
          { error: 'Método de pago inválido' },
          { status: 400 }
        )
      }
    }

    // 8. Manejar comprobante en Storage
    let comprobanteActualizado: string | null | undefined = undefined // undefined = no se toca

    if (body.eliminar_comprobante === true) {
      if (abono.comprobante_url && supabaseAdmin) {
        await supabaseAdmin.storage
          .from('comprobantes-abonos')
          .remove([abono.comprobante_url as string])
          .catch(_e => {
            /* best-effort: fallo silencioso al limpiar storage */
          })
      }
      comprobanteActualizado = null
    } else if (
      body.comprobante_url !== undefined &&
      body.comprobante_url !== abono.comprobante_url
    ) {
      // Nuevo comprobante: eliminar el anterior (best-effort)
      if (abono.comprobante_url && supabaseAdmin) {
        await supabaseAdmin.storage
          .from('comprobantes-abonos')
          .remove([abono.comprobante_url as string])
          .catch(_e => {
            /* best-effort: fallo silencioso al limpiar storage */
          })
      }
      comprobanteActualizado =
        typeof body.comprobante_url === 'string' ? body.comprobante_url : null
    }

    // 9. Construir objeto de actualización (solo campos que cambian)
    const actualizacion: Record<string, unknown> = {}

    if (body.monto !== undefined) actualizacion.monto = Number(body.monto)
    if (body.fecha_abono !== undefined)
      actualizacion.fecha_abono = String(body.fecha_abono)
    if (body.metodo_pago !== undefined)
      actualizacion.metodo_pago = body.metodo_pago
    if (body.numero_referencia !== undefined)
      actualizacion.numero_referencia = body.numero_referencia || null
    if (body.notas !== undefined) actualizacion.notas = body.notas || null
    if (comprobanteActualizado !== undefined)
      actualizacion.comprobante_url = comprobanteActualizado

    if (Object.keys(actualizacion).length === 0) {
      return NextResponse.json(
        { error: 'No hay cambios para guardar' },
        { status: 400 }
      )
    }

    // 10. Ejecutar UPDATE via admin client para no depender del claim user_rol en JWT
    // (consistente con /api/abonos/anular). Las validaciones de auth/permisos ya se
    // hicieron arriba; el audit_log se escribe explícitamente en el paso 11.
    const { data: abonoActualizado, error: updateError } = await supabaseAdmin
      .from('abonos_historial')
      .update(actualizacion as unknown as TablesUpdate<'abonos_historial'>)
      .eq('id', abonoId)
      .select(
        'id, negociacion_id, fuente_pago_id, monto, fecha_abono, metodo_pago, numero_referencia, notas, comprobante_url'
      )
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar el abono: ' + updateError.message },
        { status: 500 }
      )
    }

    // 11. Registrar en audit_log (awaited — garantiza persistencia antes de responder)
    try {
      const ETIQUETAS_CAMPO: Record<string, string> = {
        monto: 'Monto del abono',
        fecha_abono: 'Fecha del abono',
        metodo_pago: 'Método de pago',
        numero_referencia: 'Número de referencia',
        notas: 'Notas',
        comprobante_url: 'Comprobante',
      }

      // Construir cambios_especificos desde los campos que realmente cambiaron
      const cambiosEspecificos: Record<
        string,
        { antes: unknown; despues: unknown }
      > = {}
      for (const campo of Object.keys(actualizacion)) {
        const antes = abono[campo as keyof typeof abono]
        const despues = actualizacion[campo]
        if (antes !== despues) {
          cambiosEspecificos[campo] = { antes, despues }
        }
      }

      // Contexto enriquecido (vivienda/fuente) — best-effort via admin
      let ctxVivienda: {
        numero?: string
        manzanas?: { nombre?: string; proyectos?: { nombre?: string } }
      } | null = null
      let ctxFuenteTipo: string | null = null

      const { data: ctx } = await supabaseAdmin
        .from('abonos_historial')
        .select(
          `fuentes_pago ( tipo ),
           negociaciones (
             viviendas ( numero, manzanas ( nombre, proyectos ( nombre ) ) )
           )`
        )
        .eq('id', abonoId)
        .maybeSingle()

      if (ctx) {
        ctxFuenteTipo =
          (ctx.fuentes_pago as { tipo?: string } | null)?.tipo ?? null
        ctxVivienda =
          (
            ctx.negociaciones as {
              viviendas?: {
                numero?: string
                manzanas?: { nombre?: string; proyectos?: { nombre?: string } }
              } | null
            } | null
          )?.viviendas ?? null
      }

      const { error: auditError } = await supabaseAdmin
        .from('audit_log')
        .insert({
          tabla: 'abonos_historial',
          accion: 'UPDATE',
          registro_id: abonoId,
          usuario_id: user.id,
          usuario_email: user.email ?? '',
          usuario_rol: usuarioPerfil?.rol ?? null,
          datos_anteriores: {
            monto: abono.monto,
            fecha_abono: abono.fecha_abono,
            metodo_pago: abono.metodo_pago,
            numero_referencia: abono.numero_referencia,
            notas: abono.notas,
            comprobante_url: abono.comprobante_url,
            numero_recibo: abono.numero_recibo,
          },
          datos_nuevos: {
            ...actualizacion,
            numero_recibo: abono.numero_recibo,
          },
          cambios_especificos: cambiosEspecificos as unknown as Json,
          metadata: {
            // cliente_id GARANTIZADO — obtenido en la query de negociacion (paso 5)
            cliente_id: negociacion.cliente_id,
            abono_monto_anterior: abono.monto,
            abono_numero_recibo: abono.numero_recibo,
            abono_metodo_pago_anterior: abono.metodo_pago,
            abono_fecha_abono_anterior: abono.fecha_abono,
            fuente_tipo: ctxFuenteTipo,
            negociacion_id: abono.negociacion_id,
            vivienda_numero: ctxVivienda?.numero ?? null,
            manzana_nombre: ctxVivienda?.manzanas?.nombre ?? null,
            proyecto_nombre: ctxVivienda?.manzanas?.proyectos?.nombre ?? null,
            motivo_edicion: String(motivo).trim(),
            campos_editados: Object.keys(cambiosEspecificos).map(
              c => ETIQUETAS_CAMPO[c] ?? c
            ),
          },
          modulo: 'abonos',
        })

      if (auditError) {
        logger.error(
          '⚠️ audit_log insert failed (non-blocking):',
          auditError.message
        )
      }
    } catch (auditErr) {
      // No fallar el flujo principal si la auditoría falla
      logger.error('⚠️ audit_log block threw (non-blocking):', auditErr)
    }

    return NextResponse.json({ ok: true, abono: abonoActualizado })
  } catch (error) {
    logger.error('[API /api/abonos/editar] Error no controlado:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}
