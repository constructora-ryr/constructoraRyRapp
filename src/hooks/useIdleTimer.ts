'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { useLogoutMutation } from '@/hooks/auth'

export type IdleWarningLevel = 'info' | 'warning' | 'critical'

export interface IdleTimerConfig {
  timeoutMinutes?: number
  enabled?: boolean
  modalIsOpen?: boolean
  onWarning?: (
    level: IdleWarningLevel,
    remainingMinutes: number,
    remainingSeconds: number
  ) => void
  onTimeout?: () => void
}

interface IdleTimerState {
  lastActivity: number
  warningShown: { info: boolean; warning: boolean; critical: boolean }
  logoutExecuted: boolean
  pageVisible: boolean
}

const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const

// Porcentajes del tiempo total en los que se dispara cada nivel de advertencia
const WARNING_LEVELS = {
  info: 0.833, // 50 min en 60 min
  warning: 0.917, // 55 min en 60 min
  critical: 0.967, // 58 min en 60 min
}

export function useIdleTimer(config: IdleTimerConfig = {}) {
  const {
    timeoutMinutes = 60,
    enabled = true,
    modalIsOpen = false,
    onWarning,
    onTimeout,
  } = config

  const { user } = useAuth()
  const logoutMutation = useLogoutMutation()

  // ── Refs de estado (sin closures) ────────────────────────
  const stateRef = useRef<IdleTimerState>({
    lastActivity: Date.now(),
    warningShown: { info: false, warning: false, critical: false },
    logoutExecuted: false,
    pageVisible: true,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ── Refs de config — actualizados en cada render, sin disparar effects ──
  // (Técnica "last-render ref": rompe la cadena de deps que resetea el timer)
  const timeoutMsRef = useRef(timeoutMinutes * 60 * 1000)
  const onWarningRef = useRef(onWarning)
  const onTimeoutRef = useRef(onTimeout)
  const modalIsOpenRef = useRef(modalIsOpen)
  const logoutMutationRef = useRef(logoutMutation)

  timeoutMsRef.current = timeoutMinutes * 60 * 1000
  onWarningRef.current = onWarning
  onTimeoutRef.current = onTimeout
  modalIsOpenRef.current = modalIsOpen
  logoutMutationRef.current = logoutMutation

  // userId primitivo — el efecto solo se remonta cuando el usuario cambia,
  // NO cuando Supabase refresca el JWT (que crea un nuevo objeto user)
  const userId = user?.id ?? null

  // ── executeLogout: deps vacías, todo via refs ─────────────
  const executeLogout = useCallback(() => {
    const state = stateRef.current
    if (state.logoutExecuted) return
    state.logoutExecuted = true

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    sessionStorage.setItem('logout_reason', 'inactivity')
    sessionStorage.setItem('logout_timestamp', Date.now().toString())

    // Si hay callback externo úsalo (maneja el logout real).
    // Si no, fallback al mutation directo.
    if (onTimeoutRef.current) {
      onTimeoutRef.current()
    } else {
      logoutMutationRef.current.mutate()
    }
  }, []) // ✅ Sin deps — usa solo refs, nunca se recrea

  // ── checkInactivity: deps mínimas ────────────────────────
  const checkInactivity = useCallback(() => {
    const state = stateRef.current
    const TIMEOUT_MS = timeoutMsRef.current
    const now = Date.now()
    const inactiveTime = now - state.lastActivity
    const progress = inactiveTime / TIMEOUT_MS
    const remainingMs = TIMEOUT_MS - inactiveTime
    const remainingSeconds = Math.floor(remainingMs / 1000)
    const remainingMinutes = Math.ceil(remainingMs / 1000 / 60)

    if (progress >= 1.0) {
      executeLogout()
      return
    }

    if (progress >= WARNING_LEVELS.critical) {
      if (!state.warningShown.critical) {
        state.warningShown.critical = true
        onWarningRef.current?.('critical', remainingMinutes, remainingSeconds)
      }
    } else if (progress >= WARNING_LEVELS.warning) {
      if (!state.warningShown.warning) {
        state.warningShown.warning = true
        onWarningRef.current?.('warning', remainingMinutes, remainingSeconds)
      }
    } else if (
      progress >= WARNING_LEVELS.info &&
      !state.warningShown.info &&
      !state.warningShown.warning &&
      !state.warningShown.critical
    ) {
      state.warningShown.info = true
      onWarningRef.current?.('info', remainingMinutes, remainingSeconds)
    }
  }, [executeLogout]) // ✅ Solo executeLogout (también estable)

  // ── resetActivity: estable ────────────────────────────────
  const resetActivity = useCallback(() => {
    const state = stateRef.current

    state.lastActivity = Date.now()
    state.warningShown = { info: false, warning: false, critical: false }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    checkIntervalRef.current = setInterval(checkInactivity, 15_000)
    // Fallback de seguridad: si el interval falla, logout forzado
    timeoutRef.current = setTimeout(executeLogout, timeoutMsRef.current + 5_000)
  }, [checkInactivity, executeLogout]) // ✅ Ambas estables

  // ── handleUserActivity: estable ───────────────────────────
  const handleUserActivity = useCallback(() => {
    const state = stateRef.current

    // Ignorar si warning/critical ya fue mostrado o si hay modal abierta.
    // Solo el botón "Mantener sesión activa" puede resetear desde ese punto.
    if (
      state.warningShown.warning ||
      state.warningShown.critical ||
      modalIsOpenRef.current // ← ref, no prop directa
    ) {
      return
    }

    // Throttle: solo actualizar si pasaron más de 10 segundos
    if (Date.now() - state.lastActivity < 10_000) return

    resetActivity()
  }, [resetActivity]) // ✅ Estable

  const keepAlive = useCallback(() => {
    resetActivity()
  }, [resetActivity])

  const getRemainingTime = useCallback(() => {
    const state = stateRef.current
    const TIMEOUT_MS = timeoutMsRef.current
    const elapsed = Date.now() - state.lastActivity
    const remaining = Math.max(0, TIMEOUT_MS - elapsed)

    return {
      remainingMs: remaining,
      remainingMinutes: Math.ceil(remaining / 1000 / 60),
      remainingSeconds: Math.ceil(remaining / 1000),
      progress: elapsed / TIMEOUT_MS,
    }
  }, [])

  // ── Effect principal: solo se remonta al login/logout real ─
  useEffect(() => {
    if (!userId || !enabled) {
      stateRef.current = {
        lastActivity: Date.now(),
        warningShown: { info: false, warning: false, critical: false },
        logoutExecuted: false,
        pageVisible: true,
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      return
    }

    // Resetear al iniciar sesión
    stateRef.current.logoutExecuted = false
    stateRef.current.warningShown = {
      info: false,
      warning: false,
      critical: false,
    }

    resetActivity()

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    const handleVisibilityChange = () => {
      stateRef.current.pageVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
    // ✅ userId (primitivo) en vez de user (objeto): el effect NO se remonta
    //    cuando Supabase refresca el JWT y cambia la referencia del objeto user
  }, [userId, enabled, handleUserActivity, resetActivity])

  return { keepAlive, getRemainingTime, resetActivity }
}
