import { describe, expect, it } from 'vitest'

import { rutaDespuesDeLogin } from './redireccion'

describe('rutaDespuesDeLogin', () => {
  it('respeta rutas internas', () => {
    expect(rutaDespuesDeLogin('/clientes/abc?tab=historial')).toBe(
      '/clientes/abc?tab=historial'
    )
  })

  it('va al inicio si no hay destino', () => {
    expect(rutaDespuesDeLogin(null)).toBe('/')
    expect(rutaDespuesDeLogin('')).toBe('/')
  })

  it('bloquea sitios externos (redirección abierta)', () => {
    expect(rutaDespuesDeLogin('https://sitio-falso.com')).toBe('/')
    expect(rutaDespuesDeLogin('//sitio-falso.com')).toBe('/')
    expect(rutaDespuesDeLogin('/\\sitio-falso.com')).toBe('/')
    expect(rutaDespuesDeLogin('javascript:alert(1)')).toBe('/')
    expect(rutaDespuesDeLogin('/\nhttps://x.com')).toBe('/')
  })

  it('no vuelve al login ni a rutas de autenticación', () => {
    expect(rutaDespuesDeLogin('/login')).toBe('/')
    expect(rutaDespuesDeLogin('/auth/callback')).toBe('/')
    expect(rutaDespuesDeLogin('/reset-password')).toBe('/')
  })
})
