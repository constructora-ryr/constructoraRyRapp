'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { Clock, Info, LogIn, ShieldAlert } from 'lucide-react'

import Image from 'next/image'

export function SessionClosedByInactivity() {
  const [timestamp, setTimestamp] = useState<string>('')
  const [minutesAgo, setMinutesAgo] = useState<number>(0)

  useEffect(() => {
    // Leer timestamp del sessionStorage
    const logoutTimestamp = sessionStorage.getItem('logout_timestamp')
    if (logoutTimestamp) {
      const date = new Date(parseInt(logoutTimestamp))
      // Formato 12 horas con AM/PM
      setTimestamp(
        date.toLocaleTimeString('es-CO', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )

      const minutes = Math.floor(
        (Date.now() - parseInt(logoutTimestamp)) / 1000 / 60
      )
      setMinutesAgo(minutes)
    }

    // Limpiar sessionStorage después de leer
    sessionStorage.removeItem('logout_reason')
    sessionStorage.removeItem('logout_timestamp')
  }, [])

  return (
    <div className='relative flex h-screen min-h-screen items-center justify-center overflow-hidden p-3 sm:p-6'>
      {/* Fondo con imagen de construcción (FULL SCREEN - igual que login) */}
      <div className='fixed inset-0 z-0 h-full w-full'>
        <Image
          src='/images/fondo-login.png'
          alt='Fondo Constructora RyR'
          fill
          sizes='100vw'
          className='object-cover object-center'
          loading='eager'
          fetchPriority='low'
          quality={90}
        />
        {/* Overlay oscuro para legibilidad */}
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900/85 via-black/80 to-gray-900/85' />
      </div>

      {/* Contenido centrado - RESPONSIVE - SIN SCROLL INNECESARIO */}
      <div className='relative z-10 flex w-full max-w-md flex-col items-center gap-4 sm:max-w-lg sm:gap-6'>
        {/* Logo RyR (más pequeño en móvil) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='relative h-16 w-48 flex-shrink-0 sm:h-20 sm:w-64'
        >
          <Image
            src='/images/logo1-dark.png'
            alt='Logo Constructora RyR'
            fill
            sizes='(max-width: 640px) 192px, 256px'
            className='object-contain drop-shadow-2xl'
            style={{
              filter:
                'drop-shadow(0 0 40px rgba(255,255,255,0.3)) brightness(1.1) contrast(1.1)',
            }}
            priority
            fetchPriority='high'
          />
        </motion.div>

        {/* Modal Card - COLORES RyR (Rojo/Negro) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className='w-full flex-shrink-0'
        >
          <div className='relative overflow-hidden rounded-2xl border border-red-200/50 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-red-900/50 dark:bg-gray-900/95'>
            {/* Header con gradiente RyR (Rojo/Negro) */}
            <div className='relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-800 px-4 py-4 sm:px-6 sm:py-5'>
              <div className='bg-grid-white/10 absolute inset-0 [mask-image:linear-gradient(0deg,transparent,black,transparent)]' />

              <div className='relative z-10 flex items-center gap-3 sm:gap-4'>
                <motion.div
                  initial={{ rotate: -20, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                >
                  <Clock className='h-6 w-6 text-white sm:h-7 sm:w-7' />
                </motion.div>

                <div className='min-w-0 flex-1'>
                  <h1 className='mb-0.5 text-lg font-bold leading-tight text-white sm:text-xl'>
                    Sesión cerrada por inactividad
                  </h1>
                  <p className='text-xs leading-tight text-red-100 sm:text-sm'>
                    Por tu seguridad, hemos cerrado tu sesión automáticamente
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del modal - MÁS COMPACTO */}
            <div className='space-y-4 p-4 sm:p-5'>
              {/* Explicación principal con colores RyR */}
              <div className='flex items-start gap-2.5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30 sm:gap-3 sm:p-4'>
                <ShieldAlert className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5' />
                <div className='min-w-0'>
                  <h3 className='mb-1 text-xs font-bold text-amber-900 dark:text-amber-100 sm:text-sm'>
                    ¿Por qué se cerró mi sesión?
                  </h3>
                  <p className='text-xs leading-relaxed text-amber-800 dark:text-amber-200 sm:text-sm'>
                    Tu sesión se cerró automáticamente después de{' '}
                    <strong className='font-bold'>1 hora de inactividad</strong>{' '}
                    para proteger tu información y la de los clientes.
                  </p>
                </div>
              </div>

              {/* Timestamp del cierre */}
              {timestamp && (
                <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700/50 dark:bg-gray-800/50 sm:gap-3 sm:p-3'>
                  <Info className='h-3.5 w-3.5 flex-shrink-0 text-gray-600 dark:text-gray-400 sm:h-4 sm:w-4' />
                  <p className='text-xs leading-tight text-gray-600 dark:text-gray-400 sm:text-sm'>
                    Sesión cerrada a las{' '}
                    <strong className='font-semibold text-gray-900 dark:text-white'>
                      {timestamp}
                    </strong>
                    {minutesAgo > 0 && (
                      <span className='text-gray-500 dark:text-gray-500'>
                        {' '}
                        • Hace {minutesAgo} min{minutesAgo !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Cómo funciona - MÁS COMPACTO */}
              <div className='space-y-2.5'>
                <h3 className='flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white sm:text-sm'>
                  <Clock className='h-3.5 w-3.5 text-red-600 dark:text-red-400 sm:h-4 sm:w-4' />
                  ¿Cómo funciona el sistema?
                </h3>

                <ul className='space-y-1.5 text-xs text-gray-700 dark:text-gray-300 sm:text-sm'>
                  <li className='flex items-start gap-2'>
                    <span className='mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400 sm:h-1.5 sm:w-1.5' />
                    <span className='leading-tight'>
                      Detecta cuando no hay{' '}
                      <strong className='font-semibold'>
                        ninguna interacción
                      </strong>
                    </span>
                  </li>

                  <li className='flex items-start gap-2'>
                    <span className='mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400 sm:h-1.5 sm:w-1.5' />
                    <span className='leading-tight'>
                      Recibes{' '}
                      <strong className='font-semibold'>advertencias</strong> a
                      los 50, 55 y 58 minutos
                    </span>
                  </li>

                  <li className='flex items-start gap-2'>
                    <span className='mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400 sm:h-1.5 sm:w-1.5' />
                    <span className='leading-tight'>
                      Se cierra{' '}
                      <strong className='font-semibold'>
                        automáticamente a los 60 minutos
                      </strong>
                    </span>
                  </li>

                  <li className='flex items-start gap-2'>
                    <span className='mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-600 dark:bg-red-400 sm:h-1.5 sm:w-1.5' />
                    <span className='leading-tight'>
                      Clic en{' '}
                      <strong className='font-semibold'>
                        &quot;Mantener sesión activa&quot;
                      </strong>{' '}
                      reinicia el contador
                    </span>
                  </li>
                </ul>
              </div>

              {/* Seguridad - Colores RyR */}
              <div className='rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-gray-50 p-3 dark:border-red-900/50 dark:from-red-950/30 dark:to-gray-950/30 sm:p-4'>
                <div className='flex items-start gap-2.5 sm:gap-3'>
                  <ShieldAlert className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400 sm:h-5 sm:w-5' />
                  <div className='min-w-0'>
                    <h4 className='mb-1 text-xs font-bold text-red-900 dark:text-red-100 sm:text-sm'>
                      Tu seguridad es nuestra prioridad
                    </h4>
                    <p className='text-xs leading-relaxed text-red-800 dark:text-red-200 sm:text-sm'>
                      Este sistema protege información sensible contra accesos
                      no autorizados cuando dejas tu computadora desatendida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón de login - COLORES RyR */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => {
                    // Limpiar sessionStorage específico de logout
                    sessionStorage.removeItem('logout_reason')
                    sessionStorage.removeItem('logout_timestamp')
                    // Navegar al login normal
                    window.location.href = '/login'
                  }}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-800 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-800 hover:via-red-700 hover:to-red-900 hover:shadow-xl sm:py-3.5 sm:text-base'
                >
                  <LogIn className='h-4 w-4 sm:h-5 sm:w-5' />
                  Iniciar sesión nuevamente
                </button>
              </motion.div>

              {/* Footer discreto */}
              <p className='border-t border-gray-200 pt-2 text-center text-[10px] leading-tight text-gray-500 dark:border-gray-700/50 dark:text-gray-400 sm:text-xs'>
                Si necesitas más tiempo, contacta al administrador
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
