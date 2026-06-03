/**
 * ============================================
 * SISTEMA DE LOGGING PROFESIONAL
 * ============================================
 *
 * Logging condicional basado en variables de entorno.
 * Solo logea en desarrollo o cuando DEBUG está habilitado.
 *
 * USO RÁPIDO (recomendado para services/hooks/componentes):
 *   import { logger } from '@/lib/utils/logger'
 *   logger.error('Mensaje', error)
 *   logger.warn('Advertencia', data)
 *
 * USO DETALLADO (para auth/middleware):
 *   import { errorLog, debugLog } from '@/lib/utils/logger'
 *   errorLog('contexto', error, { extra: 'data' })
 */

/* eslint-disable no-console, no-restricted-syntax */

const IS_DEV = process.env.NODE_ENV === 'development'
const DEBUG_AUTH = process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true'
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

/**
 * Log de debugging (solo en desarrollo con DEBUG_AUTH=true)
 * @param message - Mensaje a mostrar
 * @param data - Datos opcionales a mostrar
 */
export function debugLog(message: string, data?: unknown) {
  if (IS_DEV && DEBUG_AUTH) {
    if (data !== undefined) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  }
}

/**
 * Log de errores (siempre se muestra, pero limpio)
 * @param context - Contexto del error (ej: 'login', 'middleware')
 * @param error - Error capturado
 * @param additionalData - Datos adicionales opcionales
 */
export function errorLog(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>
) {
  const err = error as Record<string, unknown> | null | undefined
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    message: (err?.message as string) || 'Error desconocido',
    stack: IS_DEV ? err?.stack : (err?.stack as string)?.substring(0, 200), // Stack completo solo en dev
    ...additionalData,
  }

  if (IS_DEV || DEBUG_MODE) {
    console.error(`[RYR ERROR - ${context.toUpperCase()}]`, errorInfo)
  }

  // TODO: Aquí se puede integrar Sentry u otro servicio de monitoreo
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, { tags: { context }, extra: additionalData })
  // }
}

/**
 * Log de información (solo en desarrollo)
 * @param message - Mensaje informativo
 */
export function infoLog(message: string) {
  if (IS_DEV) {
    console.info(`[RYR INFO]`, message)
  }
}

/**
 * Log de éxito (solo en desarrollo)
 * @param message - Mensaje de éxito
 */
export function successLog(message: string) {
  if (IS_DEV) {
    console.log(`✅ [RYR SUCCESS]`, message)
  }
}

/**
 * Log de advertencia (siempre se muestra)
 * @param message - Mensaje de advertencia
 */
export function warnLog(message: string, data?: unknown) {
  if (IS_DEV || DEBUG_MODE) {
    console.warn(`⚠️ [RYR WARNING]`, message, data || '')
  }
}

// ============================================
// LOGGER SIMPLE (API compatible con console.*)
// ============================================

/**
 * Logger simple drop-in para reemplazar console.* en toda la app.
 * - error: solo en desarrollo o con DEBUG_MODE=true
 * - warn: solo en desarrollo o con DEBUG_MODE=true
 * - info: solo en desarrollo
 * - debug: solo en desarrollo con DEBUG_AUTH=true
 */
export const logger = {
  error: (...args: unknown[]) => {
    if (IS_DEV || DEBUG_MODE) console.error(...args)
  },
  warn: (...args: unknown[]) => {
    if (IS_DEV || DEBUG_MODE) console.warn(...args)
  },
  info: (...args: unknown[]) => {
    if (IS_DEV) console.info(...args)
  },
  debug: (...args: unknown[]) => {
    if (IS_DEV && DEBUG_AUTH) console.log(...args)
  },
}
