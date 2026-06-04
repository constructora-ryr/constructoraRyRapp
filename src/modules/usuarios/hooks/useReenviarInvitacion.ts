import { useState } from 'react'

import { reenviarInvitacion } from '../services/usuarios.service'

interface UseReenviarInvitacionReturn {
  reenviar: (email: string) => Promise<void>
  cargando: boolean
  error: string | null
}

export function useReenviarInvitacion(): UseReenviarInvitacionReturn {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reenviar = async (email: string) => {
    setCargando(true)
    setError(null)
    try {
      await reenviarInvitacion(email)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al reenviar invitación'
      )
      throw err
    } finally {
      setCargando(false)
    }
  }

  return { reenviar, cargando, error }
}
