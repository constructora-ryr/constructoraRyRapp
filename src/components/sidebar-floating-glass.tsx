'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LogOut } from 'lucide-react'

import { PantallaCarga } from '@/shared/components/carga'
import { usePapeleraCount } from '@/shared/documentos/hooks'

import { sidebarAnimationVariants } from './sidebar/sidebar.styles'
import { SidebarFooter } from './sidebar/SidebarFooter'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarNavItem } from './sidebar/SidebarNavItem'
import { useSidebarNavigation } from './sidebar/useSidebarNavigation'
import { useSidebarViewModel } from './sidebar/useSidebarViewModel'
import { useSidebar } from './useSidebar'

export function SidebarFloatingGlass() {
  const {
    isExpanded,
    isMobile,
    searchQuery,
    pathname,
    setSearchQuery,
    toggleSidebar,
    closeSidebar,
    getMostSpecificMatch,
  } = useSidebar()
  const papeleraCount = usePapeleraCount()
  const vm = useSidebarViewModel(pathname)
  const navGroups = useSidebarNavigation({
    pathname,
    searchQuery,
    getMostSpecificMatch,
  })

  return (
    <>
      {/* Overlay móvil */}
      <AnimatePresence>
        {isMobile && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden'
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Contenedor con efecto flotante */}
      <div
        className={`fixed left-0 top-0 z-50 h-full ${
          isMobile ? (isExpanded ? 'w-full' : 'w-0') : ''
        }`}
      >
        <motion.aside
          variants={sidebarAnimationVariants}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`h-full ${
            isMobile
              ? isExpanded
                ? 'translate-x-0'
                : '-translate-x-full'
              : 'm-3 h-[calc(100vh-24px)] rounded-3xl'
          } relative flex flex-col border border-white/20 bg-white/80 shadow-2xl shadow-gray-900/10 backdrop-blur-2xl dark:border-gray-700/30 dark:bg-gray-900/80 dark:shadow-black/20`}
        >
          {/* Header: logo + toggle + buscador */}
          <SidebarHeader
            isExpanded={isExpanded}
            logoSrc={vm.getLogoSrc(true)}
            logoCollapsedSrc={vm.getLogoSrc(false)}
            toggleSidebar={toggleSidebar}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Navegación */}
          <div className='custom-scrollbar flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 py-3'>
            {navGroups.map((group, i) => (
              <div key={group.title}>
                {/* Título del grupo (expandido) o separador (colapsado) */}
                {isExpanded ? (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className='mb-1.5 flex items-center gap-2 px-2'
                  >
                    <h3 className='text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500'>
                      {group.title}
                    </h3>
                    <span className='h-px flex-1 bg-slate-200/80 dark:bg-slate-700/60' />
                  </motion.div>
                ) : i > 0 ? (
                  <div className='mx-auto mb-3 h-px w-8 bg-slate-200 dark:bg-slate-700' />
                ) : null}

                {/* Items */}
                <div className='space-y-1'>
                  {group.items.map(
                    ({ item, isModuleActive, visibleChildren }) => (
                      <SidebarNavItem
                        key={item.href}
                        item={item}
                        isExpanded={isExpanded}
                        pathname={pathname}
                        isSubmenuOpen={vm.openSubmenus.has(item.href)}
                        onToggleSubmenu={vm.toggleSubmenu}
                        papeleraCount={papeleraCount.total}
                        isModuleActive={isModuleActive}
                        visibleChildren={visibleChildren}
                        isMobile={isMobile}
                        onCloseSidebar={closeSidebar}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer: perfil + tema + logout */}
          <SidebarFooter
            isExpanded={isExpanded}
            isAdmin={vm.isAdmin}
            initials={vm.initials}
            displayName={vm.displayName}
            email={vm.user?.email}
            rol={vm.perfil?.rol}
            isLoggingOut={vm.isLoggingOut}
            onLogout={vm.logout}
          />
        </motion.aside>
      </div>

      {/* Al cerrar sesión se tapa la app: ya no hay sesión detrás */}
      {vm.isLoggingOut ? (
        <div className='fixed inset-0 z-[100]'>
          <PantallaCarga
            icon={LogOut}
            label='Cerrando sesión'
            className='min-h-dvh'
          />
        </div>
      ) : null}
    </>
  )
}
