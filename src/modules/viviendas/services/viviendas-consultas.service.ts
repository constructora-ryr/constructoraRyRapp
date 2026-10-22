import { supabase } from '@/lib/supabase/client'
import { errorLog } from '@/lib/utils/logger'

import type {
  ConfiguracionRecargo,
  FiltrosViviendas,
  ManzanaConDisponibilidad,
  Proyecto,
  Vivienda,
} from '../types'

export async function obtenerProyectos(): Promise<Proyecto[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('id, nombre, estado')
    .in('estado', ['en_planificacion', 'en_construccion'])
    .order('nombre')

  if (error) throw error
  return data || []
}

export async function obtenerProyectosParaFiltro(): Promise<
  Array<{ id: string; nombre: string }>
> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('id, nombre')
    .order('nombre')

  if (error) throw error
  return data || []
}

export async function obtenerViviendasDisponiblesPorProyecto(
  proyectoId: string
): Promise<
  Array<{
    id: string
    numero: string
    manzana_id: string
    manzanas: { nombre: string } | null
  }>
> {
  const { data: manzanas } = await supabase
    .from('manzanas')
    .select('id')
    .eq('proyecto_id', proyectoId)

  const ids = manzanas?.map(m => m.id) ?? []
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('viviendas')
    .select('id, numero, manzana_id, manzanas(nombre)')
    .in('manzana_id', ids)
    .eq('estado', 'Disponible')
    .order('numero')

  if (error) throw error
  return (data ?? []) as Array<{
    id: string
    numero: string
    manzana_id: string
    manzanas: { nombre: string } | null
  }>
}

export async function obtenerManzanasDisponibles(
  proyectoId: string
): Promise<ManzanaConDisponibilidad[]> {
  const { data, error } = await supabase
    .from('vista_manzanas_disponibilidad')
    .select('*')
    .eq('proyecto_id', proyectoId)
    .eq('tiene_disponibles', true)
    .order('nombre')

  if (error) throw error
  return (data || []) as ManzanaConDisponibilidad[]
}

export async function obtenerSiguienteNumeroVivienda(
  manzanaId: string
): Promise<number> {
  const { data, error } = await supabase.rpc(
    'obtener_siguiente_numero_vivienda',
    {
      p_manzana_id: manzanaId,
    }
  )

  if (error) throw error
  return data || 1
}

export async function obtenerNumerosOcupados(
  manzanaId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('viviendas')
    .select('numero')
    .eq('manzana_id', manzanaId)
    .order('numero')

  if (error) throw error
  return data?.map(v => v.numero) || []
}

export async function verificarMatriculaUnica(
  matricula: string,
  viviendaId?: string
): Promise<{
  esUnica: boolean
  viviendaDuplicada?: { numero: string; manzana: string }
}> {
  try {
    const { data, error } = await supabase
      .from('viviendas')
      .select('id, numero, matricula_inmobiliaria, manzanas!inner(nombre)')
      .eq('matricula_inmobiliaria', matricula)

    if (error) throw error

    const duplicados = viviendaId
      ? data?.filter(v => v.id !== viviendaId) || []
      : data || []
    const esUnica = duplicados.length === 0

    if (!esUnica && duplicados[0]) {
      return {
        esUnica: false,
        viviendaDuplicada: {
          numero: duplicados[0].numero,
          manzana: duplicados[0].manzanas.nombre,
        },
      }
    }

    return { esUnica: true }
  } catch (error) {
    if (error instanceof Error) {
      errorLog('[VIVIENDAS] Error al verificar matrícula', error)
    } else {
      errorLog(
        '[VIVIENDAS] Error desconocido al verificar matrícula',
        String(error)
      )
    }
    throw error
  }
}

export async function obtenerConfiguracionRecargos(): Promise<
  ConfiguracionRecargo[]
> {
  const { data, error } = await supabase
    .from('configuracion_recargos')
    .select('*')
    .eq('activo', true)
    .order('tipo')

  if (error) throw error
  return (data || []) as ConfiguracionRecargo[]
}

/**
 * Gastos notariales vigentes. Sin valor configurado se lanza error en vez de
 * suponer uno: el total de la vivienda depende de este número.
 */
export async function obtenerGastosNotariales(): Promise<number> {
  const { data, error } = await supabase
    .from('configuracion_recargos')
    .select('valor')
    .eq('tipo', 'gastos_notariales')
    .eq('activo', true)
    .maybeSingle()

  if (error) {
    errorLog('Error obteniendo gastos notariales', error)
    throw error
  }
  if (data?.valor == null)
    throw new Error(
      'No hay gastos notariales activos configurados. Revisa la configuración de recargos.'
    )
  return Number(data.valor)
}

export async function obtenerTodas(): Promise<Vivienda[]> {
  const { data, error } = await supabase
    .from('viviendas')
    .select('*')
    .order('fecha_creacion', { ascending: false })

  if (error) throw error
  return (data || []) as unknown as Vivienda[]
}

export async function obtenerPorManzana(
  manzanaId: string
): Promise<Vivienda[]> {
  const { data, error } = await supabase
    .from('viviendas')
    .select('*')
    .eq('manzana_id', manzanaId)
    .order('numero')

  if (error) throw error
  return (data || []) as unknown as Vivienda[]
}

export async function obtenerPorId(id: string): Promise<Vivienda | null> {
  const { data, error } = await supabase
    .from('viviendas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as Vivienda
}

interface NegociacionDetalle {
  valor_total_pagar: number | null
  clientes: {
    id: string
    nombres: string
    apellidos: string
    telefono: string | null
    email: string | null
  } | null
  abonos_historial: Array<{ monto: number; estado: string }>
}

/**
 * Detalle de una vivienda en UNA consulta: manzana, proyecto y, si tiene
 * negociación vigente, su cliente y abonos activos para calcular el saldo.
 * Los abonos salen de la negociación actual (no de la vivienda): tras una
 * renuncia y una nueva venta no se mezclan los pagos de dos clientes.
 */
export async function obtenerVivienda(id: string): Promise<Vivienda> {
  const { data, error } = await supabase
    .from('viviendas')
    .select(
      `
      *,
      manzanas (nombre, proyecto_id, proyectos (nombre)),
      negociacion:negociaciones!viviendas_negociacion_id_fkey (
        valor_total_pagar,
        clientes (id, nombres, apellidos, telefono, email),
        abonos_historial!abonos_historial_negociacion_id_fkey (monto, estado)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) throw new Error('Vivienda no encontrada')

  const { negociacion, ...fila } = data as unknown as Vivienda & {
    negociacion: NegociacionDetalle | null
  }
  const vivienda = fila as Vivienda

  const cliente = negociacion?.clientes
  if (cliente) {
    vivienda.clientes = {
      id: cliente.id,
      nombre_completo: `${cliente.nombres} ${cliente.apellidos}`.trim(),
      telefono: cliente.telefono ?? undefined,
      email: cliente.email ?? undefined,
    }
  }

  const activos = (negociacion?.abonos_historial ?? []).filter(
    a => a.estado === 'Activo'
  )
  const valorNegociado = Number(negociacion?.valor_total_pagar) || undefined
  const base = valorNegociado ?? vivienda.valor_total
  const abonado = activos.reduce((suma, a) => suma + Number(a.monto), 0)

  vivienda.valor_negociado = valorNegociado
  vivienda.total_abonado = abonado
  vivienda.cantidad_abonos = activos.length
  vivienda.saldo_pendiente = Math.max(0, base - abonado)
  vivienda.porcentaje_pagado =
    base > 0 ? Math.round((abonado / base) * 10000) / 100 : 0

  return vivienda
}

export async function listar(filtros?: FiltrosViviendas): Promise<Vivienda[]> {
  const queryBuilder = supabase.from('vista_viviendas_completas').select('*')
  let query = queryBuilder

  if (filtros?.proyecto_id) query = query.eq('proyecto_id', filtros.proyecto_id)
  if (filtros?.manzana_id) query = query.eq('manzana_id', filtros.manzana_id)
  if (filtros?.estado) {
    if (filtros.estado === 'Vendidas') {
      query = query.neq('estado', 'Disponible')
    } else {
      query = query.eq('estado', filtros.estado)
    }
  }

  const { data, error } = await query

  if (error) {
    errorLog('Error cargando viviendas desde vista', error)
    throw error
  }

  const viviendas = (data || []).map((row: Record<string, unknown>) => ({
    id: row.id,
    manzana_id: row.manzana_id,
    numero: row.numero,
    estado: row.estado,
    cliente_id: row.cliente_id,
    negociacion_id: row.negociacion_id,
    lindero_norte: row.lindero_norte,
    lindero_sur: row.lindero_sur,
    lindero_oriente: row.lindero_oriente,
    lindero_occidente: row.lindero_occidente,
    matricula_inmobiliaria: row.matricula_inmobiliaria,
    nomenclatura: row.nomenclatura,
    area: row.area,
    area_lote: row.area_lote,
    area_construida: row.area_construida,
    tipo_vivienda: row.tipo_vivienda,
    certificado_tradicion_url: row.certificado_tradicion_url,
    valor_base: row.valor_base,
    es_esquinera: row.es_esquinera,
    recargo_esquinera: row.recargo_esquinera,
    gastos_notariales: row.gastos_notariales,
    valor_total: row.valor_total,
    fecha_creacion: row.fecha_creacion,
    fecha_actualizacion: row.fecha_actualizacion,
    manzanas: {
      nombre: row.manzana_nombre,
      proyecto_id: row.proyecto_id,
      proyectos: { nombre: row.proyecto_nombre },
    },
    ...(row.cliente_id
      ? {
          clientes: {
            id: row.cliente_id_data,
            nombre_completo:
              `${String(row.cliente_nombres ?? '')} ${String(row.cliente_apellidos ?? '')}`.trim(),
            telefono: row.cliente_telefono,
            email: row.cliente_email,
          },
        }
      : {}),
    total_abonado: Number(row.total_abonado) || 0,
    cantidad_abonos: Number(row.cantidad_abonos) || 0,
    valor_negociado: Number(row.valor_total_pagar) || undefined,
    porcentaje_pagado: Number(row.porcentaje_pagado) || 0,
    saldo_pendiente:
      row.saldo_pendiente != null
        ? Number(row.saldo_pendiente)
        : Number(row.valor_total) || 0,
  })) as Vivienda[]

  viviendas.sort((a, b) => {
    const manzanaA = a.manzanas?.nombre || ''
    const manzanaB = b.manzanas?.nombre || ''
    if (manzanaA !== manzanaB) return manzanaA.localeCompare(manzanaB)
    const numA = parseInt(a.numero, 10) || 0
    const numB = parseInt(b.numero, 10) || 0
    return numA - numB
  })

  return viviendas
}
