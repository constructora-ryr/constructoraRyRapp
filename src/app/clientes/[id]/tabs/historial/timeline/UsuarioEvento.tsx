/** Quién hizo el evento: avatar con iniciales + nombre (+ rol) */

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { AvatarUsuario } from '@/shared/components/usuario/AvatarUsuario'

export function UsuarioEvento({
  usuario,
  conRol = true,
}: {
  usuario: EventoHistorialHumanizado['usuario']
  conRol?: boolean
}) {
  const nombre = usuario.nombres || usuario.email || 'Sistema'

  return (
    <span className='inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300'>
      <AvatarUsuario nombre={nombre} rol={usuario.rol} tamano='xs' />
      <span className='truncate font-medium'>{nombre}</span>
      {conRol && usuario.rol ? (
        <span className='hidden text-slate-400 sm:inline'>· {usuario.rol}</span>
      ) : null}
    </span>
  )
}
