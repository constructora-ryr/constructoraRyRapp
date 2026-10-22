'use client'

/**
 * Aviso de intentos fallidos por correo en este navegador: tras 5 fallos
 * bloquea el formulario 15 minutos. Es solo una ayuda visual (se puede borrar
 * con los datos del navegador); la protección real contra fuerza bruta es el
 * límite de Supabase Auth en el servidor.
 */

import { useCallback, useEffect, useState } from 'react'

export const MAX_INTENTOS = 5
export const MINUTOS_BLOQUEO = 15
const CLAVE = 'ryr_login_intentos'

type Registro = Record<string, { fallidos: number; hasta: number | null }>

function leer(): Registro {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) ?? '{}') as Registro
    // Descartar bloqueos ya vencidos
    const ahora = Date.now()
    return Object.fromEntries(
      Object.entries(datos).filter(([, r]) => !r.hasta || r.hasta > ahora)
    )
  } catch {
    return {}
  }
}

function guardar(datos: Registro) {
  try {
    if (Object.keys(datos).length)
      localStorage.setItem(CLAVE, JSON.stringify(datos))
    else localStorage.removeItem(CLAVE)
  } catch {
    // Sin almacenamiento (modo privado): el aviso simplemente no persiste
  }
}

export function useBloqueoLocal(email: string) {
  const clave = email.trim().toLowerCase()
  const [registro, setRegistro] = useState({
    fallidos: 0,
    hasta: null as number | null,
  })
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    setRegistro(leer()[clave] ?? { fallidos: 0, hasta: null })
  }, [clave])

  // Reloj para la cuenta regresiva mientras está bloqueado
  const bloqueado = !!registro.hasta && registro.hasta > ahora
  useEffect(() => {
    if (!registro.hasta) return
    const intervalo = setInterval(() => setAhora(Date.now()), 15_000)
    return () => clearInterval(intervalo)
  }, [registro.hasta])

  const registrarFallo = useCallback(() => {
    const datos = leer()
    const fallidos = (datos[clave]?.fallidos ?? 0) + 1
    const hasta =
      fallidos >= MAX_INTENTOS ? Date.now() + MINUTOS_BLOQUEO * 60_000 : null
    datos[clave] = { fallidos, hasta }
    guardar(datos)
    setRegistro({ fallidos, hasta })
    setAhora(Date.now())
    return {
      restantes: Math.max(0, MAX_INTENTOS - fallidos),
      bloqueado: !!hasta,
    }
  }, [clave])

  const limpiar = useCallback(() => {
    const datos = leer()
    delete datos[clave]
    guardar(datos)
    setRegistro({ fallidos: 0, hasta: null })
  }, [clave])

  return {
    bloqueado,
    minutosRestantes: bloqueado
      ? Math.ceil(((registro.hasta as number) - ahora) / 60_000)
      : 0,
    intentosRestantes: Math.max(0, MAX_INTENTOS - registro.fallidos),
    registrarFallo,
    limpiar,
  }
}
