/**
 * ============================================
 * COMPONENTE: ProtectedApp
 * ============================================
 *
 * Wrapper de seguridad que valida el rol del usuario ANTES de renderizar la aplicación.
 * Si el rol es inválido, muestra pantalla de error y bloquea TODO acceso.
 */

'use client'

import { Building2 } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { PantallaCarga } from '@/shared/components/carga'
import { InvalidRoleError } from '@/shared/components/errors'

const ROLES_VALIDOS = [
  'Administrador',
  'Contabilidad',
  'Administrador de Obra',
  'Gerencia',
] as const
type RolValido = (typeof ROLES_VALIDOS)[number]

function esRolValido(rol: string | null | undefined): rol is RolValido {
  return typeof rol === 'string' && ROLES_VALIDOS.includes(rol as RolValido)
}

interface ProtectedAppProps {
  children: React.ReactNode
}

export function ProtectedApp({ children }: ProtectedAppProps) {
  const { user, perfil, loading } = useAuth()

  // Mientras carga auth, mostrar pantalla de carga consistente
  if (loading) {
    return (
      <PantallaCarga
        icon={Building2}
        label='Preparando tu sesión'
        className='h-screen'
      />
    )
  }

  // Si hay perfil, validar el rol
  if (perfil) {
    const rolActual = perfil.rol
    const esRolInvalido = !esRolValido(rolActual)

    if (esRolInvalido) {
      // 🚨 SEGURIDAD: Registrar intento de acceso con rol inválido
      const errorLog = {
        timestamp: new Date().toISOString(),
        email: user?.email,
        rolInvalido: rolActual,
        userAgent:
          typeof window !== 'undefined'
            ? window.navigator.userAgent
            : 'unknown',
      }

      logger.error(
        `❌ [PROTECTED APP] ACCESO BLOQUEADO - Rol inválido`,
        errorLog
      )

      // TODO: Enviar a servicio de logging/alertas (Sentry, LogRocket, etc.)
      // await fetch('/api/security/invalid-role', { method: 'POST', body: JSON.stringify(errorLog) })

      // 🚨 BLOQUEO TOTAL: Mostrar solo pantalla de error (sin información sensible del sistema)
      return (
        <InvalidRoleError detectedRole={rolActual} userEmail={user?.email} />
      )
    }
  }

  // Rol válido o sin sesión: renderizar aplicación normal
  return <>{children}</>
}
