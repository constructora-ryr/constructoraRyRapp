import { describe, expect, it } from 'vitest'

import { leerUserAgent } from './user-agent'

describe('leerUserAgent', () => {
  it('Chrome en Windows', () => {
    expect(
      leerUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36'
      )
    ).toEqual({
      sistema: 'Windows 11/10',
      navegador: 'Chrome 157',
      tipo: 'computador',
    })
  })

  it('Edge no se confunde con Chrome', () => {
    expect(
      leerUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
      ).navegador
    ).toBe('Edge 130')
  })

  it('Safari en iPhone es celular', () => {
    expect(
      leerUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      )
    ).toEqual({ sistema: 'iPhone', navegador: 'Safari', tipo: 'celular' })
  })

  it('Android sin "Mobile" es tableta', () => {
    expect(
      leerUserAgent(
        'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      ).tipo
    ).toBe('tableta')
  })

  it('sin user agent', () => {
    expect(leerUserAgent(null)).toEqual({
      sistema: 'Equipo desconocido',
      navegador: 'Navegador desconocido',
      tipo: 'computador',
    })
  })
})
