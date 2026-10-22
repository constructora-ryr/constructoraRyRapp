/**
 * Filtro para campos de área (m²): solo dígitos, un punto y hasta 3
 * decimales. Bloquea teclas inválidas, limpia lo pegado y muestra un aviso
 * corto explicando por qué no entró el carácter.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'

const DECIMALES = 3

export function useCampoDecimal() {
  const [aviso, setAviso] = useState<string | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    },
    []
  )

  const avisar = useCallback((mensaje: string) => {
    if (temporizador.current) clearTimeout(temporizador.current)
    setAviso(mensaje)
    temporizador.current = setTimeout(() => setAviso(null), 2500)
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const { key, ctrlKey, metaKey, altKey } = e
      // Solo se filtran caracteres: Shift, Enter, Bloq Mayús, flechas, etc.
      // tienen nombres largos y no escriben nada
      if (ctrlKey || metaKey || altKey || key.length !== 1) return

      const { value, selectionStart, selectionEnd } = e.currentTarget
      const inicio = selectionStart ?? value.length
      const haySeleccion = inicio !== (selectionEnd ?? value.length)
      // La coma (teclado numérico en español) cuenta como punto decimal
      const esSeparador = key === '.' || key === ','

      if (!/^\d$/.test(key) && !esSeparador) {
        e.preventDefault()
        avisar('Solo números y punto decimal')
      } else if (esSeparador && value.includes('.') && !haySeleccion) {
        e.preventDefault()
        avisar('Solo un punto decimal')
      } else if (/\d/.test(key) && value.includes('.') && !haySeleccion) {
        const punto = value.indexOf('.')
        if (inicio > punto && value.length - punto - 1 >= DECIMALES) {
          e.preventDefault()
          avisar(`Máximo ${DECIMALES} decimales (Ej: 66.125)`)
        }
      }
    },
    [avisar]
  )

  // Lo pegado o autocompletado no pasa por onKeyDown
  const onInput = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      // Coma → punto sin aviso: es la forma normal de escribir decimales aquí
      const conPunto = input.value.replace(/,/g, '.')
      const [entero, ...resto] = conPunto.replace(/[^\d.]/g, '').split('.')
      const limpio = resto.length
        ? `${entero}.${resto.join('').slice(0, DECIMALES)}`
        : entero
      if (input.value !== limpio) {
        input.value = limpio
        if (conPunto !== limpio)
          avisar('Se ajustó el valor: solo números con hasta 3 decimales')
      }
    },
    [avisar]
  )

  return { aviso, onKeyDown, onInput }
}
