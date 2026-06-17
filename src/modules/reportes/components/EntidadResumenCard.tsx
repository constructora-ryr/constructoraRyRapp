'use client'

import { memo } from 'react'

import { Building2, ChevronRight, Users } from 'lucide-react'

import type { EntidadFinancieraResumen } from '../types'

interface EntidadResumenCardProps {
  entidad: EntidadFinancieraResumen
  seleccionada: boolean
  onSeleccionar: (id: string) => void
}

function EntidadResumenCardComponent({
  entidad,
  seleccionada,
  onSeleccionar,
}: EntidadResumenCardProps) {
  const colorPorTipo: Record<string, string> = {
    Banco: 'from-blue-600 to-indigo-600',
    'Caja de Compensación': 'from-emerald-600 to-teal-600',
    Cooperativa: 'from-purple-600 to-violet-600',
    Gobierno: 'from-orange-500 to-amber-500',
    Otro: 'from-gray-500 to-slate-600',
  }

  const bgPorTipo: Record<string, string> = {
    Banco: 'bg-blue-50 dark:bg-blue-950/30',
    'Caja de Compensación': 'bg-emerald-50 dark:bg-emerald-950/30',
    Cooperativa: 'bg-purple-50 dark:bg-purple-950/30',
    Gobierno: 'bg-orange-50 dark:bg-orange-950/30',
    Otro: 'bg-gray-50 dark:bg-gray-800/50',
  }

  const borderPorTipo: Record<string, string> = {
    Banco: 'border-blue-200 dark:border-blue-800',
    'Caja de Compensación': 'border-emerald-200 dark:border-emerald-800',
    Cooperativa: 'border-purple-200 dark:border-purple-800',
    Gobierno: 'border-orange-200 dark:border-orange-800',
    Otro: 'border-gray-200 dark:border-gray-700',
  }

  const gradient = colorPorTipo[entidad.tipo] ?? colorPorTipo['Otro']
  const bg = bgPorTipo[entidad.tipo] ?? bgPorTipo['Otro']
  const border = borderPorTipo[entidad.tipo] ?? borderPorTipo['Otro']

  return (
    <button
      type='button'
      onClick={() => onSeleccionar(entidad.id)}
      className={`group w-full rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-lg ${bg} ${
        seleccionada
          ? `${border} ring-current/20 shadow-md ring-2 ring-inset`
          : 'hover:border-current/40 border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Cabecera */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}
          >
            <Building2 className='h-5 w-5 text-white' />
          </div>
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>
              {entidad.nombre}
            </p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {entidad.tipo === 'Gobierno' ? 'Subsidio' : entidad.tipo}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${seleccionada ? 'rotate-90' : 'group-hover:translate-x-0.5'}`}
        />
      </div>

      {/* Métricas */}
      <div className='mt-3 grid grid-cols-2 gap-2'>
        <div>
          <p className='text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Clientes
          </p>
          <div className='flex items-center gap-1'>
            <Users className='h-3.5 w-3.5 text-gray-400' />
            <p className='text-lg font-bold text-gray-900 dark:text-white'>
              {entidad.totalClientesUnicos}
            </p>
          </div>
        </div>
        <div>
          <p className='text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            {esSubsidio(entidad.tipo) ? 'Total Asignado' : 'Total Aprobado'}
          </p>
          <p className='text-xs font-bold text-gray-900 dark:text-white'>
            {formatCOP(entidad.montoTotalAprobado)}
          </p>
        </div>
      </div>

      {/* Desembolso */}
      <div className='mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-950/30'>
        <p className='text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400'>
          Desembolsado
        </p>
        <p className='text-xs font-bold text-emerald-700 dark:text-emerald-300'>
          {formatCOP(entidad.totalDesembolsado)}
        </p>
      </div>

      {/* Barra de porcentaje */}
      <div className='mt-3'>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] text-gray-500 dark:text-gray-400'>
            Del total financiado
          </span>
          <span className='text-[10px] font-semibold text-gray-700 dark:text-gray-300'>
            {entidad.porcentajeDelTotal.toFixed(1)}%
          </span>
        </div>
        <div className='mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
            style={{ width: `${Math.min(entidad.porcentajeDelTotal, 100)}%` }}
          />
        </div>
      </div>
    </button>
  )
}

export const EntidadResumenCard = memo(EntidadResumenCardComponent)

// ── Utilidades locales ───────────────────────────────────────────────────────

function esSubsidio(tipo: string): boolean {
  return (
    tipo === 'Caja de Compensación' ||
    tipo === 'Cooperativa' ||
    tipo === 'Gobierno'
  )
}

function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}
