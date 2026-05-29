/**
 * ============================================
 * REACT QUERY: Autenticación - Queries
 * ============================================
 *
 * Hooks de React Query para gestionar estado de autenticación.
 * Reemplaza useState/useEffect del AuthContext con cache inteligente.
 */

'use client'

import type { User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'

const supabase = createClient()

// ============================================
// TYPES
// ============================================

export interface Perfil {
  id: string
  nombres: string
  apellidos: string
  email: string
  rol: 'Administrador' | 'Contabilidad' | 'Administrador de Obra' | 'Gerencia'
  estado: 'Activo' | 'Inactivo'
  debe_cambiar_password: boolean
  ultimo_acceso: string | null
  fecha_creacion: string
  fecha_actualizacion: string
}

// ============================================
// QUERY KEYS
// ============================================

export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  perfil: (userId?: string) => [...authKeys.all, 'perfil', userId] as const,
}

// ============================================
// QUERY: Sesión Actual
// ============================================

/**
 * Obtiene la sesión actual de Supabase
 * Se revalida automáticamente cuando la pestaña vuelve a tener foco
 */
export function useAuthSessionQuery() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        // Refresh token inválido/expirado: limpiar sesión localmente y retornar null
        // El SDK ya emite TOKEN_REFRESH_FAILED y SIGNED_OUT; evitamos propagar el error
        if (
          error.message.includes('Refresh Token Not Found') ||
          error.message.includes('Invalid Refresh Token')
        ) {
          await supabase.auth.signOut({ scope: 'local' })
          return null
        }
        throw error
      }
      return data.session
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos en cache
    refetchOnWindowFocus: true, // Revalidar al volver a la pestaña
    refetchOnMount: 'always', // ✅ CRÍTICO: Siempre refetch para detectar logout
    retry: false, // ✅ No reintentar si falla (usuario no autenticado)
  })
}

// ============================================
// QUERY: Usuario Actual
// ============================================

/**
 * Obtiene el usuario actual de Supabase Auth
 * Depende de la sesión activa
 */
export function useAuthUserQuery() {
  const { data: session } = useAuthSessionQuery()

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data.user as User | null
    },
    enabled: !!session, // Solo ejecutar si hay sesión
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos en cache
    retry: false, // ✅ No reintentar si falla
  })
}

// ============================================
// QUERY: Perfil del Usuario
// ============================================

/**
 * Obtiene el perfil completo del usuario desde la tabla usuarios
 * Incluye rol, permisos, estado, etc.
 */
export function useAuthPerfilQuery(userId?: string) {
  return useQuery({
    queryKey: authKeys.perfil(userId),
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        logger.error('Error obteniendo perfil:', error)
        throw error
      }

      return data as Perfil
    },
    enabled: !!userId, // Solo ejecutar si hay userId
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos en cache
    retry: false, // ✅ No reintentar si falla
  })
}

// ============================================
// HOOK COMBINADO: Auth Completo
// ============================================

/**
 * Hook principal que combina sesión, usuario y perfil
 * Retorna toda la información de autenticación
 */
export function useAuth() {
  const { data: session, isLoading: sessionLoading } = useAuthSessionQuery()
  const { data: user, isLoading: userLoading } = useAuthUserQuery()
  const { data: perfil, isLoading: perfilLoading } = useAuthPerfilQuery(
    user?.id
  )

  return {
    session,
    user: user ?? null,
    perfil: perfil ?? null,
    isLoading: sessionLoading || userLoading || perfilLoading,
    isAuthenticated: !!session && !!user,
  }
}
