'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Clock, LogOut, MousePointer2 } from 'lucide-react'

import Image from 'next/image'

interface IdleWarningModalProps {
  isOpen: boolean
  remainingSeconds: number
  level: 'info' | 'warning' | 'critical'
  isLoggingOut?: boolean
  onKeepAlive: () => void
  onLogout?: () => void
}

const LEVEL_CONFIG = {
  info: {
    title: 'Inactividad detectada',
    icon: Clock,
    gradient: 'from-gray-800 via-gray-700 to-gray-900',
    iconBg: 'bg-gray-700',
    borderColor: 'border-gray-600',
    message: 'Detectamos que has estado inactivo por un tiempo.',
  },
  warning: {
    title: '⚠️ Tu sesión está por expirar',
    icon: AlertTriangle,
    gradient: 'from-red-700 via-red-600 to-red-800',
    iconBg: 'bg-red-600',
    borderColor: 'border-red-500',
    message:
      'Por seguridad, cerraremos tu sesión pronto si no detectamos actividad.',
  },
  critical: {
    title: 'ðŸš¨ Tu sesión está por expirar',
    icon: AlertTriangle,
    gradient: 'from-red-700 via-red-600 to-red-800',
    iconBg: 'bg-red-600',
    borderColor: 'border-red-500',
    message:
      'Por seguridad, cerraremos tu sesión pronto si no detectamos actividad.',
  },
}

export function IdleWarningModal({
  isOpen,
  remainingSeconds,
  level,
  isLoggingOut = false,
  onKeepAlive,
  onLogout,
}: IdleWarningModalProps) {
  const [countdown, setCountdown] = useState(remainingSeconds)
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false)
  const [isClosingSession, setIsClosingSession] = useState(false)
  const config = LEVEL_CONFIG[level]

  // Inicializar countdown cuando se abre el modal
  useEffect(() => {
    if (isOpen && remainingSeconds > 0) {
      setCountdown(remainingSeconds)
      setHasStartedCountdown(true)
    }
  }, [isOpen, remainingSeconds])

  // Countdown timer - SOLO depende de isOpen, NO de countdown
  useEffect(() => {
    if (!isOpen) {
      setHasStartedCountdown(false)
      return
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 0
        }
        const newValue = prev - 1
        // Solo loggear cada 5 segundos para reducir ruido
        if (newValue % 5 === 0 || newValue <= 5) {
        }
        return newValue
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [isOpen])

  // ðŸš¨ CRÍTICO: Cerrar sesión automáticamente cuando llegue a 0 (SOLO si ya empezó countdown)
  useEffect(() => {
    if (
      countdown === 0 &&
      hasStartedCountdown &&
      isOpen &&
      onLogout &&
      !isLoggingOut &&
      !isClosingSession
    ) {
      setIsClosingSession(true)
      // Guardar razón de logout para mostrar pantalla explicativa
      sessionStorage.setItem('logout_reason', 'inactivity')
      sessionStorage.setItem('logout_timestamp', Date.now().toString())
      onLogout()
    }
  }, [
    countdown,
    hasStartedCountdown,
    isOpen,
    onLogout,
    isLoggingOut,
    isClosingSession,
  ])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm'
            onClick={onKeepAlive}
          />

          {/* Modal - CENTRADO ABSOLUTO */}
          <div className='fixed inset-0 z-[10000] flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className='w-full max-w-md'
            >
              <div
                className={`relative overflow-hidden rounded-2xl border-2 bg-white shadow-2xl dark:bg-gray-900 ${config.borderColor}`}
              >
                {/* Header con gradiente RyR */}
                <div
                  className={`relative overflow-hidden bg-gradient-to-r ${config.gradient} px-6 py-4`}
                >
                  <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

                  <div className='relative z-10 flex items-center gap-3'>
                    <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm'>
                      <AlertTriangle className='h-6 w-6 text-white' />
                    </div>

                    <div className='min-w-0 flex-1'>
                      <h3 className='text-lg font-bold leading-tight text-white'>
                        {config.title}
                      </h3>
                      <p className='text-sm leading-tight text-white/90'>
                        Sistema de seguridad
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className='space-y-4 p-6'>
                  {/* Logo RyR - MÁS VISIBLE */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: level === 'critical' ? [0, -3, 3, -3, 3, 0] : 0,
                    }}
                    transition={{
                      opacity: { duration: 0.3 },
                      scale: { duration: 0.3 },
                      rotate: {
                        duration: 0.5,
                        repeat: level === 'critical' ? Infinity : 0,
                        repeatDelay: 2,
                      },
                    }}
                    className='mb-2 flex justify-center'
                  >
                    <div className='relative h-24 w-32'>
                      <Image
                        src='/images/logo1-dark.png'
                        alt='Constructora RyR'
                        width={128}
                        height={96}
                        className='h-full w-full object-contain'
                        style={{
                          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
                        }}
                        loading='lazy'
                        unoptimized
                      />
                    </div>
                  </motion.div>

                  {/* Mensaje */}
                  <p className='text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                    {config.message}
                  </p>

                  {/* Countdown o Loading State */}
                  <div className='flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900'>
                    {isClosingSession ? (
                      <>
                        <div className='h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent' />
                        <div className='text-center'>
                          <div className='text-sm font-semibold text-red-600 dark:text-red-400'>
                            Cerrando sesión...
                          </div>
                          <div className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            Un momento por favor
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Clock className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                        <div className='text-center'>
                          <div className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold tabular-nums text-transparent dark:from-white dark:to-gray-300'>
                            {minutes.toString().padStart(2, '0')}:
                            {seconds.toString().padStart(2, '0')}
                          </div>
                          <div className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                            {minutes > 0
                              ? `${minutes} minuto${minutes !== 1 ? 's' : ''}`
                              : `${seconds} segundos`}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Barra de progreso - Colores RyR */}
                  <div className='relative h-3 overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-800'>
                    <motion.div
                      className='absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-red-500 to-red-700 shadow-lg'
                      initial={{ width: '100%' }}
                      animate={{
                        width: `${(countdown / remainingSeconds) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>

                  {/* Acciones - Botón RyR */}
                  <div className='flex gap-3 pt-2'>
                    <motion.button
                      whileHover={{ scale: isClosingSession ? 1 : 1.02 }}
                      whileTap={{ scale: isClosingSession ? 1 : 0.98 }}
                      onClick={onKeepAlive}
                      disabled={isLoggingOut || isClosingSession}
                      className='inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-800 px-4 py-3.5 font-semibold text-white shadow-lg transition-all hover:from-red-800 hover:via-red-700 hover:to-red-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <MousePointer2 className='h-5 w-5' />
                      Mantener sesión activa
                    </motion.button>

                    {onLogout && (
                      <motion.button
                        whileHover={{
                          scale: isLoggingOut || isClosingSession ? 1 : 1.02,
                        }}
                        whileTap={{
                          scale: isLoggingOut || isClosingSession ? 1 : 0.98,
                        }}
                        onClick={onLogout}
                        disabled={isLoggingOut || isClosingSession}
                        className='min-w-[56px] rounded-xl bg-gray-100 px-4 py-3.5 font-medium text-gray-700 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        title={
                          isLoggingOut
                            ? 'Cerrando sesión...'
                            : 'Cerrar sesión ahora'
                        }
                      >
                        {isLoggingOut ? (
                          <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent' />
                        ) : (
                          <LogOut className='h-5 w-5' />
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Info adicional - Colores RyR */}
                  <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20'>
                    <Clock className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
                    <p className='text-xs text-red-700 dark:text-red-300'>
                      <strong>Medida de seguridad:</strong> Tu sesión se cierra
                      automáticamente después de 1 hora de inactividad para
                      proteger tu información.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
