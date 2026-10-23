import { NextRequest, NextResponse } from 'next/server'

import { adminComo } from '@/lib/supabase/admin'
import type { Json } from '@/lib/supabase/database.types'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

/**
 * API Route: POST /api/abonos/registrar
 * Registra un abono o desembolso de una fuente de pago (RPC registrar_abono)
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
    const admin = adminComo(user.id)

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
      es_overpayment, // flag explícito enviado por el frontend cuando admin acepta exceder saldo
    } = body

    // mora_incluida: porción del monto que corresponde a mora (no se descuenta del saldo)
    const moraIncluida =
      typeof mora_incluida === 'number' && mora_incluida > 0 ? mora_incluida : 0

    // 1. Registro atómico (RPC registrar_abono): valida permiso, negociación,
    //    fuente, fecha, método, saldo, cierre financiero y documentos
    //    obligatorios; inserta el abono, el excedente si lo hay y cierra la
    //    negociación cuando queda pagada. Ver
    //    supabase/migrations/20261023_rpc_registrar_abono.sql
    const { data, error: rpcError } = await supabase.rpc('registrar_abono', {
      p_payload: {
        negociacion_id,
        fuente_pago_id,
        monto,
        mora_incluida: moraIncluida,
        fecha_abono:
          typeof fecha_abono === 'string' ? fecha_abono.slice(0, 10) : null,
        metodo_pago,
        numero_referencia: numero_referencia || null,
        notas: notas || null,
        comprobante_path,
        es_overpayment: es_overpayment === true,
      },
    })

    if (rpcError) {
      const status = rpcError.code === '42501' ? 403 : 400
      return NextResponse.json({ error: rpcError.message }, { status })
    }

    const resultado = data as unknown as {
      abono: Record<string, unknown> & { id: string }
      negociacion_completada: boolean
      cliente_nombre: string | null
      fuente_antes: { monto_recibido: number; saldo_pendiente: number }
      fuente_despues: { monto_recibido: number; saldo_pendiente: number }
    }
    const nuevoAbono = resultado.abono
    const fechaAbonoDB = String(nuevoAbono.fecha_abono ?? '')

    // 2. Registrar en audit_log con metadata enriquecida (alimenta el
    //    Historial del cliente). Sincrónico: Vercel no garantiza ejecución
    //    post-response sin waitUntil.
    try {
      const [{ data: contexto }, { data: fuente }] = await Promise.all([
        supabase
          .from('negociaciones')
          .select(
            'id, cliente_id, saldo_pendiente, valor_total_pagar, clientes(id, nombres, apellidos), viviendas!negociaciones_vivienda_id_fkey(numero, manzanas(nombre, proyectos(nombre)))'
          )
          .eq('id', negociacion_id)
          .single(),
        supabase
          .from('fuentes_pago')
          .select('tipo, monto_aprobado')
          .eq('id', fuente_pago_id)
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
        abono_numero_recibo: nuevoAbono.numero_recibo,
        abono_metodo_pago: metodo_pago,
        abono_fecha_abono: fechaAbonoDB,
        abono_numero_referencia: numero_referencia ?? null,
        abono_notas: notas ?? null,
        abono_mora_incluida: moraIncluida > 0 ? moraIncluida : null,
        abono_comprobante_url: comprobante_path ?? null,
        fuente_tipo: fuente?.tipo ?? null,
        fuente_monto_aprobado: fuente?.monto_aprobado ?? null,
        fuente_monto_antes: resultado.fuente_antes.monto_recibido ?? null,
        fuente_saldo_antes: resultado.fuente_antes.saldo_pendiente ?? null,
        fuente_monto_despues: resultado.fuente_despues.monto_recibido ?? null,
        fuente_saldo_despues: resultado.fuente_despues.saldo_pendiente ?? null,
        negociacion_id,
        negociacion_valor_total_pagar: contexto?.valor_total_pagar ?? null,
        negociacion_saldo_despues: contexto?.saldo_pendiente ?? null,
        vivienda_numero: viviendaCtx?.numero ?? null,
        manzana_nombre: viviendaCtx?.manzanas?.nombre ?? null,
        proyecto_nombre: viviendaCtx?.manzanas?.proyectos?.nombre ?? null,
      }

      await admin.from('audit_log').insert({
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
      negociacion_completada: resultado.negociacion_completada,
      cliente_nombre: resultado.cliente_nombre,
      saldo_fuente: resultado.fuente_despues.saldo_pendiente,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'
    logger.error('❌ Error en POST /api/abonos/registrar:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
