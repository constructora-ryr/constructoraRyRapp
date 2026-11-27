'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Clock, Mail } from 'lucide-react'

import type { Perfil } from '@/hooks/auth/useAuthQuery'
import { rolVisual } from '@/modules/usuarios/config/usuarios-visual'
import {
  ChipDato,
  EncabezadoDetalle,
  InsigniaEstado,
} from '@/shared/components/detalle/EncabezadoDetalle'
import {
  AvatarUsuario,
  degradadoRol,
} from '@/shared/components/usuario/AvatarUsuario'

const desde = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

/**
 * Encabezado de Mi perfil (EncabezadoDetalle): la línea superior y el
 * avatar llevan el color del rol; nombre, rol y datos de la cuenta.
 */
export function EncabezadoPerfil({ perfil }: { perfil: Perfil }) {
  const rol = rolVisual(perfil.rol)
  const nombre = `${perfil.nombres} ${perfil.apellidos}`.trim()
  const ultimoIngreso = perfil.ultimo_login ?? perfil.ultimo_acceso

  return (
    <EncabezadoDetalle
      acento={degradadoRol(perfil.rol)}
      avatar={
        <AvatarUsuario
          nombre={nombre}
          rol={perfil.rol}
          iniciales={`${perfil.nombres[0] ?? ''}${perfil.apellidos[0] ?? ''}`.toUpperCase()}
          tamano='xl'
        />
      }
      titulo={nombre}
      insignia={
        <InsigniaEstado label={rol.label} icon={rol.icon} clase={rol.badge} />
      }
      datos={
        <>
          <ChipDato icon={Mail}>{perfil.email}</ChipDato>
          <ChipDato icon={CalendarDays}>
            Cuenta desde {desde(perfil.fecha_creacion)}
          </ChipDato>
          {ultimoIngreso ? (
            <ChipDato icon={Clock}>
              Último ingreso{' '}
              {formatDistanceToNow(new Date(ultimoIngreso), {
                addSuffix: true,
                locale: es,
              })}
            </ChipDato>
          ) : null}
        </>
      }
    />
  )
}
