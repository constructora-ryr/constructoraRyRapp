'use client'

import { ChevronsUpDown, LogOut, Moon, Sun, UserRound } from 'lucide-react'

import Link from 'next/link'

import { useTemaCuenta } from '@/modules/perfil/hooks/useTemaCuenta'
import { ROL_VISUAL } from '@/modules/usuarios/config/usuarios-visual'
import type { Rol } from '@/modules/usuarios/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { AvatarUsuario } from '@/shared/components/usuario/AvatarUsuario'

import { AdminCrown } from './AdminCrown'

interface SidebarFooterProps {
  isExpanded: boolean
  isAdmin: boolean
  initials: string
  displayName: string
  email?: string | null
  rol: string | null | undefined
  isLoggingOut: boolean
  onLogout: () => void
}

/**
 * Pie del sidebar: tarjeta del usuario que abre un menú con perfil, tema y
 * cierre de sesión. El avatar usa el color del rol (el mismo de Usuarios).
 */
export function SidebarFooter({
  isExpanded,
  isAdmin,
  initials,
  displayName,
  email,
  rol,
  isLoggingOut,
  onLogout,
}: SidebarFooterProps) {
  // El tema se guarda en la cuenta (Mi perfil → Preferencias)
  const { oscuro, cambiarTema } = useTemaCuenta()
  const rv = rol ? ROL_VISUAL[rol as Rol] : undefined
  const RolIcono = rv?.icon

  const avatar = (
    <span className='relative flex-shrink-0'>
      {isAdmin && <AdminCrown />}
      <AvatarUsuario
        nombre={displayName}
        rol={rol}
        iniciales={initials}
        tamano={isExpanded ? 'md' : 'lg'}
      />
    </span>
  )

  return (
    <div className='border-t border-slate-200/60 p-2.5 dark:border-slate-700/40'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            aria-label='Menú de usuario'
            className={`group flex w-full items-center rounded-xl transition-colors hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 data-[state=open]:bg-slate-100 dark:hover:bg-slate-800/70 dark:data-[state=open]:bg-slate-800 ${
              isExpanded ? 'gap-2.5 p-2 text-left' : 'justify-center p-1.5'
            }`}
          >
            {avatar}
            {isExpanded && (
              <>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[13px] font-bold text-slate-900 dark:text-white'>
                    {displayName}
                  </span>
                  {rv && RolIcono ? (
                    <span className='mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold'>
                      <RolIcono className={`h-3 w-3 ${rv.text}`} />
                      <span className={rv.text}>{rv.label}</span>
                    </span>
                  ) : (
                    <span className='text-[11px] text-slate-500'>Sin rol</span>
                  )}
                </span>
                <ChevronsUpDown className='h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300' />
              </>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={isExpanded ? 'top' : 'right'}
          align={isExpanded ? 'start' : 'end'}
          sideOffset={8}
          className='w-60 rounded-xl p-1.5'
        >
          <DropdownMenuLabel className='flex items-center gap-2.5 px-2 py-2 font-normal'>
            <AvatarUsuario
              nombre={displayName}
              rol={rol}
              iniciales={initials}
              tamano='md'
            />
            <span className='min-w-0'>
              <span className='block truncate text-sm font-semibold text-slate-900 dark:text-white'>
                {displayName}
              </span>
              {email && (
                <span className='block truncate text-xs text-slate-500 dark:text-slate-400'>
                  {email}
                </span>
              )}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href='/perfil' className='cursor-pointer'>
              <UserRound className='mr-2 h-4 w-4' />
              Mi perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={e => {
              // Mantener el menú abierto para ver el cambio
              e.preventDefault()
              cambiarTema(oscuro ? 'light' : 'dark')
            }}
          >
            {oscuro ? (
              <Sun className='mr-2 h-4 w-4' />
            ) : (
              <Moon className='mr-2 h-4 w-4' />
            )}
            {oscuro ? 'Modo claro' : 'Modo oscuro'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isLoggingOut}
            onSelect={onLogout}
            className='text-red-600 focus:text-red-700 dark:text-red-400'
          >
            <LogOut
              className={`mr-2 h-4 w-4 ${isLoggingOut ? 'animate-pulse' : ''}`}
            />
            {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
