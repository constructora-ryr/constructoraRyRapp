/**
 * ============================================
 * CUSTOM TOASTS - Diseño Moderno y Atractivo
 * ============================================
 *
 * Toasts personalizados con glassmorphism, gradientes y animaciones.
 * Reemplazan los toasts genéricos de Sonner con diseños únicos.
 */

'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================
// TOAST: LOGIN EXITOSO
// ============================================

/**
 * Toast de Login Exitoso - Diseño Limpio con Presencia Visual
 * Sin bordes dobles ni efectos que causen capas visuales
 */
export function showLoginSuccessToast() {
  toast.custom(
    _t => (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className='flex min-w-[300px] items-center gap-3 rounded-xl border border-emerald-500/30 bg-black/25 py-3 pl-3 pr-4 shadow-lg shadow-black/20 backdrop-blur-md'
      >
        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/40'>
          <LogIn className='h-4 w-4 text-emerald-400' strokeWidth={2.5} />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-1.5'>
            <h3 className='text-sm font-semibold text-white'>
              ¡Bienvenido de nuevo!
            </h3>
            <Sparkles className='h-3 w-3 flex-shrink-0 text-yellow-400' />
          </div>
          <p className='mt-0.5 text-xs text-white/60'>
            Redirigiendo al dashboard...
          </p>
        </div>

        <CheckCircle2
          className='h-4 w-4 flex-shrink-0 text-emerald-400'
          strokeWidth={2.5}
        />
      </motion.div>
    ),
    {
      duration: 3000,
      position: 'top-right',
      unstyled: true,
    }
  )
}

// ============================================
// TOAST: SESIÓN POR EXPIRAR (ADVERTENCIA)
// ============================================

interface SessionExpiringToastProps {
  minutes: number
  onKeepAlive: () => void
}

export function showSessionExpiringToast({
  minutes,
  onKeepAlive,
}: SessionExpiringToastProps) {
  toast.custom(
    t => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-[2px] shadow-2xl shadow-orange-500/50'
      >
        {/* Pulso de fondo */}
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-amber-400/30 via-orange-400/30 to-red-400/30' />

        {/* Patrón de advertencia */}
        <div className='bg-grid-white/10 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative min-w-[420px] rounded-2xl bg-white/95 p-4 backdrop-blur-xl dark:bg-gray-900/95'>
          <div className='flex items-start gap-4'>
            {/* Icono animado con pulso */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 animate-pulse rounded-full bg-orange-500 opacity-50 blur-xl' />
                <div className='relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 shadow-lg'>
                  <Clock className='h-7 w-7 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='min-w-0 flex-1'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className='mb-1 flex items-center gap-2'>
                  <AlertTriangle
                    className='h-5 w-5 text-orange-600 dark:text-orange-400'
                    strokeWidth={2.5}
                  />
                  <h3 className='bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-lg font-bold text-transparent'>
                    ⚠️ Sesión por expirar
                  </h3>
                </div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Tu sesión se cerrará en{' '}
                  <span className='font-bold text-orange-600 dark:text-orange-400'>
                    {minutes} {minutes === 1 ? 'minuto' : 'minutos'}
                  </span>
                </p>
                <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                  Por seguridad, cierra automáticamente por inactividad
                </p>
              </motion.div>

              {/* Botón de acción */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onKeepAlive()
                  toast.dismiss(t)
                }}
                className='mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl'
              >
                <ShieldAlert className='h-4 w-4' />
                Mantener sesión activa
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 15000,
      position: 'top-right',
    }
  )
}

// ============================================
// TOAST: SESIÓN CERRADA POR INACTIVIDAD
// ============================================

export function showSessionClosedToast() {
  // ✅ ID único para evitar duplicados
  const toastId = 'session-closed-toast'

  // ✅ Dismiss toast previo si existe
  toast.dismiss(toastId)

  toast.custom(
    _t => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 p-[2px] shadow-2xl shadow-red-500/50'
      >
        {/* Fondo animado */}
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-red-400/20 via-rose-400/20 to-pink-400/20' />

        {/* Patrón */}
        <div className='bg-grid-white/5 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative min-w-[400px] rounded-2xl bg-white/95 p-4 backdrop-blur-xl dark:bg-gray-900/95'>
          <div className='flex items-start gap-4'>
            {/* Icono */}
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 animate-pulse rounded-full bg-red-500 opacity-50 blur-xl' />
                <div className='relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-600 shadow-lg'>
                  <LogOut className='h-6 w-6 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='min-w-0 flex-1'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className='mb-1 flex items-center gap-2'>
                  <XCircle
                    className='h-5 w-5 text-red-600 dark:text-red-400'
                    strokeWidth={2.5}
                  />
                  <h3 className='bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent'>
                    Sesión cerrada
                  </h3>
                </div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Por seguridad, tu sesión se cerró automáticamente
                </p>
                <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                  Detectamos inactividad prolongada • Vuelve a iniciar sesión
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      id: toastId, // ✅ ID único para evitar duplicados
      duration: 5000,
      position: 'top-right',
    }
  )
}

// ============================================
// TOAST: SESIÓN MANTENIDA ACTIVA
// ============================================

export function showSessionKeptAliveToast() {
  toast.custom(
    _t => (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className='relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-xl shadow-blue-500/50'
      >
        <div className='relative min-w-[300px] rounded-xl bg-white/95 p-3 backdrop-blur-xl dark:bg-gray-900/95'>
          <div className='flex items-center gap-3'>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600'>
                <CheckCircle2
                  className='h-5 w-5 text-white'
                  strokeWidth={2.5}
                />
              </div>
            </motion.div>
            <div className='flex-1'>
              <p className='text-sm font-bold text-gray-900 dark:text-white'>
                ✅ Sesión mantenida activa
              </p>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                Temporizador reiniciado correctamente
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 3000,
      position: 'top-right',
    }
  )
}

// ============================================
// TOAST: LOGOUT - Cerrando sesión (Loading)
// ============================================

/**
 * Toast de loading durante el proceso de logout
 * Diseño premium con animaciones y glassmorphism
 * Retorna el ID del toast para poder dismiss después
 */
export function showLoggingOutToast() {
  return toast.custom(
    _t => (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 p-[2px] shadow-2xl shadow-gray-900/50'
      >
        {/* Gradiente animado de fondo */}
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20' />

        {/* Patrón de grid sutil */}
        <div className='bg-grid-white/5 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative min-w-[340px] rounded-2xl bg-white/95 p-4 backdrop-blur-xl dark:bg-gray-900/95'>
          <div className='flex items-center gap-3'>
            {/* Spinner animado con efecto de salida */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                {/* Glow effect */}
                <div className='absolute inset-0 animate-pulse rounded-full bg-blue-500 opacity-40 blur-xl' />

                {/* Icono con gradiente */}
                <div className='relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 shadow-lg'>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <LogOut className='h-6 w-6 text-white' strokeWidth={2.5} />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Texto con animación */}
            <div className='min-w-0 flex-1'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-base font-bold text-transparent'>
                  Cerrando sesión...
                </h3>
                <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                  Finalizando tu sesión de forma segura
                </p>
              </motion.div>
            </div>

            {/* Dots animados */}
            <div className='flex gap-1'>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                  className='h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600'
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: Infinity, // Se dismisses manualmente
      position: 'top-center',
    }
  )
}

// ============================================
// TOAST: LOGOUT - Sesión cerrada (Success)
// ============================================

/**
 * Toast de despedida después de logout exitoso
 */
export function showLogoutToast() {
  toast.custom(
    _t => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 via-blue-700 to-indigo-700 p-[2px] shadow-2xl shadow-blue-500/30'
      >
        {/* Fondo animado */}
        <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20' />

        {/* Patrón de grid */}
        <div className='bg-grid-white/10 absolute inset-0 [mask-image:radial-gradient(white,transparent_70%)]' />

        {/* Contenido */}
        <div className='relative min-w-[360px] rounded-2xl bg-white/95 p-4 backdrop-blur-xl dark:bg-gray-900/95'>
          <div className='flex items-start gap-3'>
            {/* Icono animado con rotación */}
            <motion.div
              initial={{ rotate: 0, scale: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0], scale: 1 }}
              transition={{
                rotate: { duration: 0.5 },
                scale: { type: 'spring', stiffness: 200 },
              }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 animate-pulse rounded-full bg-blue-500 opacity-50 blur-xl' />
                <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg'>
                  <LogOut className='h-5 w-5 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='min-w-0 flex-1'>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-base font-bold text-transparent'>
                  Sesión cerrada
                </h3>
                <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                  ¡Hasta pronto! 👋
                </p>
              </motion.div>
            </div>

            {/* Check animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2
                className='h-5 w-5 text-blue-600 dark:text-blue-400'
                strokeWidth={2.5}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 3000,
      position: 'top-center',
    }
  )
}

// ============================================
// TOAST: LOGOUT - Error (Failure)
// ============================================

/**
 * Toast de error si el logout falla
 */
export function showLogoutErrorToast() {
  toast.custom(
    _t => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-[2px] shadow-2xl shadow-red-500/50'
      >
        {/* Contenido */}
        <div className='relative min-w-[340px] rounded-2xl bg-white/95 p-4 backdrop-blur-xl dark:bg-gray-900/95'>
          <div className='flex items-start gap-3'>
            {/* Icono de error */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className='flex-shrink-0'
            >
              <div className='relative'>
                <div className='absolute inset-0 rounded-full bg-red-500 opacity-50 blur-xl' />
                <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-rose-600 shadow-lg'>
                  <XCircle className='h-5 w-5 text-white' strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>

            {/* Texto */}
            <div className='min-w-0 flex-1'>
              <h3 className='text-base font-bold text-red-600 dark:text-red-400'>
                Error al cerrar sesión
              </h3>
              <p className='mt-0.5 text-sm text-gray-700 dark:text-gray-300'>
                Intenta nuevamente o recarga la página
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 4000,
      position: 'top-center',
    }
  )
}

// ============================================
// TOAST: ENTIDAD ACTUALIZADA CON ÉXITO
// ============================================

interface ShowEntitySuccessToastProps {
  entityName: string
  action: 'created' | 'updated'
}

export function showEntitySuccessToast({
  entityName,
  action,
}: ShowEntitySuccessToastProps) {
  const isCreated = action === 'created'

  toast.custom(
    _t => (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className='flex min-w-[320px] items-center gap-3 rounded-xl border border-emerald-500/30 bg-black/25 py-3 pl-3 pr-4 shadow-lg shadow-black/20 backdrop-blur-md'
      >
        <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/40'>
          <CheckCircle2
            className='h-5 w-5 text-emerald-400'
            strokeWidth={2.5}
          />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-1.5'>
            <h3 className='text-sm font-semibold text-white'>
              {isCreated ? 'Creado exitosamente' : 'Cambios guardados'}
            </h3>
            {isCreated && (
              <Sparkles className='h-3.5 w-3.5 flex-shrink-0 text-yellow-400' />
            )}
          </div>
          <p className='mt-0.5 text-xs text-white/60'>
            {isCreated
              ? `${entityName} ya está disponible`
              : `${entityName} se actualizó correctamente`}
          </p>
        </div>

        <CheckCircle2
          className='h-5 w-5 flex-shrink-0 text-emerald-400'
          strokeWidth={2.5}
        />
      </motion.div>
    ),
    {
      duration: 3000,
      position: 'top-right',
      unstyled: true,
    }
  )
}
