'use client'

import { Edit3, MapPin, Phone, User, Users } from 'lucide-react'

interface ClienteDetalleRenderProps {
  metadata: Record<string, unknown>
  accion?: string
}

export function ClienteDetalleRender({
  metadata,
  accion,
}: ClienteDetalleRenderProps) {
  const get = (key: string, fallback = 'N/A'): string =>
    metadata[key] != null ? String(metadata[key]) : fallback

  if (accion === 'UPDATE') {
    const nombre = get('cliente_nombre')
    const camposRaw = metadata.campos_modificados
    const campos: string[] = Array.isArray(camposRaw) ? camposRaw : []

    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30'>
          <Edit3 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400'>
              Perfil Actualizado
            </p>
            <p className='text-base font-bold text-blue-700 dark:text-blue-300'>
              {nombre}
            </p>
          </div>
        </div>

        {campos.length > 0 && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Campos Modificados ({campos.length})
            </label>
            <div className='flex flex-wrap gap-1.5'>
              {campos.map((c: string) => (
                <span
                  key={c}
                  className='rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Nombre Completo
          </label>
          <div className='flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white'>
            <User className='h-5 w-5 text-purple-600 dark:text-purple-400' />
            {get('cliente_nombre_completo')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Documento
          </label>
          <div className='text-base text-gray-900 dark:text-white'>
            {get('cliente_tipo_documento', 'CC')}{' '}
            {get('cliente_numero_documento')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Teléfono
          </label>
          <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
            <Phone className='h-5 w-5 text-cyan-600 dark:text-cyan-400' />
            {get('cliente_telefono')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Email
          </label>
          <div className='text-base text-gray-900 dark:text-white'>
            {get('cliente_email')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Ciudad
          </label>
          <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
            <MapPin className='h-5 w-5 text-red-600 dark:text-red-400' />
            {get('cliente_ciudad')}, {get('cliente_departamento')}
          </div>
        </div>

        <div className='space-y-1'>
          <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Estado
          </label>
          <span className='inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold capitalize text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
            {get('cliente_estado')}
          </span>
        </div>

        {metadata.cliente_origen != null && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Origen
            </label>
            <div className='text-base text-gray-900 dark:text-white'>
              {get('cliente_origen')}
            </div>
          </div>
        )}

        {metadata.cliente_referido_por != null && (
          <div className='space-y-1'>
            <label className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
              Referido por
            </label>
            <div className='flex items-center gap-2 text-base text-gray-900 dark:text-white'>
              <Users className='h-5 w-5 text-gray-400' />
              {get('cliente_referido_por')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
