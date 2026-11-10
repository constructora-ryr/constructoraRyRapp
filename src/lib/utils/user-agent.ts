/**
 * User-Agent → datos legibles para mostrar una sesión: "Windows 11/10",
 * "Chrome 157", y el tipo de equipo para elegir el ícono.
 */

export type TipoEquipo = 'celular' | 'tableta' | 'computador'

export interface EquipoLegible {
  sistema: string
  navegador: string
  tipo: TipoEquipo
}

function navegadorDe(ua: string): string {
  const version = (re: RegExp) => ua.match(re)?.[1]
  if (/Edg(e|A|iOS)?\//.test(ua)) {
    const v = version(/Edg(?:e|A|iOS)?\/(\d+)/)
    return `Edge${v ? ` ${v}` : ''}`
  }
  if (/OPR\//.test(ua)) return 'Opera'
  if (/SamsungBrowser\//.test(ua)) return 'Samsung Internet'
  if (/CriOS\//.test(ua)) return 'Chrome'
  if (/FxiOS\//.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua)) {
    const v = version(/Chrome\/(\d+)/)
    return `Chrome${v ? ` ${v}` : ''}`
  }
  if (/Firefox\//.test(ua)) {
    const v = version(/Firefox\/(\d+)/)
    return `Firefox${v ? ` ${v}` : ''}`
  }
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Navegador desconocido'
}

function sistemaDe(ua: string): { sistema: string; tipo: TipoEquipo } {
  if (/iPhone/.test(ua)) return { sistema: 'iPhone', tipo: 'celular' }
  if (/iPad/.test(ua)) return { sistema: 'iPad', tipo: 'tableta' }
  if (/Android/.test(ua))
    return {
      sistema: 'Android',
      tipo: /Mobile/.test(ua) ? 'celular' : 'tableta',
    }
  if (/Windows NT 10/.test(ua))
    return { sistema: 'Windows 11/10', tipo: 'computador' }
  if (/Windows NT/.test(ua)) return { sistema: 'Windows', tipo: 'computador' }
  if (/Macintosh/.test(ua)) return { sistema: 'macOS', tipo: 'computador' }
  if (/CrOS/.test(ua)) return { sistema: 'ChromeOS', tipo: 'computador' }
  if (/Linux/.test(ua)) return { sistema: 'Linux', tipo: 'computador' }
  return { sistema: 'Equipo desconocido', tipo: 'computador' }
}

export function leerUserAgent(ua: string | null | undefined): EquipoLegible {
  const texto = ua ?? ''
  return { ...sistemaDe(texto), navegador: navegadorDe(texto) }
}
