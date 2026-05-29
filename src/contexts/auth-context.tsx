/**
 * ============================================
 * AUTH CONTEXT - Refactorizado con React Query
 * ============================================
 *
 * Context de autenticaci�n que usa React Query internamente.
 * Mantiene la misma API para compatibilidad con c�digo existente.
 *
 * BENEFICIOS:
 * - ? Cache autom�tico de sesi�n y perfil
 * - ? Invalidaci�n inteligente
 * - ? Sin problemas de closures
 * - ? Estados de carga precisos
 * - ? Refetch autom�tico en background
 */

'use client'

import { createContext, useContext, useEffect } from 'react'

import type { User } from '@supabase/supabase-js'

import {
  useAuthPerfilQuery,
  useAuthSessionQuery,
  useAuthUserQuery,
  useLoginMutation,
  useLogoutMutation,
  type Perfil,
} from '@/hooks/auth'
import { createClient } from '@/lib/supabase/client'
import { debugLog, errorLog, successLog } from '@/lib/utils/logger'

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: User | null
  perfil: Perfil | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<unknown>
  signOut: () => Promise<void>
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ============================================
  // LIMPIAR SESIÓN INVÁLIDA (Refresh Token No Found)
  // ============================================
  // Cuando Supabase detecta un refresh token inválido (sesión expirada/revocada)
  // emite TOKEN_REFRESH_FAILED y luego SIGNED_OUT automáticamente.
  // Este listener lo maneja silenciosamente sin producir errores no controlados.
  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async event => {
      if (event === 'TOKEN_REFRESHED') {
        debugLog('🔄 Token refrescado exitosamente')
      }
      if (event === 'TOKEN_REFRESH_FAILED') {
        // Limpiar solo la sesión local para no dejar tokens basura en storage
        await supabase.auth.signOut({ scope: 'local' })
      }
      if (event === 'SIGNED_OUT') {
        debugLog('🔓 Sesión cerrada — refresh token inválido o sesión expirada')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Queries de React Query
  const { isLoading: sessionLoading } = useAuthSessionQuery()
  const { data: user, isLoading: userLoading } = useAuthUserQuery()
  const { data: perfil, isLoading: perfilLoading } = useAuthPerfilQuery(
    user?.id
  )

  // Mutaciones
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()

  // ============================================
  // SIGN IN - Wrapper para mantener API
  // ============================================

  const signIn = async (email: string, password: string) => {
    debugLog('?? AuthContext.signIn() invocado', { email })

    try {
      const result = await loginMutation.mutateAsync({ email, password })
      successLog('Login mutation completado')
      return result
    } catch (error) {
      errorLog('auth-context-signin', error, { email })
      throw error
    }
  }

  // ============================================
  // SIGN OUT - Wrapper para mantener API
  // ============================================

  const signOut = async () => {
    debugLog('?? AuthContext.signOut() invocado')
    try {
      await logoutMutation.mutateAsync()
      successLog('Logout completado desde AuthContext')
    } catch (error) {
      errorLog('auth-context-signout', error)
      throw error
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================

  const loading = sessionLoading || userLoading || perfilLoading

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AuthContextType = {
    user: user ?? null,
    perfil: perfil ?? null,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

// Re-export Perfil type para compatibilidad
export type { Perfil }
