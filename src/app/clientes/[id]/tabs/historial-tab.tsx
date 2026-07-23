/**
 * Tab de Historial del Cliente
 * Línea de tiempo cronológica con todos los movimientos del cliente:
 * creación, ediciones, negociaciones, abonos, renuncias, intereses, documentos y notas manuales.
 *
 * ARQUITECTURA:
 * - Componente orquestador (< 150 líneas)
 * - Lógica en useHistorialCliente hook
 * - UI separada en historial/components/
 */

'use client'

import { useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Clock, Eye, EyeOff, Filter, Lock, X } from 'lucide-react'
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
import { SectionLoadingSpinner } from '@/shared/components/ui'

import {
  HistorialFiltros,
  HistorialResumen,
  NotaModal,
  TimelineGrupoFecha,
} from './historial/components'

interface HistorialTabProps {
  clienteId: string
  clienteNombre: string
}

export function HistorialTab({ clienteId, clienteNombre }: HistorialTabProps) {
  const queryClient = useQueryClient()
  const [mostrarModalNota, setMostrarModalNota] = useState(false)
  const [notaIdSeleccionado, setNotaIdSeleccionado] = useState<string | null>(
    null
  )
  const { confirm } = useModal()
  const { eliminarNota } = useNotasHistorial(clienteId)
  const { puede, esAdmin, isLoading: permisosLoading } = usePermisosQuery()

  const tienePermiso = esAdmin || puede('clientes', 'ver_historial')
  const canAnotarHistorial = esAdmin || puede('clientes', 'anotar_historial')

  const {
    eventosAgrupados,
    estadisticas,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    limpiarFiltros,
    tieneAplicados,
    mostrarOcultos,
    setMostrarOcultos,
    ocultarEvento,
    restaurarEvento,
  } = useHistorialCliente({ clienteId, habilitado: tienePermiso })

  // Scroll a nota específica si viene desde Actividad de Clientes
  useEffect(() => {
    if (isLoading) return
    const notaIntent = sessionStorage.getItem('cliente-nota-intent')
    if (!notaIntent) return
    sessionStorage.removeItem('cliente-nota-intent')
    const timer = setTimeout(() => {
      const el = document.getElementById(`evento-${notaIntent}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.style.transition = 'outline 0.4s ease'
        el.style.outline = '2px solid #0d9488'
        el.style.borderRadius = '12px'
        setTimeout(() => {
          el.style.outline = ''
        }, 2000)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [isLoading])

  // Aplanar eventos para calcular permisos
  const todosLosEventos = useMemo(() => {
    return eventosAgrupados.flatMap(g => g.eventos)
  }, [eventosAgrupados])

  const { notasEditables } = usePermisosNotasHistorial(todosLosEventos)

  // Formatear fecha del primer evento para el resumen
  const primerEventoFormateado = estadisticas.primerEvento
    ? formatDateCompact(estadisticas.primerEvento)
    : null

  // ========== HANDLERS DE NOTAS ==========
  const handleEditarNota = async (notaId: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ['nota-historial', notaId],
        queryFn: () => notasHistorialService.obtenerNotaPorId(notaId),
      })
      setNotaIdSeleccionado(notaId)
      setMostrarModalNota(true)
    } catch (err) {
      logger.error('Error cargando nota:', err)
      toast.error('Error al cargar la nota')
    }
  }

  const handleEliminarNota = async (notaId: string) => {
    const confirmado = await confirm({
      title: '¿Eliminar nota?',
      message:
        'Esta acción no se puede deshacer. La nota se eliminará permanentemente del historial.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })
    if (confirmado) {
      try {
        await eliminarNota(notaId)
      } catch (err) {
        logger.error('Error eliminando nota:', err)
      }
    }
  }

  const handleCerrarModal = () => {
    setMostrarModalNota(false)
    setNotaIdSeleccionado(null)
  }

  // ========== ESTADOS ==========
  if (permisosLoading) {
    return (
      <SectionLoadingSpinner
        label='Verificando permisos...'
        moduleName='clientes'
        icon={Clock}
      />
    )
  }

  if (!tienePermiso) {
    return (
      <div className='p-6'>
        <EmptyState
          icon={<Lock className='h-12 w-12 text-gray-400' />}
          title='Sin acceso al historial'
          description='No tienes permisos para ver el historial de este cliente. Contacta a un administrador si necesitas acceso.'
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <SectionLoadingSpinner
        label='Cargando historial...'
        moduleName='clientes'
        icon={Clock}
      />
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <EmptyState
          icon={<X className='h-12 w-12 text-red-500' />}
          title='Error al cargar historial'
          description='Ocurrió un error al cargar el historial del cliente'
        />
      </div>
    )
  }

  if (estadisticas.total === 0) {
    return (
      <div className='p-6'>
        <EmptyState
          icon={<Clock className='h-12 w-12 text-gray-400' />}
          title='Sin historial'
          description='Este cliente aún no tiene eventos registrados'
        />
      </div>
    )
  }

  // ========== RENDER ==========
  return (
    <div className='space-y-4 py-4'>
      {/* Resumen del ciclo de vida */}
      <HistorialResumen
        total={estadisticas.total}
        estaSemana={estadisticas.estaSemana}
        esteMes={estadisticas.esteMes}
        criticos={estadisticas.criticos}
        primerEvento={primerEventoFormateado}
      />

      {/* Filtros */}
      <HistorialFiltros
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        categoriaActiva={categoria}
        onCategoriaChange={setCategoria}
        totalFiltrados={estadisticas.filtrados}
        totalGeneral={estadisticas.total}
        tieneAplicados={tieneAplicados}
        onLimpiarFiltros={limpiarFiltros}
        onAgregarNota={() => setMostrarModalNota(true)}
        canAgregarNota={canAnotarHistorial}
      />

      {/* Toggle ocultos — solo admins */}
      {esAdmin ? (
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={() => setMostrarOcultos(v => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              mostrarOcultos
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/40 dark:hover:text-white/60'
            }`}
          >
            {mostrarOcultos ? (
              <Eye className='h-3.5 w-3.5' />
            ) : (
              <EyeOff className='h-3.5 w-3.5' />
            )}
            {mostrarOcultos ? 'Ocultar ocultos' : 'Mostrar ocultos'}
          </button>
        </div>
      ) : null}

      {/* Timeline */}
      {estadisticas.filtrados === 0 ? (
        <div className='py-8'>
          <EmptyState
            icon={<Filter className='h-12 w-12 text-gray-400' />}
            title='Sin resultados'
            description='No se encontraron eventos con los filtros aplicados'
          />
        </div>
      ) : (
        <div className='relative pl-8'>
          {/* Línea vertical del timeline */}
          <div className='absolute bottom-4 left-[15px] top-0 w-[2px] bg-gradient-to-b from-cyan-300 via-cyan-200 to-transparent dark:from-cyan-700 dark:via-cyan-800' />

          <AnimatePresence>
            {eventosAgrupados.map(grupo => (
              <TimelineGrupoFecha
                key={grupo.fecha}
                fecha={grupo.fecha}
                fechaFormateada={grupo.fechaFormateada}
                total={grupo.total}
                eventos={grupo.eventos}
                onEditarNota={handleEditarNota}
                onEliminarNota={handleEliminarNota}
                notasEditables={notasEditables}
                onOcultarEvento={esAdmin ? ocultarEvento : undefined}
                onRestaurarEvento={esAdmin ? restaurarEvento : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de nota */}
      <NotaModal
        isOpen={mostrarModalNota}
        onClose={handleCerrarModal}
        clienteId={clienteId}
        clienteNombre={clienteNombre}
        notaId={notaIdSeleccionado}
      />
    </div>
  )
}
