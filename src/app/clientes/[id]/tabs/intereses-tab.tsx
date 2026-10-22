'use client'

/**
 * Pestaña Intereses — solo orquesta:
 * - Lógica (consulta, filtro, descarte): useInteresesTab
 * - Tarjetas de estado como filtro (mismo componente que las listas)
 * - InteresCard / InteresesVacio en ./intereses
 */

import { Heart, Plus } from 'lucide-react'

import { ModalDescartarInteres } from '@/modules/clientes/components/modals/modal-descartar-interes'
import { useInteresesTab } from '@/modules/clientes/hooks'
import type { Cliente } from '@/modules/clientes/types'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import {
  EstadoFiltroCards,
  type EstadoFiltroOpcion,
} from '@/shared/components/list-page'

import { InteresesEsqueleto } from '../components/TabsEsqueletos'

import { INTERES_ESTADO_VISUAL } from './intereses/interes-visual'
import { InteresCard } from './intereses/InteresCard'
import { InteresesVacio } from './intereses/InteresesVacio'

interface InteresesTabProps {
  cliente: Cliente
  onRegistrarInteres?: () => void
  onVerNegociacion?: () => void
}

type FiltroInteres = 'Todos' | 'Activo' | 'Convertido' | 'Descartado'

export function InteresesTab({
  cliente,
  onRegistrarInteres,
  onVerNegociacion,
}: InteresesTabProps) {
  const { puede, esAdmin } = usePermisosQuery()
  const canEdit = esAdmin || puede('clientes', 'registrar_interes')

  const {
    intereses,
    loading,
    stats,
    estadoFiltro,
    descartando,
    abrirModalDescartar,
    cancelarDescartar,
    confirmarDescartar,
    interesADescartar,
    filtrarPorEstado,
  } = useInteresesTab({ clienteId: cliente.id })

  if (loading) {
    return <InteresesEsqueleto />
  }

  // Regla de negocio: una vivienda por cliente. Con vivienda vigente no se
  // registran intereses nuevos (solo se ven los que tuvo antes).
  const negVigente = cliente.negociaciones?.find(
    n =>
      n.estado === 'Activa' ||
      n.estado === 'Suspendida' ||
      n.estado === 'Completada'
  )
  const vivienda = negVigente?.viviendas
    ? {
        codigo: `${negVigente.viviendas.manzanas?.nombre ?? ''}${negVigente.viviendas.numero ?? ''}`,
        proyecto: negVigente.viviendas.manzanas?.proyectos?.nombre,
        valor: negVigente.valor_total_pagar || negVigente.valor_total,
        pagada:
          negVigente.estado === 'Completada' || negVigente.saldo_pendiente <= 0,
      }
    : null

  const registrar = canEdit && !vivienda ? onRegistrarInteres : undefined

  if (stats.total === 0) {
    return (
      <InteresesVacio
        vivienda={vivienda}
        onRegistrar={registrar}
        onVerNegociacion={onVerNegociacion}
      />
    )
  }

  const conEstilo = (estado: Exclude<FiltroInteres, 'Todos'>) => {
    const v = INTERES_ESTADO_VISUAL[estado]
    return {
      icon: v.icon,
      gradient: v.gradient,
      text: v.text,
      selected: v.selected,
    }
  }
  const opciones: EstadoFiltroOpcion<FiltroInteres>[] = [
    {
      value: 'Todos',
      label: 'Todos',
      count: stats.total,
      icon: Heart,
      gradient: 'from-cyan-500 to-blue-600',
      text: 'text-cyan-700 dark:text-cyan-400',
      selected:
        'border-cyan-400 bg-cyan-50/80 ring-2 ring-cyan-400/40 dark:border-cyan-500/60 dark:bg-cyan-500/10',
    },
    {
      value: 'Activo',
      label: 'Activos',
      count: stats.activos,
      ...conEstilo('Activo'),
    },
    {
      value: 'Convertido',
      label: 'Convertidos',
      count: stats.convertidos,
      ...conEstilo('Convertido'),
    },
    {
      value: 'Descartado',
      label: 'Descartados',
      count: stats.descartados,
      ...conEstilo('Descartado'),
    },
  ]

  const conversion = Math.round((stats.convertidos / stats.total) * 100)

  return (
    <>
      <div className='space-y-4'>
        <EstadoFiltroCards
          ariaLabel='Filtrar intereses por estado'
          total={stats.total}
          opciones={opciones}
          seleccionado={(estadoFiltro as FiltroInteres | null) ?? 'Todos'}
          onSeleccionar={v => filtrarPorEstado(v === 'Todos' ? null : v)}
        />

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            <span className='font-bold text-emerald-600 dark:text-emerald-400'>
              {conversion}% de conversión
            </span>{' '}
            · {stats.convertidos} de {stats.total}{' '}
            {stats.total === 1 ? 'interés pasó' : 'intereses pasaron'} a
            negociación
          </p>
          {registrar && (
            <button
              type='button'
              onClick={registrar}
              className='inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 text-sm font-semibold text-white shadow-md shadow-pink-500/25 transition-all hover:-translate-y-0.5 hover:shadow-lg'
            >
              <Plus className='h-4 w-4' />
              Registrar interés
            </button>
          )}
        </div>

        {intereses.length === 0 ? (
          <div className='rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400'>
            No hay intereses con este estado
          </div>
        ) : (
          <div className='grid gap-4 lg:grid-cols-2'>
            {intereses.map(interes => (
              <InteresCard
                key={interes.id}
                interes={interes}
                canDescartar={canEdit}
                descartando={descartando === interes.id}
                onDescartar={abrirModalDescartar}
              />
            ))}
          </div>
        )}
      </div>

      <ModalDescartarInteres
        interes={interesADescartar}
        descartando={descartando !== null}
        onConfirmar={confirmarDescartar}
        onCancelar={cancelarDescartar}
      />
    </>
  )
}
