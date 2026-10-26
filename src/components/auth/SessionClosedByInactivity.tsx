'use client'

/**
 * Pantalla tras cerrar la sesión por inactividad. Usa el mismo marco que el
 * login (PantallaAuth) para que el usuario reconozca dónde está. La muestra
 * SessionInterceptor al recargar.
 */

import { useEffect, useState } from 'react'

import { Clock, LogIn, MousePointerClick } from 'lucide-react'

import {
  AvisoAuth,
  BotonAuth,
  EncabezadoAuth,
  PantallaAuth,
} from '@/components/auth/pantalla-auth'
import { leerLimiteMinutos } from '@/lib/sesion/reloj-actividad'

function textoDuracion(minutos: number): string {
  if (minutos % 60 === 0) {
    const h = minutos / 60
    return `${h} hora${h === 1 ? '' : 's'}`
  }
  return `${minutos} minutos`
}

/** Hora del cierre guardada por cerrarSesion() */
function leerHoraCierre(): string {
  try {
    const marca = Number(sessionStorage.getItem('logout_timestamp'))
    return marca
      ? new Date(marca).toLocaleTimeString('es-CO', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : ''
  } catch {
    return ''
  }
}

export function SessionClosedByInactivity() {
  // Solo se renderiza en el navegador (SessionInterceptor la activa en un
  // efecto), así que se puede leer el almacenamiento al iniciar el estado
  const [hora] = useState(leerHoraCierre)
  const [minutos] = useState(leerLimiteMinutos)

  // Se muestra una sola vez: el próximo ingreso es normal
  useEffect(() => {
    try {
      sessionStorage.removeItem('logout_reason')
      sessionStorage.removeItem('logout_timestamp')
    } catch {
      // Nada que limpiar
    }
  }, [])

  return (
    <PantallaAuth>
      <EncabezadoAuth
        titulo='Sesión cerrada'
        subtitulo={`Pasaron ${textoDuracion(minutos)} sin actividad${hora ? ` (a las ${hora})` : ''}.`}
      />

      <AvisoAuth tono='aviso' icon={Clock}>
        Cerramos tu sesión para proteger tu cuenta. Lo que habías guardado sigue
        intacto.
      </AvisoAuth>

      <p className='mt-5 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400'>
        <MousePointerClick className='mt-0.5 h-4 w-4 flex-shrink-0' />
        Para evitarlo, basta con usar la app en cualquiera de tus pestañas; te
        avisamos 5 minutos antes.
      </p>

      <BotonAuth
        type='button'
        className='mt-6'
        autoFocus
        onClick={() => {
          window.location.href = '/login'
        }}
      >
        <LogIn className='h-4 w-4' />
        Iniciar sesión de nuevo
      </BotonAuth>
    </PantallaAuth>
  )
}
