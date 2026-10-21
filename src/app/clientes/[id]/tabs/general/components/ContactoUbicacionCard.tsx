'use client'

import {
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  PhoneCall,
} from 'lucide-react'

import { formatTelefono } from '@/lib/utils/format.utils'
import type { Cliente } from '@/modules/clientes/types'

import { AccionRapida, DetalleCard, FilaDato } from './DetalleCard'

/** Solo dígitos; agrega el indicativo de Colombia a celulares de 10 dígitos */
function numeroWhatsApp(telefono: string) {
  const d = telefono.replace(/\D/g, '')
  return d.length === 10 ? `57${d}` : d
}

const tintTelefono =
  'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'

function AccionesTelefono({ telefono }: { telefono: string }) {
  return (
    <>
      <AccionRapida
        icon={PhoneCall}
        label='Llamar'
        href={`tel:${telefono.replace(/\s/g, '')}`}
      />
      <AccionRapida
        icon={MessageCircle}
        label='Escribir por WhatsApp'
        href={`https://wa.me/${numeroWhatsApp(telefono)}`}
        externo
        className='hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400'
      />
    </>
  )
}

export function ContactoUbicacionCard({ cliente }: { cliente: Cliente }) {
  const ciudad = [cliente.ciudad, cliente.departamento]
    .filter(Boolean)
    .join(', ')
  const ubicacion = [cliente.direccion, ciudad].filter(Boolean).join(', ')

  return (
    <DetalleCard
      icon={Phone}
      title='Contacto y ubicación'
      gradient='from-blue-500 to-indigo-600'
      delay={0.05}
    >
      <FilaDato
        icon={Phone}
        tint={tintTelefono}
        label='Teléfono principal'
        acciones={
          cliente.telefono ? (
            <AccionesTelefono telefono={cliente.telefono} />
          ) : undefined
        }
      >
        {formatTelefono(cliente.telefono)}
      </FilaDato>

      <FilaDato
        icon={Phone}
        tint={tintTelefono}
        label='Teléfono alternativo'
        acciones={
          cliente.telefono_alternativo ? (
            <AccionesTelefono telefono={cliente.telefono_alternativo} />
          ) : undefined
        }
      >
        {formatTelefono(cliente.telefono_alternativo)}
      </FilaDato>

      <FilaDato
        icon={Mail}
        tint='bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
        label='Correo electrónico'
        acciones={
          cliente.email ? (
            <AccionRapida
              icon={Mail}
              label='Enviar correo'
              href={`mailto:${cliente.email}`}
            />
          ) : undefined
        }
      >
        {cliente.email ? (
          <span className='block truncate'>{cliente.email}</span>
        ) : null}
      </FilaDato>

      <FilaDato
        icon={MapPin}
        tint='bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
        label='Ubicación'
        acciones={
          ubicacion ? (
            <AccionRapida
              icon={Navigation}
              label='Ver en Google Maps'
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`}
              externo
            />
          ) : undefined
        }
      >
        {ubicacion ? (
          <>
            {cliente.direccion && (
              <span className='block'>{cliente.direccion}</span>
            )}
            {ciudad && (
              <span className='block text-xs font-normal text-slate-500 dark:text-slate-400'>
                {ciudad}
              </span>
            )}
          </>
        ) : null}
      </FilaDato>
    </DetalleCard>
  )
}
