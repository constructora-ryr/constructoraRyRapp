'use client'

import { FileText, Tag, Upload, Trash2, Edit } from 'lucide-react'

import type { AuditLogRecord } from '../../types'

interface DocumentoClienteDetalleRenderProps {
  registro: AuditLogRecord
}

function getStr(
  obj: Record<string, unknown> | null,
  key: string
): string | null {
  if (!obj) return null
  const val = obj[key]
  return val != null ? String(val) : null
}

export function DocumentoClienteDetalleRender({
  registro,
}: DocumentoClienteDetalleRenderProps) {
  const datos =
    registro.accion === 'DELETE'
      ? registro.datosAnteriores
      : registro.datosNuevos

  const titulo =
    getStr(datos, 'titulo') ||
    getStr(registro.metadata as Record<string, unknown>, 'titulo') ||
    'Documento sin título'

  const descripcion = getStr(datos, 'descripcion')
  const estado = getStr(datos, 'estado')
  const version = getStr(datos, 'version')

  const accionConfig = {
    CREATE: {
      icon: Upload,
      label: 'Documento Cargado',
      color:
        'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
    },
    UPDATE: {
      icon: Edit,
      label: 'Documento Actualizado',
      color:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    DELETE: {
      icon: Trash2,
      label: 'Documento Eliminado',
      color:
        'border-red-200 bg-red-50 text-redred-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  }[registro.accion] ?? {
    icon: FileText,
    label: 'Documento',
    color:
      'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
    iconColor: 'text-gray-500',
  }

  const IconAccion = accionConfig.icon

  return (
    <div className='space-y-4'>
      {/* Encabezado del documento */}
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${accionConfig.color}`}
      >
        <IconAccion
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${accionConfig.iconColor}`}
        />
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-semibold uppercase tracking-wide opacity-70'>
            {accionConfig.label}
          </p>
          <p className='mt-0.5 break-words text-base font-bold text-gray-900 dark:text-white'>
            {titulo}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {estado && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Estado
            </label>
            <span className='inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-medium capitalize text-gray-800 dark:bg-gray-800 dark:text-gray-200'>
              {estado}
            </span>
          </div>
        )}

        {version && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Versión
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Tag className='h-4 w-4 text-gray-400' />v{version}
            </div>
          </div>
        )}
      </div>

      {descripcion && (
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Descripción
          </label>
          <p className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300'>
            {descripcion}
          </p>
        </div>
      )}
    </div>
  )
}
