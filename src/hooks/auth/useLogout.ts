'use client'

/**
 * Cierre de sesión. Mientras corre, `isLoggingOut` permite tapar la app
 * (la sesión ya no existe y la pantalla no debe seguir usable); al terminar
 * se va directo al login, que muestra el aviso "Cerraste sesión".
 *
 * El evento de auditoría se registra ANTES del signOut: la ruta del servidor
 * identifica al usuario por la sesión.
 */

import { useCallback, useRef, useState } from 'react'

import { showLogoutErrorToast } from '@/components/toasts/custom-toasts'
import { useAuth } from '@/contexts/auth-context'
import { errorLog } from '@/lib/utils/logger'
import { auditLogService } from '@/services/audit-log.service'

import { useLogoutMutation } from './useAuthMutations'

export function useLogout() {
  const { user } = useAuth()
  const logoutMutation = useLogoutMutation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const enCurso = useRef(false)

  const logout = useCallback(async () => {
    if (enCurso.current) return
    enCurso.current = true
    setIsLoggingOut(true)

    try {
      if (user?.email)
        await auditLogService.logLogout(user.email).catch(() => undefined)
      await logoutMutation.mutateAsync()
      sessionStorage.clear()
      // replace: que "Atrás" no vuelva a una pantalla de la app sin sesión
      window.location.replace('/login?sesion=cerrada')
    } catch (error) {
      errorLog('logout-hook', error)
      showLogoutErrorToast()
      enCurso.current = false
      setIsLoggingOut(false)
    }
  }, [user?.email, logoutMutation])

  return { logout, isLoggingOut }
}
