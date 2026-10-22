/**
 * Archivo(s) del evento como tarjetas compactas; "Ver archivo" abre el visor
 * grande (con ← → si hay dos, como en un reemplazo).
 * - Reemplazo: archivo anterior (respaldo) y archivo nuevo, con el motivo
 * - Papelera / eliminación: el archivo eliminado
 * - Resto: el archivo del registro
 */

'use client'

import { useEffect, useState } from 'react'

import { FileText, MessageSquareQuote } from 'lucide-react'

import {
  VisorArchivoModal,
  VisorArchivoPreview,
  tipoDeArchivo,
} from '@/shared/components/visor-archivo'

import { DETALLE } from '../../config/detalle'
import type { EventoAuditoria } from '../../types'
import type { Suceso } from '../../utils/interpretar'
import { datosReemplazo } from '../../utils/interpretar'

import { ArchivoTarjeta, useUrlArchivo, type ArchivoInfo } from './archivos'

const texto = (v: unknown) => (typeof v === 'string' && v ? v : null)

function archivosDelEvento(
  evento: EventoAuditoria,
  fila: Record<string, unknown> | null,
  suceso: Suceso
): ArchivoInfo[] {
  const config = DETALLE[evento.tabla]?.archivo
  if (!config || !fila) return []
  const ruta = texto(fila[config.ruta])
  const nombre = texto(fila[config.nombre])
  const mime = config.mime ? texto(fila[config.mime]) : null
  const comprobante = config.bucket === 'comprobante'

  if (suceso === 'reemplazo') {
    const r = datosReemplazo(evento)
    return [
      {
        clave: 'anterior',
        titulo: 'Archivo anterior',
        bucket: config.bucket,
        ruta: r?.backup_path ?? null,
        nombre: r?.archivo_original ?? null,
        mime: null,
        tamano: r?.tamano_original,
        etiqueta: 'Anterior',
        tono: 'anterior',
      },
      {
        clave: 'nuevo',
        titulo: 'Archivo nuevo',
        bucket: config.bucket,
        ruta,
        nombre: r?.archivo_nuevo ?? nombre,
        mime,
        tamano: r?.tamano_nuevo,
        etiqueta: 'Nuevo',
        tono: 'nuevo',
      },
    ]
  }

  const eliminado = suceso === 'papelera' || suceso === 'eliminado'
  return [
    {
      clave: 'archivo',
      titulo: comprobante ? 'Comprobante del abono' : 'Archivo',
      bucket: config.bucket,
      ruta,
      nombre: comprobante ? 'Comprobante del abono' : nombre,
      mime,
      tamano: fila.tamano_bytes,
      etiqueta: eliminado ? 'Eliminado' : undefined,
      tono: eliminado ? 'eliminado' : 'neutro',
    },
  ]
}

function VisorArchivos({
  archivos,
  indice,
  onCambiar,
  onCerrar,
}: {
  archivos: ArchivoInfo[]
  indice: number
  onCambiar: (i: number) => void
  onCerrar: () => void
}) {
  const archivo = archivos[indice]
  const { url, error } = useUrlArchivo(archivo)
  const navegacion =
    archivos.length > 1
      ? {
          actual: indice + 1,
          total: archivos.length,
          nombre: 'Archivo',
          onAnterior: indice > 0 ? () => onCambiar(indice - 1) : undefined,
          onSiguiente:
            indice < archivos.length - 1
              ? () => onCambiar(indice + 1)
              : undefined,
        }
      : undefined

  return (
    <VisorArchivoModal
      isOpen
      onClose={onCerrar}
      ariaLabel={archivo.titulo}
      gradient='from-sky-600 via-blue-600 to-indigo-600'
      icono={<FileText className='h-5 w-5' />}
      titulo={archivo.titulo}
      subtitulo={archivo.nombre ?? undefined}
      navegacion={navegacion}
    >
      <VisorArchivoPreview
        url={url}
        tipo={tipoDeArchivo(archivo.mime, archivo.nombre ?? archivo.ruta)}
        titulo={archivo.titulo}
        errorUrl={error}
        marcaAgua={archivo.tono === 'eliminado' ? 'ELIMINADO' : undefined}
        navegacion={navegacion}
      />
    </VisorArchivoModal>
  )
}

export function BloqueArchivos({
  evento,
  fila,
  suceso,
  onVisorAbierto,
}: {
  evento: EventoAuditoria
  /** La fila guardada en el evento, completada con la de hoy */
  fila: Record<string, unknown> | null
  suceso: Suceso
  /** Avisa al modal para que su Esc no cierre todo mientras se ve un archivo */
  onVisorAbierto: (abierto: boolean) => void
}) {
  const [abierto, setAbierto] = useState<number | null>(null)
  useEffect(() => onVisorAbierto(abierto !== null), [abierto, onVisorAbierto])

  const archivos = archivosDelEvento(evento, fila, suceso)
  if (!archivos.length) return null
  const motivo = suceso === 'reemplazo' ? datosReemplazo(evento)?.motivo : null

  return (
    <div className='space-y-2'>
      {motivo ? (
        <p className='flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-sm text-violet-900 dark:bg-violet-500/10 dark:text-violet-200'>
          <MessageSquareQuote className='mt-0.5 h-4 w-4 flex-shrink-0' />
          <span>
            <strong>Motivo:</strong> {motivo}
          </span>
        </p>
      ) : null}
      <div className={archivos.length > 1 ? 'grid gap-2 md:grid-cols-2' : ''}>
        {archivos.map((a, i) => (
          <ArchivoTarjeta
            key={a.clave}
            archivo={a}
            onVer={() => setAbierto(i)}
          />
        ))}
      </div>
      {abierto !== null ? (
        <VisorArchivos
          archivos={archivos}
          indice={abierto}
          onCambiar={setAbierto}
          onCerrar={() => setAbierto(null)}
        />
      ) : null}
    </div>
  )
}
