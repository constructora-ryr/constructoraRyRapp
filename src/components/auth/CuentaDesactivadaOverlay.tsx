'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { LogIn, ShieldOff, UserX } from 'lucide-react'

import Image from 'next/image'

interface Props {
  visible: boolean
}

export function CuentaDesactivadaOverlay({ visible }: Props) {
  const [segundos, setSegundos] = useState(5)

  useEffect(() => {
    if (!visible) return

    if (segundos <= 0) {
      window.location.href = '/login?desactivado=1'
      return
    }

    const timer = setTimeout(() => setSegundos(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [visible, segundos])

  if (!visible) return null

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 sm:p-6'>
      {/* Fondo */}
      <div className='absolute inset-0'>
        <Image
          src='/images/fondo-login.png'
          alt='Fondo'
          fill
          sizes='100vw'
          className='object-cover object-center'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/85 to-gray-900/90' />
      </div>

      <div className='relative z-10 flex w-full max-w-md flex-col items-center gap-4 sm:max-w-lg sm:gap-6'>
        {/* Logo */}
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
          />
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className='w-full'
        >
          <div className='overflow-hidden rounded-2xl border border-orange-200/50 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-orange-900/50 dark:bg-gray-900/95'>
            {/* Header */}
            <div className='relative overflow-hidden bg-gradient-to-r from-orange-700 via-orange-600 to-red-700 px-4 py-4 sm:px-6 sm:py-5'>
              <div className='relative z-10 flex items-center gap-3 sm:gap-4'>
                <motion.div
                  initial={{ rotate: -20, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14'
                >
                  <ShieldOff className='h-6 w-6 text-white sm:h-7 sm:w-7' />
                </motion.div>
                <div className='min-w-0 flex-1'>
                  <h1 className='mb-0.5 text-lg font-bold leading-tight text-white sm:text-xl'>
                    Acceso desactivado
                  </h1>
                  <p className='text-xs leading-tight text-orange-100 sm:text-sm'>
                    Un administrador ha desactivado tu cuenta
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className='space-y-4 p-4 sm:p-5'>
              <div className='flex items-start gap-2.5 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-3 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-amber-950/30 sm:gap-3 sm:p-4'>
                <UserX className='mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400 sm:h-5 sm:w-5' />
                <div className='min-w-0'>
                  <h3 className='mb-1 text-xs font-bold text-orange-900 dark:text-orange-100 sm:text-sm'>
                    ¿Qué significa esto?
                  </h3>
                  <p className='text-xs leading-relaxed text-orange-800 dark:text-orange-200 sm:text-sm'>
                    Tu acceso al sistema ha sido{' '}
                    <strong className='font-bold'>
                      desactivado temporalmente
                    </strong>{' '}
                    por un administrador. No podrás ingresar hasta que sea
                    reactivado.
                  </p>
                </div>
              </div>

              <div className='rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700/50 dark:bg-gray-800/50 sm:p-4'>
                <p className='text-center text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:text-sm'>
                  Si crees que esto es un error, contacta al administrador del
                  sistema para reactivar tu cuenta.
                </p>
              </div>

              {/* Botón con countdown */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => {
                    window.location.href = '/login?desactivado=1'
                  }}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-700 via-orange-600 to-red-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-orange-800 hover:via-orange-700 hover:to-red-800 hover:shadow-xl sm:py-3.5 sm:text-base'
                >
                  <LogIn className='h-4 w-4 sm:h-5 sm:w-5' />
                  Ir al login
                  <span className='ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold'>
                    {segundos}s
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
