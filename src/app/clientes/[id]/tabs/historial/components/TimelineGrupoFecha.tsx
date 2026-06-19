/**
 * TimelineGrupoFecha - Grupo de eventos agrupados por fecha
 * Muestra la fecha como separador y renderiza los eventos hijos
 */

'use client'

import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { historialStyles as styles } from '../historial-tab.styles'

import { TimelineEventoCard } from './TimelineEventoCard'

interface TimelineGrupoFechaProps {
  fecha: string
  fechaFormateada: string
  total: number
  eventos: EventoHistorialHumanizado[]
  onEditarNota?: (notaId: string) => void
  onEliminarNota?: (notaId: string) => void
  notasEditables?: Set<string>
  onOcultarEvento?: (eventoId: string) => void
  onRestaurarEvento?: (eventoId: string) => void
}

export function TimelineGrupoFecha({
  fechaFormateada,
  total,
  eventos,
  onEditarNota,
  onEliminarNota,
  notasEditables,
  onOcultarEvento,
  onRestaurarEvento,
}: TimelineGrupoFechaProps) {
  return (
    <motion.div
      initial={styles.animations.fadeIn.initial}
      animate={styles.animations.fadeIn.animate}
      className={styles.timeline.grupoWrapper}
    >
      {/* Marcador de fecha en la línea */}
      <div className={styles.timeline.grupoFechaContainer}>
        <div className={styles.timeline.grupoFechaPunto}>
          <CalendarDays className={styles.timeline.grupoFechaIcono} />
        </div>
        <span className={styles.timeline.grupoFechaTexto}>
          {fechaFormateada}
        </span>
        <span className={styles.timeline.grupoFechaContador}>
          {total} {total === 1 ? 'evento' : 'eventos'}
        </span>
      </div>

      {/* Eventos del grupo */}
      <div className={styles.timeline.grupoEventos}>
        {eventos.map(evento => (
          <TimelineEventoCard
            key={evento.id}
            evento={evento}
            onEditarNota={onEditarNota}
            onEliminarNota={onEliminarNota}
            notasEditables={notasEditables}
            onOcultarEvento={onOcultarEvento}
            onRestaurarEvento={onRestaurarEvento}
          />
        ))}
      </div>
    </motion.div>
  )
}
