/**
 * Service: Notas Manuales del Historial de Cliente
 * CRUD operations para notas que complementan eventos automáticos
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  ActualizarNotaDTO,
  CrearNotaDTO,
  NotaGlobalConCliente,
  NotaHistorialConUsuario,
} from '../types/notas-historial.types'

class NotasHistorialService {
  /**
   * Obtener una nota específica por ID
   */
  async obtenerNotaPorId(
    notaId: string
  ): Promise<NotaHistorialConUsuario | null> {
    try {
      const { data: nota, error } = await supabase
        .from('notas_historial_cliente')
        .select(
          'id,cliente_id,titulo,contenido,es_importante,fecha_creacion,fecha_actualizacion,creado_por,actualizado_por'
        )
        .eq('id', notaId)
        .single()

      if (error) throw error
      if (!nota) return null

      // Obtener datos del creador
      const { data: creador } = await supabase
        .from('usuarios')
        .select('id,email,nombres,apellidos,rol')
        .eq('id', nota.creado_por)
        .single()

      return {
        ...nota,
        creador: creador || {
          id: nota.creado_por,
          email: 'Desconocido',
          nombres: 'Usuario',
          apellidos: 'Eliminado',
          rol: '',
        },
      } as NotaHistorialConUsuario
    } catch (error) {
      logger.error('❌ [NOTAS] Error obteniendo nota:', error)
      return null
    }
  }

  /**
   * Obtener todas las notas de un cliente
   */
  async obtenerNotasCliente(
    clienteId: string
  ): Promise<NotaHistorialConUsuario[]> {
    try {
      const { data: notas, error } = await supabase
        .from('notas_historial_cliente')
        .select(
          'id,cliente_id,titulo,contenido,es_importante,fecha_creacion,fecha_actualizacion,creado_por,actualizado_por'
        )
        .eq('cliente_id', clienteId)
        .order('fecha_creacion', { ascending: false })

      if (error) throw error

      if (!notas || notas.length === 0) return []

      // Obtener IDs únicos de usuarios (creadores + actualizadores)
      const usuarioIds = new Set<string>()
      notas.forEach(nota => {
        usuarioIds.add(nota.creado_por)
        if (nota.actualizado_por) usuarioIds.add(nota.actualizado_por)
      })

      // Query única para todos los usuarios
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id,email,nombres,apellidos,rol')
        .in('id', Array.from(usuarioIds))

      const usuariosMap = new Map((usuarios || []).map(u => [u.id, u]))

      // Mapear notas con datos de usuarios
      return notas.map(nota => {
        const creador = usuariosMap.get(nota.creado_por)
        const actualizador = nota.actualizado_por
          ? usuariosMap.get(nota.actualizado_por)
          : undefined

        return {
          ...nota,
          creador: creador
            ? {
                id: creador.id,
                email: creador.email,
                nombres: creador.nombres,
                apellidos: creador.apellidos,
                rol: creador.rol,
              }
            : {
                id: nota.creado_por,
                email: 'Desconocido',
                nombres: 'Usuario',
                apellidos: 'Eliminado',
                rol: '',
              },
          actualizador: actualizador
            ? {
                id: actualizador.id,
                email: actualizador.email,
                nombres: actualizador.nombres,
                apellidos: actualizador.apellidos,
              }
            : undefined,
        } as NotaHistorialConUsuario
      })
    } catch (error) {
      logger.error('❌ [NOTAS] Error obteniendo notas del cliente:', error)
      return []
    }
  }

  /**
   * Crear una nota nueva
   */
  async crearNota(datos: CrearNotaDTO): Promise<{
    success: boolean
    nota?: NotaHistorialConUsuario
    error?: string
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      const { data: nota, error } = await supabase
        .from('notas_historial_cliente')
        .insert({
          cliente_id: datos.cliente_id,
          titulo: datos.titulo.trim(),
          contenido: datos.contenido.trim(),
          es_importante: datos.es_importante || false,
          creado_por: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Obtener datos del creador
      const { data: creador } = await supabase
        .from('usuarios')
        .select('id,email,nombres,apellidos,rol')
        .eq('id', user.id)
        .single()

      return {
        success: true,
        nota: {
          ...nota,
          creador: creador || {
            id: user.id,
            email: user.email || '',
            nombres: 'Usuario',
            apellidos: '',
            rol: '',
          },
        } as NotaHistorialConUsuario,
      }
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('❌ [NOTAS] Error creando nota:', error)
      return { success: false, error: mensaje }
    }
  }

  /**
   * Actualizar una nota existente
   */
  async actualizarNota(
    notaId: string,
    datos: ActualizarNotaDTO
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      type NotaActualizacion = {
        actualizado_por: string
        titulo?: string
        contenido?: string
        es_importante?: boolean
      }
      const actualizacion: NotaActualizacion = {
        actualizado_por: user.id,
      }

      if (datos.titulo !== undefined) actualizacion.titulo = datos.titulo.trim()
      if (datos.contenido !== undefined)
        actualizacion.contenido = datos.contenido.trim()
      if (datos.es_importante !== undefined)
        actualizacion.es_importante = datos.es_importante

      const { error } = await supabase
        .from('notas_historial_cliente')
        .update(actualizacion)
        .eq('id', notaId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('❌ [NOTAS] Error actualizando nota:', error)
      return { success: false, error: mensaje }
    }
  }

  /**
   * Eliminar una nota
   */
  async eliminarNota(
    notaId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notas_historial_cliente')
        .delete()
        .eq('id', notaId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : 'Error desconocido'
      logger.error('❌ [NOTAS] Error eliminando nota:', error)
      return { success: false, error: mensaje }
    }
  }

  /**
   * Obtener las N notas más recientes de todos los clientes (feed global)
   */
  async obtenerNotasRecientesGlobal(
    limite = 100
  ): Promise<NotaGlobalConCliente[]> {
    try {
      const { data: notas, error } = await supabase
        .from('notas_historial_cliente')
        .select(
          'id,cliente_id,titulo,contenido,es_importante,fecha_creacion,fecha_actualizacion,creado_por,actualizado_por'
        )
        .order('fecha_creacion', { ascending: false })
        .limit(limite)

      if (error) throw error
      if (!notas || notas.length === 0) return []

      const clienteIds = [...new Set(notas.map(n => n.cliente_id))]
      const usuarioIds = [...new Set(notas.map(n => n.creado_por))]

      const [{ data: clientes }, { data: usuarios }] = await Promise.all([
        supabase
          .from('clientes')
          .select('id,nombres,apellidos')
          .in('id', clienteIds),
        supabase
          .from('usuarios')
          .select('id,email,nombres,apellidos')
          .in('id', usuarioIds),
      ])

      const clientesMap = new Map((clientes || []).map(c => [c.id, c]))
      const usuariosMap = new Map((usuarios || []).map(u => [u.id, u]))

      return notas.map(nota => {
        const cliente = clientesMap.get(nota.cliente_id)
        const creador = usuariosMap.get(nota.creado_por)
        return {
          ...nota,
          cliente: cliente || {
            id: nota.cliente_id,
            nombres: 'Cliente',
            apellidos: 'eliminado',
          },
          creador: creador || {
            id: nota.creado_por,
            email: 'Desconocido',
            nombres: 'Usuario',
            apellidos: 'eliminado',
          },
        } as NotaGlobalConCliente
      })
    } catch (error) {
      logger.error('❌ [NOTAS] Error obteniendo feed global:', error)
      return []
    }
  }

  /**
   * Verificar si usuario puede editar/eliminar nota
   */
  async puedeEditarNota(notaId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      // Obtener nota y usuario
      const [notaResult, usuarioResult] = await Promise.all([
        supabase
          .from('notas_historial_cliente')
          .select('creado_por')
          .eq('id', notaId)
          .single(),
        supabase.from('usuarios').select('rol').eq('id', user.id).single(),
      ])

      if (notaResult.error || usuarioResult.error) return false

      const nota = notaResult.data
      const usuario = usuarioResult.data

      // Es Admin o es el creador
      return usuario.rol === 'Administrador' || nota.creado_por === user.id
    } catch (error) {
      logger.error('❌ [NOTAS] Error verificando permisos:', error)
      return false
    }
  }
}

export const notasHistorialService = new NotasHistorialService()
