/**
 * Pestaña Historial del cliente: línea de tiempo de todo lo que pasó con el
 * cliente (creación, ediciones, negociación, abonos, documentos, renuncias,
 * intereses y notas manuales). Datos y filtros en useHistorialCliente.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Clock, Lock, SearchX } from 'lucide-react'
import { toast } from 'sonner'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'
import { useHistorialCliente } from '@/modules/clientes/hooks/useHistorialCliente'
import { useNotasHistorial } from '@/modules/clientes/hooks/useNotasHistorial'
import { usePermisosNotasHistorial } from '@/modules/clientes/hooks/usePermisosNotasHistorial'
import { notasHistorialService } from '@/modules/clientes/services/notas-historial.service'
import { usePermisosQuery } from '@/modules/usuarios/hooks'
import { EmptyState } from '@/shared/components/layout/EmptyState'
import { useModal } from '@/shared/components/modals'

import { HistorialEsqueleto } from '../components/TabsEsqueletos'

import {
  EventoDetalleModal,
  type TabCliente,
} from './historial/components/EventoDetalleModal'
import { HistorialFiltros } from './historial/components/HistorialFiltros'
import { NotaModal } from './historial/components/NotaModal'
import { DiaTimeline } from './historial/timeline/DiaTimeline'
import type { AccionesEvento } from './historial/timeline/EventoCard'

interface HistorialTabProps {
  clienteId: string
  clienteNombre: string
  /** Para "Ver en Negociación", "Ver en Documentos"… desde el detalle */
  onIrATab?: (tab: TabCliente) => void
}

/** Lleva a la nota abierta desde "Actividad de clientes" y la resalta */
function useScrollANotaPendiente(listo: boolean) {
  useEffect(() => {
    if (!listo) return
    const notaId = sessionStorage.getItem('cliente-nota-intent')
    if (!notaId) return
    sessionStorage.removeItem('cliente-nota-intent')
    const timer = setTimeout(() => {
      const el = document.getElementById(`evento-${notaId}`)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-teal-500', 'rounded-2xl')
      setTimeout(
        () => el.classList.remove('ring-2', 'ring-teal-500', 'rounded-2xl'),
        2000
      )
    }, 400)
    return () => clearTimeout(timer)
  }, [listo])
}

export function HistorialTab({
  clienteId,
  clienteNombre,
  onIrATab,
}: HistorialTabProps) {
  const queryClient = useQueryClient()
  const { confirm } = useModal()
  const { eliminarNota } = useNotasHistorial(clienteId)
  const { puede, esAdmin, isLoading: permisosLoading } = usePermisosQuery()

  const tienePermiso = esAdmin || puede('clientes', 'ver_historial')
  const canAnotarHistorial = esAdmin || puede('clientes', 'anotar_historial')

  const [modalNota, setModalNota] = useState<{ notaId: string | null } | null>(
    null
  )
  // Id del evento abierto en el detalle (se navega por la lista visible)
  const [detalleId, setDetalleId] = useState<string | null>(null)

  const {
    eventosAgrupados,
    estadisticas,
    conteoPorCategoria,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    limpiarFiltros,
    mostrarOcultos,
    setMostrarOcultos,
    ocultarEvento,
    restaurarEvento,
    vistaNueva,
    alternarVistaNueva,
  } = useHistorialCliente({ clienteId, habilitado: tienePermiso })

  useScrollANotaPendiente(!isLoading)

  const todosLosEventos = useMemo(
    () => eventosAgrupados.flatMap(g => g.eventos),
    [eventosAgrupados]
  )
  const { notasEditables } = usePermisosNotasHistorial(todosLosEventos)
  const indiceDetalle = detalleId
    ? todosLosEventos.findIndex(e => e.id === detalleId)
    : -1

  const editarNota = async (notaId: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ['nota-historial', notaId],
        queryFn: () => notasHistorialService.obtenerNotaPorId(notaId),
      })
      setModalNota({ notaId })
    } catch (err) {
      logger.error('Error cargando nota:', err)
      toast.error('No se pudo cargar la nota')
    }
  }

  const borrarNota = async (notaId: string) => {
    const confirmado = await confirm({
      title: '¿Eliminar nota?',
      message:
        'Esta acción no se puede deshacer. La nota se eliminará permanentemente del historial.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })
    if (!confirmado) return
    try {
      await eliminarNota(notaId)
    } catch (err) {
      logger.error('Error eliminando nota:', err)
    }
  }

  const acciones: AccionesEvento = {
    onVerDetalle: evento => setDetalleId(evento.id),
    onEditarNota: editarNota,
    onEliminarNota: borrarNota,
    notasEditables,
    // En la vista de prueba no se oculta: los ids son de otra tabla
    onOcultarEvento: esAdmin && !vistaNueva ? ocultarEvento : undefined,
    onRestaurarEvento: esAdmin && !vistaNueva ? restaurarEvento : undefined,
  }

  if (permisosLoading) return <HistorialEsqueleto />

  if (!tienePermiso) {
    return (
      <EmptyState
        icon={<Lock className='h-12 w-12' />}
        title='Sin acceso al historial'
        description='No tienes permiso para ver el historial de este cliente. Pide acceso a un administrador.'
      />
    )
  }

  if (isLoading) return <HistorialEsqueleto />

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className='h-12 w-12 text-rose-500' />}
        title='No se pudo cargar el historial'
        description='Revisa tu conexión y vuelve a abrir la pestaña.'
      />
    )
  }

  if (estadisticas.total === 0 && !mostrarOcultos) {
    return (
      <EmptyState
        icon={<Clock className='h-12 w-12' />}
        title='Sin historial todavía'
        description='Aquí aparecerá todo lo que pase con este cliente.'
      />
    )
  }

  return (
    <div className='space-y-5 py-2'>
      <HistorialFiltros
        resumen={estadisticas}
        desde={
          estadisticas.primerEvento
            ? formatDateCompact(estadisticas.primerEvento)
            : null
        }
        conteoPorCategoria={conteoPorCategoria}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        categoriaActiva={categoria}
        onCategoriaChange={setCategoria}
        onAgregarNota={
          canAnotarHistorial ? () => setModalNota({ notaId: null }) : undefined
        }
        mostrarOcultos={mostrarOcultos}
        onToggleOcultos={esAdmin ? () => setMostrarOcultos(v => !v) : undefined}
        vistaNueva={vistaNueva}
        onToggleVistaNueva={esAdmin ? alternarVistaNueva : undefined}
      />

      {estadisticas.filtrados === 0 ? (
        <EmptyState
          icon={<SearchX className='h-12 w-12' />}
          title='Sin resultados'
          description='Ningún evento coincide con la búsqueda o la categoría elegida.'
          action={
            <button
              type='button'
              onClick={limpiarFiltros}
              className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className='space-y-6'>
          {eventosAgrupados.map(grupo => (
            <DiaTimeline key={grupo.fecha} grupo={grupo} acciones={acciones} />
          ))}
        </div>
      )}

      {indiceDetalle >= 0 ? (
        <EventoDetalleModal
          evento={todosLosEventos[indiceDetalle]}
          onClose={() => setDetalleId(null)}
          onIrATab={onIrATab}
          navegacion={{
            actual: indiceDetalle + 1,
            total: todosLosEventos.length,
            nombre: 'Evento',
            onAnterior:
              indiceDetalle > 0
                ? () => setDetalleId(todosLosEventos[indiceDetalle - 1].id)
                : undefined,
            onSiguiente:
              indiceDetalle < todosLosEventos.length - 1
                ? () => setDetalleId(todosLosEventos[indiceDetalle + 1].id)
                : undefined,
          }}
        />
      ) : null}

      {modalNota ? (
        <NotaModal
          key={modalNota.notaId ?? 'nueva'}
          onClose={() => setModalNota(null)}
          clienteId={clienteId}
          clienteNombre={clienteNombre}
          notaId={modalNota.notaId}
        />
      ) : null}
    </div>
  )
}
