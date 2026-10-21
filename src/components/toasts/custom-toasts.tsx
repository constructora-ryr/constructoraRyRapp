/**
 * Toasts con ícono propio (login, logout, entidades). Son toasts normales de
 * sonner con otro ícono, así comparten la misma tarjeta que el resto.
 */

'use client'

import { Building2, LogIn, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { IconoToast } from './toast-estilos'

export function showLoginSuccessToast() {
  toast.success('¡Bienvenido de nuevo!', {
    description: 'Entrando al dashboard…',
    icon: <IconoToast tipo='success' icon={LogIn} />,
    duration: 3000,
  })
}

export function showLogoutToast() {
  toast.info('Sesión cerrada', {
    description: '¡Hasta pronto!',
    icon: <IconoToast tipo='info' icon={LogOut} />,
    duration: 3000,
  })
}

export function showLogoutErrorToast() {
  toast.error('Error al cerrar sesión', {
    description: 'Intenta nuevamente o recarga la página',
  })
}

export function showEntitySuccessToast({
  entityName,
  action,
}: {
  entityName: string
  action: 'created' | 'updated'
}) {
  const creada = action === 'created'
  toast.success(creada ? 'Creado exitosamente' : 'Cambios guardados', {
    description: creada
      ? `${entityName} ya está disponible`
      : `${entityName} se actualizó correctamente`,
    icon: <IconoToast tipo='success' icon={Building2} />,
    duration: 3000,
  })
}
