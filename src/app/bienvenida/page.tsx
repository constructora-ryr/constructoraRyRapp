'use client'

import { useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Sparkles } from 'lucide-react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase/client'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'

type PageState = 'loading' | 'ready' | 'success' | 'error'

export default function BienvenidaPage() {
  const router = useRouter()
  const passwordRef = useRef<HTMLInputElement>(null)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [nombres, setNombres] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    let resolved = false

    const resolve = (
      user: { user_metadata?: Record<string, string> } | null
    ) => {
      if (!mounted || resolved) return
      resolved = true

      if (user) {
        const n = user.user_metadata?.nombres ?? ''
        setNombres(n)
        setPageState('ready')
        setTimeout(() => passwordRef.current?.focus(), 100)
      } else {
        setPageState('error')
      }
    }

    // useEffect solo corre en cliente — window siempre disponible aquí
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1)) // quitar el '#'
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const hashError = params.get('error')

    // Hash con error explícito (ej: otp_expired) → error inmediato
    if (hashError) {
      resolve(null)
      return
    }

    // createBrowserClient (@supabase/ssr) NO procesa el hash automáticamente.
    // Si hay tokens en el hash, los establecemos manualmente.
    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error: sessionError }) => {
          if (sessionError || !data.session?.user) {
            resolve(null)
          } else {
            resolve(data.session.user)
          }
        })
      return
    }

    // Sin hash token: escuchar eventos (sesión ya establecida via cookies)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        resolve(session.user)
      } else if (event === 'INITIAL_SESSION') {
        resolve(null)
      }
    })

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) resolve(user)
    })

    const timeout = setTimeout(() => {
      if (!resolved && mounted) resolve(null)
    }, 8000)

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
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })
      if (updateError) {
        setError(traducirErrorSupabase(updateError.message))
        return
      }

      setPageState('success')
      // Cerrar sesión y redirigir al login para que el JWT se genere correctamente
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login')
      }, 2500)
    } catch (err) {
      setError(
        traducirErrorSupabase(
          err instanceof Error ? err.message : 'Error inesperado'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative flex min-h-screen w-full items-center justify-center overflow-y-auto overflow-x-hidden py-8'>
      {/* Fondo — igual que login */}
      <div className='fixed inset-0 z-0 h-screen w-screen'>
        <Image
          src='/images/fondo-login.png'
          alt='Fondo RyR Constructora'
          fill
          sizes='100vw'
          className='object-cover'
          priority
          quality={90}
        />
        <div className='absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70' />
      </div>

      {/* Contenido */}
      <div className='relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center justify-center px-4'>
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-8 flex w-full flex-col items-center justify-center space-y-4 text-center'
        >
          <div className='relative h-28 w-full max-w-md'>
            <Image
              src='/images/logo1-dark.png'
              alt='Logo RyR Constructora'
              fill
              sizes='(max-width: 640px) 280px, 400px'
              className='object-contain drop-shadow-2xl'
              style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3))' }}
              priority
            />
          </div>
          <h2 className='mt-4 max-w-xl text-2xl font-bold text-white drop-shadow-lg lg:text-3xl'>
            Bienvenido al Sistema de Gestión Administrativa
          </h2>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className='w-full max-w-md'
        >
          <div className='rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl'>
            {/* Logo secundario */}
            <div className='relative mb-6 h-16 w-full'>
              <Image
                src='/images/logo2-dark.png'
                alt='Logo RyR Constructora'
                fill
                sizes='400px'
                className='object-contain drop-shadow-xl'
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))',
                }}
              />
            </div>

            {/* ── Estado: cargando ── */}
            {pageState === 'loading' && (
              <div className='py-10 text-center'>
                <svg
                  className='mx-auto mb-4 h-10 w-10 animate-spin text-white/70'
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
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                <p className='text-white/70'>Verificando invitación...</p>
              </div>
            )}

            {/* ── Estado: enlace inválido ── */}
            {pageState === 'error' && (
              <div className='py-10 text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 ring-2 ring-yellow-500/40'>
                  <svg
                    className='h-8 w-8 text-yellow-400'
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
                <h3 className='mb-2 text-xl font-bold text-white'>
                  Enlace inválido o expirado
                </h3>
                <p className='mb-6 text-sm text-white/70'>
                  El enlace de invitación no es válido o ya fue utilizado.
                  Contacta al administrador.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className='w-full rounded-lg bg-gradient-to-r from-red-600 to-red-700 py-3 font-semibold text-white shadow-lg transition-all hover:from-red-500 hover:to-red-600'
                >
                  Ir al login
                </button>
              </div>
            )}

            {/* ── Estado: éxito ── */}
            {pageState === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='py-10 text-center'
              >
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 ring-2 ring-green-500/40'>
                  <svg
                    className='h-8 w-8 text-green-400'
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
                <h3 className='mb-2 text-xl font-bold text-white'>
                  ¡Contraseña configurada!
                </h3>
                <p className='text-sm text-white/70'>
                  Ya puedes iniciar sesión con tu email y contraseña.
                </p>
                <div className='mt-4 flex items-center justify-center gap-2 text-sm text-white/50'>
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
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Redirigiendo al login...
                </div>
              </motion.div>
            )}

            {/* ── Estado: formulario ── */}
            {pageState === 'ready' && (
              <>
                <div className='mb-8 text-center'>
                  <div className='mb-2 flex items-center justify-center gap-2'>
                    <Sparkles className='h-5 w-5 text-yellow-400' />
                    <h1 className='text-2xl font-bold text-white drop-shadow-md'>
                      {nombres ? `¡Hola, ${nombres}!` : '¡Bienvenido!'}
                    </h1>
                    <Sparkles className='h-5 w-5 text-yellow-400' />
                  </div>
                  <p className='text-white/80'>
                    Crea tu contraseña para acceder al sistema
                  </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                  {/* Nueva contraseña */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-white/90'>
                      Contraseña
                    </label>
                    <div className='relative'>
                      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5'>
                        <Lock className='h-5 w-5 text-white/60' />
                      </div>
                      <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        className='w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-11 pr-12 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-70'
                        placeholder='••••••••'
                        required
                        minLength={6}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(v => !v)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white'
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className='h-5 w-5' />
                        ) : (
                          <Eye className='h-5 w-5' />
                        )}
                      </button>
                    </div>
                    <p className='mt-1 text-xs text-white/50'>
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className='mb-2 block text-sm font-medium text-white/90'>
                      Confirmar contraseña
                    </label>
                    <div className='relative'>
                      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5'>
                        <Lock className='h-5 w-5 text-white/60' />
                      </div>
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        className='w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-11 pr-12 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-70'
                        placeholder='••••••••'
                        required
                        minLength={6}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirm(v => !v)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white'
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOff className='h-5 w-5' />
                        ) : (
                          <Eye className='h-5 w-5' />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className='flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/15 p-4 text-red-100 backdrop-blur-md'
                    >
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
                      <p className='text-sm font-medium'>{error}</p>
                    </motion.div>
                  )}

                  {/* Botón */}
                  <button
                    type='submit'
                    disabled={loading}
                    className='w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 py-3 font-semibold text-white shadow-lg shadow-green-600/30 transition-all hover:from-green-500 hover:to-emerald-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {loading ? (
                      <span className='flex items-center justify-center gap-2'>
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
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        Guardando...
                      </span>
                    ) : (
                      'Establecer contraseña'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className='mt-8 text-center text-xs text-white/40'
        >
          © {new Date().getFullYear()} RyR Constructora LTDA. Todos los
          derechos reservados.
        </motion.p>
      </div>
    </div>
  )
}
