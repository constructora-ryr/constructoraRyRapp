'use client'

/**
 * Lógica del formulario de login: credenciales, recordar correo, aviso de
 * intentos, verificación de cuenta activa, auditoría y redirección segura.
 */

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { showLoginSuccessToast } from '@/components/toasts/custom-toasts'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase/client'
import { errorLog } from '@/lib/utils/logger'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { auditLogService } from '@/services/audit-log.service'

import { rutaDespuesDeLogin } from './redireccion'
import { MINUTOS_BLOQUEO, useBloqueoLocal } from './useBloqueoLocal'

const CLAVE_RECORDAR = 'ryr_remember_email'

export type EstadoLogin = 'idle' | 'enviando' | 'exito'

export function useLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [estado, setEstado] = useState<EstadoLogin>('idle')
  const [error, setError] = useState('')
  const enviando = useRef(false)

  const { signIn } = useAuth()
  const router = useRouter()
  const destino = rutaDespuesDeLogin(useSearchParams()?.get('redirectedFrom'))
  const bloqueo = useBloqueoLocal(email)

  // Correo recordado
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_RECORDAR)
      if (guardado) {
        setEmail(guardado)
        setRecordar(true)
      }
    } catch {
      // Sin almacenamiento: no se recuerda
    }
  }, [])

  const enviar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (enviando.current) return
      if (bloqueo.bloqueado) {
        setError(
          `Demasiados intentos. Espera ${bloqueo.minutosRestantes} min o restablece tu contraseña.`
        )
        return
      }

      enviando.current = true
      setEstado('enviando')
      setError('')

      try {
        await signIn(email, password)

        // Supabase Auth acepta la contraseña aunque la cuenta esté inactiva
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const { data: cuenta } = await supabase
          .from('usuarios')
          .select('estado')
          .eq('id', user?.id ?? '')
          .maybeSingle()
        if (cuenta?.estado !== 'Activo') {
          await supabase.auth.signOut()
          throw new Error(
            'Tu cuenta está desactivada. Contacta al administrador del sistema.'
          )
        }

        bloqueo.limpiar()
        try {
          if (recordar) localStorage.setItem(CLAVE_RECORDAR, email)
          else localStorage.removeItem(CLAVE_RECORDAR)
        } catch {
          // Sin almacenamiento
        }
        void auditLogService.logLoginExitoso(email)

        setEstado('exito')
        showLoginSuccessToast()
        router.push(destino)
        // Se queda en "exito" (botón deshabilitado) hasta que cambia la página
      } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err)
        errorLog('login-submit', new Error(mensaje), { email })

        const { restantes, bloqueado } = bloqueo.registrarFallo()
        void auditLogService.logLoginFallido(email, restantes)
        if (bloqueado)
          void auditLogService.logCuentaBloqueada(email, MINUTOS_BLOQUEO)

        const texto = traducirErrorSupabase(mensaje)
        setError(
          bloqueado
            ? `Demasiados intentos fallidos. Espera ${MINUTOS_BLOQUEO} minutos o restablece tu contraseña.`
            : restantes <= 2
              ? `${texto}. Te ${restantes === 1 ? 'queda 1 intento' : `quedan ${restantes} intentos`}.`
              : texto
        )
        setEstado('idle')
        enviando.current = false
      }
    },
    [email, password, recordar, signIn, router, destino, bloqueo]
  )

  return {
    email,
    setEmail,
    password,
    setPassword,
    recordar,
    setRecordar,
    estado,
    error,
    bloqueado: bloqueo.bloqueado,
    minutosRestantes: bloqueo.minutosRestantes,
    intentosRestantes: bloqueo.intentosRestantes,
    enviar,
  }
}
