'use client'

import { useCallback, useRef, useState } from 'react'

import { toast } from 'sonner'

import { IdleWarningModal } from '@/components/modals/IdleWarningModal'
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
      toast.custom(
        t => (
          <div className='flex w-full max-w-md items-start gap-3 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 shadow-2xl animate-in slide-in-from-right dark:border-blue-700'>
            <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
              <svg
                className='h-6 w-6 text-white'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>

            <div className='min-w-0 flex-1'>
              <h3 className='mb-1 text-sm font-bold text-white'>
                ⏱️ Inactividad detectada
              </h3>
              <p className='text-xs leading-relaxed text-blue-100'>
                Tu sesión expirará en{' '}
                <strong className='font-bold'>
                  {remainingMinutes} minuto{remainingMinutes !== 1 ? 's' : ''}
                </strong>{' '}
                si no detectamos actividad.
              </p>
            </div>

            <button
              onClick={() => {
                keepAliveRef.current()
                toast.dismiss(t)
              }}
              className='flex-shrink-0 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30'
            >
              Mantener activa
            </button>
          </div>
        ),
        { duration: 10000 }
      )
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
