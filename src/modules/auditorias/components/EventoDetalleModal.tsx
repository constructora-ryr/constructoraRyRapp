/**
 * Detalle de un evento de auditoría, para leer de arriba abajo:
 * 1. Qué pasó: encabezado (reemplazo, papelera, anulación…) y una frase
 * 2. Contexto: chips de cliente, casa y categoría
 * 3. Evidencia: archivo(s) y lo que cambió (antes → después)
 * 4. Datos del registro y, plegados, los datos técnicos
 */

'use client'

import { useState } from 'react'

import { FolderOpen, Home, Sparkles, User } from 'lucide-react'

import Link from 'next/link'

import { getShortId } from '@/lib/utils/slug.utils'
import { ModalDetalle } from '@/shared/components/modals/ModalDetalle'
import type { VisorNavegacion } from '@/shared/components/visor-archivo'
import { cn } from '@/shared/utils/helpers'

import { infoTabla } from '../config/presentacion'
import { useContextoEvento } from '../hooks/useContextoEvento'
import type { EventoAuditoria } from '../types'
import { cambiosVisibles, frase, nombreActor } from '../utils/evento'
import { interpretar } from '../utils/interpretar'
import { haceCuanto, resumenNatural } from '../utils/resumen'

import { BloqueArchivos } from './detalle/BloqueArchivos'
import {
  DatosTecnicos,
  GrillaDatos,
  ListaCambios,
  TituloSeccion,
} from './detalle/Campos'

/** En un reemplazo, los campos del archivo ya se ven en las tarjetas */
const CAMPOS_DEL_ARCHIVO = new Set([
  'nombre_archivo',
  'nombre_original',
  'tamano_bytes',
  'tipo_mime',
])

const chip =
  'inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold'

const iniciales = (nombre: string) =>
  nombre
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()

/**
 * La etiqueta viene como "Principal · Mz. A Casa 2 · Cliente": la casa y el
 * cliente salen como chips; en el encabezado queda solo lo principal.
 */
function partirEtiqueta(etiqueta: string | null, cliente: string | null) {
  const partes = (etiqueta ?? '').split(' · ').filter(Boolean)
  const casa = partes.find(p => p.startsWith('Mz. ')) ?? null
  const resto = partes.filter(p => p !== casa && p !== cliente)
  return { principal: resto.join(' · ') || null, casa }
}

export function EventoDetalleModal({
  evento,
  usuarios,
  navegacion,
  onClose,
}: {
  evento: EventoAuditoria
  usuarios: { id: string; nombre: string }[]
  navegacion?: VisorNavegacion
  onClose: () => void
}) {
  const [visorAbierto, setVisorAbierto] = useState(false)
  const tabla = infoTabla(evento.tabla)
  const lectura = interpretar(evento)
  const { fila, nombreRef, cliente } = useContextoEvento(evento, usuarios)
  const actor = nombreActor(evento)

  // Datos del evento; si faltan (ediciones o eventos antiguos), los de hoy
  const filaMostrada = evento.datos ?? fila
  const filaCompleta =
    fila || evento.datos ? { ...(fila ?? {}), ...(evento.datos ?? {}) } : null

  const cambios = cambiosVisibles(evento).filter(
    ([campo]) =>
      !(lectura.suceso === 'reemplazo' && CAMPOS_DEL_ARCHIVO.has(campo))
  )
  const resumen = resumenNatural(
    evento,
    lectura.suceso,
    filaCompleta,
    nombreRef,
    cliente
  )
  const { principal, casa } = partirEtiqueta(evento.etiqueta, cliente)
  const categoria = nombreRef('categoria_id', filaCompleta?.categoria_id)
  const fechaExacta = new Date(evento.fecha).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <ModalDetalle
      onClose={onClose}
      gradient={lectura.degradado}
      icon={tabla.icon}
      titulo={frase(evento)}
      subtitulo={principal ?? undefined}
      navegacion={navegacion}
      bloqueado={visorAbierto}
      franja={
        <>
          <span className='inline-flex min-w-0 items-center gap-2'>
            <span className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm'>
              {iniciales(actor)}
            </span>
            <span className='min-w-0 leading-tight'>
              <span className='block truncate text-sm font-bold text-slate-800 dark:text-slate-100'>
                {actor}
              </span>
              <span
                className='block text-xs text-slate-500 first-letter:uppercase'
                title={fechaExacta}
              >
                {haceCuanto(evento.fecha)} · {fechaExacta}
              </span>
            </span>
          </span>
          <span
            className={cn(
              'ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ring-1',
              lectura.badge
            )}
          >
            {lectura.label}
          </span>
        </>
      }
    >
      <div className='space-y-5'>
        {resumen.length ? (
          <p className='flex items-start gap-2.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 px-4 py-3 text-[15px] leading-relaxed text-slate-700 ring-1 ring-indigo-100 dark:from-indigo-500/10 dark:to-blue-500/5 dark:text-slate-200 dark:ring-indigo-500/20'>
            <Sparkles className='mt-1 h-4 w-4 flex-shrink-0 text-indigo-500' />
            <span>
              {resumen.map((trozo, i) =>
                trozo.fuerte ? (
                  <strong
                    key={i}
                    className='font-semibold text-slate-900 dark:text-white'
                  >
                    {trozo.texto}
                  </strong>
                ) : (
                  <span key={i}>{trozo.texto}</span>
                )
              )}
            </span>
          </p>
        ) : null}

        {cliente || casa || categoria ? (
          <div className='flex flex-wrap gap-2'>
            {cliente && evento.cliente_id ? (
              <Link
                href={`/clientes/${getShortId(evento.cliente_id)}`}
                className={cn(
                  chip,
                  'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200 transition-colors hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/30'
                )}
                title='Ver el cliente'
              >
                <User className='h-3.5 w-3.5 flex-shrink-0' />
                <span className='truncate'>{cliente}</span>
              </Link>
            ) : null}
            {casa ? (
              <span
                className={cn(
                  chip,
                  'bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30'
                )}
              >
                <Home className='h-3.5 w-3.5' />
                {casa}
              </span>
            ) : null}
            {categoria ? (
              <span
                className={cn(
                  chip,
                  'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30'
                )}
              >
                <FolderOpen className='h-3.5 w-3.5' />
                {categoria}
              </span>
            ) : null}
          </div>
        ) : null}

        <BloqueArchivos
          evento={evento}
          fila={filaCompleta}
          suceso={lectura.suceso}
          onVisorAbierto={setVisorAbierto}
        />

        {evento.accion === 'EDITAR' && cambios.length ? (
          <section>
            <TituloSeccion>Qué cambió</TituloSeccion>
            <ListaCambios cambios={cambios} nombreRef={nombreRef} />
          </section>
        ) : null}

        {filaMostrada ? (
          <section>
            <TituloSeccion>
              {evento.accion === 'CREAR'
                ? 'Datos registrados'
                : evento.accion === 'ELIMINAR'
                  ? 'Datos que tenía antes de eliminarse'
                  : 'Así está el registro hoy'}
            </TituloSeccion>
            <GrillaDatos
              tabla={evento.tabla}
              fila={filaMostrada}
              nombreRef={nombreRef}
              tono={evento.accion === 'ELIMINAR' ? 'eliminado' : 'neutro'}
              omitir={['titulo', 'categoria_id']}
            />
          </section>
        ) : evento.accion === 'EDITAR' ? (
          <p className='rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:bg-slate-800/60'>
            El registro ya no existe hoy.
          </p>
        ) : null}

        <DatosTecnicos
          datos={{
            tabla: evento.tabla,
            registro_id: evento.registro_id,
            evento_id: evento.id,
            origen: evento.origen,
            usuario_email: evento.usuario_email,
            ...(evento.cambios ? { cambios: evento.cambios } : {}),
            ...(filaMostrada ?? {}),
          }}
        />
      </div>
    </ModalDetalle>
  )
}
