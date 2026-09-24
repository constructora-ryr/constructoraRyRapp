import { useCallback, useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { showLoginSuccessToast } from '@/components/toasts/custom-toasts'
import { supabase } from '@/lib/supabase/client'
import { debugLog, errorLog, successLog } from '@/lib/utils/logger'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { auditLogService } from '@/services/audit-log.service'

import { useAuth } from '../../contexts/auth-context'

import { useRateLimit } from './useRateLimit'

const REMEMBER_EMAIL_KEY = 'ryr_remember_email'

interface UseLoginReturn {
  email: string
  password: string
  loading: boolean
  error: string
  estaBloqueado: boolean
  minutosRestantes: number
  intentosRestantes: number
  loginExitoso: boolean
  mensajeExito: string
  recordarUsuario: boolean
  navegando: boolean
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setRecordarUsuario: (recordar: boolean) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

/**
 * Hook personalizado para manejar la lógica de autenticación
 * Separa la lógica de negocio del componente de presentación
 * NOTA: Registro público deshabilitado por seguridad
 */
export function useLogin(): UseLoginReturn {
  // Estados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginExitoso, setLoginExitoso] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [recordarUsuario, setRecordarUsuario] = useState(false)
  const [navegando, setNavegando] = useState(false)

  // ✅ Ref para prevenir ejecuciones múltiples durante signIn
  const isSubmittingRef = useRef(false)

  // Hooks externos
  const { signIn, perfil } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Obtener ruta de redirección (puede ser null en SSR/build)
  const redirectedFrom = searchParams?.get('redirectedFrom') || null

  // ✅ CRÍTICO: Detectar si venimos de logout (hay timestamp en URL)
  const logoutTimestamp = searchParams?.get('_t')

  // ✅ SOLUCIÓN DEFINITIVA: Limpiar TODO al montar si venimos de logout
  useEffect(() => {
    if (logoutTimestamp) {
      // Resetear TODOS los estados de UI (venimos de logout)
      setLoginExitoso(false)
      setMensajeExito('')
      setNavegando(false)
      setError('')
      setLoading(false)
      setPassword('') // ✅ CRÍTICO: Limpiar password
    }
  }, [logoutTimestamp]) // Ejecutar cuando cambie el timestamp

  // Cargar email guardado al montar el componente
  useEffect(() => {
    const emailGuardado = localStorage.getItem(REMEMBER_EMAIL_KEY)
    if (emailGuardado) {
      setEmail(emailGuardado)
      setRecordarUsuario(true)
    }
  }, [])

  // ✅ Listener de cambios de sesión de Supabase
  // Detecta cuando la sesión se actualiza correctamente
  useEffect(() => {
    // Si ya estamos logueados y el perfil está cargado, redirigir
    if (perfil && !loading && loginExitoso) {
    }
  }, [perfil, loading, loginExitoso])

  // Rate limiting POR EMAIL (5 intentos por email)
  const {
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    registrarIntentoFallido,
    resetearIntentos,
    verificarBloqueo,
  } = useRateLimit(email)

  // Handler del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')

      debugLog('ðŸ“ Formulario de login enviado')

      // Verificar si está bloqueado
      if (verificarBloqueo()) {
        setError(
          `ðŸš¨ Cuenta bloqueada por seguridad. Intenta nuevamente en ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.`
        )
        return
      }

      // Prevenir múltiples submissions
      if (loading || isSubmittingRef.current) {
        debugLog('⚠️ Login ya en progreso, ignorando submission duplicado')
        return
      }

      isSubmittingRef.current = true
      setLoading(true)

      let loginSuccess = false // ✅ Flag para controlar el finally

      try {
        // Determinar ruta de redirección ANTES del login
        const isInvalidRedirect =
          !redirectedFrom ||
          redirectedFrom === '/' ||
          redirectedFrom === '/login' ||
          redirectedFrom.startsWith('/auth/')

        const redirectTo = isInvalidRedirect ? '/' : redirectedFrom

        debugLog('ðŸ” Iniciando proceso de login', { email })

        // ✅ CRÍTICO: signIn PRIMERO, navegación INMEDIATA después (sin cambios de estado)
        await signIn(email, password)

        successLog('Login exitoso en signIn()')

        // Verificar estado de la cuenta en public.usuarios antes de continuar.
        // Supabase Auth acepta credenciales válidas aunque la cuenta esté inactiva,
        // por lo que necesitamos verificar aquí y hacer signOut si corresponde.
        const {
          data: { user: loggedUser },
        } = await supabase.auth.getUser()

        if (loggedUser) {
          const { data: cuenta } = await supabase
            .from('usuarios')
            .select('estado')
            .eq('id', loggedUser.id)
            .maybeSingle()

          if (!cuenta || cuenta.estado !== 'Activo') {
            await supabase.auth.signOut()
            throw new Error(
              'Tu cuenta está desactivada. Contacta al administrador del sistema.'
            )
          }
        }

        // Login exitoso: resetear intentos fallidos
        resetearIntentos()

        // Guardar email si "Recordar usuario" está marcado
        if (recordarUsuario) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email)
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY)
        }

        // ðŸ“ Registrar evento de auditoría
        auditLogService.logLoginExitoso(email)

        // Toast moderno personalizado
        showLoginSuccessToast()

        // ❌ REMOVIDO: No cambiar estados UI (causa re-render y limpia el formulario visualmente)
        // setLoginExitoso(true)
        // setMensajeExito(...)

        // ✅ Navegar INMEDIATAMENTE sin cambiar estado

        debugLog('ðŸš€ Navegando inmediatamente', { destino: redirectTo })

        // ✅ Navegación directa sin cambiar estado previos
        router.push(redirectTo)

        successLog('Navegación exitosa con cache pre-poblado')

        // ✅ Marcar como exitoso para que finally NO desactive loading
        loginSuccess = true

        // ✅ NO ejecutar finally (no desactivar loading en caso exitoso)
        return
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        errorLog('login-submit', error, { email })

        // Calcular intentos restantes DESPUÉS de este fallo
        const nuevoIntentosFallidos = intentosRestantes - 1

        // Login fallido: registrar intento
        registrarIntentoFallido()

        // ðŸ“ Registrar evento de auditoría
        auditLogService.logLoginFallido(email, nuevoIntentosFallidos)

        // Traducir mensaje de error al español
        const mensajeError = traducirErrorSupabase(
          error.message || 'Error de autenticación'
        )

        // Si se bloqueó la cuenta, registrar también
        if (nuevoIntentosFallidos === 0) {
          auditLogService.logCuentaBloqueada(email, 15)
          setError(
            'ðŸš¨ Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos por seguridad.'
          )
        } else if (nuevoIntentosFallidos <= 2) {
          // Advertencia cuando quedan 2 o menos intentos
          setError(
            `${mensajeError}. ⚠️ Te quedan ${nuevoIntentosFallidos} intento${nuevoIntentosFallidos !== 1 ? 's' : ''}.`
          )
        } else {
          setError(mensajeError)
        }
      } finally {
        // ✅ Solo desactivar loading si NO fue exitoso
        if (!loginSuccess) {
          setLoading(false)
          isSubmittingRef.current = false
        }
        // Si fue exitoso, loading se queda activo hasta que navegue
      }
    },
    [
      email,
      password,
      signIn,
      router,
      redirectedFrom,
      verificarBloqueo,
      minutosRestantes,
      registrarIntentoFallido,
      resetearIntentos,
      intentosRestantes,
      recordarUsuario,
      loading,
    ]
  )

  // ✅ Estabilizar funciones con useCallback para evitar re-renders
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value)
  }, [])

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value)
  }, [])

  const handleRecordarChange = useCallback((value: boolean) => {
    setRecordarUsuario(value)
  }, [])

  return {
    email,
    password,
    loading,
    error,
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    loginExitoso,
    mensajeExito,
    recordarUsuario,
    navegando, // ✅ Estado para mostrar overlay
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    setRecordarUsuario: handleRecordarChange,
    handleSubmit,
  }
}
