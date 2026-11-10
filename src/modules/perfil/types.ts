export const SECCIONES_PERFIL = [
  'cuenta',
  'seguridad',
  'preferencias',
  'actividad',
  'permisos',
] as const

export type SeccionPerfil = (typeof SECCIONES_PERFIL)[number]

/** Sesión real de Supabase (auth.sessions), vía mis_sesiones() */
export interface SesionReal {
  id: string
  creada: string
  ultima_actividad: string
  user_agent: string | null
  ip: string | null
  es_actual: boolean
}

/** Entrada propia de audit_log_seguridad (inicios de sesión, intentos…) */
export interface AccesoReciente {
  id: string
  tipo: string
  ip_address: string | null
  user_agent: string | null
  fecha_evento: string
}

export type Tema = 'light' | 'dark' | 'system'

export interface PreferenciasUsuario {
  tema?: Tema
}

export interface DatosCuenta {
  nombres: string
  apellidos: string
  telefono: string
}
