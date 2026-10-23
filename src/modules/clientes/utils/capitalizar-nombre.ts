/**
 * Nombres propios con mayúscula inicial: "juan  PÉREZ de la cruz" →
 * "Juan Pérez de la Cruz". Las partículas (de, del, la…) van en minúscula
 * salvo al inicio.
 */

const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e'])

export function capitalizarNombre(texto: string): string {
  return texto
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es')
    .split(' ')
    .map((palabra, i) =>
      i > 0 && PARTICULAS.has(palabra)
        ? palabra
        : palabra.replace(
            /(^|[-'])(\p{L})/gu,
            (_, sep: string, letra: string) =>
              sep + letra.toLocaleUpperCase('es')
          )
    )
    .join(' ')
}
