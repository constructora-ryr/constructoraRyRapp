'use client'

import { motion } from 'framer-motion'

import { useTiposFuentePagoConfig } from '@/modules/fuentes-pago/hooks'
import { iconoFuente } from '@/shared/constants/fuente-iconos'
import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

/** Ícono de la entidad con el color e ícono de su tipo de fuente */
export function IconoEntidad({
  tipoFuente,
  tamano = 'md',
}: {
  tipoFuente: string
  tamano?: 'md' | 'lg'
}) {
  const { getTipoConfig } = useTiposFuentePagoConfig()
  const config = getTipoConfig(tipoFuente)
  const Icono = iconoFuente(config.icono)
  return (
    <span
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
        getFuenteColorClasses(config.color).icon,
        tamano === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
      )}
    >
      <Icono className={tamano === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
    </span>
  )
}

/** Barra de lo girado (verde) sobre lo aprobado; el resto queda en ámbar */
export function BarraDesembolso({
  porcentaje,
  grosor = 'h-2',
}: {
  porcentaje: number
  grosor?: string
}) {
  const completo = porcentaje >= 100
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full',
        grosor,
        completo
          ? 'bg-emerald-100 dark:bg-emerald-500/15'
          : 'bg-amber-100 dark:bg-amber-500/20'
      )}
    >
      <motion.div
        className='h-full origin-left rounded-full bg-gradient-to-r from-emerald-500 to-teal-500'
        initial={{ scaleX: 0 }}
        animate={{ scaleX: porcentaje / 100 }}
        transition={{ type: 'spring', stiffness: 70, damping: 20 }}
      />
    </div>
  )
}
