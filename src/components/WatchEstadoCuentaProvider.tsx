'use client'

import { useEffect, useRef, useState } from 'react'

import { supabase } from '@/lib/supabase/client'

import { CuentaDesactivadaOverlay } from './auth/CuentaDesactivadaOverlay'

const POLL_INTERVAL_MS = 20_000 // verificar cada 20 segundos como fallback

/**
 * Detecta en tiempo real cuando un admin desactiva la cuenta del usuario actual.
 *
 * Estrategia dual:
 * 1. Supabase Realtime (postgres_changes) — instantáneo si la tabla está
 *    en supabase_realtime publication:
 *    `ALTER PUBLICATION supabase_realtime ADD TABLE public.usuarios;`
 * 2. Polling cada 20s + al recuperar foco de ventana — garantía de respaldo.
 */
export function WatchEstadoCuentaProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [desactivado, setDesactivado] = useState(false)
  const desactivadoRef = useRef(false)

  // Marca desactivado solo una vez para evitar múltiples signOuts
  const activarDesactivado = async () => {
    if (desactivadoRef.current) return
    desactivadoRef.current = true
    await supabase.auth.signOut({ scope: 'local' }).catch(() => null)
    setDesactivado(true)
  }

  useEffect(() => {
    let channelRef: ReturnType<typeof supabase.channel> | null = null
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let userId: string | null = null

    const verificarEstado = async () => {
      if (!userId || desactivadoRef.current) return
      const { data } = await supabase
        .from('usuarios')
        .select('estado')
        .eq('id', userId)
        .maybeSingle()
      if (data && data.estado !== 'Activo') {
        activarDesactivado()
      }
    }

    const iniciar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      userId = user.id

      // ── 1. Realtime (instantáneo si la publicación está configurada) ──
      channelRef = supabase
        .channel(`cuenta-estado-${user.id}`)
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
              activarDesactivado()
            }
          }
        )
        .subscribe()

      // ── 2. Polling cada 20s (fallback si Realtime no está configurado) ──
      pollTimer = setInterval(verificarEstado, POLL_INTERVAL_MS)

      // ── 3. Al recuperar foco de pestaña ──
      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          verificarEstado()
        }
      }
      document.addEventListener('visibilitychange', onVisibilityChange)

      return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    }

    let cleanupVisibility: (() => void) | undefined

    iniciar().then(cleanup => {
      cleanupVisibility = cleanup
    })

    // Limpiar al logout
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') {
        desactivadoRef.current = false
        setDesactivado(false)
        userId = null
        if (channelRef) {
          supabase.removeChannel(channelRef)
          channelRef = null
        }
        if (pollTimer) {
          clearInterval(pollTimer)
          pollTimer = null
        }
      }
    })

    return () => {
      authSub.unsubscribe()
      cleanupVisibility?.()
      if (channelRef) supabase.removeChannel(channelRef)
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [])

  return (
    <>
      {children}
      <CuentaDesactivadaOverlay visible={desactivado} />
    </>
  )
}
