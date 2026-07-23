'use client'

import { useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, MessageSquare, Search, Star, User } from 'lucide-react'

import Link from 'next/link'

import type { NotaGlobalConCliente } from '@/modules/clientes/types/notas-historial.types'

import { useActividadClientesQuery } from '../hooks/useActividadClientes'

type Grupo = 'Hoy' | 'Ayer' | 'Esta semana' | 'Este mes' | 'Más antiguo'

function getGrupo(fechaStr: string): Grupo {
  const fecha = new Date(fechaStr)
  const ahora = new Date()
  const diffMs = ahora.getTime() - fecha.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias <= 7) return 'Esta semana'
  if (diffDias <= 30) return 'Este mes'
  return 'Más antiguo'
}

function tiempoRelativo(fechaStr: string): string {
  const fecha = new Date(fechaStr)
  const ahora = new Date()
  const diffMs = ahora.getTime() - fecha.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Ahora mismo'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `Hace ${diffD}d`
  return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

const ORDEN_GRUPOS: Grupo[] = [
  'Hoy',
  'Ayer',
  'Esta semana',
  'Este mes',
  'Más antiguo',
]

export function ActividadClientesView() {
  const { data: notas = [], isLoading } = useActividadClientesQuery(150)
  const [busqueda, setBusqueda] = useState('')
  const [soloImportantes, setSoloImportantes] = useState(false)

  const notasFiltradas = useMemo(() => {
    let resultado = notas
    if (soloImportantes) resultado = resultado.filter(n => n.es_importante)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter(
        n =>
          n.titulo.toLowerCase().includes(q) ||
          n.contenido.toLowerCase().includes(q) ||
          `${n.cliente.nombres} ${n.cliente.apellidos}`
            .toLowerCase()
            .includes(q)
      )
    }
    return resultado
  }, [notas, busqueda, soloImportantes])

  const grupos = useMemo(() => {
    const mapa = new Map<Grupo, NotaGlobalConCliente[]>()
    for (const nota of notasFiltradas) {
      const g = getGrupo(nota.fecha_creacion)
      if (!mapa.has(g)) mapa.set(g, [])
      const grupo = mapa.get(g)
      if (grupo) grupo.push(nota)
    }
    return ORDEN_GRUPOS.filter(g => mapa.has(g)).map(g => ({
      label: g,
      notas: mapa.get(g) ?? [],
    }))
  }, [notasFiltradas])

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className='h-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700'
          />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Barra de filtros */}
      <div className='flex flex-col gap-3 rounded-2xl border border-gray-200/50 bg-white/90 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/90 sm:flex-row sm:items-center'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Buscar por cliente o nota...'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className='w-full rounded-xl border-2 border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:border-gray-700 dark:bg-gray-900/50'
          />
        </div>
        <button
          onClick={() => setSoloImportantes(v => !v)}
          className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${
            soloImportantes
              ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-900/20 dark:text-amber-400'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-amber-300 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400'
          }`}
        >
          <Star className='h-4 w-4' />
          Solo importantes
        </button>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {notasFiltradas.length} nota{notasFiltradas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Estado vacío */}
      {grupos.length === 0 && (
        <div className='flex flex-col items-center gap-3 py-16 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/20'>
            <MessageSquare className='h-8 w-8 text-teal-500' />
          </div>
          <p className='font-semibold text-gray-700 dark:text-gray-300'>
            {busqueda || soloImportantes
              ? 'Sin resultados con los filtros aplicados'
              : 'Aún no hay notas registradas'}
          </p>
          <p className='text-sm text-gray-500'>
            Las notas agregadas a clientes aparecerán aquí
          </p>
        </div>
      )}

      {/* Timeline agrupado */}
      {grupos.map(({ label, notas: notasGrupo }) => (
        <div key={label}>
          <div className='mb-3 flex items-center gap-3'>
            <span className='text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400'>
              {label}
            </span>
            <div className='h-px flex-1 bg-gray-200 dark:bg-gray-700' />
            <span className='text-xs text-gray-400'>{notasGrupo.length}</span>
          </div>

          <div className='space-y-2'>
            {notasGrupo.map((nota, idx) => (
              <motion.div
                key={nota.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className='group flex gap-3 rounded-2xl border border-gray-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/80'
              >
                {/* Indicador de importancia */}
                <div className='mt-0.5 flex-shrink-0'>
                  {nota.es_importante ? (
                    <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30'>
                      <Star className='h-4 w-4 fill-amber-500 text-amber-500' />
                    </div>
                  ) : (
                    <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/20'>
                      <MessageSquare className='h-4 w-4 text-teal-500' />
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                    <Link
                      href={`/clientes/${nota.cliente_id}`}
                      className='text-sm font-semibold text-gray-900 hover:text-teal-600 dark:text-gray-100 dark:hover:text-teal-400'
                    >
                      {nota.cliente.nombres} {nota.cliente.apellidos}
                    </Link>
                    <span className='text-gray-300 dark:text-gray-600'>·</span>
                    <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                      {nota.titulo}
                    </span>
                  </div>

                  {nota.contenido && (
                    <p className='mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400'>
                      {nota.contenido}
                    </p>
                  )}

                  <div className='mt-2 flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500'>
                    <span className='inline-flex items-center gap-1'>
                      <User className='h-3 w-3' />
                      {nota.creador.nombres} {nota.creador.apellidos}
                    </span>
                    <span>{tiempoRelativo(nota.fecha_creacion)}</span>
                    {nota.fecha_actualizacion &&
                      nota.fecha_actualizacion !== nota.fecha_creacion && (
                        <span className='flex items-center gap-0.5 text-gray-300 dark:text-gray-600'>
                          <AlertCircle className='h-3 w-3' />
                          editada
                        </span>
                      )}
                  </div>
                </div>

                {/* Flecha al cliente */}
                <Link
                  href={`/clientes/${nota.cliente_id}`}
                  className='flex-shrink-0 self-center text-gray-300 transition-colors group-hover:text-teal-500 dark:text-gray-600 dark:group-hover:text-teal-400'
                  aria-label={`Ver cliente ${nota.cliente.nombres}`}
                >
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
