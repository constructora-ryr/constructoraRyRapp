'use client'

import { motion } from 'framer-motion'
import {
  ChevronRight,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Receipt,
} from 'lucide-react'

import { ProtectedLink } from '@/shared/components/ui/ProtectedLink'

import { abonosListaStyles as s } from './abonos-lista.styles'

interface AbonosListHeaderProps {
  totalAbonos: number
  canCreate: boolean
  onRegistrar: () => void
}

export function AbonosListHeader({
  totalAbonos,
  canCreate,
  onRegistrar,
}: AbonosListHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={s.header.wrapper}
    >
      <div className={s.header.pattern} />
      <div className='relative z-10'>
        <div className='mb-3 flex items-center gap-1.5'>
          <LayoutDashboard className='h-3 w-3 text-violet-200' />
          <ProtectedLink
            href='/dashboard'
            className='text-xs text-violet-200 transition-colors hover:text-white'
          >
            Dashboard
          </ProtectedLink>
          <ChevronRight className='h-3 w-3 text-violet-300/60' />
          <span className='text-xs font-semibold text-white'>Abonos</span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={s.header.iconCircle}>
              <CreditCard className='h-6 w-6 text-white' />
            </div>
            <div className='space-y-0.5'>
              <h1 className='text-2xl font-bold text-white'>Abonos</h1>
              <p className='text-xs text-violet-100 dark:text-violet-200'>
                Registro global de recibos · RyR Constructora
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className={s.header.badge}>
              <Receipt className='h-3.5 w-3.5' />
              {totalAbonos} {totalAbonos === 1 ? 'Recibo' : 'Recibos'}
            </span>
            {canCreate ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRegistrar}
                className={s.header.btn}
              >
                <DollarSign className='h-4 w-4' />
                Registrar
              </motion.button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
