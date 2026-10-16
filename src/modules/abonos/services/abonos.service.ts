// =====================================================
// SERVICIO: Módulo de Abonos
// Lógica de negocio y comunicación con Supabase
// =====================================================

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  AbonoHistorial,
  CrearAbonoDTO,
  EstadisticasAbonos,
  FiltrosAbonos,
  FuentePagoConAbonos,
  MetodoPago,
  NegociacionConAbonos,
} from '../types'

// =====================================================
// OBTENER NEGOCIACIONES ACTIVAS
// =====================================================

/**
 * Obtiene todas las negociaciones en estado activo
 * ✅ ACTUALIZADO (2025-10-23): Estados según migración 003
 * Estados considerados: 'Activa' (negociaciones activas que permiten abonos)
 * Consultar: docs/DATABASE-SCHEMA-REFERENCE-ACTUALIZADO.md
 */
export async function obtenerNegociacionesActivas(): Promise<
  NegociacionConAbonos[]
> {
  // Query con campos REALES verificados en DB
  // Solo negociaciones 'Activa' permiten registrar abonos
  // Especificamos la relación exacta para evitar ambigüedad
  const { data, error } = await supabase
    .from('negociaciones')
    .select(
      `
      *,
      clientes!negociaciones_cliente_id_fkey(id, nombres, apellidos, numero_documento, telefono, email, ciudad),
      viviendas!negociaciones_vivienda_id_fkey(id, numero, manzana_id, valor_base, area, tipo_vivienda),
      fuentes_pago!fuentes_pago_negociacion_id_fkey(*, tipos_fuentes_pago!fk_fuentes_pago_tipo_fuente(orden))
    `
    )
    .eq('estado', 'Activa')
    .or('saldo_pendiente.gt.0,saldo_pendiente.is.null')
    .order('fecha_creacion', { ascending: false })

  if (error) {
    logger.error('❌ Error obteniendo negociaciones activas:', error)
    throw new Error(`Error al obtener negociaciones: ${error.message}`)
  }

  // Obtener manzanas y proyectos por separado (viviendas → manzanas → proyectos)
  const manzanaIds = [
    ...new Set(
      data
        ?.map(n => {
          const vivienda = Array.isArray(n.viviendas)
            ? n.viviendas[0]
            : n.viviendas
          return vivienda?.manzana_id
        })
        .filter(Boolean)
    ),
  ]

  const { data: manzanas } = await supabase
    .from('manzanas')
    .select('id, nombre, proyecto_id')
    .in('id', manzanaIds)

  const proyectoIds = [
    ...new Set(manzanas?.map(m => m.proyecto_id).filter(Boolean)),
  ]

  const { data: proyectos } = await supabase
    .from('proyectos')
    .select('id, nombre, ubicacion')
    .in('id', proyectoIds)

  // Crear maps
  const manzanaMap = new Map(manzanas?.map(m => [m.id, m]) || [])
  const proyectoMap = new Map(proyectos?.map(p => [p.id, p]) || [])

  return (data ?? []).map(item => {
    const vivienda = Array.isArray(item.viviendas)
      ? item.viviendas[0]
      : item.viviendas
    const manzana = manzanaMap.get(vivienda?.manzana_id ?? '')
    const proyecto = proyectoMap.get(manzana?.proyecto_id ?? '')

    return {
      ...item,
      cliente: Array.isArray(item.clientes) ? item.clientes[0] : item.clientes,
      vivienda: {
        ...(vivienda ?? {}),
        manzana: manzana || undefined,
      },
      proyecto: proyecto || { id: '', nombre: 'Sin proyecto', ubicacion: '' },
      fuentes_pago: Array.isArray(item.fuentes_pago)
        ? item.fuentes_pago
            .filter(fp => {
              // Excluir fuentes inactivas (soporta ambas variantes de nombre de columna)
              const estado = (fp.estado || fp.estado_fuente || '').toLowerCase()
              return estado !== 'inactiva'
            })
            .sort((a, b) => {
              const ordenA = a.tipos_fuentes_pago?.orden ?? 999
              const ordenB = b.tipos_fuentes_pago?.orden ?? 999
              return ordenA - ordenB
            })
            .map(fp => ({
              ...fp,
              abonos: [],
            }))
        : [],
    }
  }) as unknown as NegociacionConAbonos[]
}

/**
 * Obtiene una negociación específica con su información completa
 */
export async function obtenerNegociacionPorId(
  negociacionId: string
): Promise<NegociacionConAbonos | null> {
  const { data, error } = await supabase
    .from('negociaciones')
    .select(
      `
      *,
      clientes!negociaciones_cliente_id_fkey(*),
      viviendas!negociaciones_vivienda_id_fkey(*),
      fuentes_pago!fuentes_pago_negociacion_id_fkey(*)
    `
    )
    .eq('id', negociacionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error('❌ Error obteniendo negociación:', error)
    throw new Error(`Error al obtener negociación: ${error.message}`)
  }

  // Obtener proyecto a través de manzana (viviendas → manzanas → proyectos)
  const vivienda = Array.isArray(data.viviendas)
    ? data.viviendas[0]
    : data.viviendas

  const { data: manzana } = await supabase
    .from('manzanas')
    .select('proyecto_id')
    .eq('id', vivienda?.manzana_id)
    .single()

  const { data: proyecto } = await supabase
    .from('proyectos')
    .select('id, nombre, ubicacion')
    .eq('id', manzana?.proyecto_id ?? '')
    .single()

  // Transformar manualmente (sin usar el mapa)
  return transformNegociacion(data, proyecto)
}

// =====================================================
// FUENTES DE PAGO CON ABONOS
// =====================================================

/**
 * Obtiene las fuentes de pago de una negociación con su historial de abonos
 */
export async function obtenerFuentesPagoConAbonos(
  negociacionId: string
): Promise<FuentePagoConAbonos[]> {
  const { data, error } = await supabase
    .from('fuentes_pago')
    .select(
      `
      *,
      entidad_financiera:entidad_financiera_id (
        id,
        nombre,
        tipo,
        codigo
      ),
      abonos:abonos_historial!fuente_pago_id(*)
    `
    )
    .eq('negociacion_id', negociacionId)
    .eq('estado_fuente', 'activa') // ✅ CRÍTICO: Solo fuentes activas

  if (error) {
    logger.error('❌ Error obteniendo fuentes de pago:', error)
    throw new Error(`Error al obtener fuentes de pago: ${error.message}`)
  }

  // Obtener orden de tipos de fuentes
  const { data: tiposFuentes, error: errorTipos } = await supabase
    .from('tipos_fuentes_pago')
    .select('nombre, orden')
    .eq('activo', true)

  if (errorTipos) {
    logger.warn('⚠️ No se pudo obtener orden de tipos de fuentes:', errorTipos)
  }

  // Crear mapa de orden
  const ordenMap = new Map<string, number>()
  if (tiposFuentes) {
    tiposFuentes.forEach(tipo => {
      ordenMap.set(tipo.nombre, tipo.orden)
    })
  }

  // Mapear y ordenar
  const fuentesMapeadas = (data ?? []).map(fuente => ({
    id: fuente.id, // ✅ Explícitamente incluir id
    tipo: fuente.tipo,
    monto: fuente.monto_aprobado, // ✅ Mapear a "monto" para consistencia
    monto_recibido: fuente.monto_recibido,
    entidad: fuente.entidad_financiera?.nombre || fuente.entidad || null, // ✅ Priorizar nombre de entidad_financiera
    numero_referencia: fuente.numero_referencia,
    detalles: (fuente as Record<string, unknown>).detalles,
    abonos: (fuente.abonos || []).sort(
      (a, b) =>
        new Date(b.fecha_abono).getTime() - new Date(a.fecha_abono).getTime()
    ),
  }))

  // ✅ Ordenar por el orden configurado en tipos_fuentes_pago
  return fuentesMapeadas.sort((a, b) => {
    const ordenA = ordenMap.get(a.tipo) || 999
    const ordenB = ordenMap.get(b.tipo) || 999
    return ordenA - ordenB
  }) as unknown as FuentePagoConAbonos[]
}

// =====================================================
// REGISTRAR ABONO
// =====================================================

/**
 * Registra un nuevo abono
/**
 * Registra un nuevo abono
 * Los triggers automáticamente actualizarán monto_recibido
 */
export async function registrarAbono(
  datos: CrearAbonoDTO
): Promise<AbonoHistorial> {
  if (datos.monto <= 0) {
    throw new Error('El monto debe ser mayor a cero')
  }

  // Obtener información de la fuente para validación
  const { data: fuente, error: fuenteError } = await supabase
    .from('fuentes_pago')
    .select('monto_aprobado, monto_recibido, saldo_pendiente, tipo')
    .eq('id', datos.fuente_pago_id)
    .single()

  if (fuenteError || !fuente) {
    throw new Error('Fuente de pago no encontrada')
  }

  // Validar que no exceda el saldo (validación adicional en cliente)
  if (datos.monto > (fuente.saldo_pendiente ?? 0)) {
    throw new Error(
      `El abono de $${datos.monto.toLocaleString('es-CO')} excede el saldo pendiente de $${(fuente.saldo_pendiente ?? 0).toLocaleString('es-CO')}`
    )
  }

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Insertar abono
  const { data, error } = await supabase
    .from('abonos_historial')
    .insert({
      ...datos,
      usuario_registro: user?.id,
    })
    .select()
    .single()

  if (error) {
    logger.error('❌ Error registrando abono:', error)

    // Traducir errores comunes
    if (error.message.includes('excede el saldo pendiente')) {
      throw new Error(
        `El abono excede el saldo disponible. Saldo actual: $${(fuente.saldo_pendiente ?? 0).toLocaleString('es-CO')}`
      )
    }

    throw new Error(`Error al registrar abono: ${error.message}`)
  }

  return data as unknown as AbonoHistorial
}

// =====================================================
// HISTORIAL DE ABONOS
// =====================================================

/**
 * Obtiene el historial de abonos con filtros opcionales
/**
 * Obtiene el historial de abonos con filtros opcionales
 */
export async function obtenerHistorialAbonos(
  filtros: FiltrosAbonos = {}
): Promise<AbonoHistorial[]> {
  let query = supabase
    .from('abonos_historial')
    .select('*')
    .order('fecha_abono', { ascending: false })

  // Aplicar filtros
  if (filtros.negociacion_id) {
    query = query.eq('negociacion_id', filtros.negociacion_id)
  }

  if (filtros.fuente_pago_id) {
    query = query.eq('fuente_pago_id', filtros.fuente_pago_id)
  }

  if (filtros.metodo_pago) {
    query = query.eq('metodo_pago', filtros.metodo_pago)
  }

  if (filtros.fecha_desde) {
    query = query.gte('fecha_abono', filtros.fecha_desde)
  }

  if (filtros.fecha_hasta) {
    query = query.lte('fecha_abono', filtros.fecha_hasta)
  }

  const { data, error } = await query

  if (error) {
    logger.error('❌ Error obteniendo historial:', error)
    throw new Error(`Error al obtener historial: ${error.message}`)
  }

  return (data ?? []) as AbonoHistorial[]
}

// =====================================================
// ESTADÍSTICAS
// =====================================================

/**
 * Obtiene estadísticas de abonos para una negociación
 */
export async function obtenerEstadisticasAbonos(
  negociacionId: string
): Promise<EstadisticasAbonos> {
  const abonos = await obtenerHistorialAbonos({ negociacion_id: negociacionId })

  const total_abonos = abonos.length
  const monto_total_abonado = abonos.reduce((sum, a) => sum + a.monto, 0)
  const promedio_por_abono =
    total_abonos > 0 ? monto_total_abonado / total_abonos : 0

  const abonos_por_metodo = abonos.reduce(
    (acc, abono) => {
      acc[abono.metodo_pago] = (acc[abono.metodo_pago] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    total_abonos,
    monto_total_abonado,
    promedio_por_abono,
    abonos_por_metodo: abonos_por_metodo as Record<MetodoPago, number>,
    ultima_actualizacion: new Date().toISOString(),
  }
}

// =====================================================
// ELIMINAR ABONO
// =====================================================

/**
 * Elimina un abono (reversa la operación)
/**
 * Elimina un abono (reversa la operación)
 * El trigger automáticamente actualizará monto_recibido
 */
export async function eliminarAbono(abonoId: string): Promise<void> {
  const { error } = await supabase
    .from('abonos_historial')
    .delete()
    .eq('id', abonoId)

  if (error) {
    logger.error('❌ Error eliminando abono:', error)
    throw new Error(`Error al eliminar abono: ${error.message}`)
  }
}

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Transforma datos de la BD al tipo NegociacionConAbonos
 */
function transformNegociacion(
  rawData: unknown,
  rawProyecto?: unknown
): NegociacionConAbonos {
  const data = rawData as Record<string, unknown>

  // Extraer el primer elemento del array (Supabase devuelve arrays para relaciones)
  const cliente = Array.isArray(data.clientes)
    ? data.clientes[0]
    : data.clientes
  const vivienda = Array.isArray(data.viviendas)
    ? data.viviendas[0]
    : data.viviendas
  const viviendaRecord = vivienda as Record<string, unknown> | undefined

  // Usar el proyecto proporcionado o buscar en datos anidados
  let proyectoFinal = rawProyecto

  if (!proyectoFinal && viviendaRecord) {
    // Fallback: buscar proyecto anidado
    const proyectos = viviendaRecord.proyectos
    proyectoFinal = Array.isArray(proyectos) ? proyectos[0] : proyectos
  }

  const fuentesPago = Array.isArray(data.fuentes_pago) ? data.fuentes_pago : []

  return {
    id: data.id,
    cliente_id: data.cliente_id,
    vivienda_id: data.vivienda_id,
    estado: data.estado,
    valor_negociado: (data.valor_negociado as number) || 0,
    descuento_aplicado: data.descuento_aplicado,
    valor_total: data.valor_total,
    total_fuentes_pago: data.total_fuentes_pago,
    total_abonado: data.total_abonado,
    saldo_pendiente: data.saldo_pendiente,
    porcentaje_pagado: data.porcentaje_pagado,
    fecha_negociacion: data.fecha_negociacion,
    fecha_completada: data.fecha_completada,
    notas: data.notas,
    fecha_creacion: data.fecha_creacion,
    fecha_actualizacion: data.fecha_actualizacion,
    cliente: cliente,
    vivienda: vivienda,
    proyecto: proyectoFinal,
    fuentes_pago: fuentesPago.map(f => ({
      ...(f as Record<string, unknown>),
      abonos: [],
    })),
  } as unknown as NegociacionConAbonos
}
