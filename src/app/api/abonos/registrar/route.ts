import { NextRequest, NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Json } from '@/lib/supabase/database.types'
import { createRouteClient } from '@/lib/supabase/server-route'
import { formatDateForDB } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

/**
 * API Route: POST /api/abonos/registrar
 * Registra un nuevo abono para una fuente de pago específica
 */
export async function POST(request: NextRequest) {
  try {
    // Crear cliente con contexto de autenticación (dentro del try para capturar errores de sesión)
    const supabase = await createRouteClient()

    // 0. Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 0b. Verificar permiso de registrar abonos según permisos_rol
    const permisos = await getServerPermissions('abonos')
    if (!permisos.canCreate) {
      return NextResponse.json(
        { error: 'No tienes permisos para registrar abonos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      negociacion_id,
      fuente_pago_id,
      monto,
      fecha_abono,
      metodo_pago,
      numero_referencia,
      notas,
      comprobante_path,
      mora_incluida,
    } = body

    // mora_incluida: porción del monto que corresponde a mora (no se descuenta del saldo)
    const moraIncluida =
      typeof mora_incluida === 'number' && mora_incluida > 0 ? mora_incluida : 0

    // Validaciones
    if (
      !negociacion_id ||
      !fuente_pago_id ||
      !monto ||
      !fecha_abono ||
      !metodo_pago
    ) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    if (!comprobante_path || typeof comprobante_path !== 'string') {
      return NextResponse.json(
        { error: 'El comprobante de pago es obligatorio' },
        { status: 400 }
      )
    }

    if (monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a cero' },
        { status: 400 }
      )
    }

    // 1. Verificar que la fuente de pago existe y tiene saldo disponible
    const { data: fuente, error: fuenteError } = await supabase
      .from('fuentes_pago')
      .select(
        'id, tipo, monto_aprobado, monto_recibido, saldo_pendiente, negociacion_id'
      )
      .eq('id', fuente_pago_id)
      .single()

    if (fuenteError || !fuente) {
      return NextResponse.json(
        { error: 'Fuente de pago no encontrada' },
        { status: 404 }
      )
    }

    if (fuente.negociacion_id !== negociacion_id) {
      return NextResponse.json(
        { error: 'La fuente de pago no pertenece a esta negociación' },
        { status: 400 }
      )
    }

    const saldoDisponible = fuente.saldo_pendiente || 0
    const montoSinMora = monto - moraIncluida
    if (montoSinMora > saldoDisponible) {
      return NextResponse.json(
        {
          error: `El monto principal ($${montoSinMora}) excede el saldo disponible ($${saldoDisponible})`,
        },
        { status: 400 }
      )
    }

    // 1b. Validar estado y fecha de la negociación
    const { data: negociacion, error: negError } = await supabase
      .from('negociaciones')
      .select('estado, fecha_negociacion')
      .eq('id', negociacion_id)
      .single()

    if (!negError && negociacion) {
      if (negociacion.estado !== 'Activa') {
        return NextResponse.json(
          {
            error: `No se puede registrar un abono en una negociación en estado "${negociacion.estado}"`,
          },
          { status: 400 }
        )
      }

      if (negociacion.fecha_negociacion) {
        const fechaNeg = negociacion.fecha_negociacion.slice(0, 10)
        if (fecha_abono < fechaNeg) {
          return NextResponse.json(
            {
              error: `La fecha del abono no puede ser anterior al inicio de la negociación (${fechaNeg})`,
            },
            { status: 400 }
          )
        }
      }
    }

    // 2. Convertir fecha usando utilidad centralizada
    const fechaAbonoDB = formatDateForDB(fecha_abono)

    // 4. Registrar el abono (numero_recibo se asigna automáticamente por secuencia BD)
    const { data: nuevoAbono, error: abonoError } = await supabaseAdmin
      .from('abonos_historial')
      .insert({
        negociacion_id,
        fuente_pago_id,
        monto,
        mora_incluida: moraIncluida > 0 ? moraIncluida : undefined,
        fecha_abono: fechaAbonoDB,
        metodo_pago,
        numero_referencia: numero_referencia || null,
        comprobante_url: comprobante_path,
        notas: notas || null,
        usuario_registro: user?.id ?? null,
      })
      .select()
      .single()

    if (abonoError) {
      logger.error('Error insertando abono:', abonoError)
      return NextResponse.json(
        { error: 'Error al registrar el abono: ' + abonoError.message },
        { status: 500 }
      )
    }

    // 4. Los triggers de la DB ya actualizaron saldo_pendiente y totales.
    //    Re-consultamos la negociación para detectar si se completó el pago.
    const { data: negActualizada } = await supabase
      .from('negociaciones')
      .select('id, estado, saldo_pendiente, cliente_id, vivienda_id')
      .eq('id', negociacion_id)
      .single()

    let negociacionCompletada = false
    let clienteNombre: string | null = null

    if (
      negActualizada &&
      negActualizada.estado === 'Activa' &&
      (negActualizada.saldo_pendiente ?? 1) <= 0
    ) {
      const hoy = formatDateForDB(new Date().toISOString().slice(0, 10))

      // Completar negociación + actualizar vivienda en paralelo
      await Promise.all([
        supabaseAdmin
          .from('negociaciones')
          .update({ estado: 'Completada', fecha_completada: hoy })
          .eq('id', negociacion_id),
        negActualizada.vivienda_id
          ? supabaseAdmin
              .from('viviendas')
              .update({ estado: 'Propietario' })
              .eq('id', negActualizada.vivienda_id)
          : Promise.resolve(),
      ])

      // Promover cliente a Propietario
      if (negActualizada.cliente_id) {
        const { data: clienteRow } = await supabaseAdmin
          .from('clientes')
          .update({ estado: 'Propietario' })
          .eq('id', negActualizada.cliente_id)
          .select('nombres, apellidos')
          .single()

        clienteNombre = clienteRow
          ? `${clienteRow.nombres} ${clienteRow.apellidos}`.trim()
          : null
      }

      negociacionCompletada = true
    }

    // 5. Registrar en audit_log con metadata enriquecida.
    //    Sincrónico: Vercel no garantiza ejecución post-response sin waitUntil,
    //    por lo que el log debe escribirse antes de retornar la respuesta.
    try {
      const [{ data: fuenteActualizada }, { data: contexto }] =
        await Promise.all([
          supabase
            .from('fuentes_pago')
            .select('monto_recibido, saldo_pendiente')
            .eq('id', fuente_pago_id)
            .single(),
          supabase
            .from('negociaciones')
            .select(
              'id, cliente_id, saldo_pendiente, valor_total_pagar, clientes(id, nombres, apellidos), viviendas!negociaciones_vivienda_id_fkey(numero, manzanas(nombre, proyectos(nombre)))'
            )
            .eq('id', negociacion_id)
            .single(),
        ])

      const cliente = contexto?.clientes as
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

      const metadata = {
        // CRÍTICO: cliente_id es la clave para que el historial del cliente filtre este evento
        cliente_id: contexto?.cliente_id ?? null,
        cliente_nombre: cliente
          ? `${String(cliente.nombres ?? '')} ${String(cliente.apellidos ?? '')}`.trim()
          : null,
        abono_monto: monto,
        abono_numero_recibo: (nuevoAbono as Record<string, unknown>)
          .numero_recibo,
        abono_metodo_pago: metodo_pago,
        abono_fecha_abono: fechaAbonoDB,
        abono_numero_referencia: numero_referencia ?? null,
        abono_notas: notas ?? null,
        abono_mora_incluida: moraIncluida > 0 ? moraIncluida : null,
        abono_comprobante_url: comprobante_path ?? null,
        fuente_tipo: fuente.tipo ?? null,
        fuente_monto_aprobado: fuente.monto_aprobado ?? null,
        fuente_monto_antes: fuente.monto_recibido ?? null,
        fuente_saldo_antes: fuente.saldo_pendiente ?? null,
        fuente_monto_despues: fuenteActualizada?.monto_recibido ?? null,
        fuente_saldo_despues: fuenteActualizada?.saldo_pendiente ?? null,
        negociacion_id,
        negociacion_valor_total_pagar: contexto?.valor_total_pagar ?? null,
        negociacion_saldo_despues: contexto?.saldo_pendiente ?? null,
        vivienda_numero: viviendaCtx?.numero ?? null,
        manzana_nombre: viviendaCtx?.manzanas?.nombre ?? null,
        proyecto_nombre: viviendaCtx?.manzanas?.proyectos?.nombre ?? null,
      }

      await supabaseAdmin.from('audit_log').insert({
        accion: 'CREATE',
        tabla: 'abonos_historial',
        registro_id: nuevoAbono.id,
        usuario_id: user?.id ?? null,
        usuario_email: user?.email ?? '',
        datos_nuevos: nuevoAbono as unknown as Json,
        metadata: metadata as unknown as Json,
        modulo: 'abonos',
      })
    } catch (auditError) {
      logger.error('Error registrando audit de abono:', auditError)
    }

    return NextResponse.json({
      success: true,
      abono: nuevoAbono,
      message: 'Abono registrado exitosamente',
      negociacion_completada: negociacionCompletada,
      cliente_nombre: clienteNombre,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'
    logger.error('❌ Error en POST /api/abonos/registrar:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
