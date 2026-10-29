import { describe, expect, it } from 'vitest'

import {
  limpiarHtmlPegado,
  tieneFormatoWhatsapp,
  whatsappAHtml,
} from './pegado'

describe('whatsappAHtml', () => {
  it('convierte negrita, cursiva y tachado', () => {
    expect(whatsappAHtml('El banco *aprobó* el _crédito_ ~ayer~')).toBe(
      '<p>El banco <strong>aprobó</strong> el <em>crédito</em> <s>ayer</s></p>'
    )
  })

  it('no toca guiones bajos dentro de referencias ni correos', () => {
    const texto = 'Ref SIB_2023_1980828 y correo juan_perez@banco.com'
    expect(tieneFormatoWhatsapp(texto)).toBe(false)
    expect(whatsappAHtml(texto)).toBe(`<p>${texto}</p>`)
  })

  it('acepta puntuación al cerrar y una sola letra', () => {
    expect(whatsappAHtml('Firmó *hoy*. Casa *A*')).toBe(
      '<p>Firmó <strong>hoy</strong>. Casa <strong>A</strong></p>'
    )
  })

  it('cada línea es un párrafo y se saltan las vacías', () => {
    expect(whatsappAHtml('*Hola*\n\nSegunda línea')).toBe(
      '<p><strong>Hola</strong></p><p>Segunda línea</p>'
    )
  })

  it('escapa el HTML del texto pegado', () => {
    expect(whatsappAHtml('*<b>x</b>*')).toBe(
      '<p><strong>&lt;b&gt;x&lt;/b&gt;</strong></p>'
    )
  })

  it('un asterisco suelto no es formato', () => {
    expect(tieneFormatoWhatsapp('Valor * 2 y 3 * 4')).toBe(false)
  })
})

describe('limpiarHtmlPegado', () => {
  it('quita comentarios de Office, estilos y <o:p>', () => {
    const word =
      '<!--[if gte mso 9]><xml>x</xml><![endif]--><style>p{}</style><p class="MsoNormal">Hola<o:p></o:p></p>'
    expect(limpiarHtmlPegado(word)).toBe('<p class="MsoNormal">Hola</p>')
  })

  it('quita párrafos vacíos repetidos', () => {
    expect(limpiarHtmlPegado('<p>A</p><p>&nbsp;</p><p><br></p><p>B</p>')).toBe(
      '<p>A</p><p>B</p>'
    )
  })
})
