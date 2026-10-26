'use client'

/**
 * Control de inactividad de la sesión.
 *
 * - Un solo reloj para todas las pestañas (localStorage): trabajar en una
 *   mantiene viva la sesión en todas; si expira, se cierran todas.
 * - Al abrir la app revisa cuánto pasó desde la última actividad guardada:
 *   cerrar el navegador o apagar el equipo no esquiva el control.
 * - Cuenta como actividad: clic, teclado, toque, rueda, scroll en cualquier
 *   contenedor y mover el ratón (como mucho una escritura cada 15 s).
 * - En los últimos minutos (fase 'aviso') solo el botón "Seguir trabajando"
 *   reinicia el reloj: mover el ratón sin querer no debe ocultar el aviso.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '@/contexts/auth-context'
import { cerrarSesion } from '@/lib/sesion/cerrar-sesion'
import {
  estadoInactividad,
  type FaseInactividad,
} from '@/lib/sesion/estado-inactividad'
import {
  escucharOtrasPestanas,
  leerActividad,
  marcarActividad,
} from '@/lib/sesion/reloj-actividad'

const EVENTOS_ACTIVIDAD = [
  'pointerdown',
  'pointermove',
  'keydown',
  'wheel',
  'touchstart',
  'scroll',
] as const
const CADA_CUANTO_MARCAR_MS = 15_000
const REVISION_NORMAL_MS = 15_000
const REVISION_EN_AVISO_MS = 1_000

interface EstadoSesion {
  fase: FaseInactividad
  restanteMs: number
}

export function useInactividad({
  minutos,
  habilitado = true,
}: {
  minutos: number
  habilitado?: boolean
}) {
  const { user } = useAuth()
  const uid = user?.id ?? null
  const inicio = user?.last_sign_in_at ?? null
  const limiteMs = minutos * 60_000

  const [estado, setEstado] = useState<EstadoSesion>({
    fase: 'activa',
    restanteMs: limiteMs,
  })

  // Refs para que los listeners no se recreen en cada render
  const limiteRef = useRef(limiteMs)
  const sesionRef = useRef({ uid, inicio, email: user?.email ?? '' })
  const faseRef = useRef<FaseInactividad>('activa')
  const cerrandoRef = useRef(false)
  // Respaldo en memoria si el navegador bloquea localStorage
  const ultimaEnMemoriaRef = useRef(Date.now())
  limiteRef.current = limiteMs
  sesionRef.current = { uid, inicio, email: user?.email ?? '' }

  const marcar = useCallback(() => {
    const { uid: u, inicio: i } = sesionRef.current
    if (!u) return
    ultimaEnMemoriaRef.current = Date.now()
    marcarActividad(u, i)
  }, [])

  const cerrar = useCallback((avisadoPorOtraPestana: boolean) => {
    if (cerrandoRef.current) return
    cerrandoRef.current = true
    faseRef.current = 'expirada'
    setEstado({ fase: 'expirada', restanteMs: 0 })
    void cerrarSesion({
      porInactividad: true,
      avisadoPorOtraPestana,
      minutos: Math.round(limiteRef.current / 60_000),
      email: sesionRef.current.email,
    })
  }, [])

  const revisar = useCallback(() => {
    const { uid: u } = sesionRef.current
    if (!u || cerrandoRef.current) return
    const registro = leerActividad()
    const ultima =
      registro?.uid === u
        ? Math.max(registro.t, ultimaEnMemoriaRef.current)
        : ultimaEnMemoriaRef.current
    const siguiente = estadoInactividad(ultima, Date.now(), limiteRef.current)
    if (siguiente.fase === 'expirada') {
      cerrar(false)
      return
    }
    faseRef.current = siguiente.fase
    // En fase activa no hace falta re-renderizar cada 15 s
    setEstado(prev =>
      prev.fase === 'activa' && siguiente.fase === 'activa' ? prev : siguiente
    )
  }, [cerrar])

  // Arranque por sesión: ¿inicio nuevo o sesión que vuelve tras un tiempo?
  useEffect(() => {
    if (!habilitado || !uid) return
    cerrandoRef.current = false

    const registro = leerActividad()
    const esSesionNueva =
      !registro || registro.uid !== uid || registro.inicio !== inicio
    if (esSesionNueva) marcar()
    else ultimaEnMemoriaRef.current = registro.t
    revisar()

    let ultimaMarca = Date.now()
    const alActuar = () => {
      if (faseRef.current !== 'activa') return
      const ahora = Date.now()
      if (ahora - ultimaMarca < CADA_CUANTO_MARCAR_MS) return
      ultimaMarca = ahora
      marcar()
    }
    // capture: el scroll de contenedores internos no burbujea hasta window
    EVENTOS_ACTIVIDAD.forEach(ev =>
      window.addEventListener(ev, alActuar, { passive: true, capture: true })
    )
    const alVolver = () => {
      if (document.visibilityState === 'visible') revisar()
    }
    document.addEventListener('visibilitychange', alVolver)
    const dejarDeEscuchar = escucharOtrasPestanas({
      onActividad: revisar,
      onCierre: () => cerrar(true),
    })

    return () => {
      EVENTOS_ACTIVIDAD.forEach(ev =>
        window.removeEventListener(ev, alActuar, { capture: true })
      )
      document.removeEventListener('visibilitychange', alVolver)
      dejarDeEscuchar()
    }
  }, [habilitado, uid, inicio, marcar, revisar, cerrar])

  // Revisión periódica: cada segundo durante el aviso (cuenta regresiva)
  useEffect(() => {
    if (!habilitado || !uid || estado.fase === 'expirada') return
    const intervalo = setInterval(
      revisar,
      estado.fase === 'aviso' ? REVISION_EN_AVISO_MS : REVISION_NORMAL_MS
    )
    return () => clearInterval(intervalo)
  }, [habilitado, uid, estado.fase, revisar])

  const seguirTrabajando = useCallback(() => {
    marcar()
    faseRef.current = 'activa'
    setEstado({ fase: 'activa', restanteMs: limiteRef.current })
  }, [marcar])

  const cerrarAhora = useCallback(() => {
    if (cerrandoRef.current) return
    cerrandoRef.current = true
    void cerrarSesion({ porInactividad: false })
  }, [])

  return {
    fase: estado.fase,
    restanteMs: estado.restanteMs,
    seguirTrabajando,
    cerrarAhora,
  }
}
