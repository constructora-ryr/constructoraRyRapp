'use client'

import { useCallback, useRef, useState } from 'react'

import { Clock } from 'lucide-react'
import { toast } from 'sonner'

import { IdleWarningModal } from '@/components/modals/IdleWarningModal'
import { IconoToast } from '@/components/toasts/toast-estilos'
import { useAuth } from '@/contexts/auth-context'
import { useLogoutMutation } from '@/hooks/auth'
import { useIdleTimer, type IdleWarningLevel } from '@/hooks/useIdleTimer'

export function IdleTimerProvider() {
  const { user } = useAuth()
  const { mutate: logout } = useLogoutMutation()

  const [modalState, setModalState] = useState<{
    isOpen: boolean
    level: IdleWarningLevel
    remainingSeconds: number
  }>({
    isOpen: false,
    level: 'info',
    remainingSeconds: 0,
  })

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Ref para keepAlive: se necesita en handleWarning (toast) pero keepAlive
  // viene del hook que aún no se inicializó — ref rompe la dependencia circular
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const keepAliveRef = useRef<() => void>(() => {})

  // ── Callbacks estables ────────────────────────────────────
  const handleWarning = useCallback(
    (
      level: IdleWarningLevel,
      remainingMinutes: number,
      remainingSeconds: number
    ) => {
      if (level === 'warning' || level === 'critical') {
        setModalState({ isOpen: true, level, remainingSeconds })
        return
      }

      // Nivel info: solo toast informativo
      toast.info('Inactividad detectada', {
        description: `Tu sesión expirará en ${remainingMinutes} minuto${
          remainingMinutes !== 1 ? 's' : ''
        } si no detectamos actividad.`,
        icon: <IconoToast tipo='info' icon={Clock} />,
        action: {
          label: 'Mantener activa',
          onClick: () => keepAliveRef.current(),
        },
        duration: 10000,
      })
    },
    [] // ✅ Sin deps: usa solo keepAliveRef (ref estable)
  )

  const handleTimeout = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }))
    setIsLoggingOut(true)
    logout(undefined, {
      onSuccess: () => {
        window.location.href = '/login'
      },
      onError: () => {
        window.location.href = '/login'
      },
    })
  }, [logout])

  // ── Inicializar hook ──────────────────────────────────────
  const { keepAlive } = useIdleTimer({
    timeoutMinutes: 60,
    modalIsOpen: modalState.isOpen,
    onWarning: handleWarning,
    onTimeout: handleTimeout,
  })

  // Mantener ref actualizada sin crear dependencia circular
  keepAliveRef.current = keepAlive

  // Si no hay usuario, no renderizar nada
  if (!user) return null

  return (
    <IdleWarningModal
      isOpen={modalState.isOpen}
      level={modalState.level}
      remainingSeconds={modalState.remainingSeconds}
      isLoggingOut={isLoggingOut}
      onKeepAlive={() => {
        setModalState({ isOpen: false, level: 'info', remainingSeconds: 0 })
        keepAlive()
      }}
      onLogout={() => {
        setIsLoggingOut(true)
        sessionStorage.setItem('logout_reason', 'inactivity')
        sessionStorage.setItem('logout_timestamp', Date.now().toString())
        logout(undefined, {
          onSuccess: () => {
            window.location.href = '/login'
          },
          onError: () => {
            setIsLoggingOut(false)
            window.location.href = '/login'
          },
        })
      }}
    />
  )
}
