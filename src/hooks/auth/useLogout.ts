/**
 * ============================================
 * HOOK: useLogout - Lógica de Cierre de Sesión
 * ============================================
 *
 * Hook personalizado que maneja toda la lógica de logout.
 * Separación de responsabilidades: SOLO lógica, sin UI.
 *
 * CARACTERÍSTICAS:
 * - ✅ Estado de loading (isLoggingOut)
 * - ✅ Invalidación de queries antes de logout
 * - ✅ Toasts con feedback visual completo
 * - ✅ Logging profesional
 * - ✅ router.replace() en lugar de push()
 * - ✅ Error handling robusto
 * - ✅ Callbacks opcionales (onBeforeLogout, onAfterLogout)
 * - ✅ Confirmación opcional
 */

'use client'

import { useCallback, useState } from 'react'

import {
  showLogoutErrorToast,
  showLogoutToast,
} from '@/components/toasts/custom-toasts'
import { debugLog, errorLog, successLog } from '@/lib/utils/logger'
import { useModal } from '@/shared/components/modals'

import { useLogoutMutation } from './useAuthMutations'

// ============================================
// TYPES
// ============================================

interface UseLogoutOptions {
  /** Mostrar confirmación antes de cerrar sesión */
  requireConfirmation?: boolean
  /** Mostrar toast de despedida */
  showToast?: boolean
  /** Ruta de redirección (default: /login) */
  redirectTo?: string
  /** Callback antes de logout (útil para guardar estado) */
  onBeforeLogout?: () => void | Promise<void>
  /** Callback después de logout exitoso */
  onAfterLogout?: () => void
}

interface UseLogoutReturn {
  /** Función para ejecutar logout */
  logout: () => Promise<void>
  /** Estado de loading durante logout */
  isLoggingOut: boolean
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para manejar logout con feedback completo
 *
 * @example
 * ```tsx
 * const { logout, isLoggingOut } = useLogout({
 *   showToast: true,
 *   redirectTo: '/login'
 * })
 *
 * <button onClick={logout} disabled={isLoggingOut}>
 *   {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
 * </button>
 * ```
 */
export function useLogout(options: UseLogoutOptions = {}): UseLogoutReturn {
  const {
    requireConfirmation = false,
    showToast = true,
    redirectTo = '/login',
    onBeforeLogout,
    onAfterLogout,
  } = options

  const logoutMutation = useLogoutMutation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { confirm } = useModal()

  /**
   * Ejecutar logout con feedback completo
   */
  const logout = useCallback(async () => {
    // Evitar múltiples ejecuciones simultáneas
    if (isLoggingOut) {
      debugLog('⚠️ Logout ya en progreso, ignorando nueva invocación')
      return
    }

    // Confirmación (si está habilitada)
    if (requireConfirmation) {
      const confirmed = await confirm({
        title: 'Cerrar sesión',
        message: '¿Estás seguro de que quieres cerrar sesión?',
        variant: 'warning',
        confirmText: 'Cerrar sesión',
        cancelText: 'Cancelar',
      })
      if (!confirmed) {
        debugLog('❌ Logout cancelado por el usuario')
        return
      }
    }

    try {
      setIsLoggingOut(true)
      debugLog('🚪 Iniciando proceso de logout...', { redirectTo, showToast })

      // Callback pre-logout (ej: guardar estado, cancelar requests)
      if (onBeforeLogout) {
        debugLog('🔄 Ejecutando callback pre-logout...')
        await onBeforeLogout()
      }

      // 1. Logout en Supabase (limpia cookies del servidor)
      debugLog('🔐 Ejecutando signOut en Supabase...')
      await logoutMutation.mutateAsync()

      // 2. Limpiar sessionStorage (Supabase v2 usa cookies httpOnly, no localStorage)
      debugLog('🧹 Limpiando sessionStorage...')
      sessionStorage.clear()

      // Toast de despedida — visible antes del redirect
      if (showToast) {
        showLogoutToast()
      }

      successLog('Logout completado exitosamente')

      // Callback post-logout
      if (onAfterLogout) {
        debugLog('✅ Ejecutando callback post-logout...')
        onAfterLogout()
      }

      // Delay para que el toast sea visible antes de redirigir
      await new Promise(resolve => setTimeout(resolve, 1200))

      debugLog(`🧭 Redirigiendo a ${redirectTo} (replace)...`)
      window.location.href = redirectTo
    } catch (error) {
      errorLog('logout-hook', error)

      // Toast de error
      if (showToast) {
        showLogoutErrorToast()
      }

      // Re-lanzar error para que el componente pueda manejarlo si es necesario
      throw error
    } finally {
      setIsLoggingOut(false)
    }
  }, [
    isLoggingOut,
    requireConfirmation,
    confirm,
    showToast,
    redirectTo,
    onBeforeLogout,
    onAfterLogout,
    logoutMutation,
  ])

  return {
    logout,
    isLoggingOut,
  }
}
