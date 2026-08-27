'use client'

export interface SesionActiva {
  id: string
  dispositivo: string | null
  navegador: string | null
  ip: string | null
  created_at: string
  last_seen_at: string
  es_actual: boolean
}

export async function obtenerSesiones(): Promise<SesionActiva[]> {
  const res = await fetch('/api/auth/sesiones', { cache: 'no-store' })
  if (!res.ok) throw new Error('Error al obtener sesiones')
  const { sesiones } = await res.json()
  return sesiones
}

export async function revocarSesion(id: string): Promise<void> {
  const res = await fetch(`/api/auth/sesiones/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Error al revocar la sesión')
}
