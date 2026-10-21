'use client'

import { Cake, Copy, FileText, HeartHandshake, User } from 'lucide-react'
import { toast } from 'sonner'

import { calculateAge, formatDateCompact } from '@/lib/utils/date.utils'
import {
  formatearNumeroDocumento,
  SIGLAS_DOCUMENTO,
} from '@/lib/utils/documento.utils'
import { formatNombreApellido } from '@/lib/utils/string.utils'
import type { Cliente } from '@/modules/clientes/types'
import { ESTADOS_CIVILES } from '@/modules/clientes/types'

import { AccionRapida, DetalleCard, FilaDato } from './DetalleCard'

export function InfoPersonalCard({ cliente }: { cliente: Cliente }) {
  const edad = cliente.fecha_nacimiento
    ? calculateAge(cliente.fecha_nacimiento)
    : null

  const copiar = async (texto: string, que: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success(`${que} copiado`)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <DetalleCard
      icon={User}
      title='Información personal'
      gradient='from-cyan-500 to-blue-600'
    >
      <FilaDato
        icon={User}
        tint='bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400'
        label='Nombre completo'
      >
        {formatNombreApellido(cliente.nombres, cliente.apellidos)}
      </FilaDato>

      <FilaDato
        icon={FileText}
        tint='bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400'
        label={
          SIGLAS_DOCUMENTO[cliente.tipo_documento] ?? cliente.tipo_documento
        }
        acciones={
          <AccionRapida
            icon={Copy}
            label='Copiar documento'
            onClick={() => copiar(cliente.numero_documento, 'Documento')}
          />
        }
      >
        <span className='tabular-nums tracking-wide'>
          {formatearNumeroDocumento(cliente.numero_documento)}
        </span>
      </FilaDato>

      <FilaDato
        icon={HeartHandshake}
        tint='bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
        label='Estado civil'
        vacio='No indica'
      >
        {cliente.estado_civil ? ESTADOS_CIVILES[cliente.estado_civil] : null}
      </FilaDato>

      <FilaDato
        icon={Cake}
        tint='bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
        label='Fecha de nacimiento'
        vacio='No indica'
      >
        {cliente.fecha_nacimiento ? (
          <span className='flex items-center gap-2'>
            {formatDateCompact(cliente.fecha_nacimiento)}
            {edad !== null && (
              <span className='rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'>
                {edad} años
              </span>
            )}
          </span>
        ) : null}
      </FilaDato>
    </DetalleCard>
  )
}
