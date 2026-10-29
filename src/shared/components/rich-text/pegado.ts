/**
 * Limpieza de lo que se pega en el editor de notas.
 *
 * - Word / Outlook: traen comentarios condicionales, estilos, etiquetas
 *   <o:p> y párrafos vacíos de relleno. El editor ya ignora fuentes y
 *   colores (no los soporta), pero esos restos dejaban huecos.
 * - WhatsApp: al copiar un mensaje llega texto plano con *negrita*,
 *   _cursiva_ y ~tachado~. Se convierten al formato del editor.
 */

/** Quita el ruido de Word/Outlook y los párrafos vacíos repetidos */
export function limpiarHtmlPegado(html: string): string {
  return (
    html
      // Comentarios, incluidos los condicionales de Office (<!--[if gte mso 9]>)
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<\/?o:p>/gi, '')
      // Dos o más párrafos vacíos seguidos → ninguno
      .replace(/(<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*){2,}/gi, '')
  )
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Marcador de WhatsApp: abre tras inicio, espacio o puntuación y cierra
 * antes de fin, espacio o puntuación. Así "SIB_2023_1980828" o
 * "nombre_apellido@correo.com" no se vuelven cursiva.
 */
function marcador(simbolo: string): RegExp {
  const s = `\\${simbolo}`
  return new RegExp(
    `(^|[\\s(¡¿"'])${s}([^${s}\\s](?:[^${s}\\n]*?[^${s}\\s])?)${s}(?=$|[\\s.,;:!?)"'])`,
    'g'
  )
}

const NEGRITA = marcador('*')
const CURSIVA = marcador('_')
const TACHADO = marcador('~')

/** ¿El texto trae formato de WhatsApp? */
export function tieneFormatoWhatsapp(texto: string): boolean {
  return [NEGRITA, CURSIVA, TACHADO].some(re => {
    re.lastIndex = 0
    return re.test(texto)
  })
}

/** Texto de WhatsApp → HTML del editor: una línea, un párrafo */
export function whatsappAHtml(texto: string): string {
  return texto
    .split(/\r?\n/)
    .filter(linea => linea.trim() !== '')
    .map(linea => {
      const html = escaparHtml(linea)
        .replace(NEGRITA, '$1<strong>$2</strong>')
        .replace(CURSIVA, '$1<em>$2</em>')
        .replace(TACHADO, '$1<s>$2</s>')
      return `<p>${html}</p>`
    })
    .join('')
}
