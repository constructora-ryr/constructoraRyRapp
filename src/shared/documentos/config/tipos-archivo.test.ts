import { describe, expect, it } from 'vitest'

import { formatosArchivo, validarArchivoDocumento } from './tipos-archivo'

const archivo = (nombre: string, bytes = 2048, tipo = '') =>
  new File([new Uint8Array(bytes)], nombre, { type: tipo })

describe('validarArchivoDocumento', () => {
  it('acepta los formatos básicos en clientes', () => {
    expect(validarArchivoDocumento(archivo('cedula.pdf'), 'cliente')).toBeNull()
    expect(validarArchivoDocumento(archivo('FOTO.JPG'), 'cliente')).toBeNull()
  })

  it('rechaza en clientes lo que el bucket no admite', () => {
    expect(validarArchivoDocumento(archivo('plano.dwg'), 'cliente')).toMatch(
      /Formato no permitido/
    )
    expect(validarArchivoDocumento(archivo('foto.webp'), 'cliente')).toMatch(
      /Formato no permitido/
    )
  })

  it('acepta CAD sin MIME en proyectos (Windows no lo informa)', () => {
    expect(validarArchivoDocumento(archivo('plano.dwg'), 'proyecto')).toBeNull()
  })

  it('rechaza archivos vacíos o de más de 50 MB', () => {
    expect(validarArchivoDocumento(archivo('a.pdf', 0), 'cliente')).toMatch(
      /vacío/
    )
    expect(
      validarArchivoDocumento(archivo('a.pdf', 51 * 1024 * 1024), 'cliente')
    ).toMatch(/máximo/)
  })
})

describe('formatosArchivo', () => {
  it('arma el accept del input según el módulo', () => {
    expect(formatosArchivo('cliente').accept).toBe(
      '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx'
    )
    expect(formatosArchivo('vivienda').etiquetas).toContain('CAD')
  })
})
