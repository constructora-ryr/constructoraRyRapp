'use client'

/**
 * Paso 3 de Asignar vivienda: qué se va a confirmar (casa, cliente, total y
 * si las fuentes lo cubren), el valor de la casa, cómo se paga y las notas.
 */

import { useCallback, useMemo, useState } from 'react'

import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Home,
  Loader2,
  Pencil,
  StickyNote,
  User,
  type LucideIcon,
} from 'lucide-react'

import { formatCurrency } from '@/lib/utils/format.utils'
import { logger } from '@/lib/utils/logger'
import type {
  FuentePagoConfiguracion,
  ViviendaDetalle,
} from '@/modules/clientes/components/asignar-vivienda/types'
import { LABELS_TIPO_DESCUENTO } from '@/modules/clientes/constants/descuento.constants'
import { generarPDFPreview } from '@/modules/clientes/services/pdf-negociacion-preview.service'
import { useEntidadesFinancierasCombinadas } from '@/modules/configuracion/hooks/useEntidadesFinancierasParaFuentes'
import type { TipoFuentePagoConCampos } from '@/modules/configuracion/types/campos-dinamicos.types'
import { getFuenteColorClasses } from '@/shared/constants/fuentes-pago.constants'
import { cn } from '@/shared/utils/helpers'

import { FilaFuenteRevision, montoFuente } from './revision/FilaFuenteRevision'

interface SeccionRevisionProps {
  clienteNombre: string
  proyectoNombre: string
  viviendaSeleccionada: ViviendaDetalle | null
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number
  valorEscrituraPublica: number
  aplicarDescuento: boolean
  tipoDescuento: string
  notas: string
  fuentes: FuentePagoConfiguracion[]
  tiposConCampos: TipoFuentePagoConCampos[]
  errorApi: string | null
  onEditarSeccion1: () => void
  onEditarSeccion2: () => void
}

function Tarjeta({
  titulo,
  icon: Icon,
  onEditar,
  children,
}: {
  titulo: string
  icon: LucideIcon
  onEditar?: () => void
  children: React.ReactNode
}) {
  return (
    <section className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900'>
      <header className='mb-2 flex items-center gap-2'>
        <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300'>
          <Icon className='h-4 w-4' />
        </span>
        <h3 className='flex-1 font-semibold text-gray-900 dark:text-white'>
          {titulo}
        </h3>
        {onEditar ? (
          <button
            type='button'
            onClick={onEditar}
            className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-500/10'
          >
            <Pencil className='h-3 w-3' />
            Editar
          </button>
        ) : null}
      </header>
      {children}
    </section>
  )
}

function Fila({
  etiqueta,
  valor,
  tono = 'normal',
}: {
  etiqueta: string
  valor: string
  tono?: 'normal' | 'descuento' | 'total'
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-1 text-sm',
        tono === 'total' &&
          'mt-1 border-t border-gray-200 pt-2 dark:border-gray-700'
      )}
    >
      <span
        className={
          tono === 'total'
            ? 'font-semibold text-gray-900 dark:text-white'
            : 'text-gray-600 dark:text-gray-300'
        }
      >
        {etiqueta}
      </span>
      <span
        className={cn(
          'tabular-nums',
          tono === 'total'
            ? 'text-base font-extrabold text-cyan-700 dark:text-cyan-300'
            : tono === 'descuento'
              ? 'font-semibold text-emerald-600 dark:text-emerald-400'
              : 'font-semibold text-gray-900 dark:text-white'
        )}
      >
        {valor}
      </span>
    </div>
  )
}

export function SeccionRevision({
  clienteNombre,
  proyectoNombre,
  viviendaSeleccionada,
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuentoAplicado,
  valorTotal,
  valorEscrituraPublica,
  aplicarDescuento,
  tipoDescuento,
  notas,
  fuentes,
  tiposConCampos,
  errorApi,
  onEditarSeccion1,
  onEditarSeccion2,
}: SeccionRevisionProps) {
  const { entidades } = useEntidadesFinancierasCombinadas()
  const [generandoPDF, setGenerandoPDF] = useState(false)

  const fuentesActivas = useMemo(
    () => fuentes.filter(f => f.enabled && f.config !== null),
    [fuentes]
  )
  const totalFuentes = fuentesActivas.reduce(
    (suma, f) => suma + montoFuente(f, tiposConCampos),
    0
  )
  const diferencia = totalFuentes - valorTotal
  const cuadra = Math.abs(diferencia) < 1
  const subtotal = valorBase + gastosNotariales + recargoEsquinera
  const conDescuento = aplicarDescuento && descuentoAplicado > 0
  const pctDescuento = subtotal > 0 ? (descuentoAplicado / subtotal) * 100 : 0
  const escrituraDistinta =
    valorEscrituraPublica > 0 &&
    Math.abs(valorEscrituraPublica - valorTotal) > 1000

  const casa = viviendaSeleccionada
    ? `Manzana ${viviendaSeleccionada.manzana_nombre ?? '?'} · Casa ${viviendaSeleccionada.numero}`
    : '—'

  const handleDescargarPDF = useCallback(async () => {
    setGenerandoPDF(true)
    try {
      const partes = clienteNombre.trim().split(' ')
      await generarPDFPreview({
        cliente: {
          nombres: partes[0] ?? '',
          apellidos: partes.slice(1).join(' '),
        },
        vivienda: {
          proyecto: proyectoNombre,
          manzana: viviendaSeleccionada?.manzana_nombre,
          numeroVivienda: viviendaSeleccionada?.numero?.toString() ?? '',
        },
        valorBase: valorBase + recargoEsquinera,
        gastosNotariales: gastosNotariales > 0 ? gastosNotariales : undefined,
        descuento: descuentoAplicado,
        valorFinal: valorTotal,
        valorEscrituraPublica:
          valorEscrituraPublica > 0 ? valorEscrituraPublica : undefined,
        fuentesPago: fuentesActivas.map(f => ({
          tipo: f.tipo,
          monto: montoFuente(f, tiposConCampos),
          entidad: f.config?.entidad
            ? (entidades.find(e => e.value === f.config?.entidad)?.label ??
              f.config.entidad)
            : undefined,
        })),
        notas: notas || undefined,
      })
    } catch (err) {
      logger.error('Error generando PDF:', err)
    } finally {
      setGenerandoPDF(false)
    }
  }, [
    clienteNombre,
    proyectoNombre,
    viviendaSeleccionada,
    valorBase,
    recargoEsquinera,
    gastosNotariales,
    descuentoAplicado,
    valorTotal,
    valorEscrituraPublica,
    fuentesActivas,
    tiposConCampos,
    entidades,
    notas,
  ])

  return (
    <div className='space-y-4'>
      {errorApi ? (
        <div
          role='alert'
          className='flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300'
        >
          <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
          {errorApi}
        </div>
      ) : null}

      {/* Lo que se va a confirmar */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-5 text-white shadow-lg shadow-blue-900/15 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-800'>
        <span className='pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl' />
        <p className='relative text-xs font-medium uppercase tracking-wide text-white/75'>
          Vas a asignar
        </p>
        <p className='relative mt-0.5 flex items-center gap-2 text-xl font-bold'>
          <Home className='h-5 w-5 flex-shrink-0' />
          {casa}
        </p>
        <p className='relative mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/90'>
          <span className='inline-flex items-center gap-1'>
            <User className='h-3.5 w-3.5' />
            {clienteNombre}
          </span>
          {proyectoNombre ? (
            <span className='inline-flex items-center gap-1'>
              <Building2 className='h-3.5 w-3.5' />
              {proyectoNombre}
            </span>
          ) : null}
        </p>

        <div className='relative mt-4 flex flex-wrap items-end justify-between gap-3'>
          <div>
            <p className='text-xs text-white/80'>Total a pagar</p>
            <p className='text-3xl font-extrabold tabular-nums'>
              {formatCurrency(valorTotal)}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1',
              cuadra
                ? 'bg-emerald-400/25 text-white ring-emerald-200/50'
                : 'bg-amber-400/30 text-white ring-amber-200/60'
            )}
          >
            {cuadra ? (
              <CheckCircle2 className='h-3.5 w-3.5' />
            ) : (
              <AlertTriangle className='h-3.5 w-3.5' />
            )}
            {cuadra
              ? 'Cubierto al 100 %'
              : diferencia > 0
                ? `Sobran ${formatCurrency(diferencia)}`
                : `Faltan ${formatCurrency(-diferencia)}`}
          </span>
        </div>
      </div>

      {/* Valor de la casa */}
      <Tarjeta
        titulo='Valor de la casa'
        icon={Home}
        onEditar={onEditarSeccion1}
      >
        <Fila etiqueta='Valor de la casa' valor={formatCurrency(valorBase)} />
        {gastosNotariales > 0 ? (
          <Fila
            etiqueta='Gastos notariales'
            valor={`+ ${formatCurrency(gastosNotariales)}`}
          />
        ) : null}
        {recargoEsquinera > 0 ? (
          <Fila
            etiqueta='Recargo esquinera'
            valor={`+ ${formatCurrency(recargoEsquinera)}`}
          />
        ) : null}
        {conDescuento ? (
          <Fila
            etiqueta={`Descuento ${pctDescuento.toFixed(1)} %${
              tipoDescuento
                ? ` · ${LABELS_TIPO_DESCUENTO[tipoDescuento as keyof typeof LABELS_TIPO_DESCUENTO] ?? tipoDescuento}`
                : ''
            }`}
            valor={`− ${formatCurrency(descuentoAplicado)}`}
            tono='descuento'
          />
        ) : null}
        <Fila
          etiqueta='Total a pagar'
          valor={formatCurrency(valorTotal)}
          tono='total'
        />

        {valorEscrituraPublica > 0 ? (
          <p
            className={cn(
              'mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs',
              escrituraDistinta
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30'
                : 'bg-gray-50 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300'
            )}
          >
            <FileText className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
            <span>
              Valor en escritura pública:{' '}
              <strong className='tabular-nums'>
                {formatCurrency(valorEscrituraPublica)}
              </strong>
              {escrituraDistinta
                ? '. Es distinto del total a pagar; revisa que sea intencional.'
                : ''}
            </span>
          </p>
        ) : null}
      </Tarjeta>

      {/* Cómo se paga */}
      <Tarjeta
        titulo='Cómo se paga'
        icon={Banknote}
        onEditar={onEditarSeccion2}
      >
        <div className='mb-1 flex h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800'>
          {fuentesActivas.map(f => (
            <span
              key={f.tipo}
              className={cn(
                'h-full',
                getFuenteColorClasses(
                  tiposConCampos.find(t => t.nombre === f.tipo)?.color
                ).barra
              )}
              style={{
                width: `${valorTotal > 0 ? Math.min((montoFuente(f, tiposConCampos) / valorTotal) * 100, 100) : 0}%`,
              }}
            />
          ))}
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
          {fuentesActivas.map(f => (
            <FilaFuenteRevision
              key={f.tipo}
              f={f}
              tiposConCampos={tiposConCampos}
              entidades={entidades}
              valorTotal={valorTotal}
            />
          ))}
        </div>
        {!cuadra ? (
          <p className='mt-2 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30'>
            <AlertTriangle className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
            {diferencia > 0
              ? `Las fuentes suman ${formatCurrency(totalFuentes)}: se devolverán ${formatCurrency(diferencia)} al cliente.`
              : `Las fuentes suman ${formatCurrency(totalFuentes)}: faltan ${formatCurrency(-diferencia)}.`}
          </p>
        ) : null}
      </Tarjeta>

      {notas ? (
        <Tarjeta titulo='Notas' icon={StickyNote} onEditar={onEditarSeccion1}>
          <p className='whitespace-pre-line text-sm text-gray-700 dark:text-gray-200'>
            {notas}
          </p>
        </Tarjeta>
      ) : null}

      <div className='flex justify-end'>
        <button
          type='button'
          onClick={handleDescargarPDF}
          disabled={generandoPDF}
          className='inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
        >
          {generandoPDF ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Download className='h-4 w-4' />
          )}
          {generandoPDF ? 'Generando PDF…' : 'Descargar resumen PDF'}
        </button>
      </div>
    </div>
  )
}
