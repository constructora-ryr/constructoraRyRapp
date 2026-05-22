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

export async function crear(formData: ViviendaFormData): Promise<Vivienda> {
  const resultado = await verificarMatriculaUnica(
    formData.matricula_inmobiliaria
  )
  if (!resultado.esUnica && resultado.viviendaDuplicada) {
    throw new Error(
      `La matrícula inmobiliaria "${formData.matricula_inmobiliaria}" ya está registrada en la Mz. ${resultado.viviendaDuplicada.manzana} Casa #${resultado.viviendaDuplicada.numero}`
    )
  }

  let certificadoUrl: string | undefined
  if (formData.certificado_tradicion_file) {
    certificadoUrl = await subirCertificado(
      formData.certificado_tradicion_file,
      formData.manzana_id,
      formData.numero
    )
  }

  const formDataSanitizada = sanitizeViviendaFormData(formData)
  const gastosNotariales = await obtenerGastosNotariales()

  const viviendaData = {
    manzana_id: formDataSanitizada.manzana_id,
    numero: formDataSanitizada.numero,
    estado: 'Disponible' as const,
    lindero_norte: formDataSanitizada.lindero_norte,
    lindero_sur: formDataSanitizada.lindero_sur,
    lindero_oriente: formDataSanitizada.lindero_oriente,
    lindero_occidente: formDataSanitizada.lindero_occidente,
    matricula_inmobiliaria: formDataSanitizada.matricula_inmobiliaria,
    nomenclatura: formDataSanitizada.nomenclatura,
    area: formDataSanitizada.area_construida || 0,
    area_lote: formDataSanitizada.area_lote,
    area_construida: formDataSanitizada.area_construida,
    tipo_vivienda: formDataSanitizada.tipo_vivienda,
    certificado_tradicion_url: certificadoUrl || null,
    valor_base: formDataSanitizada.valor_base,
    es_esquinera: formDataSanitizada.es_esquinera,
    recargo_esquinera: formDataSanitizada.recargo_esquinera,
    gastos_notariales: gastosNotariales,
  }

  const { data, error } = await supabase
    .from('viviendas')
    .insert(viviendaData)
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
    throw error
  }

  const viviendaCreada: Vivienda = {
    ...data,
    total_abonado: 0,
    cantidad_abonos: 0,
    porcentaje_pagado: 0,
    saldo_pendiente: data.valor_total ?? undefined,
    fecha_creacion: new Date(data.fecha_creacion ?? Date.now()),
    fecha_actualizacion: new Date(data.fecha_actualizacion ?? Date.now()),
  } as unknown as Vivienda

  if (certificadoUrl && formData.certificado_tradicion_file) {
    try {
      const { data: categoria } = await supabase
        .from('categorias_documento')
        .select('id')
        .eq('nombre', 'Certificado de Tradición')
        .contains('modulos_permitidos', ['viviendas'])
        .eq('es_sistema', true)
        .maybeSingle()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error: docError } = await supabase
        .from('documentos_vivienda')
        .insert({
          vivienda_id: data.id,
          categoria_id: categoria?.id || null,
          titulo: 'Certificado de Tradición y Libertad',
          descripcion:
            'Documento oficial de tradición y libertad de la vivienda (subido en creación)',
          nombre_archivo: (formData.certificado_tradicion_file as File).name,
          nombre_original: (formData.certificado_tradicion_file as File).name,
          tamano_bytes: formData.certificado_tradicion_file.size,
          tipo_mime: formData.certificado_tradicion_file.type,
          url_storage: certificadoUrl,
          etiquetas: ['certificado', 'tradición', 'legal'],
          version: 1,
          es_version_actual: true,
          estado: 'activo',
          subido_por: user?.id ?? '',
          es_importante: true,
          metadata: {
            origen: 'creacion_vivienda',
            matricula: formData.matricula_inmobiliaria,
            nomenclatura: formData.nomenclatura,
          },
        })

      if (docError)
        errorLog('[VIVIENDAS] Error al crear registro de documento', docError)
    } catch (error) {
      if (error instanceof Error) {
        errorLog('[VIVIENDAS] Error inesperado al crear documento', error)
      } else {
        errorLog(
          '[VIVIENDAS] Error desconocido al crear documento',
          String(error)
        )
      }
    }
  }

  return viviendaCreada
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
