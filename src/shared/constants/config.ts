/**
 * Configuración de la aplicación
 */

export const APP_CONFIG = {
  name: 'Constructora RyR',
  description: 'Sistema de Gestión Administrativa',
  version: '1.0.0',
  author: 'Constructora RyR',
  email: 'info@ryrconstrucora.com',
  phone: '+57 123 456 7890',
  address: 'Calle Principal #123, Ciudad, Colombia 🇨🇴',
  country: 'Colombia',
  currency: 'COP',
  timezone: 'America/Bogota',
  locale: 'es-CO',
} as const

// Configuración de API
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3,
} as const

// Configuración de Supabase
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const

// Configuración de almacenamiento
export const STORAGE_KEYS = {
  THEME: 'ryr-theme',
  SIDEBAR_STATE: 'ryr-sidebar-state',
  USER_PREFERENCES: 'ryr-user-preferences',
  PROYECTOS: 'constructora-ryr-proyectos',
} as const

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [20, 50, 100],
  MAX_VISIBLE_PAGES: 5,
} as const

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 300,
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
} as const

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.6,
  },
  SPRING: {
    STIFFNESS: 400,
    DAMPING: 25,
  },
  EASING: {
    EASE_IN: [0.4, 0, 1, 1],
    EASE_OUT: [0, 0, 0.2, 1],
    EASE_IN_OUT: [0.4, 0, 0.2, 1],
  },
} as const

// Breakpoints (deben coincidir con Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DURATION: 5000,
  POSITION: 'bottom-right' as const,
  MAX_NOTIFICATIONS: 3,
} as const
