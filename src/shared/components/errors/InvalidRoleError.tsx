/**
 * ============================================
 * COMPONENTE: InvalidRoleError
 * ============================================
 *
 * Pantalla de error cuando se detecta un rol no válido en el sistema.
 * Muestra información útil y opciones de recuperación.
 *
 * ✅ SEPARACIÓN DE RESPONSABILIDADES:
 * - Componente: Solo UI presentacional
 * - Hook (useInvalidRoleError): Lógica de negocio
 */

'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  LogOut,
  Mail,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'

import Image from 'next/image'

import { useInvalidRoleError } from './useInvalidRoleError'

interface InvalidRoleErrorProps {
  detectedRole: string
  userEmail?: string
  // ❌ ELIMINADO: validRoles (información sensible)
}

export function InvalidRoleError({
  detectedRole: _detectedRole,
  userEmail: _userEmail,
}: InvalidRoleErrorProps) {
  // ✅ Lógica extraída a hook personalizado
  const {
    mounted,
    handleSignOut,
    handleRefresh,
    logoHorizontal,
    logoCircular,
  } = useInvalidRoleError()

  // Mientras carga, mostrar spinner
  if (!mounted) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-red-600' />
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6 dark:from-gray-900 dark:via-red-950/20 dark:to-orange-950/20'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-2xl'
      >
        {/* Logo Horizontal - Arriba (Responsive) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mb-4 flex justify-center sm:mb-6'
        >
          <Image
            src={logoHorizontal}
            alt='Constructora RyR'
            width={220}
            height={66}
            className='h-auto w-40 sm:w-[220px]'
            priority
          />
        </motion.div>

        {/* Card Principal */}
        <div className='overflow-hidden rounded-2xl border-2 border-red-200 bg-white shadow-2xl dark:border-red-800 dark:bg-gray-800'>
          {/* Header con Gradiente (Responsive) */}
          <div className='bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-4 text-white sm:p-6 md:p-8'>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md sm:h-14 sm:w-14 sm:rounded-2xl md:h-16 md:w-16'>
                <ShieldAlert className='h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10' />
              </div>
              <div className='min-w-0'>
                <h1 className='text-xl font-bold sm:text-2xl md:text-3xl'>
                  Acceso Restringido
                </h1>
                <p className='mt-0.5 text-xs text-red-100 sm:mt-1 sm:text-sm'>
                  Tu cuenta no tiene autorización para acceder
                </p>
              </div>
            </div>
          </div>

          {/* Contenido (Responsive) */}
          <div className='space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8'>
            {/* Información del Error - SIN DETALLES SENSIBLES */}
            <div className='rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 sm:p-6'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400' />
                <div className='flex-1 space-y-2'>
                  <h3 className='font-bold text-red-900 dark:text-red-100'>
                    Acceso No Autorizado
                  </h3>
                  <div className='text-sm text-red-800 dark:text-red-200'>
                    <p>
                      Tu cuenta no tiene permisos válidos para acceder a este
                      sistema. Por favor, contacta al administrador para
                      resolver este problema.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de Ayuda - SIN INFORMACIÓN DEL SISTEMA */}
            <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20 sm:p-6'>
              <div className='flex items-start gap-3'>
                <Mail className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
                <div className='flex-1'>
                  <h3 className='mb-2 font-bold text-amber-900 dark:text-amber-100'>
                    ¿Qué puedes hacer?
                  </h3>
                  <ul className='list-inside list-disc space-y-1 text-sm text-amber-800 dark:text-amber-200'>
                    <li>Contacta al administrador del sistema</li>
                    <li>
                      Verifica que tu cuenta esté activa y correctamente
                      configurada
                    </li>
                    <li>Cierra sesión e intenta con otra cuenta</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Acciones (Responsive) */}
            <div className='flex flex-col gap-3 pt-3 sm:pt-4'>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignOut}
                className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-red-700 hover:to-rose-700 hover:shadow-xl'
              >
                <LogOut className='h-5 w-5' />
                Cerrar Sesión
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-gray-700 hover:to-gray-800 hover:shadow-xl'
              >
                <RefreshCw className='h-5 w-5' />
                Reintentar
              </motion.button>
            </div>
          </div>
        </div>

        {/* Footer con Logo Circular (Responsive) */}
        <div className='mt-6 space-y-2 text-center sm:mt-8 sm:space-y-3'>
          <div className='mb-1 flex justify-center sm:mb-2'>
            <Image
              src={logoCircular}
              alt='RyR'
              width={48}
              height={48}
              className='h-10 w-10 opacity-60 sm:h-12 sm:w-12'
            />
          </div>
          <p className='text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm'>
            Sistema de Gestión Integral
          </p>

          <p className='px-4 text-xs text-gray-600 dark:text-gray-400 sm:text-sm'>
            ¿Necesitas ayuda?{' '}
            <a
              href='mailto:soporte@constructoraryr.com'
              className='font-semibold text-red-600 hover:underline dark:text-red-400'
            >
              Contacta a Soporte Técnico
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
