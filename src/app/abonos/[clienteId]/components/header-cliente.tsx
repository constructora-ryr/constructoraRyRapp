'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Building2, ExternalLink, Home, Star } from 'lucide-react'

import Link from 'next/link'

import { construirURLCliente } from '@/lib/utils/slug.utils'
import { formatNombreCompleto } from '@/lib/utils/string.utils'
import { getAvatarGradient } from '@/modules/abonos/styles/seleccion-cliente.styles'
import type { NegociacionConAbonos } from '@/modules/abonos/types'

interface HeaderClienteProps {
  negociacion: NegociacionConAbonos
  onVolver: () => void
  onRegistrarAbono?: () => void
  canCreate?: boolean
  canVerCliente?: boolean
}

export function HeaderCliente({
  negociacion,
  onVolver,
  onRegistrarAbono: _onRegistrarAbono,
  canCreate: _canCreate,
  canVerCliente = false,
}: HeaderClienteProps) {
  const { cliente, vivienda, proyecto } = negociacion
  const estaCompleta =
    negociacion.estado === 'Completada' ||
    (negociacion.saldo_pendiente ?? 1) <= 0
  const clienteUrl = construirURLCliente({
    id: cliente.id,
    nombres: cliente.nombres,
    apellidos: cliente.apellidos,
  })
  const nombreCompleto = formatNombreCompleto(
    `${cliente.nombres} ${cliente.apellidos}`
  )
  const iniciales =
    `${cliente.nombres[0] || ''}${cliente.apellidos[0] || ''}`.toUpperCase()
  const avatarGradient = getAvatarGradient(nombreCompleto)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-2xl ${estaCompleta ? 'shadow-2xl shadow-amber-900/40' : 'shadow-2xl shadow-emerald-900/40'}`}
      style={{
        background: estaCompleta
          ? 'linear-gradient(135deg, #78350f 0%, #92400e 40%, #b45309 100%)'
          : 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)',
      }}
    >
      {/* Grid pattern */}
      <div className='bg-grid-white/[0.04] absolute inset-0 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.8),transparent)]' />
      {/* Orb superior derecho */}
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-2xl ${estaCompleta ? 'bg-amber-400/20' : 'bg-emerald-400/20'}`}
      />
      {/* Orb inferior izquierdo */}
      <div
        className={`pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full blur-2xl ${estaCompleta ? 'bg-yellow-300/10' : 'bg-teal-300/10'}`}
      />
      {/* Franja de acento superior */}
      <div
        className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent to-transparent ${estaCompleta ? 'via-amber-300/60' : 'via-emerald-300/60'}`}
      />

      <div className='relative z-10 p-5'>
        {/* Breadcrumb */}
        <button
          onClick={onVolver}
          className={`group mb-4 flex items-center gap-1.5 text-xs font-medium transition-colors ${estaCompleta ? 'text-amber-300/80 hover:text-amber-100' : 'text-emerald-300/80 hover:text-emerald-100'}`}
        >
          <ArrowLeft className='h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5' />
          <span>Abonos</span>
        </button>

        <div className='flex items-end justify-between gap-4'>
          {/* Avatar + info */}
          <div className='flex items-center gap-4'>
            <div className='relative flex-shrink-0'>
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-xl`}
              >
                <span className='text-lg font-extrabold tracking-tight text-white'>
                  {iniciales}
                </span>
              </div>
              <div className='absolute inset-0 rounded-2xl ring-1 ring-white/20' />
            </div>

            <div>
              <div className='flex flex-wrap items-center gap-2'>
                {canVerCliente ? (
                  <Link
                    href={clienteUrl}
                    className='group inline-flex items-center gap-2'
                  >
                    <h1 className='text-2xl font-extrabold leading-tight tracking-tight text-white transition-opacity group-hover:opacity-80'>
                      {nombreCompleto}
                    </h1>
                    <ExternalLink
                      className={`h-4 w-4 transition-all ${estaCompleta ? 'text-amber-300/60 group-hover:text-amber-200' : 'text-emerald-300/60 group-hover:text-emerald-200'}`}
                    />
                  </Link>
                ) : (
                  <h1 className='text-2xl font-extrabold leading-tight tracking-tight text-white'>
                    {nombreCompleto}
                  </h1>
                )}
                {estaCompleta && (
                  <span className='inline-flex items-center gap-1 rounded-full bg-amber-400/25 px-2.5 py-1 backdrop-blur-sm'>
                    <Star className='h-3 w-3 fill-amber-300 text-amber-300' />
                    <span className='text-xs font-bold text-amber-200'>
                      Propietario
                    </span>
                  </span>
                )}
              </div>
              <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
                <span
                  className={`flex items-center gap-1 text-xs ${estaCompleta ? 'text-amber-200/70' : 'text-emerald-200/70'}`}
                >
                  CC {cliente.numero_documento}
                </span>
              </div>
              <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1'>
                {proyecto && (
                  <span
                    className={`flex items-center gap-1 text-xs ${estaCompleta ? 'text-amber-200/70' : 'text-emerald-200/70'}`}
                  >
                    <Building2 className='h-3 w-3' />
                    {proyecto.nombre}
                  </span>
                )}
                {vivienda && (
                  <span
                    className={`flex items-center gap-1 text-xs ${estaCompleta ? 'text-amber-200/70' : 'text-emerald-200/70'}`}
                  >
                    <Home className='h-3 w-3' />
                    {vivienda.manzana?.nombre
                      ? `Mz.${vivienda.manzana.nombre} `
                      : ''}
                    Casa No. {vivienda.numero}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* CTA principal */}
        </div>
      </div>
    </motion.div>
  )
}
