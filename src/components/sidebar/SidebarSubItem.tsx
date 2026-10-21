'use client'

import Link from 'next/link'

import type { NavigationSubItem } from '@/shared/config/navigation.config'

interface SidebarSubItemProps {
  child: NavigationSubItem
  pathname: string
  /** Fondo suave + color del módulo padre (para el sub-item activo) */
  itemTint: string
  isMobile?: boolean
  onCloseSidebar?: () => void
}

export function SidebarSubItem({
  child,
  pathname,
  itemTint,
  isMobile,
  onCloseSidebar,
}: SidebarSubItemProps) {
  const childActive = pathname === child.href

  return (
    <Link
      href={child.href}
      prefetch={true}
      aria-current={childActive ? 'page' : undefined}
      onClick={isMobile ? onCloseSidebar : undefined}
      className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 ${
        childActive
          ? itemTint
          : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
      }`}
    >
      <child.icon className='h-3.5 w-3.5 flex-shrink-0' />
      <span className={`text-xs ${childActive ? 'font-bold' : 'font-medium'}`}>
        {child.name}
      </span>
    </Link>
  )
}
