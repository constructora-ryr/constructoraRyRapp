'use client'

import { AnimatePresence, motion } from 'framer-motion'

import Link from 'next/link'

import type {
  NavigationItem,
  NavigationSubItem,
} from '@/shared/config/navigation.config'

import { SidebarNavItemRow } from './SidebarNavItemRow'
import { SidebarSubItem } from './SidebarSubItem'

interface SidebarNavItemProps {
  item: NavigationItem
  isExpanded: boolean
  pathname: string
  isSubmenuOpen: boolean
  onToggleSubmenu: (href: string) => void
  papeleraCount: number
  isModuleActive: boolean
  visibleChildren: NavigationSubItem[]
  isMobile?: boolean
  onCloseSidebar?: () => void
}

export function SidebarNavItem({
  item,
  isExpanded,
  pathname,
  isSubmenuOpen,
  onToggleSubmenu,
  papeleraCount,
  isModuleActive,
  visibleChildren,
  isMobile,
  onCloseSidebar,
}: SidebarNavItemProps) {
  const hasChildren = visibleChildren.length > 0

  const row = (
    <SidebarNavItemRow
      item={item}
      isExpanded={isExpanded}
      isSubmenuOpen={isSubmenuOpen}
      isModuleActive={isModuleActive}
      hasChildren={hasChildren}
      papeleraCount={papeleraCount}
    />
  )

  return (
    <div className='space-y-0.5'>
      {/* Fila principal */}
      {hasChildren && isExpanded ? (
        <div
          role='button'
          tabIndex={0}
          onClick={() => onToggleSubmenu(item.href)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') onToggleSubmenu(item.href)
          }}
        >
          {row}
        </div>
      ) : (
        <Link
          href={item.href}
          prefetch={true}
          aria-current={isModuleActive && !hasChildren ? 'page' : undefined}
          onClick={isMobile ? onCloseSidebar : undefined}
        >
          {row}
        </Link>
      )}

      {/* Sub-items animados */}
      <AnimatePresence>
        {isExpanded && hasChildren && isSubmenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='overflow-hidden'
          >
            <div className='ml-[1.4rem] mt-0.5 space-y-0.5 border-l-2 border-slate-200/80 pl-2.5 dark:border-slate-700/60'>
              {visibleChildren.map(child => (
                <SidebarSubItem
                  key={child.href}
                  child={child}
                  pathname={pathname}
                  itemTint={item.tint}
                  isMobile={isMobile}
                  onCloseSidebar={onCloseSidebar}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
