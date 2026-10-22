import { supabase } from '@/lib/supabase/client'
import { errorLog } from '@/lib/utils/logger'

import type { Vivienda, ViviendaFormData } from '../types'
import {
  sanitizeViviendaFormData,
  sanitizeViviendaUpdate,
} from '../utils/sanitize-vivienda.utils'

import {
  obtenerGastosNotariales,
  obtenerPorId,
  verificarMatriculaUnica,
} from './viviendas-consultas.service'
import {
  eliminarCertificado,
  subirCertificado,
} from './viviendas-storage.service'

/** Errores de índices únicos de la BD, en palabras del usuario */
function traducirErrorCreacion(error: { code?: string; message?: string }) {
  if (error.code !== '23505')
    return new Error(error.message || 'No se pudo crear la vivienda')
  if (error.message?.includes('idx_matricula_inmobiliaria_unica'))
    return new Error(
      'Esa matrícula inmobiliaria ya está registrada en otra vivienda'
    )
  if (error.message?.includes('idx_vivienda_manzana_numero_unico'))
    return new Error(
      'Esa casa ya fue registrada en la manzana (quizá por otra persona hace un momento)'
    )
  return new Error('Ya existe una vivienda con esos datos')
}

/**
 * Crea la vivienda en estado Disponible. El certificado de tradición se sube
 * después, desde la pestaña Documentos de la vivienda.
 */
export async function crear(formData: ViviendaFormData): Promise<Vivienda> {
  const resultado = await verificarMatriculaUnica(
    formData.matricula_inmobiliaria
  )
  if (!resultado.esUnica && resultado.viviendaDuplicada) {
    throw new Error(
      `La matrícula inmobiliaria "${formData.matricula_inmobiliaria}" ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} casa ${resultado.viviendaDuplicada.numero}`
    )
  }

  const datos = sanitizeViviendaFormData(formData)
  const gastosNotariales = await obtenerGastosNotariales()

  const { data, error } = await supabase
    .from('viviendas')
    .insert({
      manzana_id: datos.manzana_id,
      numero: datos.numero,
      estado: 'Disponible' as const,
      lindero_norte: datos.lindero_norte,
      lindero_sur: datos.lindero_sur,
      lindero_oriente: datos.lindero_oriente,
      lindero_occidente: datos.lindero_occidente,
      matricula_inmobiliaria: datos.matricula_inmobiliaria,
      nomenclatura: datos.nomenclatura,
      area: datos.area_construida || 0,
      area_lote: datos.area_lote,
      area_construida: datos.area_construida,
      tipo_vivienda: datos.tipo_vivienda,
      valor_base: datos.valor_base,
      es_esquinera: datos.es_esquinera,
      // valor_total (columna generada) suma el recargo: sin esquina, 0
      recargo_esquinera: datos.es_esquinera ? datos.recargo_esquinera : 0,
      gastos_notariales: gastosNotariales,
    })
    .select(
      `
      *,
      manzanas (
        id,
        nombre,
        proyectos (id, nombre)
      )
    `
    )
    .single()

  if (error) {
    errorLog('[VIVIENDAS] Error al crear vivienda', error)
    throw traducirErrorCreacion(error)
  }

  return {
    ...data,
    total_abonado: 0,
    cantidad_abonos: 0,
    porcentaje_pagado: 0,
    saldo_pendiente: data.valor_total ?? undefined,
    fecha_creacion: new Date(data.fecha_creacion ?? Date.now()),
    fecha_actualizacion: new Date(data.fecha_actualizacion ?? Date.now()),
  } as unknown as Vivienda
}

export async function actualizar(
  id: string,
  formData: Partial<ViviendaFormData>
): Promise<Vivienda> {
  const formDataSanitizada = sanitizeViviendaUpdate(formData)

  // Bloquear cambios financieros en viviendas ya entregadas (invariante de negocio)
  if (formDataSanitizada.valor_base !== undefined) {
    const viviendaActual = await obtenerPorId(id)
    if (viviendaActual?.estado === 'Entregada') {
      throw new Error(
        'No se puede modificar el valor base de una vivienda ya entregada'
      )
    }
  }

  if (formDataSanitizada.matricula_inmobiliaria !== undefined) {
    const resultado = await verificarMatriculaUnica(
      formDataSanitizada.matricula_inmobiliaria,
      id
    )
    if (!resultado.esUnica && resultado.viviendaDuplicada) {
      errorLog(
        '[ACTUALIZAR VIVIENDA] Matrícula duplicada',
        formDataSanitizada.matricula_inmobiliaria
      )
      throw new Error(
        `La matrícula inmobiliaria "${formDataSanitizada.matricula_inmobiliaria}" ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`
      )
    }
  }

  let certificadoUrl: string | undefined
  if (formDataSanitizada.certificado_tradicion_file) {
    const vivienda = await obtenerPorId(id)
    if (!vivienda) throw new Error('Vivienda no encontrada')
    certificadoUrl = await subirCertificado(
      formDataSanitizada.certificado_tradicion_file,
      vivienda.manzana_id,
      vivienda.numero
    )
  }

  const updateData: Record<string, unknown> = {}

  if (formDataSanitizada.lindero_norte !== undefined)
    updateData.lindero_norte = formDataSanitizada.lindero_norte
  if (formDataSanitizada.lindero_sur !== undefined)
    updateData.lindero_sur = formDataSanitizada.lindero_sur
  if (formDataSanitizada.lindero_oriente !== undefined)
    updateData.lindero_oriente = formDataSanitizada.lindero_oriente
  if (formDataSanitizada.lindero_occidente !== undefined)
    updateData.lindero_occidente = formDataSanitizada.lindero_occidente
  if (formDataSanitizada.matricula_inmobiliaria !== undefined)
    updateData.matricula_inmobiliaria =
      formDataSanitizada.matricula_inmobiliaria
  if (formDataSanitizada.nomenclatura !== undefined)
    updateData.nomenclatura = formDataSanitizada.nomenclatura
  if (formDataSanitizada.area_lote !== undefined)
    updateData.area_lote = formDataSanitizada.area_lote
  if (formDataSanitizada.area_construida !== undefined)
    updateData.area_construida = formDataSanitizada.area_construida
  if (formDataSanitizada.tipo_vivienda !== undefined)
    updateData.tipo_vivienda = formDataSanitizada.tipo_vivienda
  if (certificadoUrl) updateData.certificado_tradicion_url = certificadoUrl
  if (formDataSanitizada.valor_base !== undefined)
    updateData.valor_base = formDataSanitizada.valor_base
  if (formDataSanitizada.es_esquinera !== undefined)
    updateData.es_esquinera = formDataSanitizada.es_esquinera
  if (formDataSanitizada.recargo_esquinera !== undefined)
    updateData.recargo_esquinera = formDataSanitizada.recargo_esquinera

  const { data, error } = await supabase
    .from('viviendas')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as unknown as Vivienda
}

export async function eliminar(id: string): Promise<void> {
  const vivienda = await obtenerPorId(id)

  if (vivienda?.certificado_tradicion_url) {
    await eliminarCertificado(vivienda.certificado_tradicion_url)
  }

  const { error } = await supabase.from('viviendas').delete().eq('id', id)
  if (error) throw error
}
