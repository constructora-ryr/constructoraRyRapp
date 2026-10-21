'use client'

/** Panel de datos del visor de documentos: resumen, fechas, metadata y archivo */

import type { ReactNode } from 'react'

import {
  Calendar,
  CalendarClock,
  CalendarPlus,
  FileText,
  HardDrive,
  Info,
  Layers,
  Upload,
  type LucideIcon,
} from 'lucide-react'

import { formatDateCompact } from '@/lib/utils/date.utils'
import { visorArchivoStyles as v } from '@/shared/components/visor-archivo'
import { cn } from '@/shared/utils/helpers'

import { DocumentoProyecto, formatFileSize } from '../../types/documento.types'
import { colorCategoria } from '../../utils/categoria-color'
import {
  diasHasta,
  entradasMetadataVisibles,
  formatearValorMetadata,
  humanizarCampoMetadata,
} from '../../utils/documento-viewer.utils'
import { CategoriaIcon } from '../shared/categoria-icon'

const s = v.sidebar

function Seccion({
  titulo,
  children,
}: {
  titulo: string
  children: ReactNode
}) {
  return (
    <section>
      <h3 className={s.sectionTitle}>{titulo}</h3>
      <div className={s.card}>{children}</div>
    </section>
  )
}

function Fila({
  icon: Icon,
  tono,
  label,
  children,
}: {
  icon: LucideIcon
  /** Fondo + texto + anillo del ícono */
  tono: string
  label: string
  children: ReactNode
}) {
  return (
    <div className={s.row}>
      <span className={cn(s.rowIcon, tono)}>
        <Icon className='h-4 w-4' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className={s.rowLabel}>{label}</p>
        <div className={cn(s.rowValue, 'break-words')}>{children}</div>
      </div>
    </div>
  )
}

const SinRegistrar = () => (
  <span className='font-normal text-slate-400 dark:text-slate-500'>
    Sin registrar
  </span>
)

const TONOS = {
  azul: 'bg-blue-50 text-blue-600 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  naranja:
    'bg-orange-50 text-orange-600 ring-orange-600/15 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20',
  verde:
    'bg-emerald-50 text-emerald-600 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  violeta:
    'bg-violet-50 text-violet-600 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  gris: 'bg-slate-100 text-slate-500 ring-slate-500/15 dark:bg-slate-700/60 dark:text-slate-300 dark:ring-slate-500/20',
}

function Vencimiento({ fecha }: { fecha: string | null | undefined }) {
  const dias = diasHasta(fecha)
  if (dias === null || !fecha) return <SinRegistrar />
  const aviso =
    dias < 0
      ? {
          texto: 'Vencido',
          clase:
            'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        }
      : dias <= 30
        ? {
            texto: dias === 0 ? 'Vence hoy' : `Vence en ${dias} d`,
            clase:
              'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
          }
        : null
  return (
    <span className='flex flex-wrap items-center gap-2'>
      {formatDateCompact(fecha)}
      {aviso ? (
        <span
          className={cn(
            'rounded-full px-2 py-px text-[11px] font-bold',
            aviso.clase
          )}
        >
          {aviso.texto}
        </span>
      ) : null}
    </span>
  )
}

export function DocumentoViewerSidebar({
  documento,
}: {
  documento: DocumentoProyecto
}) {
  const { categoria } = documento
  const hexCategoria = colorCategoria(categoria?.color)
  const metadata = entradasMetadataVisibles(documento.metadata)
  const extension =
    documento.nombre_archivo?.split('.').pop()?.toUpperCase() || 'N/A'
  const emision =
    diasHasta(documento.fecha_documento) !== null
      ? documento.fecha_documento
      : null
  const subido = diasHasta(documento.fecha_creacion) !== null

  return (
    <aside className={s.container}>
      {categoria || documento.descripcion ? (
        <Seccion titulo='Resumen'>
          <div className='space-y-3 py-1'>
            {categoria ? (
              <span
                className='inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset'
                style={{
                  backgroundColor: `${hexCategoria}18`,
                  color: hexCategoria,
                  ['--tw-ring-color' as string]: `${hexCategoria}40`,
                }}
              >
                <CategoriaIcon icono={categoria.icono} size={12} />
                {categoria.nombre}
              </span>
            ) : null}
            {documento.descripcion ? (
              <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
                {documento.descripcion}
              </p>
            ) : null}
          </div>
        </Seccion>
      ) : null}

      <Seccion titulo='Fechas'>
        <Fila icon={Calendar} tono={TONOS.azul} label='Emisión del documento'>
          {emision ? formatDateCompact(emision) : <SinRegistrar />}
        </Fila>
        <div className={s.divider} />
        <Fila icon={CalendarClock} tono={TONOS.naranja} label='Vencimiento'>
          <Vencimiento fecha={documento.fecha_vencimiento} />
        </Fila>
        <div className={s.divider} />
        <Fila icon={CalendarPlus} tono={TONOS.verde} label='Subido al sistema'>
          {subido ? (
            new Date(documento.fecha_creacion).toLocaleString('es-CO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          ) : (
            <SinRegistrar />
          )}
        </Fila>
        <div className={s.divider} />
        <Fila icon={Upload} tono={TONOS.violeta} label='Subido por'>
          {documento.usuario
            ? `${documento.usuario.nombres} ${documento.usuario.apellidos}`
            : 'Desconocido'}
        </Fila>
      </Seccion>

      {metadata.length > 0 ? (
        <Seccion titulo='Información adicional'>
          {metadata.map(([key, value], i) => (
            <div key={key}>
              {i > 0 ? <div className={s.divider} /> : null}
              <Fila
                icon={Info}
                tono={TONOS.gris}
                label={humanizarCampoMetadata(key)}
              >
                {formatearValorMetadata(
                  key,
                  value,
                  documento.metadata ?? undefined
                )}
              </Fila>
            </div>
          ))}
        </Seccion>
      ) : null}

      <Seccion titulo='Archivo'>
        <div className='grid grid-cols-3 gap-2 py-1 text-center'>
          {[
            { icon: FileText, label: 'Tipo', valor: extension },
            {
              icon: HardDrive,
              label: 'Tamaño',
              valor: formatFileSize(documento.tamano_bytes),
            },
            { icon: Layers, label: 'Versión', valor: `v${documento.version}` },
          ].map(({ icon: Icon, label, valor }) => (
            <div
              key={label}
              className='rounded-xl bg-slate-50 px-2 py-2.5 dark:bg-slate-900/60'
            >
              <Icon className='mx-auto mb-1 h-4 w-4 text-slate-400' />
              <p className={s.rowLabel}>{label}</p>
              <p className='truncate text-sm font-bold text-slate-900 dark:text-white'>
                {valor}
              </p>
            </div>
          ))}
        </div>
      </Seccion>
    </aside>
  )
}
