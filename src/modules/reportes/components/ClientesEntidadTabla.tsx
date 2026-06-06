'use client'

import { memo } from 'react'

import { ExternalLink, FileText, Users } from 'lucide-react'

import Link from 'next/link'

import type {
  ClienteEnEntidad,
  EntidadFinancieraResumen,
  TipoEntidadFinanciera,
} from '../types'

interface ClientesEntidadTablaProps {
  entidad: EntidadFinancieraResumen
}

function labelValor(tipo: TipoEntidadFinanciera): string {
  if (tipo === 'Caja de Compensación' || tipo === 'Cooperativa')
    return 'Valor Subsidio'
  return 'Valor Crédito'
}

function ClientesEntidadTablaComponent({ entidad }: ClientesEntidadTablaProps) {
  const headerValor = labelValor(entidad.tipo)

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900'>
      {/* Cabecera */}
      <div className='flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-5 py-3.5 dark:border-gray-700 dark:from-gray-800/80 dark:to-gray-900'>
        <div className='flex items-center gap-2.5'>
          <Users className='h-4 w-4 text-indigo-500 dark:text-indigo-400' />
          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
            Clientes con {entidad.nombre}
          </h3>
          <span className='rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'>
            {entidad.totalClientesUnicos}{' '}
            {entidad.totalClientesUnicos !== 1 ? 'clientes' : 'cliente'}
          </span>
        </div>
        <div className='text-right'>
          <p className='text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500'>
            Suma de créditos
          </p>
          <p className='text-sm font-bold text-gray-900 dark:text-white'>
            {formatCOP(entidad.montoTotalAprobado)}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-100 bg-gray-50/60 dark:border-gray-700/50 dark:bg-gray-800/40'>
              <Th>Vivienda</Th>
              <Th>Cliente</Th>
              <Th>Tipo Doc.</Th>
              <Th>N° Documento</Th>
              <Th right>{headerValor}</Th>
              <Th>Referencia Cred.</Th>
              <Th center>Estado neg.</Th>
              <th className='px-4 py-2.5' />
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-700/40'>
            {entidad.clientes.map((cliente, idx) => (
              <FilaCliente
                key={`${cliente.negociacionId}-${idx}`}
                cliente={cliente}
              />
            ))}
          </tbody>
        </table>
      </div>

      {entidad.clientes.length === 0 && (
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

// ── Helpers de header ────────────────────────────────────────────────────────

function Th({
  children,
  right,
  center,
}: {
  children?: React.ReactNode
  right?: boolean
  center?: boolean
}) {
  return (
    <th
      className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}
    >
      {children}
    </th>
  )
}

// ── Fila individual ──────────────────────────────────────────────────────────

function FilaCliente({ cliente }: { cliente: ClienteEnEntidad }) {
  const estadoColor: Record<string, string> = {
    Activa:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Completada:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Suspendida:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  const badgeClass =
    estadoColor[cliente.estadoNegociacion] ??
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  return (
    <tr className='group transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/10'>
      {/* Vivienda */}
      <td className='px-4 py-3'>
        {cliente.viviendaLabel ? (
          <span className='inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
            {cliente.viviendaLabel}
          </span>
        ) : (
          <span className='text-xs italic text-gray-400 dark:text-gray-600'>
            —
          </span>
        )}
      </td>

      {/* Cliente */}
      <td className='px-4 py-3'>
        <p className='font-semibold text-gray-900 dark:text-white'>
          {cliente.clienteNombre}
        </p>
      </td>

      {/* Tipo documento */}
      <td className='px-4 py-3'>
        <span className='rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
          {cliente.clienteTipoDocumento || '—'}
        </span>
      </td>

      {/* Número documento */}
      <td className='px-4 py-3 text-gray-600 dark:text-gray-400'>
        {cliente.clienteDocumento || '—'}
      </td>

      {/* Valor crédito / subsidio */}
      <td className='px-4 py-3 text-right'>
        <span className='font-semibold text-gray-900 dark:text-white'>
          {formatCOP(cliente.montoAprobado)}
        </span>
      </td>

      {/* Referencia */}
      <td className='px-4 py-3 text-gray-500 dark:text-gray-400'>
        {cliente.numeroReferencia ?? (
          <span className='italic text-gray-400 dark:text-gray-600'>—</span>
        )}
      </td>

      {/* Estado */}
      <td className='px-4 py-3 text-center'>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {cliente.estadoNegociacion}
        </span>
      </td>

      {/* Ver cliente */}
      <td className='px-4 py-3 text-right'>
        <Link
          href={`/clientes/${cliente.clienteId}`}
          className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 opacity-0 transition-opacity hover:bg-indigo-50 group-hover:opacity-100 dark:text-indigo-400 dark:hover:bg-indigo-950/30'
        >
          Ver
          <ExternalLink className='h-3 w-3' />
        </Link>
      </td>
    </tr>
  )
}

export const ClientesEntidadTabla = memo(ClientesEntidadTablaComponent)

// ── Utilidad local ───────────────────────────────────────────────────────────

function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}
