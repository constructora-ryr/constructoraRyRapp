/**
 * Mi perfil: todo actúa sobre la cuenta propia mediante funciones de la BD
 * (supabase/migrations/20261110_perfil_sesiones_reales.sql) que solo tocan
 * filas de auth.uid().
 */

import { supabase } from '@/lib/supabase/client'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import type { EventoAuditoria } from '@/modules/auditorias/types'
import { auditLogService } from '@/services/audit-log.service'

import type {
  AccesoReciente,
  DatosCuenta,
  PreferenciasUsuario,
  SesionReal,
} from '../types'

// Las funciones nuevas aún no están en los tipos generados de la BD: se
// llaman sin tipar (rpc se invoca sobre el cliente para conservar `this`)
type RpcSinTipos = (
  fn: string,
  args?: Record<string, unknown>
) => Promise<{ data: unknown; error: { message: string } | null }>
const rpc = (fn: string, args?: Record<string, unknown>) =>
  (supabase.rpc as unknown as RpcSinTipos).call(supabase, fn, args)

async function llamar<T>(fn: string, args?: Record<string, unknown>) {
  const { data, error } = await rpc(fn, args)
  if (error) throw new Error(traducirErrorSupabase(error.message))
  return data as T
}

// ── Sesiones ────────────────────────────────────────────────────────────────

export const misSesiones = () => llamar<SesionReal[]>('mis_sesiones')

export const cerrarSesion = (id: string) =>
  llamar<boolean>('cerrar_mi_sesion', { p_sesion: id })

export const cerrarOtrasSesiones = () =>
  llamar<number>('cerrar_mis_otras_sesiones')

// ── Cuenta ──────────────────────────────────────────────────────────────────

export const actualizarMiPerfil = (datos: DatosCuenta) =>
  llamar<void>('actualizar_mi_perfil', {
    p_nombres: datos.nombres,
    p_apellidos: datos.apellidos,
    p_telefono: datos.telefono,
  })

export const guardarPreferencias = (preferencias: PreferenciasUsuario) =>
  llamar<PreferenciasUsuario>('guardar_mis_preferencias', {
    p_preferencias: preferencias,
  })

/**
 * Cambia la contraseña tras comprobar la actual (sin iniciar otra sesión).
 * Con `cerrarOtras`, los demás dispositivos tienen que volver a entrar.
 */
export async function cambiarContrasena({
  actual,
  nueva,
  email,
  cerrarOtras,
}: {
  actual: string
  nueva: string
  email: string
  cerrarOtras: boolean
}) {
  const correcta = await llamar<boolean>('verificar_mi_contrasena', {
    p_actual: actual,
  })
  if (!correcta) throw new Error('La contraseña actual no es correcta')
  if (actual === nueva)
    throw new Error('La nueva contraseña debe ser distinta de la actual')

  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) throw new Error(traducirErrorSupabase(error.message))

  await auditLogService.logSecurityEvent({
    tipo: 'password_reset_completado',
    usuarioEmail: email,
    metadata: { origen: 'perfil' },
  })
  return cerrarOtras ? cerrarOtrasSesiones() : 0
}

// ── Historial propio ────────────────────────────────────────────────────────

/** Inicios de sesión, intentos fallidos, cierres (RLS: solo los propios) */
export async function misAccesos(limite = 15): Promise<AccesoReciente[]> {
  const { data, error } = await supabase
    .from('audit_log_seguridad')
    .select('id, tipo, ip_address, user_agent, fecha_evento')
    .order('fecha_evento', { ascending: false })
    .limit(limite)
  if (error) throw new Error(traducirErrorSupabase(error.message))
  return (data ?? []) as AccesoReciente[]
}

export const miActividad = (limite = 30) =>
  llamar<EventoAuditoria[]>('mi_actividad', { p_limite: limite })
