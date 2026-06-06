'use client'

import { memo } from 'react'

import { ExternalLink, FileText, Users } from 'lucide-react'

import Link from 'next/link'

import type { ClienteEnEntidad, EntidadFinancieraResumen } from '../types'

interface ClientesEntidadTablaProps {
  entidad: EntidadFinancieraResumen
}

function ClientesEntidadTablaComponent({ entidad }: ClientesEntidadTablaProps) {
  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800'>
      {/* Cabecera de la tabla */}
      <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80'>
        <div className='flex items-center gap-2'>
          <Users className='h-4 w-4 text-gray-500 dark:text-gray-400' />
          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
            Clientes con {entidad.nombre}
          </h3>
          <span className='rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
            {entidad.totalClientesUnicos} cliente
            {entidad.totalClientesUnicos !== 1 ? 's' : ''}
          </span>
        </div>
        <div className='text-right'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Total aprobado
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
            <tr className='border-b border-gray-100 bg-gray-50/50 dark:border-gray-700/50 dark:bg-gray-800/40'>
              <th className='px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Cliente
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Documento
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Tipo de fuente
              </th>
              <th className='px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Monto aprobado
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Referencia
              </th>
              <th className='px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
                Estado neg.
              </th>
              <th className='px-4 py-2.5' />
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 dark:divide-gray-700/50'>
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
        <div className='flex flex-col items-center py-10 text-center'>
          <FileText className='mb-2 h-8 w-8 text-gray-300 dark:text-gray-600' />
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Sin clientes registrados para esta entidad
          </p>
        </div>
      )}
    </div>
  )
}

// ── Fila individual ──────────────────────────────────────────────────────────

function FilaCliente({ cliente }: { cliente: ClienteEnEntidad }) {
  const estadoColor: Record<string, string> = {
    Activa:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Completada:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Suspendida:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  }

  const badgeClass =
    estadoColor[cliente.estadoNegociacion] ??
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  return (
    <tr className='group transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-700/20'>
      <td className='px-4 py-3'>
        <p className='font-medium text-gray-900 dark:text-white'>
          {cliente.clienteNombre}
        </p>
      </td>
      <td className='px-4 py-3 text-gray-600 dark:text-gray-400'>
        {cliente.clienteDocumento}
      </td>
      <td className='px-4 py-3 text-gray-600 dark:text-gray-400'>
        {cliente.tipoFuente}
      </td>
      <td className='px-4 py-3 text-right font-medium text-gray-900 dark:text-white'>
        {formatCOP(cliente.montoAprobado)}
      </td>
      <td className='px-4 py-3 text-gray-500 dark:text-gray-400'>
        {cliente.numeroReferencia ?? (
          <span className='italic text-gray-400 dark:text-gray-600'>—</span>
        )}
      </td>
      <td className='px-4 py-3 text-center'>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
        >
          {cliente.estadoNegociacion}
        </span>
      </td>
      <td className='px-4 py-3 text-right'>
        <Link
          href={`/clientes/${cliente.clienteId}`}
          className='inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 opacity-0 transition-opacity hover:bg-blue-50 group-hover:opacity-100 dark:text-blue-400 dark:hover:bg-blue-950/30'
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
