'use client'

import { useEffect, useState } from 'react'

import { type Session } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Shield } from 'lucide-react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/utils/logger'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState<boolean | null>(null)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const _code = urlParams.get('code')
    const error = urlParams.get('error')
    const errorCode = urlParams.get('error_code')
    const errorDescription = urlParams.get('error_description')

    if (error) {
      logger.error('Error en URL de reset:', {
        error,
        errorCode,
        errorDescription,
      })
      setError(errorDescription || 'El enlace es inválido o ha expirado')
      setValidToken(false)
      return
    }

    let mounted = true
    let sessionDetected = false

    // Listener para auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
        !sessionDetected
      ) {
        if (session && mounted) {
          sessionDetected = true
          setCurrentSession(session) // GUARDAR SESIÓN
          setValidToken(true)
        } else {
          logger.warn(
            '⚠️ Evento detectado pero sin sesión o componente desmontado'
          )
        }
      } else if (event === 'SIGNED_OUT') {
      } else if (event === 'TOKEN_REFRESHED') {
      }
    })

    // Verificar sesión inmediatamente por si ya existe
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          logger.error('Error al obtener sesión:', error)
        }

        if (session && mounted && !sessionDetected) {
          sessionDetected = true
          setCurrentSession(session) // GUARDAR SESIÓN
          setValidToken(true)
        } else if (!session && mounted) {
        } else if (sessionDetected) {
        }
      })
      .catch(err => {
        logger.error('Excepción en getSession():', err)
      })

    // Timeout de seguridad
    const timeout = setTimeout(() => {
      if (!sessionDetected && mounted) {
        logger.error(
          'Timeout alcanzado sin detectar sesión: el enlace puede ser inválido o haber expirado'
        )
        setValidToken(false)
        setError(
          'El enlace ha expirado o es inválido. Por favor, solicita uno nuevo.'
        )
      }
    }, 15000)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      if (!currentSession) {
        throw new Error(
          'No hay sesión activa. Por favor, solicita un nuevo enlace.'
        )
      }

      // Usar API REST directamente con el access token de la sesión guardada
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentSession.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
          },
          body: JSON.stringify({
            password: password,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        const errorMsg =
          result.msg ||
          result.message ||
          result.error_description ||
          'Error al actualizar contraseña'
        logger.error('Error al actualizar contraseña:', {
          status: response.status,
          error: errorMsg,
          body: result,
        })

        const mensajeTraducido = traducirErrorSupabase(errorMsg)
        setError(mensajeTraducido)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      setTimeout(async () => {
        try {
          // Intentar signOut (puede colgarse, por eso usamos timeout)
          const signOutPromise = supabase.auth.signOut()
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject('timeout'), 1000)
          )

          await Promise.race([signOutPromise, timeoutPromise])
            .then(() => logger.info('SignOut exitoso'))
            .catch(_err => {
              // Limpiar cookies manualmente
              document.cookie.split(';').forEach(c => {
                document.cookie = c
                  .replace(/^ +/, '')
                  .replace(
                    /=.*/,
                    '=;expires=' + new Date().toUTCString() + ';path=/'
                  )
              })
            })
        } catch (error) {
          logger.error('Error inesperado en signOut:', error)
        }

        window.location.href = '/login'
      }, 2000)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.error('Excepción general en handleSubmit:', error)

      const mensajeTraducido = traducirErrorSupabase(
        error.message || 'Error al actualizar contraseña'
      )
      setError(mensajeTraducido)
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Imagen de fondo - Optimizada */}
      <div className='absolute inset-0 z-0'>
        <div
          className='h-full w-full bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: 'url(/images/fondo-login.png)',
            willChange: 'transform',
          }}
        />
        <div className='absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80' />
      </div>

      {/* Efectos de glow - Simplificados */}
      <div className='absolute -right-40 -top-40 z-[1] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl'></div>
      <div className='absolute -bottom-40 -left-40 z-[1] h-80 w-80 rounded-full bg-purple-500/20 blur-3xl'></div>

      {/* Contenido Centrado - Ocupa toda la pantalla */}
      <div className='relative z-10 flex h-full w-full items-center justify-center px-4 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className='w-full max-w-md'
        >
          {/* Logo RyR */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className='mb-8 text-center'
          >
            <div className='relative mx-auto mb-6 h-24 w-64'>
              <Image
                src='/images/logo1-dark.png'
                alt='Logo Constructora RyR'
                fill
                sizes='256px'
                className='object-contain'
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))',
                }}
                priority
                quality={90}
              />
            </div>
            <div className='mb-4 flex items-center justify-center gap-3'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg'>
                <Shield className='h-8 w-8 text-white' />
              </div>
            </div>
            <h1 className='mb-2 text-3xl font-bold text-white'>
              Nueva Contraseña
            </h1>
            <p className='text-sm text-gray-300'>
              Ingresa tu nueva contraseña de acceso
            </p>
          </motion.div>

          {/* Card Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className='rounded-2xl border border-white/20 bg-black/40 p-8 shadow-2xl backdrop-blur-md'
          >
            {validToken === null ? (
              // Estado de carga - verificando token
              <div className='py-12 text-center'>
                <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center'>
                  <svg
                    className='h-12 w-12 animate-spin text-blue-500'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                </div>
                <p className='text-gray-300'>Verificando enlace...</p>
              </div>
            ) : validToken === false ? (
              // Token inválido o expirado
              <div className='py-12 text-center'>
                <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/50'>
                  <svg
                    className='h-10 w-10 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                </div>
                <h3 className='mb-3 text-xl font-bold text-white'>
                  Enlace inválido o expirado
                </h3>
                <p className='mb-6 text-gray-300'>
                  El enlace de recuperación no es válido o ha expirado. Por
                  favor, solicita uno nuevo.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40'
                >
                  Volver al login
                </button>
              </div>
            ) : !success ? (
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Nueva Contraseña */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-200'>
                    Nueva Contraseña
                  </label>
                  <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                      <Lock className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className='w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-11 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-blue-500/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                      placeholder='••••••••'
                      required
                      minLength={6}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-200'
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5' />
                      ) : (
                        <Eye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                  <p className='mt-1.5 text-xs text-gray-400'>
                    Mínimo 6 caracteres
                  </p>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-200'>
                    Confirmar Contraseña
                  </label>
                  <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
                      <Lock className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className='w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-11 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-blue-500/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                      placeholder='••••••••'
                      required
                      minLength={6}
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-200'
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-5 w-5' />
                      ) : (
                        <Eye className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mensaje de Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-sm'
                  >
                    <div className='flex items-start gap-3'>
                      <svg
                        className='mt-0.5 h-5 w-5 flex-shrink-0'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}

                {/* Botón Submit */}
                <button
                  type='submit'
                  disabled={loading}
                  className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100'></div>
                  <span className='relative flex items-center justify-center gap-2'>
                    {loading ? (
                      <>
                        <svg
                          className='h-5 w-5 animate-spin'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Lock className='h-5 w-5' />
                        Actualizar Contraseña
                      </>
                    )}
                  </span>
                </button>

                {/* Volver al Login */}
                <div className='text-center'>
                  <button
                    type='button'
                    onClick={() => router.push('/login')}
                    className='text-sm text-blue-400 transition-colors hover:text-blue-300 hover:underline'
                  >
                    Volver al login
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='py-12 text-center'
              >
                <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'>
                  <svg
                    className='h-10 w-10 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={3}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
                <h3 className='mb-3 text-2xl font-bold text-white'>
                  ¡Contraseña Actualizada!
                </h3>
                <p className='mb-4 text-gray-300'>
                  Tu contraseña ha sido cambiada exitosamente
                </p>
                <div className='flex items-center justify-center gap-2 text-sm text-gray-400'>
                  <svg
                    className='h-4 w-4 animate-spin'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Redirigiendo al login...
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className='mt-8 text-center text-xs text-gray-400'
          >
            <p>
              Â© 2024 Constructora RyR LTDA. Todos los derechos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
