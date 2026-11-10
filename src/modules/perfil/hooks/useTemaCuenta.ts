'use client'

/**
 * Tema (claro / oscuro / según el sistema) guardado en la cuenta, no solo en
 * el navegador: al entrar desde otro equipo se aplica el mismo. Lo usan la
 * barra lateral (atajo) y Mi perfil → Preferencias.
 */

import { useEffect, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { authKeys, useAuth } from '@/hooks/auth/useAuthQuery'

import { guardarPreferencias } from '../services/perfil.service'
import type { Tema } from '../types'

export function useTemaCuenta() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { perfil } = useAuth()
  const qc = useQueryClient()
  const temaCuenta = perfil?.preferencias?.tema
  const aplicado = useRef(false)

  // Al cargar la cuenta, su tema manda sobre el que recuerde este navegador
  // (una sola vez: después, lo que elija el usuario)
  useEffect(() => {
    if (aplicado.current || !perfil) return
    aplicado.current = true
    if (temaCuenta && temaCuenta !== theme) setTheme(temaCuenta)
  }, [perfil, temaCuenta, theme, setTheme])

  const cambiarTema = (tema: Tema) => {
    setTheme(tema)
    guardarPreferencias({ tema })
      .then(() =>
        qc.invalidateQueries({ queryKey: [...authKeys.all, 'perfil'] })
      )
      .catch(() =>
        toast.error('El tema se aplicó, pero no se pudo guardar en tu cuenta')
      )
  }

  return {
    tema: (theme as Tema | undefined) ?? 'system',
    oscuro: resolvedTheme === 'dark',
    cambiarTema,
  }
}
