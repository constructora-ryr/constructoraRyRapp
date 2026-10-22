import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

export type TipoEventoSeguridad =
  | 'login_exitoso'
  | 'login_fallido'
  | 'logout'
  | 'password_reset_solicitado'
  | 'password_reset_completado'
  | 'session_expirada'
  | 'cuenta_bloqueada'
  | 'cuenta_desbloqueada'

interface LogSecurityEventParams {
  tipo: TipoEventoSeguridad
  usuarioEmail: string
  metadata?: Record<string, unknown>
}

/**
 * Servicio para registrar eventos de seguridad en la auditoría
 * Cumple con requisitos de trazabilidad y detección de anomalías
 */
class AuditLogService {
  /**
   * Registra un evento de seguridad
   *
   * @example
   * await auditLogService.logSecurityEvent({
   *   tipo: 'login_exitoso',
   *   usuarioEmail: 'user@example.com',
   *   metadata: { dispositivo: 'Chrome/Windows' }
   * })
   */
  async logSecurityEvent({
    tipo,
    usuarioEmail,
    metadata = {},
  }: LogSecurityEventParams): Promise<void> {
    try {
      // Lo registra el servidor (IP real, usuario de la sesión). El
      // navegador no puede escribir en audit_log_seguridad.
      const res = await fetch('/api/auth/evento-seguridad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, email: usuarioEmail, metadata }),
        keepalive: true,
      })
      if (!res.ok && res.status !== 429) {
        logger.error('❌ Error registrando evento de seguridad:', res.status)
      }
    } catch (error) {
      // No interrumpir el flujo principal por un fallo de auditoría
      logger.error('❌ Excepción en logSecurityEvent:', error)
    }
  }

  /**
   * Registra un login exitoso
   */
  async logLoginExitoso(
    usuarioEmail: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'login_exitoso',
      usuarioEmail,
      metadata,
    })
  }

  /**
   * Registra un intento de login fallido
   */
  async logLoginFallido(
    usuarioEmail: string,
    intentosRestantes: number
  ): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'login_fallido',
      usuarioEmail,
      metadata: {
        intentos_restantes: intentosRestantes,
      },
    })
  }

  /**
   * Registra un logout
   */
  async logLogout(usuarioEmail: string): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'logout',
      usuarioEmail,
    })
  }

  /**
   * Registra una solicitud de reset de contraseña
   */
  async logPasswordResetSolicitado(usuarioEmail: string): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'password_reset_solicitado',
      usuarioEmail,
    })
  }

  /**
   * Registra una sesión expirada
   */
  async logSessionExpirada(
    usuarioEmail: string,
    duracionMinutos: number
  ): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'session_expirada',
      usuarioEmail,
      metadata: {
        duracion_minutos: duracionMinutos,
      },
    })
  }

  /**
   * Registra un bloqueo de cuenta por intentos fallidos
   */
  async logCuentaBloqueada(
    usuarioEmail: string,
    minutosBloqueo: number
  ): Promise<void> {
    await this.logSecurityEvent({
      tipo: 'cuenta_bloqueada',
      usuarioEmail,
      metadata: {
        minutos_bloqueo: minutosBloqueo,
      },
    })
  }

  /**
   * Obtiene el historial de eventos de un usuario
   */
  async obtenerHistorialUsuario(usuarioEmail: string, limit = 50) {
    const { data, error } = await supabase
      .from('audit_log_seguridad')
      .select('*')
      .eq('usuario_email', usuarioEmail)
      .order('fecha_evento', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Error obteniendo historial:', error)
      return []
    }

    return data
  }

  /**
   * Obtiene resumen de seguridad de un usuario (últimos 30 días)
   */
  async obtenerResumenSeguridad(usuarioEmail: string) {
    const { data, error } = await supabase.rpc('obtener_resumen_seguridad', {
      p_usuario_email: usuarioEmail,
    })

    if (error) {
      logger.error('Error obteniendo resumen de seguridad:', error)
      return null
    }

    return data?.[0] || null
  }
}

// Exportar instancia única (singleton)
export const auditLogService = new AuditLogService()
