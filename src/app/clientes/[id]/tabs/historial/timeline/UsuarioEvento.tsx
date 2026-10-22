/** Quién hizo el evento: avatar con iniciales + nombre (+ rol) */

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { getAvatarColor } from '@/shared/documentos/utils/documento-card.utils'

export function UsuarioEvento({
  usuario,
  conRol = true,
}: {
  usuario: EventoHistorialHumanizado['usuario']
  conRol?: boolean
}) {
  const nombre = usuario.nombres || usuario.email || 'Sistema'
  const iniciales =
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('') || '?'

  return (
    <span className='inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300'>
      <span
        aria-hidden
        className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white'
        style={{ backgroundColor: getAvatarColor(nombre) }}
      >
        {iniciales}
      </span>
      <span className='truncate font-medium'>{nombre}</span>
      {conRol && usuario.rol ? (
        <span className='hidden text-slate-400 sm:inline'>· {usuario.rol}</span>
      ) : null}
    </span>
  )
}
