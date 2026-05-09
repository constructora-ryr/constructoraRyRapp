/**
 * Servicio de Clientes
 * Gestión completa del módulo de clientes
 */

import { supabase } from '@/lib/supabase/client'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import { auditService } from '@/services/audit.service'

import type {
  ActualizarClienteDTO,
  Cliente,
  ClienteResumen,
  CrearClienteDTO,
  EstadoCliente,
  FiltrosClientes,
  TipoDocumento,
} from '../types'
import {
  sanitizeActualizarClienteDTO,
  sanitizeCrearClienteDTO,
} from '../utils/sanitize-cliente.utils'

class ClientesService {
  /**
   * Obtener todos los clientes con estadísticas, negociaciones e intereses
   * ✅ Incluye datos de viviendas, proyectos y manzanas para la tabla
   */
  async obtenerClientes(filtros?: FiltrosClientes): Promise<ClienteResumen[]> {
    // 1. Obtener datos básicos de clientes desde la vista
    let query = supabase.from('vista_clientes_resumen').select(`
      id,
      nombres,
      apellidos,
      nombre_completo,
      tipo_documento,
      numero_documento,
      telefono,
      email,
      estado,
      estado_civil,
      fecha_nacimiento,
      tiene_documento_identidad,
      fecha_creacion,
      total_negociaciones,
      negociaciones_activas,
      negociaciones_completadas
    `)

    // Aplicar filtros
    if (filtros?.estado && filtros.estado.length > 0) {
      query = query.in('estado', filtros.estado)
    }

    if (filtros?.busqueda) {
      query = query.or(
        `nombre_completo.ilike.%${filtros.busqueda}%,numero_documento.ilike.%${filtros.busqueda}%,telefono.ilike.%${filtros.busqueda}%,email.ilike.%${filtros.busqueda}%`
      )
    }

    if (filtros?.fecha_desde) {
      query = query.gte('fecha_creacion', filtros.fecha_desde)
    }

    if (filtros?.fecha_hasta) {
      query = query.lte('fecha_creacion', filtros.fecha_hasta)
    }

    // ⚡ EJECUTAR TODAS LAS CONSULTAS EN PARALELO (Promise.all)
    const [{ data, error }, { data: negociaciones }, { data: intereses }] =
      await Promise.all([
        // 1. Datos básicos de clientes
        query.order('fecha_creacion', { ascending: false }),

        // 2. Negociaciones activas (en paralelo)
        supabase
          .from('negociaciones')
          .select(
            `
          id,
          cliente_id,
          estado,
          valor_total,
          valor_total_pagar,
          total_abonado,
          saldo_pendiente,
          viviendas!negociaciones_vivienda_id_fkey (
            id,
            numero,
            manzanas!viviendas_manzana_id_fkey (
              nombre,
              proyectos!manzanas_proyecto_id_fkey (
                nombre,
                ubicacion
              )
            )
          )
        `
          )
          .eq('estado', 'Activa'),

        // 3. Intereses activos (en paralelo)
        supabase
          .from('cliente_intereses')
          .select(
            `
          id,
          cliente_id,
          estado,
          vivienda_id,
          proyectos!cliente_intereses_proyecto_id_fkey (
            nombre
          ),
          viviendas!cliente_intereses_vivienda_id_fkey (
            numero,
            manzanas!viviendas_manzana_id_fkey (
              nombre
            )
          )
        `
          )
          .eq('estado', 'Activo'),
      ])

    if (error) throw error

    // ⚡ CREAR MAPAS DE BÚSQUEDA RÁPIDA (O(1) lookup)
    const negociacionesMap = new Map(
      negociaciones?.map(neg => [
        neg.cliente_id,
        {
          nombre_proyecto: neg.viviendas?.manzanas?.proyectos?.nombre,
          ubicacion_proyecto: neg.viviendas?.manzanas?.proyectos?.ubicacion,
          nombre_manzana: neg.viviendas?.manzanas?.nombre,
          numero_vivienda: neg.viviendas?.numero,
          valor_total: neg.valor_total,
          valor_total_pagar: neg.valor_total_pagar,
          total_abonado: neg.total_abonado,
          saldo_pendiente: neg.saldo_pendiente,
        },
      ]) || []
    )

    const interesesMap = new Map(
      intereses
        ?.filter(int => !negociacionesMap.has(int.cliente_id)) // Solo si no tiene negociación
        .map(int => [
          int.cliente_id,
          {
            nombre_proyecto: int.proyectos?.nombre,
            nombre_manzana: int.viviendas?.manzanas?.nombre,
            numero_vivienda: int.viviendas?.numero,
          },
        ]) || []
    )

    // ⚡ TRANSFORMAR Y ENRIQUECER DATOS (O(n) single pass)
    return (data || []).map(item => {
      const itemId = item.id || ''
      const negociacion = itemId ? negociacionesMap.get(itemId) : undefined
      const interes = itemId ? interesesMap.get(itemId) : undefined

      return {
        id: itemId,
        tipo_documento: (item.tipo_documento as TipoDocumento) || 'CC',
        numero_documento: item.numero_documento || '',
        nombres: item.nombres || '',
        apellidos: item.apellidos || '',
        nombre_completo: item.nombre_completo || '',
        telefono: item.telefono || '',
        email: item.email || '',
        estado_civil: item.estado_civil || undefined,
        fecha_nacimiento: item.fecha_nacimiento || undefined,
        estado: (item.estado as EstadoCliente) || 'Interesado',
        fecha_creacion:
          item.fecha_creacion || formatDateForDB(getTodayDateString()),
        fecha_actualizacion:
          item.fecha_creacion || formatDateForDB(getTodayDateString()),
        tiene_documento_identidad: item.tiene_documento_identidad || false,
        estadisticas: {
          total_negociaciones: item.total_negociaciones || 0,
          negociaciones_activas: item.negociaciones_activas || 0,
          negociaciones_completadas: item.negociaciones_completadas || 0,
          ultima_negociacion: undefined,
        },
        // â­ Datos de vivienda para clientes Activos (pre-calculados)
        vivienda: negociacion || undefined,
        // â­ Datos de interés para clientes Interesados (pre-calculados)
        interes: interes || undefined,
      } as ClienteResumen
    })
  }

  /**
   * Obtener un cliente por ID con sus negociaciones, intereses y estadísticas
   */
  async obtenerCliente(id: string): Promise<Cliente | null> {
    // 1. Obtener datos del cliente con negociaciones
    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select(
        `
        *,
        negociaciones!negociaciones_cliente_id_fkey (
          id,
          estado,
          valor_total,
          valor_total_pagar,
          total_abonado,
          saldo_pendiente,
          porcentaje_pagado,
          fecha_negociacion,
          fecha_completada,
          viviendas!negociaciones_vivienda_id_fkey (
            numero,
            tipo_vivienda,
            manzanas!viviendas_manzana_id_fkey (
              nombre,
              proyectos!manzanas_proyecto_id_fkey (
                nombre,
                ubicacion
              )
            )
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (clienteError) throw clienteError
    if (!clienteData) return null

    // 2. Obtener intereses del cliente usando la vista intereses_completos
    const { data: interesesData, error: interesesError } = await supabase
      .from('intereses_completos')
      .select(
        `
        id, cliente_id, proyecto_id, vivienda_id, estado, origen,
        notas, fecha_interes, proyecto_nombre, vivienda_numero,
        vivienda_valor, manzana_nombre, proyecto_estado, vivienda_estado,
        motivo_descarte, fecha_actualizacion
      `
      )
      .eq('cliente_id', id)
      .order('fecha_interes', { ascending: false })

    if (interesesError) {
      logger.error('Error cargando intereses:', interesesError)
      // No lanzamos error, continuamos sin intereses
    }

    // 3. Calcular estadísticas comerciales
    // Ordenar: Activas/En Proceso primero, luego Cerradas (para que negociaciones[0] = activa)
    const ORDEN_ESTADO: Record<string, number> = {
      Activa: 0,
      'En Proceso': 1,
      Completada: 2,
      'Cerrada por Traslado': 3,
      'Cerrada por Renuncia': 4,
    }
    const negociaciones = (clienteData.negociaciones || [])
      .slice()
      .sort(
        (a, b) =>
          (ORDEN_ESTADO[a.estado] ?? 99) - (ORDEN_ESTADO[b.estado] ?? 99)
      )
    const negociacionesReales = negociaciones.filter(
      n =>
        n.estado !== 'Cerrada por Renuncia' &&
        n.estado !== 'Cerrada por Traslado'
    )
    const estadisticas = {
      total_negociaciones: negociacionesReales.length,
      negociaciones_activas: negociaciones.filter(n =>
        ['Activa', 'En Proceso'].includes(n.estado)
      ).length,
      negociaciones_completadas: negociaciones.filter(
        n => n.estado === 'Completada'
      ).length,
      ultima_negociacion:
        negociacionesReales.length > 0
          ? negociacionesReales[0].fecha_negociacion
          : null,
    }

    // 4. Mapear intereses al formato ClienteInteres
    const intereses = (interesesData || []).map(interes => ({
      id: interes.id,
      cliente_id: interes.cliente_id,
      proyecto_id: interes.proyecto_id,
      vivienda_id: interes.vivienda_id,
      proyecto_nombre: interes.proyecto_nombre,
      proyecto_estado: interes.proyecto_estado,
      vivienda_numero: interes.vivienda_numero,
      vivienda_estado: interes.vivienda_estado,
      vivienda_valor: interes.vivienda_valor,
      manzana_nombre: interes.manzana_nombre,
      notas: interes.notas,
      estado: interes.estado,
      motivo_descarte: interes.motivo_descarte,
      fecha_interes: interes.fecha_interes,
      fecha_actualizacion: interes.fecha_actualizacion,
    }))

    // 5. Retornar cliente completo con intereses y estadísticas
    return {
      ...clienteData,
      intereses,
      estadisticas,
    } as unknown as Cliente
  }

  /**
   * Buscar cliente por número de documento
   */
  async buscarPorDocumento(
    tipo_documento: string,
    numero_documento: string
  ): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select(
        'id, nombres, apellidos, tipo_documento, numero_documento, estado'
      )
      .eq('tipo_documento', tipo_documento)
      .eq('numero_documento', numero_documento)
      .maybeSingle()

    if (error) {
      // Si es error de "no encontrado", está bien (no hay duplicado)
      // Si es otro error, lanzarlo
      logger.error('Error buscando cliente por documento:', error)
      throw error
    }

    if (data) {
    } else {
    }

    return data as Cliente | null
  }

  /**
   * Crear un nuevo cliente
   */
  async crearCliente(datos: CrearClienteDTO): Promise<Cliente> {
    // Verificar que no exista cliente con el mismo documento
    const clienteExistente = await this.buscarPorDocumento(
      datos.tipo_documento,
      datos.numero_documento
    )

    if (clienteExistente) {
      const error = `Ya existe un cliente registrado con ${datos.tipo_documento} ${datos.numero_documento}.\n\nCliente existente: ${clienteExistente.nombres} ${clienteExistente.apellidos}`
      logger.error('❌ Cliente duplicado:', error)
      throw new Error(error)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 🧹 Sanitizar y limpiar datos (convierte strings vacíos a null, valida enums)
    const datosSanitizados = sanitizeCrearClienteDTO(datos)

    // Excluir interes_inicial (no es un campo de la tabla clientes)
    const { interes_inicial, ...datosCliente } = datosSanitizados

    const datosLimpios = {
      ...datosCliente,
      usuario_creacion: user?.id,
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert(datosLimpios)
      .select()
      .single()

    if (error) {
      logger.error('❌ Error insertando en DB:', error)
      throw error
    }

    // 🔍 Auditar creación de cliente
    try {
      await auditService.auditarCreacionCliente(data)
    } catch (auditError) {
      logger.error('⚠️ Error auditando creación de cliente:', auditError)
      // No bloqueamos la operación si falla la auditoría
    }

    return data as Cliente
  }

  /**
   * Actualizar un cliente
   */
  async actualizarCliente(
    id: string,
    datos: ActualizarClienteDTO
  ): Promise<Cliente> {
    // 1. Obtener datos anteriores para auditoría
    const { data: datosAnteriores } = await supabase
      .from('clientes')
      .select(
        `
        id, nombres, apellidos, tipo_documento, numero_documento,
        telefono, telefono_alternativo, email, direccion, ciudad,
        departamento, fecha_nacimiento, estado_civil, notas, estado
      `
      )
      .eq('id', id)
      .single()
    // 2. Actualizar cliente
    // 🧹 Sanitizar datos (strings vacíos â†’ null, validar enums)
    const datosLimpios = sanitizeActualizarClienteDTO(datos)

    const { data, error } = await supabase
      .from('clientes')
      .update(datosLimpios)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // 3. 🔍 Auditar actualización
    if (datosAnteriores) {
      try {
        await auditService.auditarActualizacion(
          'clientes',
          id,
          datosAnteriores,
          data,
          {
            campos_modificados: Object.keys(datosLimpios),
            cliente_nombre: `${data.nombres} ${data.apellidos}`,
          },
          'clientes'
        )
      } catch (auditError) {
        logger.error('⚠️ Error auditando actualización:', auditError)
      }
    }

    return data as Cliente
  }

  /**
   * Eliminar un cliente
   *
   * Restricciones:
   * - NO se puede eliminar si tiene negociaciones (activas o históricas)
   * - NO se puede eliminar si tiene viviendas asignadas
   * - Solo se permite eliminar clientes "Interesado" sin historial
   *
   * Para clientes con datos, usar estado "Inactivo" en lugar de eliminar
   */
  async eliminarCliente(id: string): Promise<void> {
    // 1. Verificar que NO tenga negociaciones (ninguna, ni activas ni históricas)
    const { data: negociaciones } = await supabase
      .from('negociaciones')
      .select('id, estado')
      .eq('cliente_id', id)
      .limit(1)

    if (negociaciones && negociaciones.length > 0) {
      throw new Error(
        'No se puede eliminar un cliente con historial de negociaciones. ' +
          'Use el estado "Inactivo" en su lugar para mantener la trazabilidad.'
      )
    }

    // 2. Verificar que NO tenga viviendas asignadas
    const { data: viviendas } = await supabase
      .from('viviendas')
      .select('id, numero')
      .eq('cliente_id', id)
      .limit(1)

    if (viviendas && viviendas.length > 0) {
      throw new Error(
        'No se puede eliminar un cliente con viviendas asignadas. ' +
          'Primero desasigne las viviendas o use el estado "Inactivo".'
      )
    }

    // 3. Solo permitir eliminar clientes en estado "Interesado" sin datos críticos
    const { data: cliente } = await supabase
      .from('clientes')
      .select('estado')
      .eq('id', id)
      .single()

    if (cliente?.estado !== 'Interesado') {
      throw new Error(
        'Solo se pueden eliminar clientes en estado "Interesado". ' +
          'Para clientes con historial, use el estado "Inactivo".'
      )
    }

    // 4. Obtener datos del cliente para auditoría
    const { data: clienteData } = await supabase
      .from('clientes')
      .select(
        'id, nombres, apellidos, tipo_documento, numero_documento, estado'
      )
      .eq('id', id)
      .single()

    // 5. Si pasa todas las validaciones, eliminar
    const { error } = await supabase.from('clientes').delete().eq('id', id)

    if (error) throw error

    // 6. 🔍 Auditar eliminación
    if (clienteData) {
      try {
        await auditService.auditarEliminacion(
          'clientes',
          id,
          clienteData,
          {
            motivo: 'Cliente sin historial de negociaciones',
            cliente_nombre: `${clienteData.nombres} ${clienteData.apellidos}`,
            cliente_documento: `${clienteData.tipo_documento} ${clienteData.numero_documento}`,
          },
          'clientes'
        )
      } catch (auditError) {
        logger.error('⚠️ Error auditando eliminación:', auditError)
      }
    }
  }

  /**
   * Verificar si un cliente tiene una renuncia pendiente de devolución
   */
  async verificarRenunciaPendiente(clienteId: string): Promise<{
    pendiente: boolean
    renunciaId?: string
    consecutivo?: string
  }> {
    const { data, error } = await supabase
      .from('renuncias')
      .select('id, consecutivo')
      .eq('cliente_id', clienteId)
      .eq('estado', 'Pendiente Devolución')
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error('Error verificando renuncia pendiente:', error)
      return { pendiente: false }
    }

    return data
      ? { pendiente: true, renunciaId: data.id, consecutivo: data.consecutivo }
      : { pendiente: false }
  }

  /**
   * Cambiar estado de un cliente
   */
  async cambiarEstado(
    id: string,
    nuevoEstado: 'Interesado' | 'Activo' | 'Inactivo' | 'Propietario'
  ): Promise<Cliente> {
    return this.actualizarCliente(id, { estado: nuevoEstado })
  }

  /**
   * Obtener estadísticas generales de clientes
   */
  async obtenerEstadisticas() {
    const { data, error } = await supabase.from('clientes').select('estado')

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      interesados: data?.filter(c => c.estado === 'Interesado').length || 0,
      activos: data?.filter(c => c.estado === 'Activo').length || 0,
      inactivos: data?.filter(c => c.estado === 'Inactivo').length || 0,
      renunciaron: data?.filter(c => c.estado === 'Renunció').length || 0,
      propietarios: data?.filter(c => c.estado === 'Propietario').length || 0,
    }

    return stats
  }
}

export const clientesService = new ClientesService()
