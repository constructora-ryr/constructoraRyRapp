/**
 * 🔧 Configuración Central de la Aplicación
 *
 * Todas las configuraciones de la app centralizadas en un solo lugar.
 * Usar siempre estas constantes en lugar de valores hardcodeados.
 */

// =============================================================================
// 🏢 INFORMACIÓN DE LA EMPRESA
// =============================================================================
export const COMPANY = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Constructora RyR',
  logo: process.env.NEXT_PUBLIC_COMPANY_LOGO || '/logo.png',
  address: 'Dirección de la constructora', // TODO: Mover a env
  phone: '+57 9 XXXX XXXX', // TODO: Mover a env
  email: 'constructoraryrltda@hotmail.com', // TODO: Mover a env
} as const

// =============================================================================
// 🌍 CONFIGURACIÓN REGIONAL
// =============================================================================
export const LOCALE = {
  currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'COP',
  timezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'America/Bogotá',
  dateFormat: 'dd/MM/yyyy',
  currencyFormat: 'es-CO',
  language: 'es',
} as const

// =============================================================================
// 🔧 CONFIGURACIÓN DE DESARROLLO
// =============================================================================
export const DEV = {
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  showDevTools: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
} as const

// =============================================================================
// 📊 LÍMITES Y VALIDACIONES DEL NEGOCIO
// =============================================================================
export const BUSINESS_LIMITS = {
  // Proyectos
  proyecto: {
    nombreMin: 3,
    nombreMax: 100,
    descripcionMax: 500,
    presupuestoMin: 1000000, // 1M CLP
    presupuestoMax: 10000000000, // 10B CLP
    diasMin: 30,
    diasMax: 3650, // 10 años
  },

  // Viviendas
  vivienda: {
    nombreMin: 2,
    nombreMax: 50,
    metrosMin: 20,
    metrosMax: 1000,
    habitacionesMin: 1,
    habitacionesMax: 10,
    banosMin: 1,
    banosMax: 10,
  },

  // Clientes
  cliente: {
    nombreMin: 2,
    nombreMax: 100,
    rutMin: 8,
    rutMax: 12,
    telefonoMin: 8,
    telefonoMax: 15,
  },

  // Documentos
  documento: {
    nombreMin: 3,
    nombreMax: 100,
    tamanoMax: 10 * 1024 * 1024, // 10MB
    tiposPermitidos: ['.pdf', '.doc', '.docx', '.jpg', '.png', '.xlsx'],
  },
} as const

// =============================================================================
// 🎨 CONFIGURACIÓN DE UI
// =============================================================================
export const UI = {
  // Paginación
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [20, 50, 100],
    maxPages: 1000,
  },

  // Animaciones
  animations: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    spring: { stiffness: 300, damping: 30 },
  },

  // Toasts
  toast: {
    duration: 4000,
    position: 'top-right' as const,
  },

  // Modales
  modal: {
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
} as const

// =============================================================================
// 🔄 INTERVALOS Y TIMEOUTS
// =============================================================================
export const TIMING = {
  // Auto-save
  autoSaveInterval: 30000, // 30 segundos

  // Refresh de datos
  dataRefreshInterval: 60000, // 1 minuto

  // Debounce
  searchDebounce: 300,
  inputDebounce: 500,

  // Timeouts
  apiTimeout: 10000, // 10 segundos
  uploadTimeout: 30000, // 30 segundos
} as const

// =============================================================================
// 📱 BREAKPOINTS RESPONSIVOS
// =============================================================================
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// =============================================================================
// 🎯 ESTADOS DEL NEGOCIO
// =============================================================================
export const ESTADOS = {
  proyecto: {
    PLANIFICACION: 'planificacion',
    EN_CURSO: 'en_curso',
    PAUSADO: 'pausado',
    COMPLETADO: 'completado',
    CANCELADO: 'cancelado',
  },

  vivienda: {
    DISPONIBLE: 'disponible',
    RESERVADA: 'reservada',
    VENDIDA: 'vendida',
    EN_CONSTRUCCION: 'en_construccion',
  },

  pago: {
    PENDIENTE: 'pendiente',
    PAGADO: 'pagado',
    VENCIDO: 'vencido',
    CANCELADO: 'cancelado',
  },
} as const

// =============================================================================
// 🔐 CONFIGURACIÓN DE SEGURIDAD
// =============================================================================
export const SECURITY = {
  // Intentos de login
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos

  // Sesión
  sessionTimeout: 60 * 60 * 1000, // 1 hora

  // Passwords (si implementas auth custom)
  passwordMinLength: 8,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
} as const

// =============================================================================
// 📋 CONFIGURACIÓN POR AMBIENTE
// =============================================================================
const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV

  const configs = {
    development: {
      apiUrl: 'http://localhost:3000/api',
      enableLogging: true,
      enableDevTools: true,
      strictMode: true,
    },

    production: {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      enableLogging: false,
      enableDevTools: false,
      strictMode: false,
    },

    test: {
      apiUrl: 'http://localhost:3000/api',
      enableLogging: false,
      enableDevTools: false,
      strictMode: true,
    },
  }

  return configs[env as keyof typeof configs] || configs.development
}

export const ENV_CONFIG = getEnvironmentConfig()

// =============================================================================
// 🚀 CONFIGURACIÓN PRINCIPAL EXPORTADA
// =============================================================================
export const APP_CONFIG = {
  company: COMPANY,
  locale: LOCALE,
  dev: DEV,
  limits: BUSINESS_LIMITS,
  ui: UI,
  timing: TIMING,
  breakpoints: BREAKPOINTS,
  estados: ESTADOS,
  security: SECURITY,
  env: ENV_CONFIG,
} as const

// Tipo para TypeScript
export type AppConfig = typeof APP_CONFIG
