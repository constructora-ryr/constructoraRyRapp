import { describe, expect, it } from 'vitest'

import { colorCategoria } from './categoria-color'

describe('colorCategoria', () => {
  it('convierte nombres de la paleta a hex', () => {
    expect(colorCategoria('red')).toBe('#EF4444')
    expect(colorCategoria('Teal')).toBe('#14B8A6')
  })

  it('deja pasar los hex de las categorías del sistema', () => {
    expect(colorCategoria('#8B5CF6')).toBe('#8B5CF6')
  })

  it('usa azul si el color falta o no se reconoce', () => {
    expect(colorCategoria(null)).toBe('#3B82F6')
    expect(colorCategoria('morado-raro')).toBe('#3B82F6')
    expect(colorCategoria('#FFF')).toBe('#3B82F6')
  })
})
