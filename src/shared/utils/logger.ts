/**
 * 🐛 Sistema de Logging Centralizado
 *
 * Sistema robusto de logging para desarrollo y producción.
 * Usar SIEMPRE en lugar de console.log directo.
 */

/* eslint-disable no-console, no-restricted-syntax */

import { APP_CONFIG } from '@/shared/constants/app-config'

// =============================================================================
// 📊 TIPOS DE LOG
// =============================================================================
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success'

export interface LogContext {
  userId?: string
  action?: string
  module?: string
  metadata?: Record<string, unknown>
  timestamp?: Date
}

// =============================================================================
// 🎨 COLORES PARA CONSOLA (DESARROLLO)
// =============================================================================
const LOG_COLORS = {
  debug: '#6B7280', // gray-500
  info: '#3B82F6', // blue-500
  warn: '#F59E0B', // amber-500
  error: '#EF4444', // red-500
  success: '#10B981', // emerald-500
} as const

const LOG_EMOJIS = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  success: '✅',
} as const

// =============================================================================
// 🏷️ ETIQUETAS POR MÓDULO
// =============================================================================
export const LOG_MODULES = {
  AUTH: 'AUTH',
  API: 'API',
  DB: 'DATABASE',
  UI: 'UI',
  PROYECTOS: 'PROYECTOS',
  VIVIENDAS: 'VIVIENDAS',
  CLIENTES: 'CLIENTES',
  DOCUMENTOS: 'DOCUMENTOS',
  ABONOS: 'ABONOS',
  RENUNCIAS: 'RENUNCIAS',
  SUPABASE: 'SUPABASE',
  ROUTER: 'ROUTER',
  STORAGE: 'STORAGE',
  FORMS: 'FORMS',
  STORE: 'STORE',
} as const

// =============================================================================
// 🔧 CLASE LOGGER
// =============================================================================
class Logger {
  private isDevelopment = APP_CONFIG.env.enableLogging
  private enableDevTools = APP_CONFIG.dev.showDevTools

  /**
   * Método principal de logging
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    // En producción no mostrar nada en consola
    if (!this.isDevelopment) {
      if (level === 'error')
        this.sendToMonitoring({ level, message, ...context })
      return
    }

    const timestamp = new Date().toISOString()
    const emoji = LOG_EMOJIS[level]
    const moduleTag = context?.module ? `[${context.module}]` : ''

    // Formato del mensaje
    const logMessage = `${emoji} ${moduleTag} ${message}`

    // Información adicional
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    }

    // Output según el nivel
    switch (level) {
      case 'debug':
        if (this.enableDevTools) {
          console.debug(
            `%c${logMessage}`,
            `color: ${LOG_COLORS.debug}`,
            logData
          )
        }
        break

      case 'info':
        console.info(`%c${logMessage}`, `color: ${LOG_COLORS.info}`, logData)
        break

      case 'warn':
        console.warn(`%c${logMessage}`, `color: ${LOG_COLORS.warn}`, logData)
        break

      case 'error':
        console.error(`%c${logMessage}`, `color: ${LOG_COLORS.error}`, logData)
        // En producción, enviar a servicio de monitoreo
        this.sendToMonitoring(logData)
        break

      case 'success':
        console.log(`%c${logMessage}`, `color: ${LOG_COLORS.success}`, logData)
        break
    }
  }

  /**
   * Enviar errores críticos a servicio de monitoreo
   */
  private sendToMonitoring(_logData: Record<string, unknown>): void {
    if (!this.isDevelopment) {
      // Aquí integrar con Sentry, LogRocket, etc.
      // TODO: Implementar cuando tengas servicio de monitoreo
    }
  }

  // =============================================================================
  // 📝 MÉTODOS PÚBLICOS
  // =============================================================================

  /**
   * Log de debugging (solo desarrollo)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  /**
   * Log informativo
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Log de advertencia
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  /**
   * Log de error
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    }

    this.log('error', message, errorContext)
  }

  /**
   * Log de éxito
   */
  success(message: string, context?: LogContext): void {
    this.log('success', message, context)
  }

  // =============================================================================
  // 🎯 MÉTODOS ESPECIALIZADOS POR MÓDULO
  // =============================================================================

  /**
   * Logs específicos de API
   */
  api = {
    request: (url: string, method: string, data?: unknown) => {
      this.debug(`API Request: ${method} ${url}`, {
        module: LOG_MODULES.API,
        action: 'request',
        metadata: { url, method, data },
      })
    },

    response: (url: string, status: number, duration?: number) => {
      const level = status >= 400 ? 'error' : 'debug'
      this.log(level, `API Response: ${status} ${url}`, {
        module: LOG_MODULES.API,
        action: 'response',
        metadata: { url, status, duration },
      })
    },

    error: (url: string, error: Error) => {
      this.error(`API Error: ${url}`, error, {
        module: LOG_MODULES.API,
        action: 'error',
        metadata: { url },
      })
    },
  }

  /**
   * Logs específicos de autenticación
   */
  auth = {
    login: (userId: string) => {
      this.info('Usuario inició sesión', {
        module: LOG_MODULES.AUTH,
        action: 'login',
        userId,
      })
    },

    logout: (userId: string) => {
      this.info('Usuario cerró sesión', {
        module: LOG_MODULES.AUTH,
        action: 'logout',
        userId,
      })
    },

    error: (action: string, error: Error) => {
      this.error(`Error de autenticación: ${action}`, error, {
        module: LOG_MODULES.AUTH,
        action,
      })
    },
  }

  /**
   * Logs específicos de base de datos
   */
  db = {
    query: (table: string, operation: string) => {
      this.debug(`DB Query: ${operation} on ${table}`, {
        module: LOG_MODULES.DB,
        action: 'query',
        metadata: { table, operation },
      })
    },

    error: (table: string, operation: string, error: Error) => {
      this.error(`DB Error: ${operation} on ${table}`, error, {
        module: LOG_MODULES.DB,
        action: 'error',
        metadata: { table, operation },
      })
    },
  }

  /**
   * Logs específicos de UI
   */
  ui = {
    navigation: (from: string, to: string) => {
      this.debug(`Navegación: ${from} → ${to}`, {
        module: LOG_MODULES.UI,
        action: 'navigation',
        metadata: { from, to },
      })
    },

    interaction: (component: string, action: string) => {
      this.debug(`Interacción: ${component} - ${action}`, {
        module: LOG_MODULES.UI,
        action: 'interaction',
        metadata: { component, action },
      })
    },
  }
}

// =============================================================================
// 🚀 INSTANCIA SINGLETON
// =============================================================================
export const logger = new Logger()

// =============================================================================
// 🎯 UTILIDADES ADICIONALES
// =============================================================================

/**
 * Medir tiempo de ejecución de funciones
 */
export function measureTime<T>(fn: () => T, label: string, module?: string): T {
  const start = performance.now()
  const result = fn()
  const duration = performance.now() - start

  logger.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`, {
    module,
    action: 'performance',
    metadata: { duration, label },
  })

  return result
}

/**
 * Medir tiempo de funciones async
 */
export async function measureTimeAsync<T>(
  fn: () => Promise<T>,
  label: string,
  module?: string
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start

  logger.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`, {
    module,
    action: 'performance',
    metadata: { duration, label },
  })

  return result
}

/**
 * Log de eventos del usuario para analytics
 */
export function trackUserEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  logger.info(`📊 User Event: ${event}`, {
    module: 'ANALYTICS',
    action: 'track',
    metadata: properties,
  })

  // Aquí integrar con Google Analytics, Mixpanel, etc.
  // TODO: Implementar cuando tengas analytics configurado
}

// =============================================================================
// 📤 EXPORTS POR DEFECTO
// =============================================================================
export default logger

// Para uso rápido sin importar la instancia
export const { debug, info, warn, error, success } = logger
