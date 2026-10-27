'use client'

/**
 * Piezas compartidas por los renderers del detalle del historial: sección
 * con título, filas de dato, monto destacado, cambios antes → después,
 * texto libre y enlace a archivo. Un solo estilo para los 13 tipos.
 */

import { createContext, useContext, useState, type ReactNode } from 'react'

import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import Link from 'next/link'

import type { DetalleEvento } from '@/modules/clientes/types/historial.types'
import { useTiposFuentePagoConfig } from '@/modules/fuentes-pago/hooks'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import { iconoFuente } from '@/shared/constants/fuente-iconos'
import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

import {
  esCampoMoneda,
  formatearMoneda,
  formatearValor,
} from './formatearValor'

export type Tono = 'neutro' | 'exito' | 'peligro' | 'aviso' | 'info'

const TONO_SECCION: Record<Tono, string> = {
  neutro: 'text-slate-500 dark:text-slate-400',
  exito: 'text-emerald-700 dark:text-emerald-400',
  peligro: 'text-rose-700 dark:text-rose-400',
  aviso: 'text-amber-700 dark:text-amber-400',
  info: 'text-blue-700 dark:text-blue-400',
}

const TONO_CAJA: Record<Tono, string> = {
  neutro:
    'border-slate-200/80 bg-white dark:border-slate-700/60 dark:bg-slate-800/60',
  exito:
    'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10',
  peligro:
    'border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/10',
  aviso:
    'border-amber-200 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10',
  info: 'border-blue-200 bg-blue-50/60 dark:border-blue-500/30 dark:bg-blue-500/10',
}

const TONO_BANNER: Record<Tono, string> = {
  neutro: 'from-slate-600 to-slate-700 shadow-slate-500/20',
  exito: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
  peligro: 'from-rose-500 to-red-600 shadow-rose-500/20',
  aviso: 'from-amber-500 to-orange-500 shadow-amber-500/20',
  info: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
}

/** Título de sección: texto normal (no versalitas), con el tono del grupo */
function TituloSeccion({ texto, tono }: { texto: string; tono: Tono }) {
  return (
    <h4 className={cn('mb-2 text-sm font-semibold', TONO_SECCION[tono])}>
      {texto}
    </h4>
  )
}

/** Bloque con título y el contenido en una tarjeta */
export function Seccion({
  titulo,
  tono = 'neutro',
  children,
  sinCaja = false,
}: {
  titulo: string
  tono?: Tono
  children: ReactNode
  /** El contenido trae su propio contenedor */
  sinCaja?: boolean
}) {
  return (
    <section>
      <TituloSeccion texto={titulo} tono={tono} />
      {sinCaja ? (
        children
      ) : (
        <div
          className={cn(
            'divide-y divide-slate-100 overflow-hidden rounded-xl border px-3 dark:divide-slate-700/50',
            TONO_CAJA[tono]
          )}
        >
          {children}
        </div>
      )}
    </section>
  )
}

export type Formato = 'texto' | 'moneda'

/** Tono del grupo: lo heredan sus filas destacadas */
const TonoDatos = createContext<Tono>('neutro')

const TONO_VALOR: Record<Tono, string> = {
  neutro: 'text-slate-900 dark:text-white',
  exito: 'text-emerald-700 dark:text-emerald-300',
  peligro: 'text-rose-700 dark:text-rose-300',
  aviso: 'text-amber-700 dark:text-amber-300',
  info: 'text-blue-700 dark:text-blue-300',
}

/**
 * Grupo de datos: una tarjeta con filas etiqueta / valor. Las filas vacías
 * no se muestran.
 */
export function Datos({
  titulo,
  tono = 'neutro',
  children,
}: {
  titulo: string
  tono?: Tono
  children: ReactNode
}) {
  return (
    <section>
      <TituloSeccion texto={titulo} tono={tono} />
      <div className='divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white px-3 dark:divide-slate-700/50 dark:border-slate-700/60 dark:bg-slate-800/60'>
        <TonoDatos.Provider value={tono}>{children}</TonoDatos.Provider>
      </div>
    </section>
  )
}

/** Fila etiqueta + valor. No se muestra si el valor está vacío */
export function Dato({
  icon: Icon,
  label,
  valor,
  formato = 'texto',
  destacado = false,
  copiable = false,
  tono,
}: {
  icon: LucideIcon
  label: string
  valor: unknown
  formato?: Formato
  destacado?: boolean
  /** Botón para copiar el valor (recibos, referencias, documentos) */
  copiable?: boolean
  /** Color del valor; por defecto neutro (el del grupo si es destacado) */
  tono?: Tono
}) {
  const tonoGrupo = useContext(TonoDatos)
  // Vacío: no se muestra (formatearMoneda(null) daría "$0")
  if (valor === null || valor === undefined || valor === '') return null
  const texto =
    formato === 'moneda' ? formatearMoneda(valor) : formatearValor(valor)
  if (texto === '—') return null
  const tonoValor = tono ?? (destacado ? tonoGrupo : 'neutro')
  return (
    <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 py-2.5'>
      <span className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
        <Icon className='h-4 w-4 flex-shrink-0' />
        {label}
      </span>
      <span className='flex min-w-0 items-center gap-1'>
        <span
          className={cn(
            'break-words text-right text-sm tabular-nums',
            destacado ? 'font-bold' : 'font-semibold',
            TONO_VALOR[tonoValor]
          )}
        >
          {texto}
        </span>
        {copiable ? <BotonCopiar texto={texto} label={label} /> : null}
      </span>
    </div>
  )
}

/** Copia un texto al portapapeles y confirma con un check */
export function BotonCopiar({
  texto,
  label,
}: {
  texto: string
  label: string
}) {
  const [copiado, setCopiado] = useState(false)
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      toast.error('No se pudo copiar')
    }
  }
  return (
    <button
      type='button'
      onClick={copiar}
      aria-label={`Copiar ${label}`}
      title={copiado ? 'Copiado' : `Copiar ${label.toLowerCase()}`}
      className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200'
    >
      {copiado ? (
        <Check className='h-4 w-4 text-emerald-600' />
      ) : (
        <Copy className='h-4 w-4' />
      )}
    </button>
  )
}

/** Monto o dato principal destacado con degradado */
export function Banner({
  etiqueta,
  valor,
  nota,
  chip,
  tono = 'exito',
  compacto = false,
}: {
  etiqueta: string
  valor: ReactNode
  nota?: ReactNode
  chip?: ReactNode
  tono?: Tono
  /** Para textos (nombre, título) en vez de montos */
  compacto?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 rounded-xl bg-gradient-to-r px-4 py-3 text-white shadow-lg',
        TONO_BANNER[tono]
      )}
    >
      <div className='min-w-0'>
        <p className='text-[11px] font-semibold uppercase tracking-widest text-white/80'>
          {etiqueta}
        </p>
        <p
          className={cn(
            'mt-0.5 break-words',
            compacto
              ? 'line-clamp-2 text-lg font-bold'
              : 'text-2xl font-black tabular-nums'
          )}
        >
          {valor}
        </p>
        {nota ? <p className='mt-0.5 text-xs text-white/80'>{nota}</p> : null}
      </div>
      {chip ? (
        <span className='inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold ring-1 ring-white/30'>
          {chip}
        </span>
      ) : null}
    </div>
  )
}

const formatearCambio = (campo: string, valor: unknown) =>
  esCampoMoneda(campo) ? formatearMoneda(valor) : formatearValor(valor)

/** Un cambio en una línea: lo anterior tachado, lo nuevo resaltado */
export function FilaCambio({
  etiqueta,
  antes,
  ahora,
}: {
  etiqueta: string
  antes: string
  ahora: string
}) {
  const sinAntes = antes === '—'
  return (
    <div className='rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-800/60'>
      <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
        {etiqueta}
      </p>
      <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm'>
        <span
          className={cn(
            'break-words rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-900/60',
            sinAntes
              ? 'italic text-slate-400 dark:text-slate-500'
              : 'text-slate-500 line-through decoration-slate-400 dark:text-slate-400'
          )}
        >
          {sinAntes ? 'Sin valor' : antes}
        </span>
        <ArrowRight className='h-4 w-4 flex-shrink-0 text-slate-400' />
        <span className='break-words rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30'>
          {ahora === '—' ? 'Sin valor' : ahora}
        </span>
      </div>
    </div>
  )
}

/** Lista de cambios del evento (o un aviso si no hay) */
export function ListaCambios({
  detalles,
  etiquetas = {},
  vacio = 'No se registraron cambios específicos en este evento.',
}: {
  detalles: DetalleEvento[]
  /** Nombres en español por campo, si el humanizador no los trae */
  etiquetas?: Record<string, string>
  vacio?: string
}) {
  if (detalles.length === 0) return <SinDatos texto={vacio} />
  const nombre = (d: DetalleEvento) =>
    etiquetas[d.campo] ?? d.etiqueta ?? d.campo
  return (
    <section>
      <TituloSeccion
        texto={
          detalles.length === 1 ? '1 cambio' : `${detalles.length} cambios`
        }
        tono='neutro'
      />
      <div className='space-y-2'>
        {detalles.map(d => (
          <FilaCambio
            key={d.campo}
            etiqueta={nombre(d)}
            antes={formatearCambio(d.campo, d.valorAnterior)}
            ahora={formatearCambio(d.campo, d.valorNuevo)}
          />
        ))}
      </div>
    </section>
  )
}

/** Texto libre (observaciones, motivo) con ícono */
export function TextoLibre({
  icon: Icon,
  titulo,
  texto,
  tono = 'neutro',
}: {
  icon: LucideIcon
  titulo: string
  texto: string | null | undefined
  tono?: Tono
}) {
  if (!texto) return null
  return (
    <section>
      <h4
        className={cn(
          'mb-2 flex items-center gap-1.5 text-sm font-semibold',
          TONO_SECCION[tono]
        )}
      >
        <Icon className='h-4 w-4' />
        {titulo}
      </h4>
      <blockquote
        className={cn(
          'whitespace-pre-line break-words rounded-r-xl border-l-4 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
          BARRA_CITA[tono]
        )}
      >
        {texto}
      </blockquote>
    </section>
  )
}

const BARRA_CITA: Record<Tono, string> = {
  neutro: 'border-slate-300 dark:border-slate-600',
  exito: 'border-emerald-400',
  peligro: 'border-rose-400',
  aviso: 'border-amber-400',
  info: 'border-blue-400',
}

/** Botón-enlace a un archivo (comprobante, documento) */
export function EnlaceArchivo({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: LucideIcon
}) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20'
    >
      <Icon className='h-4 w-4 flex-shrink-0' />
      <span className='flex-1 truncate'>{label}</span>
      <ExternalLink className='h-3.5 w-3.5 flex-shrink-0' />
    </a>
  )
}

/** Aviso cuando el evento no trae datos para mostrar */
export function SinDatos({ texto }: { texto: string }) {
  return (
    <p className='rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400'>
      {texto}
    </p>
  )
}

/** Fecha corta o "—"; tolera valores vacíos o inválidos */
export function fechaCorta(
  iso: unknown,
  formatear: (s: string) => string
): string {
  if (!iso) return '—'
  try {
    return formatear(String(iso))
  } catch {
    return String(iso)
  }
}

const TONO_AVISO: Record<Tono, string> = {
  neutro: 'text-slate-700 dark:text-slate-200',
  exito: 'text-emerald-800 dark:text-emerald-200',
  peligro: 'text-rose-800 dark:text-rose-200',
  aviso: 'text-amber-800 dark:text-amber-200',
  info: 'text-blue-800 dark:text-blue-200',
}

/** Franja de estado: ícono + etiqueta + texto (p.ej. "Renuncia cerrada") */
export function Aviso({
  icon: Icon,
  etiqueta,
  texto,
  tono = 'neutro',
}: {
  icon: LucideIcon
  etiqueta: string
  texto: ReactNode
  tono?: Tono
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-3',
        TONO_CAJA[tono],
        TONO_AVISO[tono]
      )}
    >
      <Icon className='h-5 w-5 flex-shrink-0' />
      <div className='min-w-0'>
        <p className='text-[11px] font-semibold uppercase tracking-wide opacity-80'>
          {etiqueta}
        </p>
        <p className='text-sm font-bold'>{texto}</p>
      </div>
    </div>
  )
}

/** Vivienda en una línea: "Mza. A · Casa 5" */
export function textoVivienda(manzana: unknown, casa: unknown): string | null {
  const partes = [
    manzana ? `Mza. ${manzana}` : null,
    casa ? `Casa ${casa}` : null,
  ].filter(Boolean)
  return partes.length ? partes.join(' · ') : null
}

/** Enlace al expediente de la renuncia (solo con permiso de verlas) */
export function EnlaceExpediente({
  consecutivo,
  nota,
}: {
  consecutivo: unknown
  nota: string
}) {
  const { esAdmin, puede } = usePermisosQuery()
  const codigo = String(consecutivo ?? '').trim()
  if (!codigo || !(esAdmin || puede('renuncias', 'ver'))) return null
  return (
    <div className='space-y-1.5'>
      <Link
        href={`/renuncias/${codigo}`}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
      >
        <ExternalLink className='h-4 w-4 flex-shrink-0' />
        Ver expediente {codigo}
      </Link>
      <p className='text-center text-xs text-slate-500 dark:text-slate-400'>
        {nota}
      </p>
    </div>
  )
}

export interface FuenteSnapshot {
  tipo: string
  monto_aprobado: number
  entidad?: string | null
  numero_referencia?: string | null
}

/** Fuentes de pago guardadas en el evento, con el color e ícono de su tipo */
export function ListaFuentes({
  titulo,
  fuentes,
}: {
  titulo: string
  fuentes: FuenteSnapshot[]
}) {
  const { getTipoConfig } = useTiposFuentePagoConfig()
  if (fuentes.length === 0) return null
  return (
    <Seccion titulo={`${titulo} (${fuentes.length})`}>
      {fuentes.map((f, i) => {
        const config = getTipoConfig(f.tipo)
        const color = getFuenteColorClasses(config.color)
        const Icono = iconoFuente(config.icono)
        const detalle = [
          f.entidad,
          f.numero_referencia ? `Ref. ${f.numero_referencia}` : null,
        ]
          .filter(Boolean)
          .join(' · ')
        return (
          <div key={i} className='flex items-center gap-3 py-2.5'>
            <span
              className={cn(
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm',
                color.icon
              )}
            >
              <Icono className='h-4 w-4' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                {f.tipo}
              </p>
              {detalle ? (
                <p className='truncate text-xs text-slate-500 dark:text-slate-400'>
                  {detalle}
                </p>
              ) : null}
            </div>
            <p className={cn('text-sm font-bold tabular-nums', color.texto)}>
              {formatearMoneda(f.monto_aprobado)}
            </p>
          </div>
        )
      })}
    </Seccion>
  )
}
