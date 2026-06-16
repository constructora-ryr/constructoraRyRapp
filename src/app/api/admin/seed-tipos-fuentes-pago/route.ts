import { NextResponse } from 'next/server'

import { getServerPermissions } from '@/lib/auth/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

// Seed data con IDs fijos (actualizado para usar createRouteClient)
const FUENTES_OFICIALES = [
  {
    id: '25336a87-035e-47ac-a382-335af02219cf',
    nombre: 'Cuota Inicial',
    codigo: 'cuota_inicial',
    descripcion: 'Pagos directos del cliente (permite múltiples abonos)',
    es_subsidio: false,
    requiere_entidad: false,
    permite_multiples_abonos: true,
    color: 'blue',
    icono: 'DollarSign',
    orden: 1,
    activo: true,
  },
  {
    id: 'e635231f-6f71-4180-8e79-e50e1a82ef7d',
    nombre: 'Crédito Hipotecario',
    codigo: 'credito_hipotecario',
    descripcion: 'Financiación bancaria',
    es_subsidio: false,
    requiere_entidad: true,
    permite_multiples_abonos: false,
    color: 'purple',
    icono: 'Building2',
    orden: 2,
    activo: true,
  },
  {
    id: '6a58205b-7297-4fd8-a0ae-b899b8a2c2ce',
    nombre: 'Subsidio Mi Casa Ya',
    codigo: 'subsidio_mi_casa_ya',
    descripcion: 'Subsidio del gobierno nacional',
    es_subsidio: true,
    requiere_entidad: false,
    permite_multiples_abonos: false,
    color: 'green',
    icono: 'Gift',
    orden: 3,
    activo: true,
  },
  {
    id: '2a21e525-2731-4270-8668-4d64359eeeb6',
    nombre: 'Subsidio Caja Compensación',
    codigo: 'subsidio_caja_compensacion',
    descripcion: 'Subsidio de caja de compensación familiar',
    es_subsidio: true,
    requiere_entidad: true,
    permite_multiples_abonos: false,
    color: 'orange',
    icono: 'HomeIcon',
    orden: 4,
    activo: true,
  },
]

export async function POST() {
  try {
    // Verificar permisos (solo admin)
    const permisos = await getServerPermissions()

    if (!permisos.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const supabase = await createRouteClient()

    // Ejecutar upserts en paralelo
    const resultados = await Promise.all(
      FUENTES_OFICIALES.map(async fuente => {
        const { data, error } = await supabaseAdmin
          .from('tipos_fuentes_pago')
          .upsert(
            {
              id: fuente.id,
              nombre: fuente.nombre,
              codigo: fuente.codigo,
              descripcion: fuente.descripcion,
              es_subsidio: fuente.es_subsidio,
              requiere_entidad: fuente.requiere_entidad,
              permite_multiples_abonos: fuente.permite_multiples_abonos,
              color: fuente.color,
              icono: fuente.icono,
              orden: fuente.orden,
              activo: fuente.activo,
            },
            {
              onConflict: 'id',
              ignoreDuplicates: false,
            }
          )
          .select()
          .single()

        if (error) {
          throw error
        }

        return data
      })
    )

    // Consultar fuentes actualizadas
    const { data: fuentesFinales, error: errorConsulta } = await supabase
      .from('tipos_fuentes_pago')
      .select('*')
      .order('orden')

    if (errorConsulta) {
      throw errorConsulta
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Seed ejecutado correctamente',
      registrosAfectados: resultados.length,
      fuentes: fuentesFinales,
    })
  } catch (error) {
    logger.error('Error en seed de tipos de fuentes:', error)
    return NextResponse.json(
      {
        error: 'Error al ejecutar seed',
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
