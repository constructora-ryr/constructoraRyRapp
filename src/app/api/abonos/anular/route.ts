import { NextRequest, NextResponse } from 'next/server'

import { isAdmin } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

// Motivos válidos — sincronizado con CHECK constraint de BD
const MOTIVOS_VALIDOS = [
  'Error en el monto',
  'Pago duplicado',
  'Comprobante inválido',
  'Error en la fecha',
  'Solicitud del cliente',
  'Otro',
] as const

type MotivoAnulacion = (typeof MOTIVOS_VALIDOS)[number]

/**
 * PATCH /api/abonos/anular
 * Body: { abono_id: string; motivo_categoria: MotivoAnulacion; motivo_detalle?: string }
 *
 * Anula (soft delete) un abono del historial.
 * Seguridad:
 *  1. Requiere sesión autenticada con rol Administrador.
 *  2. Verifica que el abono exista y esté en estado 'Activo'.
 *  3. El trigger AFTER UPDATE de BD recalcula montos en fuentes_pago y negociaciones.
 *  4. Registra en audit_log con snapshot del admin que anuló.
 */
export async function PATCH(request: NextRequest) {
  // 1. Verificar sesión y rol Administrador
  const supabase = await createRouteClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: 'Acceso denegado. Solo el Administrador puede anular abonos.' },
      { status: 403 }
    )
  }

  // 2. Parsear y validar body
  let abono_id: string
  let motivo_categoria: MotivoAnulacion
  let motivo_detalle: string | undefined

  try {
    const body = await request.json()
    abono_id = body.abono_id
    motivo_categoria = body.motivo_categoria
    motivo_detalle = body.motivo_detalle ?? undefined
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  if (!abono_id || typeof abono_id !== 'string') {
    return NextResponse.json({ error: 'Falta abono_id' }, { status: 400 })
  }

  if (
    !motivo_categoria ||
    !(MOTIVOS_VALIDOS as readonly string[]).includes(motivo_categoria)
  ) {
    return NextResponse.json(
      {
        error: `motivo_categoria inválido. Valores permitidos: ${MOTIVOS_VALIDOS.join(', ')}`,
      },
      { status: 400 }
    )
  }

  if (
    motivo_categoria === 'Otro' &&
    (!motivo_detalle || !motivo_detalle.trim())
  ) {
    return NextResponse.json(
      {
        error:
          'Cuando motivo_categoria es "Otro", motivo_detalle es obligatorio',
      },
      { status: 400 }
    )
  }

  // 3. Obtener nombre completo del admin (snapshot — JWT no incluye apellidos)
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from('usuarios')
    .select('nombres, apellidos')
    .eq('id', user.id)
    .single()

  if (adminError || !adminData) {
    return NextResponse.json(
      { error: 'No se pudo recuperar el perfil del administrador' },
      { status: 500 }
    )
  }
  const anulado_por_nombre =
    `${adminData.nombres} ${adminData.apellidos}`.trim()

  // 4. Obtener el abono (verificar existencia y estado) + contexto completo en paralelo
  const { data: abono, error: fetchError } = await supabaseAdmin
    .from('abonos_historial')
    .select(
      'id, negociacion_id, fuente_pago_id, monto, estado, numero_recibo, metodo_pago, fecha_abono, numero_referencia, notas, mora_incluida, comprobante_url'
    )
    .eq('id', abono_id)
    .maybeSingle()

  if (fetchError || !abono) {
    return NextResponse.json({ error: 'Abono no encontrado' }, { status: 404 })
  }

  if (abono.estado === 'Anulado') {
    return NextResponse.json(
      { error: 'El abono ya se encuentra anulado' },
      { status: 409 }
    )
  }

  // 4b. Contexto enriquecido para metadata del audit_log (en paralelo)
  const [{ data: contexto }, { data: fuente }] = await Promise.all([
    supabaseAdmin
      .from('negociaciones')
      .select(
        'id, cliente_id, valor_total_pagar, saldo_pendiente, clientes(id, nombres, apellidos), viviendas(numero, manzanas(nombre, proyectos(nombre)))'
      )
      .eq('id', abono.negociacion_id)
      .single(),
    supabaseAdmin
      .from('fuentes_pago')
      .select('tipo, monto_aprobado')
      .eq('id', abono.fuente_pago_id)
      .single(),
  ])

  const clienteCtx = contexto?.clientes as
    | { id: string; nombres: string; apellidos: string }
    | null
    | undefined
  const viviendaCtx = contexto?.viviendas as
    | {
        numero: string
        manzanas: { nombre: string; proyectos: { nombre: string } }
      }
    | null
    | undefined

  // 5. Soft delete — UPDATE estado = 'Anulado' (trigger recalculará saldos)
  const { data: abonoActualizado, error: updateError } = await supabaseAdmin
    .from('abonos_historial')
    .update({
      estado: 'Anulado',
      motivo_categoria,
      motivo_detalle: motivo_detalle ?? null,
      anulado_por_id: user.id,
      anulado_por_nombre,
      fecha_anulacion: new Date().toISOString(),
    })
    .eq('id', abono_id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: 'Error al anular el abono: ' + updateError.message },
      { status: 500 }
    )
  }

  // 5b. Si la negociación estaba Completada y ahora el saldo volvió a > 0,
  //     revertir negociación → Activa, vivienda → Asignada, cliente → Activo.
  const { data: negPost } = await supabaseAdmin
    .from('negociaciones')
    .select('id, estado, saldo_pendiente, vivienda_id, cliente_id')
    .eq('id', abono.negociacion_id)
    .single()

  if (
    negPost &&
    (negPost.saldo_pendiente ?? 0) > 0 &&
    negPost.estado === 'Completada'
  ) {
    const revertOps = [
      supabaseAdmin
        .from('negociaciones')
        .update({ estado: 'Activa', fecha_completada: null })
        .eq('id', abono.negociacion_id),
      negPost.vivienda_id
        ? supabaseAdmin
            .from('viviendas')
            .update({ estado: 'Asignada' })
            .eq('id', negPost.vivienda_id)
            .eq('estado', 'Propietario')
        : Promise.resolve({ error: null }),
      negPost.cliente_id
        ? supabaseAdmin
            .from('clientes')
            .update({ estado: 'Activo' })
            .eq('id', negPost.cliente_id)
            .eq('estado', 'Propietario')
        : Promise.resolve({ error: null }),
    ]

    const revertResults = await Promise.all(revertOps)
    revertResults.forEach(({ error }, i) => {
      if (error)
        logger.error(
          `⚠️ Error revirtiendo estado tras anulación (op ${i}):`,
          error.message
        )
    })
  }

  // 6. Registrar en audit_log con metadata completa (mismos nombres de campo que el renderer)
  await supabaseAdmin
    .from('audit_log')
    .insert({
      accion: 'ANULAR',
      tabla: 'abonos_historial',
      registro_id: abono_id,
      usuario_id: user.id,
      usuario_email: user.email ?? '',
      usuario_nombres: anulado_por_nombre,
      usuario_rol: 'Administrador',
      datos_anteriores: {
        estado: 'Activo',
        monto: abono.monto,
        numero_recibo: abono.numero_recibo,
        metodo_pago: abono.metodo_pago,
        fecha_abono: abono.fecha_abono,
        numero_referencia: abono.numero_referencia,
        negociacion_id: abono.negociacion_id,
        fuente_pago_id: abono.fuente_pago_id,
      },
      datos_nuevos: {
        estado: 'Anulado',
        motivo_categoria,
        motivo_detalle: motivo_detalle ?? null,
        anulado_por_nombre,
        fecha_anulacion: abonoActualizado.fecha_anulacion,
      },
      metadata: {
        // ─── CLAVE CRÍTICA para que el historial del cliente lo muestre ───
        cliente_id: contexto?.cliente_id ?? null,
        cliente_nombre: clienteCtx
          ? `${String(clienteCtx.nombres ?? '')} ${String(clienteCtx.apellidos ?? '')}`.trim()
          : null,

        // ─── Datos del abono original (mismo naming que AbonoRegistradoRenderer) ───
        abono_monto: abono.monto,
        abono_numero_recibo: abono.numero_recibo,
        abono_metodo_pago: abono.metodo_pago,
        abono_fecha_abono: abono.fecha_abono,
        abono_numero_referencia: abono.numero_referencia ?? null,
        abono_notas: abono.notas ?? null,
        abono_mora_incluida: abono.mora_incluida ?? null,
        abono_comprobante_url: abono.comprobante_url ?? null,

        // ─── Fuente de pago ───
        fuente_tipo: fuente?.tipo ?? null,
        fuente_monto_aprobado: fuente?.monto_aprobado ?? null,

        // ─── Negociación ───
        negociacion_id: abono.negociacion_id,
        negociacion_valor_total_pagar: contexto?.valor_total_pagar ?? null,

        // ─── Vivienda / Proyecto ───
        vivienda_numero: viviendaCtx?.numero ?? null,
        manzana_nombre: viviendaCtx?.manzanas?.nombre ?? null,
        proyecto_nombre: viviendaCtx?.manzanas?.proyectos?.nombre ?? null,

        // ─── Datos de la anulación ───
        motivo_categoria,
        motivo_detalle: motivo_detalle ?? null,
        anulado_por_nombre,
        fecha_anulacion: abonoActualizado.fecha_anulacion,
      },
      modulo: 'abonos',
    })
    .then(({ error: auditError }) => {
      if (auditError)
        logger.error(
          '⚠️ audit_log insert failed (non-blocking):',
          auditError.message
        )
    })

  return NextResponse.json({
    success: true,
    message: `Abono #${abono.numero_recibo} anulado correctamente`,
    abono: abonoActualizado,
  })
}
