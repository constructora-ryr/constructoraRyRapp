'use client'

/**
 * Registrar abono: elegir el cliente que va a pagar. Mismo lenguaje que el
 * listado de recibos (/abonos): encabezado violeta con las cifras de la
 * cartera, tarjetas por etapa del pago (que son también el filtro),
 * buscador con filtro de proyecto y la tabla de clientes.
 * La lógica de filtros vive en useNegociacionesList.
 */

import { motion } from 'framer-motion'
import {
  CircleDashed,
  CreditCard,
  Hourglass,
  PiggyBank,
  Receipt,
  Rocket,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { getShortId } from '@/lib/utils/slug.utils'
import {
  EstadoFiltroCards,
  formatCOP,
  HeroDato,
  ListPageHeader,
  ListSearchToolbar,
  type EstadoFiltroOpcion,
} from '@/shared/components/list-page'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { FilterDropdown } from '@/shared/components/ui/filter-dropdown'
import { NoResults } from '@/shared/components/ui/NoResults'

import {
  UMBRAL_AVANZADO,
  useNegociacionesList,
  type EtapaPago,
} from '../hooks/useNegociacionesList'
import type { NegociacionConAbonos } from '../types'

import { ClientesPorAbonarTabla } from './lista/ClientesPorAbonarTabla'

const FILTRO_ACTIVO =
  'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/70 dark:bg-violet-900/20 dark:text-violet-300'

function Esqueleto() {
  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
      <div className='h-11 animate-pulse bg-gradient-to-r from-violet-200 to-fuchsia-200 dark:from-violet-900/40 dark:to-fuchsia-900/40' />
      <div className='space-y-3 p-4'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/50'
          />
        ))}
      </div>
    </div>
  )
}

export function AbonosPageMain() {
  const router = useRouter()
  const {
    negociaciones,
    negociacionesFiltradas,
    proyectosDisponibles,
    conteos,
    porcentajeCartera,
    busqueda,
    setBusqueda,
    proyectoFiltro,
    setProyectoFiltro,
    etapa,
    setEtapa,
    hayFiltros,
    limpiarFiltros,
    isLoading,
    estadisticas,
  } = useNegociacionesList()

  const abrirCliente = (n: NegociacionConAbonos) =>
    router.push(`/abonos/${getShortId(n.cliente.id)}`)

  // Las tarjetas de conteo son también el filtro de etapa
  const opcionesEtapa: EstadoFiltroOpcion<EtapaPago>[] = [
    {
      value: 'todos',
      label: 'Todos',
      count: conteos.todos,
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      text: 'text-violet-700 dark:text-violet-400',
      selected:
        'border-violet-400 bg-violet-50/80 ring-2 ring-violet-400/40 dark:border-violet-500/60 dark:bg-violet-500/10',
    },
    {
      value: 'sin_abonos',
      label: 'Sin abonos',
      count: conteos.sin_abonos,
      icon: CircleDashed,
      gradient: 'from-rose-500 to-pink-600',
      text: 'text-rose-700 dark:text-rose-400',
      selected:
        'border-rose-400 bg-rose-50/80 ring-2 ring-rose-400/40 dark:border-rose-500/60 dark:bg-rose-500/10',
    },
    {
      value: 'en_curso',
      label: 'Pagando',
      count: conteos.en_curso,
      icon: Hourglass,
      gradient: 'from-amber-400 to-orange-500',
      text: 'text-amber-700 dark:text-amber-400',
      selected:
        'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/40 dark:border-amber-500/60 dark:bg-amber-500/10',
    },
    {
      value: 'avanzados',
      label: `Más del ${UMBRAL_AVANZADO}%`,
      count: conteos.avanzados,
      icon: Rocket,
      gradient: 'from-emerald-500 to-teal-600',
      text: 'text-emerald-700 dark:text-emerald-400',
      selected:
        'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-400/40 dark:border-emerald-500/60 dark:bg-emerald-500/10',
    },
  ]

  const total = negociacionesFiltradas.length
  const resultado =
    total === negociaciones.length
      ? `${total} cliente${total !== 1 ? 's' : ''}`
      : `${total} de ${negociaciones.length} clientes`

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/60 to-purple-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className='mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 lg:py-8'
      >
        <ListPageHeader
          icon={Wallet}
          heroGradient='from-violet-600 via-purple-600 to-fuchsia-600'
          title='Registrar abono'
          subtitle='Elige el cliente que va a pagar'
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Abonos', href: '/abonos' },
            { label: 'Registrar' },
          ]}
          actions={
            <>
              {!isLoading && negociaciones.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  <HeroDato
                    icon={TrendingUp}
                    label='Total a pagar'
                    valor={formatCOP(estadisticas.totalVentas)}
                  />
                  <HeroDato
                    icon={PiggyBank}
                    label={`Recaudado · ${porcentajeCartera}%`}
                    valor={formatCOP(estadisticas.totalAbonado)}
                  />
                  <HeroDato
                    icon={Hourglass}
                    label='Por cobrar'
                    valor={formatCOP(estadisticas.saldoPendiente)}
                  />
                </div>
              )}
              <button
                type='button'
                onClick={() => router.push('/abonos')}
                className='inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-lg shadow-violet-900/20 transition-all hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-xl'
              >
                <Receipt className='h-4 w-4' />
                Ver recibos
              </button>
            </>
          }
        />

        <EstadoFiltroCards
          ariaLabel='Filtrar clientes por etapa del pago'
          total={conteos.todos}
          opciones={opcionesEtapa}
          seleccionado={etapa}
          onSeleccionar={setEtapa}
        />

        <ListSearchToolbar
          value={busqueda}
          onChange={setBusqueda}
          placeholder='Buscar por nombre, cédula o vivienda (A1, Mz. B 6)…'
          resultado={resultado}
          onLimpiar={hayFiltros ? limpiarFiltros : undefined}
        >
          {proyectosDisponibles.length > 1 && (
            <FilterDropdown
              value={proyectoFiltro}
              placeholder='Todos los proyectos'
              allValue='todos'
              activeClassName={FILTRO_ACTIVO}
              options={[
                { value: 'todos', label: 'Todos los proyectos' },
                ...proyectosDisponibles.map(p => ({ value: p, label: p })),
              ]}
              onChange={setProyectoFiltro}
            />
          )}
        </ListSearchToolbar>

        {isLoading ? (
          <Esqueleto />
        ) : total === 0 ? (
          negociaciones.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title='No hay clientes por abonar'
              description='Los clientes con una vivienda asignada y saldo pendiente aparecerán aquí para registrar sus pagos'
              moduleName='abonos'
            />
          ) : (
            <NoResults
              moduleName='abonos'
              onLimpiarFiltros={limpiarFiltros}
              mensaje='No hay clientes que coincidan con los filtros aplicados'
            />
          )
        ) : (
          <ClientesPorAbonarTabla
            negociaciones={negociacionesFiltradas}
            onAbrir={abrirCliente}
          />
        )}
      </motion.div>
    </div>
  )
}
