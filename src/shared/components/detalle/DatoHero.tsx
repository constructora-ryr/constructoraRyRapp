/**
 * Cifra en vidrio para los encabezados con degradado de las páginas de
 * detalle (valor total, saldo, etc.).
 */

import type { LucideIcon } from 'lucide-react'

export function DatoHero({
  icon: Icon,
  label,
  valor,
}: {
  icon: LucideIcon
  label: string
  valor: string
}) {
  return (
    <div className='flex items-center gap-2.5 rounded-xl bg-white/15 px-3 py-2 ring-1 ring-white/25 backdrop-blur-sm'>
      <Icon className='h-4 w-4 shrink-0 text-white/80' />
      <div className='leading-tight'>
        <p className='text-[10px] font-medium uppercase tracking-wider text-white/70'>
          {label}
        </p>
        <p className='text-sm font-bold tabular-nums text-white'>{valor}</p>
      </div>
    </div>
  )
}
