'use client'

import { StickyNote } from 'lucide-react'

import type { Cliente } from '@/modules/clientes/types'

import { DetalleCard } from './DetalleCard'

export function NotasCard({ cliente }: { cliente: Cliente }) {
  if (!cliente.notas) return null

  return (
    <DetalleCard
      icon={StickyNote}
      title='Notas y observaciones'
      gradient='from-amber-400 to-orange-500'
      delay={0.1}
    >
      <p className='whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300'>
        {cliente.notas}
      </p>
    </DetalleCard>
  )
}
