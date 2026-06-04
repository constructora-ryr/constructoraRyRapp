/**
 * ============================================
 * SERVICE: Gestión de Usuarios v2
 * ============================================
 *
 * Funciones puras para CRUD de usuarios.
 * Patrón: logger.error() + throw Error (Regla #4)
 * No usa clase — funciones exportadas directamente.
 */

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

import type {
  ActualizarUsuarioData,
  CrearUsuarioData,
  CrearUsuarioRespuesta,
  EstadisticasUsuarios,
  EstadoUsuario,
  FiltrosUsuarios,
  Rol,
  UsuarioCompleto,
} from '../types'

// ============================================
// QUERIES
// ============================================

/**
 * Obtiene la lista de usuarios con filtros opcionales.
 */
export async function obtenerUsuarios(
  filtros?: FiltrosUsuarios
): Promise<UsuarioCompleto[]> {
  let query = supabase.from('vista_usuarios_completos').select('*')

  if (filtros?.busqueda) {
    const b = `%${filtros.busqueda}%`
    query = query.or(`nombres.ilike.${b},apellidos.ilike.${b},email.ilike.${b}`)
  }
  if (filtros?.rol) {
    query = query.eq('rol', filtros.rol)
  }
  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado)
  }

  const { data, error } = await query.order('fecha_creacion', {
    ascending: false,
  })

  if (error) {
    logger.error('❌ [USUARIOS] Error obteniendo usuarios:', error)
    throw new Error(`Error al obtener usuarios: ${error.message}`)
  }

  return (data ?? []) as unknown as UsuarioCompleto[]
}

/**
 * Obtiene un usuario por ID. Retorna null si no existe.
 */
export async function obtenerUsuarioPorId(
  id: string
): Promise<UsuarioCompleto | null> {
  const { data, error } = await supabase
    .from('vista_usuarios_completos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error('❌ [USUARIOS] Error obteniendo usuario por ID:', error)
    throw new Error(`Error al obtener usuario: ${error.message}`)
  }

  return data as unknown as UsuarioCompleto
}

/**
 * Calcula estadísticas del módulo de usuarios.
 * Nota: Carga todos los usuarios una sola vez para calcular en cliente.
 */
export async function obtenerEstadisticasUsuarios(): Promise<EstadisticasUsuarios> {
  const usuarios = await obtenerUsuarios()

  const stats: EstadisticasUsuarios = {
    total: usuarios.length,
    activos: 0,
    inactivos: 0,
    bloqueados: 0,
    activos_hoy: 0,
    por_rol: {
      Administrador: 0,
      Contabilidad: 0,
      'Administrador de Obra': 0,
      Gerencia: 0,
    },
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  for (const u of usuarios) {
    stats.por_rol[u.rol]++

    if (u.estado === 'Activo') stats.activos++
    else if (u.estado === 'Inactivo') stats.inactivos++
    else if (u.estado === 'Bloqueado') stats.bloqueados++

    if (u.ultimo_acceso && new Date(u.ultimo_acceso) >= hoy) {
      stats.activos_hoy++
    }
  }

  return stats
}

// ============================================
// MUTACIONES
// ============================================

/**
 * Invita a un nuevo usuario vía email.
 * El usuario recibirá un link para establecer su propia contraseña.
 * Requiere que el usuario actual sea Administrador.
 */
export async function crearUsuario(
  datos: CrearUsuarioData
): Promise<CrearUsuarioRespuesta> {
  const response = await fetch('/api/usuarios/invitar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: datos.email,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      telefono: datos.telefono,
      rol: datos.rol,
    }),
  })

  const body = await response.json()

  if (!response.ok) {
    logger.error('❌ [USUARIOS] Error invitando usuario:', body)
    throw new Error(body.error ?? 'Error al enviar invitación')
  }

  return {
    usuario: body.usuario,
    invitacion_enviada: true,
  }
}

/**
 * Actualiza los datos de un usuario existente.
 */
export async function actualizarUsuario(
  id: string,
  datos: ActualizarUsuarioData
): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update(datos as Record<string, unknown>)
    .eq('id', id)

  if (error) {
    logger.error('❌ [USUARIOS] Error actualizando usuario:', error)
    throw new Error(`Error al actualizar usuario: ${error.message}`)
  }
}

/**
 * Cambia el estado de un usuario (Activo, Inactivo, Bloqueado).
 */
export async function cambiarEstadoUsuario(
  id: string,
  nuevoEstado: EstadoUsuario
): Promise<void> {
  await actualizarUsuario(id, { estado: nuevoEstado })
}

/**
 * Cambia el rol de un usuario.
 */
export async function cambiarRolUsuario(
  id: string,
  nuevoRol: Rol
): Promise<void> {
  await actualizarUsuario(id, { rol: nuevoRol })
}

/**
 * Reenvía el email de invitación a un usuario que aún no ha iniciado sesión.
 */
export async function reenviarInvitacion(email: string): Promise<void> {
  const response = await fetch('/api/usuarios/reenviar-invitacion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const body = await response.json()

  if (!response.ok) {
    logger.error('❌ [USUARIOS] Error reenviando invitación:', body)
    throw new Error(body.error ?? 'Error al reenviar invitación')
  }
}

/**
 * Desbloquea un usuario reseteando sus intentos fallidos.
 */
export async function desbloquearUsuario(id: string): Promise<void> {
  const { error } = await supabase
    .from('usuarios')
    .update({ estado: 'Activo', intentos_fallidos: 0, bloqueado_hasta: null })
    .eq('id', id)

  if (error) {
    logger.error('❌ [USUARIOS] Error desbloqueando usuario:', error)
    throw new Error(`Error al desbloquear usuario: ${error.message}`)
  }
}
