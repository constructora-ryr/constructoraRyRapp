'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Crown, LogOut, Settings } from 'lucide-react'

import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/shared/components/ui/button'

import { AdminCrown } from './AdminCrown'
import { contentFadeVariants } from './sidebar.styles'

interface SidebarFooterProps {
  isExpanded: boolean
  isAdmin: boolean
  initials: string
  displayName: string
  rol: string | null | undefined
  rolGradient: string
  rolBadgeColor: string
  isLoggingOut: boolean
  onLogout: () => void
}

export function SidebarFooter({
  isExpanded,
  isAdmin,
  initials,
  displayName,
  rol,
  rolGradient,
  rolBadgeColor,
  isLoggingOut,
  onLogout,
}: SidebarFooterProps) {
  const avatarBase = `flex items-center justify-center rounded-lg bg-gradient-to-br ${rolGradient} shadow-md`
  const adminRing = isAdmin
    ? 'shadow-amber-500/40 ring-2 ring-amber-400/20'
    : ''

  return (
    <div className='space-y-2 border-t border-gray-200/50 p-3 dark:border-gray-700/30'>
      {/* ── Perfil expandido ──────────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentFadeVariants}
            initial='collapsed'
            animate='expanded'
            exit='collapsed'
            transition={{ duration: 0.2 }}
            className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-50 p-2.5 shadow-md shadow-gray-900/5 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800'
          >
            {isAdmin && (
              <div className='absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 opacity-50' />
            )}

            <div className='relative flex items-start gap-2'>
              {/* Avatar */}
              <div className='relative flex-shrink-0'>
                {isAdmin && <AdminCrown />}
                <div className={`h-9 w-9 ${avatarBase} ${adminRing}`}>
                  <span className='text-sm font-bold text-white drop-shadow-md'>
                    {initials}
                  </span>
                </div>
              </div>

              {/* Datos de usuario */}
              <div className='min-w-0 flex-1 space-y-0.5'>
                <p className='line-clamp-1 text-xs font-bold text-gray-900 dark:text-white'>
                  {displayName}
                </p>
                <div className='flex items-center'>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${rolBadgeColor}`}
                  >
                    {isAdmin && <Crown className='h-2.5 w-2.5' />}
                    {rol ?? 'Sin rol'}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <Button
                variant='ghost'
                size='sm'
                disabled={isLoggingOut}
                onClick={onLogout}
                title={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                className='flex-shrink-0 rounded-lg p-1.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20'
              >
                <LogOut
                  className={`h-3.5 w-3.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 ${
                    isLoggingOut ? 'animate-pulse' : ''
                  }`}
                />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Avatar colapsado ──────────────────────────────────── */}
      {!isExpanded && (
        <div className='relative mx-auto w-fit'>
          {isAdmin && <AdminCrown />}
          <div className={`h-11 w-11 ${avatarBase} ${adminRing}`}>
            <span className='text-base font-bold text-white drop-shadow-md'>
              {initials}
            </span>
          </div>
        </div>
      )}

      {/* ── Controles inferiores ─────────────────────────────── */}
      <div
        className={`flex items-center ${
          isExpanded ? 'justify-between gap-1' : 'flex-col gap-1.5'
        }`}
      >
        <ThemeToggle
          className='inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-200'
          sunClassName='h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
          moonClassName='absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
        />

        <Button
          variant='ghost'
          size='sm'
          asChild
          title='Mi perfil'
          className='h-7 w-7 rounded-lg p-0 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
        >
          <Link href='/perfil'>
            <Settings className='h-3.5 w-3.5' />
          </Link>
        </Button>

        {!isExpanded && (
          <Button
            variant='ghost'
            size='sm'
            disabled={isLoggingOut}
            onClick={onLogout}
            title={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            className='h-7 w-7 rounded-lg p-0 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/20'
          >
            <LogOut
              className={`h-3.5 w-3.5 text-gray-600 dark:text-gray-400 ${
                isLoggingOut ? 'animate-pulse' : ''
              }`}
            />
          </Button>
        )}
      </div>
    </div>
  )
}
