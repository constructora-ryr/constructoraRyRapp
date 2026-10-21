'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import { Tooltip } from '@/shared/components/ui/Tooltip'
import type { NavigationItem } from '@/shared/config/navigation.config'
import { PAPELERA_NAV_NAME } from '@/shared/config/navigation.config'

import { contentFadeVariants } from './sidebar.styles'

interface SidebarNavItemRowProps {
  item: NavigationItem
  isExpanded: boolean
  isSubmenuOpen: boolean
  isModuleActive: boolean
  hasChildren: boolean
  papeleraCount: number
}

/**
 * Fila de un módulo. El ícono va en un cuadro con el color del módulo
 * (suave si está inactivo, degradado si está activo) y el activo se marca
 * igual tenga o no submenú: fondo suave + barra de color a la izquierda.
 */
export function SidebarNavItemRow({
  item,
  isExpanded,
  isSubmenuOpen,
  isModuleActive,
  hasChildren,
  papeleraCount,
}: SidebarNavItemRowProps) {
  const isPapelera = item.name === PAPELERA_NAV_NAME
  const contador = isPapelera && papeleraCount > 0 ? papeleraCount : 0
  const contadorTexto = contador > 99 ? '99+' : String(contador)

  const tile = (
    <span
      className={`relative flex flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
        isExpanded ? 'h-8 w-8' : 'h-10 w-10'
      } ${
        isModuleActive
          ? `bg-gradient-to-br ${item.color} text-white shadow-md`
          : `${item.tint} group-hover:scale-105`
      }`}
    >
      <item.icon className={isExpanded ? 'h-4 w-4' : 'h-5 w-5'} />

      {/* Contador en modo colapsado */}
      {!isExpanded && contador > 0 ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className='absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold text-white shadow dark:border-slate-900'
        >
          {contadorTexto}
        </motion.span>
      ) : null}
    </span>
  )

  const fila = (
    <div
      className={`group relative flex cursor-pointer items-center rounded-xl transition-colors duration-150 ${
        isExpanded ? 'gap-2.5 px-2 py-1.5' : 'justify-center py-1'
      } ${
        isModuleActive
          ? isExpanded
            ? 'bg-slate-100/90 dark:bg-slate-800/80'
            : ''
          : isExpanded
            ? 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
            : ''
      }`}
    >
      {/* Barra de color del activo */}
      {isModuleActive ? (
        <motion.span
          layoutId='sidebar-active-bar'
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          // -left-2 = borde del menú (más afuera lo recorta overflow-x-hidden)
          className={`absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b ${item.color}`}
        />
      ) : null}

      {tile}

      {/* Texto — solo en modo expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentFadeVariants}
            initial='collapsed'
            animate='expanded'
            exit='collapsed'
            transition={{ duration: 0.2 }}
            className='flex min-w-0 flex-1 items-center justify-between gap-2'
          >
            <div className='flex min-w-0 flex-col'>
              <span
                className={`truncate text-[13px] leading-tight ${
                  isModuleActive
                    ? 'font-bold text-slate-900 dark:text-white'
                    : 'font-semibold text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white'
                }`}
              >
                {item.name}
              </span>
              <span className='truncate text-[10px] text-slate-500 dark:text-slate-400'>
                {item.description}
              </span>
            </div>

            {contador > 0 ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className='flex h-[18px] min-w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white'
              >
                {contadorTexto}
              </motion.span>
            ) : null}

            {hasChildren ? (
              <motion.span
                animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className='flex-shrink-0 text-slate-400 dark:text-slate-500'
              >
                <ChevronDown className='h-3.5 w-3.5' />
              </motion.span>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  if (isExpanded) return fila

  // Colapsado: tooltip (en portal, no lo recorta el scroll del menú)
  return (
    <Tooltip
      side='right'
      sideOffset={10}
      delayDuration={80}
      content={
        <span className='flex items-center gap-2'>
          <span>
            <span className='block font-semibold'>{item.name}</span>
            <span className='block text-[11px] font-normal text-white/70'>
              {item.description}
            </span>
          </span>
          {contador > 0 ? (
            <span className='flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold'>
              {contadorTexto}
            </span>
          ) : null}
        </span>
      }
    >
      {fila}
    </Tooltip>
  )
}
