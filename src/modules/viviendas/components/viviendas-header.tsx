'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Home, LayoutDashboard, Plus } from 'lucide-react'

import { useRouter } from 'next/navigation'

import { ProtectedLink } from '@/shared/components/ui/ProtectedLink'

import { viviendasStyles as styles } from '../styles/viviendas.styles'

interface ViviendasHeaderProps {
  totalViviendas: number
  canCreate?: boolean
}

export function ViviendasHeader({
  totalViviendas,
  canCreate = false,
}: ViviendasHeaderProps) {
  const router = useRouter()

  const handleNuevaVivienda = () => {
    router.push('/viviendas/nueva')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={styles.header.container}
    >
      <div className={styles.header.pattern} />
      <div className={styles.header.content}>
        <div className='mb-3 flex items-center gap-1.5'>
          <LayoutDashboard className='h-3 w-3 text-orange-200' />
          <ProtectedLink
            href='/dashboard'
            className='text-xs text-orange-200 transition-colors hover:text-white'
          >
            Dashboard
          </ProtectedLink>
          <ChevronRight className='h-3 w-3 text-orange-300/60' />
          <span className='text-xs font-semibold text-white'>Viviendas</span>
        </div>
        <div className={styles.header.topRow}>
          <div className={styles.header.titleGroup}>
            <div className={styles.header.iconCircle}>
              <Home className={styles.header.icon} />
            </div>
            <div className={styles.header.titleWrapper}>
              <h1 className={styles.header.title}>Gestión de Viviendas</h1>
              <p className={styles.header.subtitle}>
                Administración completa • Control de inventario
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className={styles.header.badge}>
              <Home className='h-3.5 w-3.5' />
              {totalViviendas} Viviendas
            </span>
            {canCreate && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNuevaVivienda}
                className={styles.header.button}
              >
                <Plus className='h-4 w-4' />
                Nueva Vivienda
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
