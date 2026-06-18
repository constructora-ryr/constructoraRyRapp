/**
 * TimelineEventoCard - Card individual de evento en la línea de tiempo
 * Muestra icono, título, descripción, hora, usuario y acciones contextuales
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Clock, Edit, Eye, Star, Trash2, User } from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { RichTextContent } from '@/shared/components/rich-text/RichTextContent'

import {
  coloresEvento,
  historialStyles as styles,
} from '../historial-tab.styles'

import { EventoDetalleModal } from './EventoDetalleModal'

interface TimelineEventoCardProps {
  evento: EventoHistorialHumanizado
  onEditarNota?: (notaId: string) => void
  onEliminarNota?: (notaId: string) => void
  notasEditables?: Set<string>
}

export function TimelineEventoCard({
  evento,
  onEditarNota,
  onEliminarNota,
  notasEditables,
}: TimelineEventoCardProps) {
  const [showDetalle, setShowDetalle] = useState(false)
  const colores = coloresEvento[evento.color] || coloresEvento.gray

  const esNota = evento.metadata?.esNota === true
  const notaId = evento.metadata?.notaId as string | undefined
  const esImportante = evento.metadata?.esImportante === true
  const puedeEditar = notaId ? (notasEditables?.has(notaId) ?? false) : false

  const tieneDetalles =
    (evento.detalles && evento.detalles.length > 0) || evento.metadata

  // Formatear hora
  const hora = new Date(evento.fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  // Badge label
  const accionLabel = esNota
    ? esImportante
      ? 'Nota Importante'
      : 'Nota Manual'
    : evento.accion === 'CREATE'
      ? 'Creación'
      : evento.accion === 'UPDATE'
        ? 'Actualización'
        : evento.accion === 'DELETE'
          ? 'Eliminación'
          : evento.accion

  const IconoEvento = evento.icono

  return (
    <>
      <motion.div
        initial={styles.animations.slideIn.initial}
        animate={styles.animations.slideIn.animate}
        transition={{ duration: 0.3 }}
        className={styles.eventoCard.wrapper}
      >
        {/* Punto del timeline */}
        <div className={`${styles.eventoCard.punto} ${colores.bg}`}>
          <IconoEvento
            className={`${styles.eventoCard.puntoIcon} ${colores.icon}`}
            strokeWidth={2.5}
          />
        </div>

        {/* Card — notas usan clases propias con fondo tintado para distinguirlas de eventos automáticos */}
        <motion.div
          whileHover={styles.animations.cardHover.whileHover}
          transition={styles.animations.cardHover.transition}
          className={
            esNota
              ? esImportante
                ? styles.eventoCard.notaImportanteCard
                : styles.eventoCard.notaCard
              : `${styles.eventoCard.card} ${colores.border}`
          }
        >
          <div
            className={`${styles.eventoCard.barraLateral} ${colores.barraLateral}`}
          />

          <div className='space-y-1 px-4 py-3'>
            {/* Header: Título + Badge + Hora */}
            <div className={styles.eventoCard.headerRow}>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h5 className={styles.eventoCard.titulo}>{evento.titulo}</h5>
                  {esNota && esImportante ? (
                    <span className={styles.eventoCard.notaImportanteIndicator}>
                      <Star className='h-2.5 w-2.5' />
                      Importante
                    </span>
                  ) : null}
                  {esNota && !esImportante ? (
                    <span className={styles.eventoCard.notaBadge}>Nota</span>
                  ) : null}
                </div>
                {esNota ? (
                  <div className='mt-0.5 line-clamp-3 text-sm text-gray-600 dark:text-gray-400'>
                    <RichTextContent html={evento.descripcion ?? ''} />
                  </div>
                ) : (
                  <p className={styles.eventoCard.descripcion}>
                    {evento.descripcion}
                  </p>
                )}
              </div>

              <div className='flex shrink-0 items-center gap-2'>
                {/* Badge de acción */}
                <span
                  className={`${styles.eventoCard.accionBadge} ${colores.bg} ${colores.icon}`}
                >
                  {accionLabel}
                </span>
                {/* Hora */}
                <span className={styles.eventoCard.horaContainer}>
                  <Clock className={styles.eventoCard.horaIcon} />
                  {hora}
                </span>
              </div>
            </div>

            {/* Usuario + Acciones */}
            <div className={styles.eventoCard.usuarioRow}>
              <User className={styles.eventoCard.usuarioIcon} />
              <div className='flex flex-1 items-center gap-1.5'>
                <span className={styles.eventoCard.usuarioLabel}>
                  Realizado por:
                </span>
                <span className={styles.eventoCard.usuarioName}>
                  {evento.usuario.nombres || evento.usuario.email}
                </span>
                {evento.usuario.rol ? (
                  <span className={styles.eventoCard.usuarioRol}>
                    · {evento.usuario.rol}
                  </span>
                ) : null}
              </div>

              {/* Acciones de nota */}
              {esNota && puedeEditar && notaId ? (
                <div className={styles.eventoCard.notaActions}>
                  <button
                    type='button'
                    onClick={() => onEditarNota?.(notaId)}
                    className={styles.eventoCard.notaButton}
                    title='Editar nota'
                  >
                    <Edit className={styles.eventoCard.notaButtonIcon} />
                  </button>
                  <button
                    type='button'
                    onClick={() => onEliminarNota?.(notaId)}
                    className={styles.eventoCard.notaButton}
                    title='Eliminar nota'
                  >
                    <Trash2 className={styles.eventoCard.notaButtonIcon} />
                  </button>
                </div>
              ) : null}

              {/* Botón ver detalles */}
              {tieneDetalles && !esNota ? (
                <button
                  type='button'
                  onClick={() => setShowDetalle(true)}
                  className={styles.eventoCard.detallesButton}
                >
                  <Eye className={styles.eventoCard.detallesButtonIcon} />
                  Ver detalle
                </button>
              ) : null}

              {/* Botón expandir nota completa */}
              {esNota ? (
                <button
                  type='button'
                  onClick={() => setShowDetalle(true)}
                  className={styles.eventoCard.detallesButtonNota}
                >
                  <Eye className={styles.eventoCard.detallesButtonIcon} />
                  Ver nota
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal de detalle */}
      {showDetalle ? (
        <EventoDetalleModal
          evento={evento}
          onClose={() => setShowDetalle(false)}
        />
      ) : null}
    </>
  )
}
