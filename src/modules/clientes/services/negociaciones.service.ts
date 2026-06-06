/**
 * Servicio de Negociaciones
 *
 * Gestiona la vinculación Cliente + Vivienda + Pagos
 *
 * ?? NOMBRES DE CAMPOS VERIFICADOS EN: docs/DATABASE-SCHEMA-REFERENCE.md
 * ? ACTUALIZADO: 2025-10-22 (Migración 003)
 *
 * Estados de negociación (CHECK constraint: negociaciones_estado_check):
 * - 'Activa' ? Negociación activa recibiendo abonos
 * - 'Suspendida' ? Temporalmente pausada
 * - 'Cerrada por Renuncia' ? Cliente renunció (vinculada a tabla renuncias)
 * - 'Completada' ? 100% pagado y entregado
 */

import { supabase } from '@/lib/supabase/client'
import type { TablesInsert } from '@/lib/supabase/database.types'
import { formatDateForDB, getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import type { Negociacion } from '@/modules/clientes/types'
import {
  sanitizeActualizarFuentePagoDTO,
  sanitizeActualizarNegociacionDTO,
  sanitizeCrearNegociacionDTO,
  type ActualizarFuentePagoDTO,
  type ActualizarNegociacionDTO,
  type CrearNegociacionDTO,
} from '@/modules/clientes/utils/sanitize-negociacion.utils'
import { crearCredito } from '@/modules/fuentes-pago/services/creditos-constructora.service'
import { crearCuotasCredito } from '@/modules/fuentes-pago/services/cuotas-credito.service'
import {
  calcularTablaAmortizacion,
  fechaCuotaParaBD,
} from '@/modules/fuentes-pago/utils/calculos-credito'
import { auditService } from '@/services/audit.service'
import { esCuotaInicial } from '@/shared/constants/fuentes-pago.constants'

// Re-export Negociacion del index
export type {
  ActualizarFuentePagoDTO,
  ActualizarNegociacionDTO,
  CrearFuentePagoDTO,
  CrearNegociacionDTO,
} from '@/modules/clientes/utils/sanitize-negociacion.utils'
export type { Negociacion }

class NegociacionesService {
  /**
   * Crear nueva negociación CON o SIN fuentes de pago (transaccional)
   *
   * ? FLUJO SIMPLIFICADO (2025-10-22):
   * - Negociación se crea DIRECTO en estado 'Activa'
   * - Fuentes de pago son OPCIONALES (se pueden agregar después)
   * - Cliente pasa a 'Activo'
   * - Vivienda pasa a 'Asignada'
   *
   * Pasos:
   * 1. Crear negociación en estado 'Activa'
   * 2. [Opcional] Crear fuentes de pago si se proporcionan
   * 3. Actualizar vivienda ? 'Asignada'
   * 4. Actualizar cliente ? 'Activo'
   * 5. Si algún paso falla, se hace rollback
   */
  async crearNegociacion(datos: CrearNegociacionDTO): Promise<Negociacion> {
    try {
      const datosSanitizados = sanitizeCrearNegociacionDTO(datos)
      const tieneFuentesPago = Boolean(datosSanitizados.fuentes_pago?.length)

      // ==========================================
      // VALIDACIÓN: No crear negociación si hay renuncia pendiente
      // ==========================================
      const { data: renunciaPendiente } = await supabase
        .from('renuncias')
        .select('id, consecutivo')
        .eq('cliente_id', datosSanitizados.cliente_id)
        .eq('estado', 'Pendiente Devolución')
        .limit(1)
        .maybeSingle()

      if (renunciaPendiente) {
        throw new Error(
          `No se puede crear negociación: el cliente tiene la renuncia ${renunciaPendiente.consecutivo} con devolución pendiente.`
        )
      }

      // ==========================================
      // PASO 1: Crear negociación en estado 'Activa'
      // ==========================================

      type NegociacionInsertData = {
        cliente_id: string
        vivienda_id: string
        valor_negociado: number
        descuento_aplicado: number
        notas?: string | null
        estado: 'Activa'
        fecha_negociacion?: string
        tipo_descuento?: string
        motivo_descuento?: string
        valor_escritura_publica?: number
      }

      // Construir objeto con campos condicionales
      const datosNegociacion: NegociacionInsertData = {
        cliente_id: datosSanitizados.cliente_id,
        vivienda_id: datosSanitizados.vivienda_id,
        valor_negociado: datosSanitizados.valor_negociado,
        descuento_aplicado: datosSanitizados.descuento_aplicado || 0,
        notas: datosSanitizados.notas,
        estado: 'Activa', // ? SIEMPRE 'Activa' (simplificado)
      }

      // Fecha de negociación personalizada (migración de datos históricos)
      if (datosSanitizados.fecha_negociacion) {
        datosNegociacion.fecha_negociacion = datosSanitizados.fecha_negociacion
      }

      // Solo incluir campos de descuento si hay descuento aplicado
      if (
        datosSanitizados.descuento_aplicado &&
        datosSanitizados.descuento_aplicado > 0
      ) {
        // Solo agregar campos si tienen valor (no undefined)
        if (datosSanitizados.tipo_descuento !== undefined) {
          datosNegociacion.tipo_descuento = datosSanitizados.tipo_descuento
        }
        if (datosSanitizados.motivo_descuento !== undefined) {
          datosNegociacion.motivo_descuento = datosSanitizados.motivo_descuento
        }
      }

      // valor_escritura_publica es independiente del descuento
      if (datosSanitizados.valor_escritura_publica !== undefined) {
        datosNegociacion.valor_escritura_publica =
          datosSanitizados.valor_escritura_publica
      }

      const { data: negociacion, error: errorNegociacion } = await supabase
        .from('negociaciones')
        .insert(datosNegociacion)
        .select(
          'id, cliente_id, vivienda_id, valor_negociado, descuento_aplicado, tipo_descuento, motivo_descuento, valor_escritura_publica, valor_total_pagar, notas, estado, fecha_negociacion, fecha_completada, fecha_creacion, fecha_actualizacion'
        )
        .single()

      if (errorNegociacion) {
        logger.error('? Error creando negociación:', errorNegociacion)
        throw errorNegociacion
      }

      // ==========================================
      // PASO 2: Crear fuentes de pago (OPCIONAL)
      // ==========================================
      if (
        datosSanitizados.fuentes_pago &&
        datosSanitizados.fuentes_pago.length > 0
      ) {
        // Resolver tipo_fuente_id en batch
        const tipoNombres = datosSanitizados.fuentes_pago.map(f => f.tipo)
        const { data: tiposFuentes, error: errorTipos } = await supabase
          .from('tipos_fuentes_pago')
          .select('id, nombre')
          .in('nombre', tipoNombres)

        if (errorTipos) {
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          throw new Error(
            `Error resolviendo tipos de fuente: ${errorTipos.message}`
          )
        }

        const tipoIdMap = Object.fromEntries(
          (tiposFuentes || []).map(t => [t.nombre, t.id])
        )

        const fuentesParaInsertar = datosSanitizados.fuentes_pago.map(
          fuente => ({
            negociacion_id: negociacion.id,
            tipo: fuente.tipo,
            tipo_fuente_id: tipoIdMap[fuente.tipo] || null,
            monto_aprobado: fuente.monto_aprobado,
            capital_para_cierre: fuente.capital_para_cierre ?? null,
            entidad: fuente.entidad || null,
            entidad_financiera_id: fuente.entidad_financiera_id || null,
            numero_referencia: fuente.numero_referencia || null,
            carta_asignacion_url: fuente.carta_asignacion_url || null,
            permite_multiples_abonos:
              fuente.permite_multiples_abonos ?? esCuotaInicial(fuente.tipo),
            estado: 'Activa',
            estado_fuente: 'activa',
          })
        )

        const { data: fuentesCreadas, error: errorFuentes } = await supabase
          .from('fuentes_pago')

          .insert(
            fuentesParaInsertar as unknown as TablesInsert<'fuentes_pago'>[]
          )
          .select('id, tipo, negociacion_id')

        if (errorFuentes) {
          logger.error('❌ Error creando fuentes de pago:', errorFuentes)
          // ROLLBACK
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          throw new Error(
            `Error creando fuentes de pago: ${errorFuentes.message}`
          )
        }

        // ==========================================
        // PASO 2b: Crear crédito + cuotas para fuentes con parametrosCredito
        // ==========================================
        const fuentesConCredito: string[] = [] // acumular IDs para rollback
        try {
          for (const fuente of datosSanitizados.fuentes_pago) {
            if (!fuente.parametrosCredito) continue

            const fuenteCreada = (fuentesCreadas ?? []).find(
              fc => fc.tipo === fuente.tipo
            )
            if (!fuenteCreada) continue

            const p = fuente.parametrosCredito
            const fechaDate =
              typeof p.fechaInicio === 'string'
                ? new Date(p.fechaInicio + 'T12:00:00')
                : p.fechaInicio

            const calculo = calcularTablaAmortizacion({
              capital: p.capital,
              tasaMensual: p.tasaMensual,
              numCuotas: p.numCuotas,
              fechaInicio: fechaDate,
            })

            const { error: errorCredito } = await crearCredito({
              fuente_pago_id: fuenteCreada.id,
              capital: p.capital,
              tasa_mensual: p.tasaMensual,
              num_cuotas: p.numCuotas,
              fecha_inicio: fechaCuotaParaBD(fechaDate),
              valor_cuota: calculo.valorCuotaMensual,
              interes_total: calculo.interesTotal,
              monto_total: calculo.montoTotal,
              tasa_mora_diaria: p.tasaMoraDiaria ?? 0.001,
            })

            if (errorCredito) {
              throw new Error(`Error creando crédito: ${errorCredito.message}`)
            }

            fuentesConCredito.push(fuenteCreada.id)

            const { error: errorCuotas } = await crearCuotasCredito(
              fuenteCreada.id,
              calculo.cuotas,
              1
            )

            if (errorCuotas) {
              throw new Error(`Error creando cuotas: ${errorCuotas.message}`)
            }
          }
        } catch (errorPaso2b) {
          logger.error('❌ Error en Paso 2b (crédito/cuotas):', errorPaso2b)
          // ROLLBACK: eliminar créditos y cuotas creados en esta operación
          for (const fid of fuentesConCredito) {
            await supabase
              .from('cuotas_credito')
              .delete()
              .eq('fuente_pago_id', fid)
            await supabase
              .from('creditos_constructora')
              .delete()
              .eq('fuente_pago_id', fid)
          }
          // Continuar con rollback estándar
          await supabase
            .from('fuentes_pago')
            .delete()
            .eq('negociacion_id', negociacion.id)
          await supabase.from('negociaciones').delete().eq('id', negociacion.id)
          throw errorPaso2b
        }
      } // end if (datosSanitizados.fuentes_pago)

      // ==========================================
      // PASO 3: Actualizar vivienda → 'Asignada'
      // ==========================================
      const { error: errorVivienda } = await supabase
        .from('viviendas')
        .update({
          estado: 'Asignada',
          cliente_id: datosSanitizados.cliente_id,
          negociacion_id: negociacion.id, // ? NUEVO campo
          fecha_asignacion: formatDateForDB(getTodayDateString()),
        })
        .eq('id', datosSanitizados.vivienda_id)

      if (errorVivienda) {
        logger.error('? Error actualizando vivienda:', errorVivienda)
        // ROLLBACK
        if (tieneFuentesPago) {
          await supabase
            .from('fuentes_pago')
            .delete()
            .eq('negociacion_id', negociacion.id)
        }
        await supabase.from('negociaciones').delete().eq('id', negociacion.id)
        throw new Error(`Error actualizando vivienda: ${errorVivienda.message}`)
      }

      // ==========================================
      // PASO 4: Actualizar cliente ? 'Activo'
      // ==========================================
      const { error: errorCliente } = await supabase
        .from('clientes')
        .update({ estado: 'Activo' })
        .eq('id', datosSanitizados.cliente_id)

      if (errorCliente) {
        logger.error('? Error actualizando cliente:', errorCliente)
        // ROLLBACK completo
        if (tieneFuentesPago) {
          await supabase
            .from('fuentes_pago')
            .delete()
            .eq('negociacion_id', negociacion.id)
        }
        await supabase.from('negociaciones').delete().eq('id', negociacion.id)
        await supabase
          .from('viviendas')
          .update({
            estado: 'Disponible',
            cliente_id: null,
            negociacion_id: null,
            fecha_asignacion: null,
          })
          .eq('id', datosSanitizados.vivienda_id)
        throw new Error(`Error actualizando cliente: ${errorCliente.message}`)
      }

      // ==========================================
      // PASO 5: Sistema de procesos eliminado
      // ==========================================
      // ?? NOTA: El sistema de plantillas de proceso fue eliminado.
      // Se reemplazará con sistema de checklist en Fuentes de Pago.

      // ==========================================
      // PASO 6: Auditoría enriquecida (no crítica)
      // ==========================================
      try {
        const [{ data: viviendaAudit }, { data: clienteAudit }] =
          await Promise.all([
            supabase
              .from('viviendas')
              .select(
                'id, numero, tipo_vivienda, area_construida, area_lote, es_esquinera, recargo_esquinera, gastos_notariales, valor_base, manzanas(nombre, proyectos(id, nombre))'
              )
              .eq('id', datosSanitizados.vivienda_id)
              .single(),
            supabase
              .from('clientes')
              .select('id, nombres, apellidos, numero_documento')
              .eq('id', datosSanitizados.cliente_id)
              .single(),
          ])

        const manzana = viviendaAudit?.manzanas as
          | { nombre: string; proyectos: { id: string; nombre: string } }
          | null
          | undefined

        const viviendaParaAudit: Record<string, unknown> = {
          id: viviendaAudit?.id,
          numero: viviendaAudit?.numero,
          tipo_vivienda: viviendaAudit?.tipo_vivienda,
          area_construida: viviendaAudit?.area_construida,
          area_lote: viviendaAudit?.area_lote,
          es_esquinera: viviendaAudit?.es_esquinera,
          recargo_esquinera: viviendaAudit?.recargo_esquinera,
          gastos_notariales: viviendaAudit?.gastos_notariales,
          valor_base: viviendaAudit?.valor_base,
          manzana_nombre: manzana?.nombre ?? null,
        }

        const proyectoParaAudit: Record<string, unknown> | undefined =
          manzana?.proyectos
            ? { id: manzana.proyectos.id, nombre: manzana.proyectos.nombre }
            : undefined

        const fuentesSnapshot = (datosSanitizados.fuentes_pago ?? []).map(
          f => ({
            tipo: f.tipo,
            monto_aprobado: f.monto_aprobado,
            entidad: f.entidad ?? null,
            numero_referencia: f.numero_referencia ?? null,
          })
        )

        await auditService.auditarCreacionNegociacion(
          negociacion as unknown as Record<string, unknown>,
          clienteAudit ?? undefined,
          viviendaParaAudit,
          proyectoParaAudit,
          fuentesSnapshot
        )
      } catch (auditError) {
        logger.warn(
          '⚠️ [CLIENTES] Error en auditoría de negociación (no crítico):',
          auditError
        )
      }

      return negociacion as unknown as Negociacion
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('? [CLIENTES] Error en crearNegociacion:', mensaje, error)
      throw error
    }
  }

  /**
   * Obtener negociación por ID
   */
  async obtenerNegociacion(id: string): Promise<Negociacion | null> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select(
          `
          id, cliente_id, vivienda_id, estado, valor_total, valor_total_pagar, valor_negociado,
          total_abonado, saldo_pendiente, fecha_negociacion,
          fecha_creacion, usuario_creacion, descuento_aplicado
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data as unknown as Negociacion
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('? [CLIENTES] Error obteniendo negociación:', mensaje, error)
      return null
    }
  }

  /**
   * Obtener negociaciones de un cliente
   */
  async obtenerNegociacionesCliente(clienteId: string): Promise<Negociacion[]> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select(
          `
          *,
          vivienda:viviendas!negociaciones_vivienda_id_fkey (
            id,
            numero,
            valor_base,
            gastos_notariales,
            recargo_esquinera,
            es_esquinera,
            estado,
            manzanas!viviendas_manzana_id_fkey (
              id,
              nombre,
              proyecto:proyectos!manzanas_proyecto_id_fkey (
                id,
                nombre,
                estado,
                ubicacion
              )
            )
          )
        `
        )
        .eq('cliente_id', clienteId)
        .order('fecha_creacion', { ascending: false })
        .limit(100) // ? Limitar a 100 negociaciones más recientes (performance)

      if (error) throw error

      // Mapear para tener proyecto en el nivel superior
      const negociacionesConProyecto = (data || []).map(neg => ({
        ...neg,
        proyecto: neg.vivienda?.manzanas?.proyecto || null,
      }))

      return negociacionesConProyecto as Negociacion[]
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '? [CLIENTES] Error obteniendo negociaciones del cliente:',
        mensaje,
        error
      )
      return []
    }
  }

  /**
   * Obtener negociación activa de una vivienda
   */
  async obtenerNegociacionVivienda(
    viviendaId: string
  ): Promise<Negociacion | null> {
    try {
      const { data, error } = await supabase
        .from('negociaciones')
        .select(
          `
          id, cliente_id, vivienda_id, estado, valor_total, valor_total_pagar, valor_negociado,
          total_abonado, saldo_pendiente, fecha_creacion
        `
        )
        .eq('vivienda_id', viviendaId)
        .in('estado', ['Activa', 'Suspendida']) // ? ACTUALIZADO: Solo estados activos
        .order('fecha_creacion', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
      return data as unknown as Negociacion | null
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '? [CLIENTES] Error obteniendo negociación de vivienda:',
        mensaje,
        error
      )
      return null
    }
  }

  /**
   * Actualizar negociación
   */
  async actualizarNegociacion(
    id: string,
    datos: ActualizarNegociacionDTO
  ): Promise<Negociacion> {
    try {
      const datosSanitizados = sanitizeActualizarNegociacionDTO(datos)
      const { data, error } = await supabase
        .from('negociaciones')
        .update(datosSanitizados)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data as Negociacion
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '? [CLIENTES] Error actualizando negociación:',
        mensaje,
        error
      )
      throw error
    }
  }

  /**
   * Suspender negociación (pausar temporalmente)
   */
  async suspenderNegociacion(
    id: string,
    motivo?: string
  ): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Suspendida',
      notas: motivo ? `[SUSPENDIDA] ${motivo}` : undefined,
    })
  }

  /**
   * Reactivar negociación suspendida
   */
  async reactivarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Activa',
    })
  }

  /**
   * Completar negociación (100% pagado)
   * ?? Requiere fecha_completada (constraint de DB)
   */
  async completarNegociacion(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Completada',
      fecha_completada: formatDateForDB(getTodayDateString()), // ? REQUERIDO por constraint
    })
  }

  /**
   * Cerrar negociación por renuncia
   * ?? Debe tener registro en tabla 'renuncias'
   */
  async cerrarPorRenuncia(id: string): Promise<Negociacion> {
    return this.actualizarNegociacion(id, {
      estado: 'Cerrada por Renuncia',
    })
  }

  /**
   * Verificar si un cliente ya tiene negociación activa con una vivienda
   */
  async existeNegociacionActiva(
    clienteId: string,
    viviendaId: string
  ): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('negociaciones')
        .select('id', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('vivienda_id', viviendaId)
        .in('estado', ['Activa', 'Suspendida']) // ? ACTUALIZADO

      if (error) throw error
      return (count ?? 0) > 0
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error(
        '? [CLIENTES] Error verificando negociación activa:',
        mensaje,
        error
      )
      return false
    }
  }

  /**
   * Eliminar negociación (solo si está recién creada y sin movimientos)
   * ?? PRECAUCIÓN: Verificar que no tenga abonos antes de eliminar
   */
  async eliminarNegociacion(id: string): Promise<void> {
    try {
      // Verificar que no tenga abonos
      const { data: abonos } = await supabase
        .from('abonos_historial')
        .select('id')
        .eq('negociacion_id', id)
        .limit(1)

      if (abonos && abonos.length > 0) {
        throw new Error(
          'No se puede eliminar una negociación con abonos registrados'
        )
      }

      // Verificar que no tenga fuentes de pago
      const { data: fuentes } = await supabase
        .from('fuentes_pago')
        .select('id')
        .eq('negociacion_id', id)
        .limit(1)

      if (fuentes && fuentes.length > 0) {
        throw new Error(
          'No se puede eliminar una negociación con fuentes de pago'
        )
      }

      const { error } = await supabase
        .from('negociaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('? [CLIENTES] Error eliminando negociación:', mensaje, error)
      throw error
    }
  }

  /**
   * Actualizar fuentes de pago de una negociación
   * ?? Operación transaccional: elimina viejas e inserta nuevas
   *
   * Validaciones:
   * - Suma total = valor_final de negociación
   * - No eliminar fuentes con monto_recibido > 0
   * - Monto >= monto_recibido (si tiene abonos)
   */
  async actualizarFuentesPago(
    negociacionId: string,
    fuentes: ActualizarFuentePagoDTO[],
    motivoCambio = 'Actualización de fuentes de pago'
  ): Promise<void> {
    const fuentesSanitizadas = fuentes.map(sanitizeActualizarFuentePagoDTO)

    try {
      // 1. Obtener fuentes actuales ACTIVAS para validar
      const { data: fuentesActuales, error: errorFetch } = await supabase
        .from('fuentes_pago')
        .select('id, monto_recibido')
        .eq('negociacion_id', negociacionId)
        .eq('estado_fuente', 'activa') // ? Solo comparar con activas

      if (errorFetch) throw errorFetch

      // 2. Validar que no se eliminen fuentes con abonos
      const idsNuevas = fuentesSanitizadas.map(f => f.id).filter(Boolean)
      const fuentesAEliminar =
        fuentesActuales?.filter(fa => !idsNuevas.includes(fa.id)) || []

      const fuentesConAbonos = fuentesAEliminar.filter(
        f => (f.monto_recibido ?? 0) > 0
      )
      if (fuentesConAbonos.length > 0) {
        throw new Error(
          'No puedes eliminar fuentes de pago que tienen abonos registrados'
        )
      }

      // 3. ? INACTIVAR fuentes viejas con UPDATE DIRECTO (sin triggers)
      if (fuentesAEliminar.length > 0) {
        const erroresInactivacion: Array<{ fuenteId: string; error: unknown }> =
          []

        for (const fuente of fuentesAEliminar) {
          const { error: errorInactivar } = await supabase
            .from('fuentes_pago')
            .update({
              estado_fuente: 'inactiva',
              razon_inactivacion:
                'Fuente eliminada/reemplazada por el usuario durante edición',
              fecha_inactivacion: new Date().toISOString(),
            })
            .eq('id', fuente.id)
          // ? SIN .select().single() para evitar error 400

          if (errorInactivar) {
            logger.error(`? Error inactivando fuente ${fuente.id}:`, {
              message: errorInactivar.message,
              code: errorInactivar.code,
              details: errorInactivar.details,
              hint: errorInactivar.hint,
            })
            erroresInactivacion.push({
              fuenteId: fuente.id,
              error: errorInactivar,
            })
          } else {
          }
        }

        // ? CRÍTICO: Si hubo errores al inactivar, lanzar excepción
        if (erroresInactivacion.length > 0) {
          const mensajeError = `No se pudieron inactivar ${erroresInactivacion.length} fuente(s). Errores: ${JSON.stringify(erroresInactivacion, null, 2)}`
          logger.error(
            '?? [CRÍTICO] Errores al inactivar fuentes:',
            mensajeError
          )
          throw new Error(mensajeError)
        }
      }

      // 4. Actualizar fuentes existentes y crear nuevas
      const nuevasFuentesCreadas: { id: string; tipo: string }[] = []

      for (const fuente of fuentesSanitizadas) {
        if (fuente.id) {
          // Actualizar existente
          const { error: errorUpdate } = await supabase
            .from('fuentes_pago')
            .update({
              tipo: fuente.tipo,
              monto_aprobado: fuente.monto_aprobado,
              entidad: fuente.entidad,
              numero_referencia: fuente.numero_referencia,
            })
            .eq('id', fuente.id)

          if (errorUpdate) throw errorUpdate
        } else {
          // Crear nueva
          const { data: nuevaFuente, error: errorInsert } = await supabase
            .from('fuentes_pago')

            .insert({
              negociacion_id: negociacionId,
              tipo: fuente.tipo,
              monto_aprobado: fuente.monto_aprobado,
              monto_recibido: 0,
              entidad: fuente.entidad,
              numero_referencia: fuente.numero_referencia,
              permite_multiples_abonos:
                fuente.permite_multiples_abonos ?? esCuotaInicial(fuente.tipo),
              estado: 'Pendiente',
              estado_fuente: 'activa', // ? Explícitamente marcar como activa
            } as unknown as TablesInsert<'fuentes_pago'>)
            .select('id, tipo')
            .single()

          if (errorInsert) throw errorInsert
          if (nuevaFuente) {
            nuevasFuentesCreadas.push({
              id: nuevaFuente.id,
              tipo: nuevaFuente.tipo,
            })
          }
        }
      }

      // 5. ? Vincular fuentes nuevas con las inactivadas (si coinciden tipos)
      if (fuentesAEliminar.length > 0 && nuevasFuentesCreadas.length > 0) {
        for (const fuenteInactivada of fuentesAEliminar) {
          // Buscar en fuentes actuales el tipo que tenía
          const fuenteActualData = fuentesActuales?.find(
            f => f.id === fuenteInactivada.id
          )
          if (!fuenteActualData) continue

          // Obtener el tipo de la fuente inactivada
          const { data: fuenteCompleta } = await supabase
            .from('fuentes_pago')
            .select('tipo')
            .eq('id', fuenteInactivada.id)
            .single()

          if (!fuenteCompleta) continue

          // Buscar si hay una nueva fuente del mismo tipo
          const fuenteReemplazo = nuevasFuentesCreadas.find(
            nf => nf.tipo === fuenteCompleta.tipo
          )

          if (fuenteReemplazo) {
            // Actualizar la fuente inactivada con referencia a la nueva
            await supabase
              .from('fuentes_pago')
              .update({
                reemplazada_por: fuenteReemplazo.id,
                razon_inactivacion: `Reemplazada por nueva fuente de tipo: ${fuenteReemplazo.tipo}`,
              })
              .eq('id', fuenteInactivada.id)
          }
        }
      }

      // 6. Crear snapshot manual con resumen de cambios
      await this.crearSnapshotCambioFuentes(
        negociacionId,
        motivoCambio,
        fuentesActuales || [],
        fuentesSanitizadas,
        {
          agregadas: nuevasFuentesCreadas.length,
          eliminadas: fuentesAEliminar.length,
          modificadas: fuentesSanitizadas.filter(f => f.id).length,
        }
      )
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('? [CLIENTES] Error actualizando fuentes de pago:', {
        mensaje,
        error,
        negociacionId,
        fuentesEnviadas: fuentesSanitizadas.length,
        motivoCambio,
      })

      // ? Re-lanzar con mensaje más descriptivo
      throw new Error(`Error al actualizar fuentes de pago: ${mensaje}`)
    }
  }

  /**
   * Crear snapshot manual de cambio en fuentes de pago
   */
  private async crearSnapshotCambioFuentes(
    negociacionId: string,
    motivoCambio: string,
    fuentesAnteriores: { id?: string; monto_recibido?: number | null }[],
    fuentesNuevas: { tipo?: string; monto_aprobado?: number }[],
    resumen: { agregadas: number; eliminadas: number; modificadas: number }
  ): Promise<void> {
    // Obtener versión actual
    const { data: negociacion } = await supabase
      .from('negociaciones')
      .select('id, version_actual, version_lock')
      .eq('id', negociacionId)
      .single()

    const nuevaVersion = (negociacion?.version_actual || 0) + 1

    // Obtener fuentes activas actuales para snapshot
    const { data: fuentesActivas } = await supabase
      .from('fuentes_pago')
      .select(
        `
        id, negociacion_id, tipo, entidad, monto_aprobado, monto_recibido,
        estado, estado_fuente
      `
      )
      .eq('negociacion_id', negociacionId)
      .eq('estado_fuente', 'activa')

    // ? Documentos se obtienen por proyecto_id, no por negociacion_id
    // Omitimos por ahora para evitar error 400
    const documentos: never[] = []

    // Obtener datos de negociación
    const { data: datosNegociacion } = await supabase
      .from('negociaciones')
      .select(
        `
        id, cliente_id, vivienda_id, estado, valor_total, valor_negociado,
        total_abonado, saldo_pendiente, fecha_negociacion, fecha_creacion
      `
      )
      .eq('id', negociacionId)
      .single()

    // Construir razón del cambio
    const partes = []
    if (resumen.agregadas > 0) partes.push(`${resumen.agregadas} agregada(s)`)
    if (resumen.eliminadas > 0)
      partes.push(`${resumen.eliminadas} eliminada(s)`)
    if (resumen.modificadas > 0)
      partes.push(`${resumen.modificadas} modificada(s)`)
    const razonCompleta =
      partes.length > 0
        ? `${motivoCambio} | ${partes.join(', ')}`
        : motivoCambio

    // Construir detalles de cambios para mostrar en modal
    const cambiosDetallados = {
      motivo_usuario: motivoCambio,
      resumen,
      fuentes_finales:
        fuentesActivas?.map(f => ({
          tipo: f.tipo,
          entidad: f.entidad,
          monto_aprobado: f.monto_aprobado,
          monto_recibido: f.monto_recibido,
        })) || [],
    }

    // Obtener datos del usuario actual para auditoría
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const usuarioEmail = user?.email || null

    // Obtener nombre del usuario desde tabla usuarios
    let usuarioNombre = null
    if (user?.id) {
      const { data: usuarioData } = await supabase
        .from('usuarios')
        .select('nombres, apellidos')
        .eq('id', user.id)
        .single()

      if (usuarioData) {
        usuarioNombre =
          `${usuarioData.nombres} ${usuarioData.apellidos || ''}`.trim()
      }
    }

    // Crear snapshot
    await supabase.from('negociaciones_historial').insert({
      negociacion_id: negociacionId,
      version: nuevaVersion,
      tipo_cambio: 'fuentes_pago_actualizadas',
      razon_cambio: razonCompleta,
      datos_negociacion: datosNegociacion,
      fuentes_pago_snapshot: fuentesActivas || [],
      documentos_snapshot: documentos || [],
      datos_anteriores: null,
      datos_nuevos: cambiosDetallados,
      campos_modificados: ['fuentes_pago'],
      usuario_email: usuarioEmail,
      usuario_nombre: usuarioNombre,
    })

    // Actualizar versión en negociaciones
    await supabase
      .from('negociaciones')
      .update({
        version_actual: nuevaVersion,
        version_lock: (negociacion?.version_lock || 0) + 1,
      })
      .eq('id', negociacionId)
  }
}

export const negociacionesService = new NegociacionesService()
