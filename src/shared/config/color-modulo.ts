/**
 * Color de cada módulo en los encabezados de página.
 *
 * - `icono`: el mismo degradado del ícono del módulo en la barra lateral
 *   (navigation.config), para que la página y el menú se reconozcan.
 * - `boton`: color plano para la acción principal (un degradado entre dos
 *   tonos oscuros se veía turbio en un botón). Con texto blanco llega a
 *   4.5:1 o más; los tonos claros del menú (naranja, ámbar, cian) no
 *   llegan, por eso se usa el tono del módulo que sí.
 */

import { navigationGroups } from './navigation.config'

export interface ColorModulo {
  icono: string
  boton: string
}

// Contraste con texto blanco entre paréntesis
const BOTON: Record<string, string> = {
  '/clientes': 'bg-blue-600 hover:bg-blue-700', // 5.2:1
  '/viviendas': 'bg-orange-700 hover:bg-orange-800', // 5.2:1
  '/proyectos': 'bg-emerald-700 hover:bg-emerald-800', // 5.5:1
  '/abonos': 'bg-violet-600 hover:bg-violet-700', // 5.7:1
  '/renuncias': 'bg-rose-600 hover:bg-rose-700', // 4.7:1
  '/usuarios': 'bg-indigo-600 hover:bg-indigo-700', // 6.3:1
  '/auditorias': 'bg-teal-700 hover:bg-teal-800', // 5.5:1
  '/reportes': 'bg-sky-700 hover:bg-sky-800', // 5.9:1
  '/admin': 'bg-slate-800 hover:bg-slate-900',
}

const NEUTRO: ColorModulo = {
  icono: 'from-slate-600 to-slate-800',
  boton: 'bg-slate-800 hover:bg-slate-900',
}

/** Color del módulo según su ruta en el menú ('/clientes', '/abonos'…) */
export function colorModulo(ruta: string | undefined): ColorModulo {
  if (!ruta) return NEUTRO
  const item = navigationGroups.flatMap(g => g.items).find(i => i.href === ruta)
  return {
    icono: item?.color ?? NEUTRO.icono,
    boton: BOTON[ruta] ?? NEUTRO.boton,
  }
}
