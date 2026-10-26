'use client'

/**
 * Monta el control de inactividad para el usuario con sesión: límite
 * configurado (Configuración → Seguridad de sesión) y aviso final.
 */

import { AvisoInactividad } from '@/components/modals/AvisoInactividad'
import { useAuth } from '@/contexts/auth-context'
import { useInactividad } from '@/hooks/useInactividad'
import { avisoMsPara } from '@/lib/sesion/estado-inactividad'
import { useLimiteInactividad } from '@/modules/configuracion/hooks/useLimiteInactividad'

export function IdleTimerProvider() {
  const { user } = useAuth()
  const { minutos } = useLimiteInactividad(!!user)
  const { fase, restanteMs, seguirTrabajando, cerrarAhora } = useInactividad({
    minutos,
    habilitado: !!user,
  })

  if (!user) return null

  return (
    <AvisoInactividad
      abierto={fase !== 'activa'}
      cerrando={fase === 'expirada'}
      restanteMs={restanteMs}
      avisoMs={avisoMsPara(minutos * 60_000)}
      onSeguir={seguirTrabajando}
      onCerrarSesion={cerrarAhora}
    />
  )
}
