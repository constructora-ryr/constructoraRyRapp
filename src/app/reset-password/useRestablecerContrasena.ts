'use client'

/**
 * Restablecer la contraseña desde el enlace del correo.
 *
 * Seguridad: solo se permite si la sesión viene de un enlace de
 * recuperación (evento PASSWORD_RECOVERY, o recovery_sent_at reciente).
 * Antes bastaba cualquier sesión abierta: quien tuviera el equipo con la
 * sesión iniciada podía cambiar la contraseña sin conocer la actual.
 */

import { useEffect, useState, type FormEvent } from 'react'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { validatePasswordStrength } from '@/lib/validations/password'
import { auditLogService } from '@/services/audit-log.service'

export type EstadoEnlace = 'verificando' | 'valido' | 'invalido'

/** El enlace de Supabase vale 1 hora */
const VIGENCIA_ENLACE_MS = 60 * 60 * 1000
const ESPERA_MAXIMA_MS = 12_000

function vieneDeRecuperacion(recoverySentAt: string | undefined): boolean {
  if (!recoverySentAt) return false
  return Date.now() - new Date(recoverySentAt).getTime() < VIGENCIA_ENLACE_MS
}

export function useRestablecerContrasena() {
  const [enlace, setEnlace] = useState<EstadoEnlace>('verificando')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [listo, setListo] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error')) {
      setError(
        params.get('error_description') ?? 'El enlace es inválido o expiró.'
      )
      setEnlace('invalido')
      return
    }

    let activo = true
    const marcar = (valido: boolean) => {
      if (!activo) return
      setEnlace(prev =>
        prev === 'verificando' ? (valido ? 'valido' : 'invalido') : prev
      )
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === 'PASSWORD_RECOVERY') marcar(true)
      else if (sesion && vieneDeRecuperacion(sesion.user.recovery_sent_at))
        marcar(true)
    })

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && vieneDeRecuperacion(session.user.recovery_sent_at))
        marcar(true)
    })

    const espera = setTimeout(() => marcar(false), ESPERA_MAXIMA_MS)
    return () => {
      activo = false
      subscription.unsubscribe()
      clearTimeout(espera)
    }
  }, [])

  const validacion = validatePasswordStrength(password)
  const coinciden = password.length > 0 && password === confirmacion
  const puedeGuardar = validacion.isValid && coinciden && !guardando

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    if (!puedeGuardar) return
    setGuardando(true)
    setError('')

    const { data, error: fallo } = await supabase.auth.updateUser({ password })
    if (fallo) {
      logger.error('Error al restablecer contraseña:', fallo)
      setError(traducirErrorSupabase(fallo.message))
      setGuardando(false)
      return
    }

    if (data.user?.email)
      await auditLogService.logSecurityEvent({
        tipo: 'password_reset_completado',
        usuarioEmail: data.user.email,
      })
    setListo(true)

    // Cerrar la sesión de recuperación y volver al login con aviso
    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined)
    setTimeout(() => window.location.replace('/login?restablecida=1'), 1800)
  }

  return {
    enlace,
    password,
    setPassword,
    confirmacion,
    setConfirmacion,
    validacion,
    coinciden,
    puedeGuardar,
    guardando,
    listo,
    error,
    guardar,
  }
}
