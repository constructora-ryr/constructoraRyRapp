'use client'

/**
 * Detalle de un evento del historial: la carcasa común (ModalHistorial) con
 * el color del módulo del evento, el renderer de su tipo como contenido,
 * anterior/siguiente y un acceso a la pestaña donde vive ese dato.
 */

import { ArrowRight, Clock } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import type { VisorNavegacion } from '@/shared/components/visor-archivo'

import { getEventoRenderer } from '../renderers'
import { MODULO_EVENTO, resumenCorto } from '../timeline/tono-evento'
import { UsuarioEvento } from '../timeline/UsuarioEvento'

import { ModalHistorial } from './ModalHistorial'

export type TabCliente = 'general' | 'intereses' | 'negociacion' | 'documentos'

/** Degradado del encabezado por módulo (tabla de origen del evento) */
const COLOR_MODULO: Record<string, string> = {
  clientes: 'from-cyan-600 via-blue-600 to-indigo-600',
  intereses: 'from-blue-600 via-indigo-600 to-violet-600',
  negociaciones: 'from-pink-600 via-fuchsia-600 to-purple-600',
  abonos_historial: 'from-violet-600 via-purple-600 to-fuchsia-600',
  documentos_cliente: 'from-sky-600 via-blue-600 to-indigo-600',
  renuncias: 'from-rose-600 via-red-600 to-orange-600',
  notas: 'from-violet-600 via-purple-600 to-fuchsia-600',
}

/** Pestaña del cliente donde está hoy el dato de cada módulo */
const DESTINO: Record<string, { tab: TabCliente; label: string }> = {
  clientes: { tab: 'general', label: 'Ver en Información general' },
  intereses: { tab: 'intereses', label: 'Ver en Intereses' },
  negociaciones: { tab: 'negociacion', label: 'Ver en Negociación' },
  abonos_historial: { tab: 'negociacion', label: 'Ver en Negociación' },
  renuncias: { tab: 'negociacion', label: 'Ver en Negociación' },
  documentos_cliente: { tab: 'documentos', label: 'Ver en Documentos' },
}

function colorEncabezado(evento: EventoHistorialHumanizado) {
  if (evento.metadata?.esImportante === true)
    return 'from-amber-500 via-orange-500 to-orange-600'
  return (
    COLOR_MODULO[evento.tabla] ?? 'from-slate-600 via-slate-700 to-slate-800'
  )
}

export function EventoDetalleModal({
  evento,
  onClose,
  navegacion,
  onIrATab,
}: {
  evento: EventoHistorialHumanizado
  onClose: () => void
  navegacion?: VisorNavegacion
  /** Cambia de pestaña en el detalle del cliente */
  onIrATab?: (tab: TabCliente) => void
}) {
  const Renderer = getEventoRenderer(evento.tipo)
  const destino = DESTINO[evento.tabla]
  const fecha = new Date(evento.fecha).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <ModalHistorial
      onClose={onClose}
      navegacion={navegacion}
      gradient={colorEncabezado(evento)}
      icon={evento.icono}
      titulo={evento.titulo}
      subtitulo={
        evento.metadata?.esNota === true
          ? 'Nota manual'
          : [MODULO_EVENTO[evento.tabla], resumenCorto(evento.descripcion)]
              .filter(Boolean)
              .join(' · ')
      }
      franja={
        <>
          <UsuarioEvento usuario={evento.usuario} />
          <span className='inline-flex items-center gap-1.5 text-xs text-slate-600 first-letter:uppercase dark:text-slate-300'>
            <Clock className='h-3.5 w-3.5 text-slate-400' />
            {fecha}
          </span>
        </>
      }
      pie={
        destino && onIrATab ? (
          <button
            type='button'
            onClick={() => {
              onIrATab(destino.tab)
              onClose()
            }}
            className='inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          >
            {destino.label}
            <ArrowRight className='h-4 w-4' />
          </button>
        ) : undefined
      }
    >
      {/* key: al navegar se monta de nuevo (vista previa, estado interno) */}
      <Renderer key={evento.id} evento={evento} />
    </ModalHistorial>
  )
}
