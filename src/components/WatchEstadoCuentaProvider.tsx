'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

import { CuentaDesactivadaOverlay } from './auth/CuentaDesactivadaOverlay'

/**
 * Suscripción Realtime al estado de la cuenta del usuario autenticado.
 * Cuando un admin cambia estado a Inactivo, el overlay aparece de inmediato
 * y hace signOut sin esperar el próximo request del middleware.
 */
export function WatchEstadoCuentaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [desactivado, setDesactivado] = useState(false)

  useEffect(() => {
    let channelName: string | null = null

    const suscribir = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      channelName = `cuenta-estado-${user.id}`

      supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'usuarios',
            filter: `id=eq.${user.id}`,
          },
          payload => {
            const nuevo = payload.new as { estado?: string }
            if (nuevo.estado && nuevo.estado !== 'Activo') {
              // Hacer signOut inmediatamente para limpiar la sesión local
              supabase.auth.signOut({ scope: 'local' }).catch(() => null)
              setDesactivado(true)
            }
          }
        )
        .subscribe()
    }

    suscribir()

    // Limpiar canal al desmontar o al hacer logout
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') {
        setDesactivado(false)
        if (channelName) {
          supabase.removeChannel(supabase.channel(channelName))
          channelName = null
        }
      }
    })

    return () => {
      authSub.unsubscribe()
      if (channelName) {
        supabase.removeChannel(supabase.channel(channelName))
      }
    }
  }, [])

  return (
    <>
      {children}
      <CuentaDesactivadaOverlay visible={desactivado} />
    </>
  )
}
