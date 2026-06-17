'use client'

import { memo } from 'react'

import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink, FileText, Users } from 'lucide-react'

import Link from 'next/link'

import { DataTable } from '@/shared/components/table/DataTable'

import type {
  ClienteEnEntidad,
  EntidadFinancieraResumen,
  TipoEntidadFinanciera,
} from '../types'

const TABLE_STYLES = `
  .reportes-tabla-wrapper thead {
    background-image: linear-gradient(135deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%) !important;
  }
  .reportes-tabla-wrapper thead th {
    font-size: 10px !important;
    letter-spacing: 0.03em !important;
    white-space: nowrap !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
  .reportes-tabla-wrapper tbody td {
    text-align: center !important;
    vertical-align: middle !important;
  }
`

interface ClientesEntidadTablaProps {
  entidad: EntidadFinancieraResumen
}

function labelColumna(tipo: TipoEntidadFinanciera): string {
  return tipo === 'Caja de Compensación' ||
    tipo === 'Cooperativa' ||
    tipo === 'Gobierno'
    ? 'Valor Subsidio'
    : 'Valor Crédito'
}

function labelTotal(tipo: TipoEntidadFinanciera): string {
  return tipo === 'Caja de Compensación' ||
    tipo === 'Cooperativa' ||
    tipo === 'Gobierno'
    ? 'Total Subsidios'
    : 'Total Créditos'
}

function labelReferencia(tipo: TipoEntidadFinanciera): string {
  if (
    tipo === 'Caja de Compensación' ||
    tipo === 'Cooperativa' ||
    tipo === 'Gobierno'
  )
    return 'N° de Acta'
  return 'Referencia Cred.'
}

// Subsidios (Cajas, Cooperativas y Gobierno/Mi Casa Ya) muestran "Acta X del fecha"
function esEntidadConActa(tipo: TipoEntidadFinanciera): boolean {
  return (
    tipo === 'Caja de Compensación' ||
    tipo === 'Cooperativa' ||
    tipo === 'Gobierno'
  )
}

function formatFechaActa(fecha: string): string {
  const [year, month, day] = fecha.split('-').map(Number)
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function ClientesEntidadTablaComponent({ entidad }: ClientesEntidadTablaProps) {
  const headerValor = labelColumna(entidad.tipo)
  const totalLabel = labelTotal(entidad.tipo)
  const headerReferencia = labelReferencia(entidad.tipo)
  const conActa = esEntidadConActa(entidad.tipo)

  const columns: ColumnDef<ClienteEnEntidad>[] = [
    // 1. VIVIENDA
    {
      id: 'vivienda',
      header: 'Vivienda',
      size: 90,
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          {row.original.viviendaLabel ? (
            <span className='rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300'>
              {row.original.viviendaLabel}
            </span>
          ) : (
            <span className='text-xs text-gray-400 dark:text-gray-500'>—</span>
          )}
        </div>
      ),
    },

    // 2. CLIENTE
    {
      accessorKey: 'clienteNombre',
      header: 'Cliente',
      size: 220,
      cell: ({ row }) => (
        <div className='text-left'>
          <span className='text-xs font-semibold text-gray-900 dark:text-white'>
            {row.original.clienteNombre}
          </span>
        </div>
      ),
    },

    // 3. TIPO DOCUMENTO
    {
      accessorKey: 'clienteTipoDocumento',
      header: 'Tipo Doc.',
      size: 85,
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {row.original.clienteTipoDocumento || '—'}
          </span>
        </div>
      ),
    },

    // 4. NÚMERO DOCUMENTO
    {
      accessorKey: 'clienteDocumento',
      header: 'N° Documento',
      size: 120,
      cell: ({ row }) => (
        <span className='text-xs text-gray-600 dark:text-gray-400'>
          {row.original.clienteDocumento || '—'}
        </span>
      ),
    },

    // 5. VALOR (dinámico según tipo entidad)
    {
      accessorKey: 'montoAprobado',
      header: headerValor,
      size: 130,
      cell: ({ row }) => (
        <span className='text-xs font-semibold text-gray-900 dark:text-white'>
          {formatCOP(row.original.montoAprobado)}
        </span>
      ),
    },

    // 6. REFERENCIA / N° ACTA / N° REFERENCIA
    {
      accessorKey: 'numeroReferencia',
      header: headerReferencia,
      size: conActa ? 180 : 150,
      cell: ({ row }) => {
        const { numeroReferencia, fechaActa } = row.original

        // Cajas / Cooperativas: "340 del 12 de junio de 2025"
        if (conActa) {
          if (!numeroReferencia && !fechaActa) {
            return (
              <span className='text-xs text-gray-400 dark:text-gray-500'>
                —
              </span>
            )
          }
          return (
            <span className='text-xs text-gray-700 dark:text-gray-300'>
              {numeroReferencia ?? ''}
              {numeroReferencia && fechaActa ? ' del ' : ''}
              {fechaActa ? formatFechaActa(fechaActa) : ''}
            </span>
          )
        }

        // Bancos / Otro: referencia de crédito
        return (
          <span className='text-xs text-gray-600 dark:text-gray-400'>
            {numeroReferencia ?? '—'}
          </span>
        )
      },
    },

    // 7. ESTADO NEG.
    {
      accessorKey: 'estadoNegociacion',
      header: 'Estado neg.',
      size: 105,
      cell: ({ row }) => {
        const estado = row.original.estadoNegociacion
        const estadoColor: Record<string, string> = {
          Activa:
            'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400',
          Completada:
            'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400',
          Suspendida:
            'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
        }
        const badgeClass =
          estadoColor[estado] ??
          'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
        return (
          <div className='flex items-center justify-center'>
            <span
              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${badgeClass}`}
            >
              {estado}
            </span>
          </div>
        )
      },
    },

    // 8. VER CLIENTE
    {
      id: 'acciones',
      header: '',
      size: 55,
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <Link
            href={`/clientes/${row.original.clienteId}`}
            onClick={e => e.stopPropagation()}
            className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/30'
          >
            Ver
            <ExternalLink className='h-3 w-3' />
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className='reportes-tabla-wrapper overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900'>
      {/* Cabecera */}
      <div className='flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-3.5 dark:border-gray-700 dark:from-indigo-950/30 dark:to-violet-950/20'>
        <div className='flex items-center gap-2.5'>
          <Users className='h-4 w-4 text-violet-600 dark:text-violet-400' />
          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
            Clientes con {entidad.nombre}
          </h3>
          <span className='rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'>
            {entidad.totalClientesUnicos}{' '}
            {entidad.totalClientesUnicos !== 1 ? 'clientes' : 'cliente'}
          </span>
        </div>
        <div className='text-right'>
          <p className='text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
            {totalLabel}
          </p>
          <p className='text-sm font-bold text-gray-900 dark:text-white'>
            {formatCOP(entidad.montoTotalAprobado)}
          </p>
        </div>
      </div>

      {/* Tabla */}
      {entidad.clientes.length > 0 ? (
        <style jsx global>{`
          ${TABLE_STYLES}
        `}</style>
      ) : null}

      {entidad.clientes.length > 0 ? (
        <DataTable
          columns={columns}
          data={entidad.clientes}
          gradientColor='purple'
          showPagination={entidad.clientes.length > 10}
        />
      ) : (
        <div className='flex flex-col items-center py-12 text-center'>
          <FileText className='mb-2 h-8 w-8 text-gray-300 dark:text-gray-600' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Sin clientes registrados para esta entidad
          </p>
        </div>
      )}
    </div>
  )
}

export const ClientesEntidadTabla = memo(ClientesEntidadTablaComponent)

function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}
