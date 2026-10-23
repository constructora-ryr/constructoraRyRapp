import { describe, expect, it } from 'vitest'

import { capitalizarNombre } from './capitalizar-nombre'
import { edad, errorFechaNacimiento } from './fecha-nacimiento'

const haceAnos = (anos: number, dias = 0) => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - anos)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

describe('capitalizarNombre', () => {
  it('pone mayúscula inicial y limpia espacios', () => {
    expect(capitalizarNombre('  juan   PÉREZ ')).toBe('Juan Pérez')
  })
  it('deja las partículas en minúscula salvo al inicio', () => {
    expect(capitalizarNombre('maría de los ángeles')).toBe(
      'María de los Ángeles'
    )
    expect(capitalizarNombre('del valle')).toBe('Del Valle')
  })
  it('respeta guiones y apóstrofos', () => {
    expect(capitalizarNombre("ana-maría o'neil")).toBe("Ana-María O'Neil")
  })
})

describe('errorFechaNacimiento', () => {
  it('acepta vacío (es opcional) y un adulto', () => {
    expect(errorFechaNacimiento('')).toBeNull()
    expect(errorFechaNacimiento(haceAnos(30))).toBeNull()
  })
  it('rechaza menores de 18', () => {
    expect(errorFechaNacimiento(haceAnos(17))).toMatch(/mayor de 18/)
  })
  it('rechaza fechas futuras y fuera de rango', () => {
    expect(errorFechaNacimiento(haceAnos(-1))).toMatch(/futura/)
    expect(errorFechaNacimiento(haceAnos(130))).toMatch(/rango/)
  })
})

describe('edad', () => {
  it('cuenta años cumplidos', () => {
    expect(edad(haceAnos(40))).toBe(40)
    expect(edad(haceAnos(40, 2))).toBe(39)
    expect(edad('')).toBeNull()
  })
})
