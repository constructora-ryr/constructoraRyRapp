/**
 * Único punto de cierre de sesión del control de inactividad.
 *
 * - scope 'local': cierra solo este navegador. El 'global' por defecto de
 *   Supabase sacaría al usuario de todos sus dispositivos.
 * - Borra la sesión local aunque Supabase no responda, así el login no
 *   vuelve a encontrar una sesión "válida".
 * - Recarga completa a /login: limpia memoria y caché de la app.
 */

import { supabase } from '@/lib/supabase/client'
import { auditLogService } from '@/services/audit-log.service'

import { avisarCierrePorInactividad, borrarActividad } from './reloj-actividad'

const MARCA_MOTIVO = 'logout_reason'
const MARCA_HORA = 'logout_timestamp'

interface OpcionesCierre {
  porInactividad: boolean
  /**
   * El usuario vio la cuenta regresiva en esta pestaña. Si no (volvió otro
   * día, el equipo estuvo suspendido), va al login con un aviso suave en vez
   * de la pantalla "Sesión cerrada por inactividad".
   */
  vioElAviso?: boolean
  /** La otra pestaña ya registró el evento y avisó: no repetir */
  avisadoPorOtraPestana?: boolean
  minutos?: number
  email?: string
}

export async function cerrarSesion({
  porInactividad,
  vioElAviso = false,
  avisadoPorOtraPestana = false,
  minutos,
  email = '',
}: OpcionesCierre) {
  if (porInactividad && vioElAviso) {
    try {
      // La pantalla "Sesión cerrada por inactividad" lo lee al recargar
      sessionStorage.setItem(MARCA_MOTIVO, 'inactivity')
      sessionStorage.setItem(MARCA_HORA, String(Date.now()))
    } catch {
      // Sin sessionStorage solo se pierde la pantalla explicativa
    }
  }
  if (porInactividad) {
    if (!avisadoPorOtraPestana) {
      avisarCierrePorInactividad()
      // Antes del signOut: la ruta necesita la sesión para saber quién fue
      void auditLogService.logSecurityEvent({
        tipo: 'session_expirada',
        usuarioEmail: email,
        metadata: {
          motivo: vioElAviso ? 'inactividad' : 'inactividad_al_volver',
          minutos: minutos ?? 0,
        },
      })
    }
  }

  borrarActividad()
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
  window.location.href =
    porInactividad && !vioElAviso ? '/login?sesion=expirada' : '/login'
}
