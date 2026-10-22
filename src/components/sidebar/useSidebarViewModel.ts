'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from 'next-themes'

import { useAuth } from '@/contexts/auth-context'
import { useLogout } from '@/hooks/auth'
import { navigationGroups } from '@/shared/config/navigation.config'

/**
 * ViewModel del Sidebar
 * Centraliza toda la lógica de negocio no-navegacional:
 * - Información de usuario (iniciales, nombre)
 * - Logo según tema y estado expandido
 * - Estado de submenús abiertos + auto-expand por ruta
 * - Logout
 */
export function useSidebarViewModel(pathname: string) {
  const { user, perfil } = useAuth()
  const { logout, isLoggingOut } = useLogout()
  const { theme, systemTheme } = useTheme()

  // ── Hydration ─────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Usuario ───────────────────────────────────────────────────────
  const initials = useMemo(() => {
    if (perfil?.nombres && perfil?.apellidos) {
      return `${perfil.nombres.charAt(0)}${perfil.apellidos.charAt(0)}`.toUpperCase()
    }
    if (perfil?.nombres) return perfil.nombres.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return 'U'
  }, [perfil?.nombres, perfil?.apellidos, user?.email])

  const displayName = useMemo(() => {
    if (perfil?.nombres && perfil?.apellidos)
      return `${perfil.nombres} ${perfil.apellidos}`
    if (perfil?.nombres) return perfil.nombres
    if (user?.email) return user.email.split('@')[0].replace(/[._-]/g, ' ')
    return 'Usuario'
  }, [perfil?.nombres, perfil?.apellidos, user?.email])

  const isAdmin = perfil?.rol === 'Administrador'

  // ── Logo ──────────────────────────────────────────────────────────
  const getLogoSrc = useCallback(
    (expanded: boolean): string => {
      if (!mounted) return expanded ? '/images/logo1.png' : '/images/logo2.png'
      const currentTheme = theme === 'system' ? systemTheme : theme
      if (expanded) {
        return currentTheme === 'dark'
          ? '/images/logo1-dark.png'
          : '/images/logo1.png'
      }
      return currentTheme === 'dark'
        ? '/images/logo2-dark.png'
        : '/images/logo2.png'
    },
    [mounted, theme, systemTheme]
  )

  // ── Submenús ──────────────────────────────────────────────────────
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set())

  // Auto-expandir submenú cuando la ruta coincide con un child
  useEffect(() => {
    const toOpen = new Set<string>()
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (
          item.children &&
          item.children.some(
            child =>
              pathname === child.href || pathname.startsWith(child.href + '/')
          )
        ) {
          toOpen.add(item.href)
        }
      }
    }
    // Reemplazar (no acumular): al cambiar de ruta, solo mantener
    // el submenú que corresponde a la ruta activa. El usuario puede
    // abrir otros manualmente con toggleSubmenu.
    setOpenSubmenus(toOpen)
  }, [pathname])

  const toggleSubmenu = useCallback((href: string) => {
    setOpenSubmenus(prev => {
      const next = new Set(prev)
      if (next.has(href)) {
        next.delete(href)
      } else {
        next.add(href)
      }
      return next
    })
  }, [])

  return {
    user,
    perfil,
    initials,
    displayName,
    isAdmin,
    getLogoSrc,
    openSubmenus,
    toggleSubmenu,
    logout,
    isLoggingOut,
  }
}
