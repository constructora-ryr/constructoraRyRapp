/**
 * Frase en lenguaje natural de lo que pasó, para leer primero en el detalle.
 * Devuelve trozos { texto, fuerte } para resaltar lo importante.
 */

import { formatearValor, nombreCampo } from '../config/presentacion'
import type { EventoAuditoria } from '../types'

import { cambiosVisibles } from './evento'
import { datosReemplazo, type Suceso } from './interpretar'

export interface Trozo {
  texto: string
  fuerte?: boolean
}

type NombreRef = (campo: string, valor: unknown) => string | null

const t = (texto: string, fuerte = false): Trozo => ({ texto, fuerte })
const str = (v: unknown) => (v === null || v === undefined ? '' : String(v))

const ES_DOCUMENTO = (tabla: string) => tabla.startsWith('documentos_')

export function resumenNatural(
  e: EventoAuditoria,
  suceso: Suceso,
  fila: Record<string, unknown> | null,
  nombreRef: NombreRef,
  cliente: string | null
): Trozo[] {
  const f = fila ?? {}
  const aCliente = cliente ? [t(' al cliente '), t(cliente, true)] : []

  if (ES_DOCUMENTO(e.tabla)) {
    const titulo = str(f.titulo) || 'el documento'
    const categoria = nombreRef('categoria_id', f.categoria_id)
    switch (suceso) {
      case 'creado':
        return [
          t('Subió '),
          t(titulo, true),
          ...(categoria ? [t(' como '), t(categoria, true)] : []),
          ...aCliente,
          t('.'),
        ]
      case 'reemplazo': {
        const r = datosReemplazo(e)
        return [
          t('Cambió el archivo '),
          t(r?.archivo_original ?? 'anterior', true),
          t(' por '),
          t(r?.archivo_nuevo ?? 'uno nuevo', true),
          t('.'),
        ]
      }
      case 'papelera':
        return [t('Envió a la papelera '), t(titulo, true), t('.')]
      case 'restaurado':
        return [t('Restauró '), t(titulo, true), t(' desde la papelera.')]
      case 'eliminado':
        return [t('Eliminó '), t(titulo, true), t('.')]
    }
  }

  if (e.tabla === 'abonos_historial') {
    const monto = formatearValor('monto', f.monto)
    if (suceso === 'creado')
      return [
        t('Registró un abono de '),
        t(monto, true),
        ...(f.metodo_pago ? [t(' por '), t(str(f.metodo_pago), true)] : []),
        ...(f.fecha_abono
          ? [
              t(' con fecha '),
              t(formatearValor('fecha_abono', f.fecha_abono), true),
            ]
          : []),
        t('.'),
      ]
    if (suceso === 'anulado')
      return [
        t('Anuló el abono '),
        t(str(f.numero_recibo), true),
        t(' de '),
        t(monto, true),
        ...(f.motivo_categoria
          ? [t('. Motivo: '), t(str(f.motivo_categoria), true)]
          : []),
        t('.'),
      ]
  }

  if (e.accion === 'EDITAR') {
    const cambios = cambiosVisibles(e)
    if (cambios.length === 1) {
      const [campo, c] = cambios[0]
      const valor = (v: unknown) =>
        nombreRef(campo, v) ?? formatearValor(campo, v)
      return [
        t('Cambió '),
        t(nombreCampo(campo).toLowerCase(), true),
        t(' de '),
        t(valor(c.antes), true),
        t(' a '),
        t(valor(c.despues), true),
        t('.'),
      ]
    }
    if (cambios.length > 1) {
      const nombres = cambios.map(([campo]) => nombreCampo(campo).toLowerCase())
      const lista =
        nombres.length > 3
          ? `${nombres.slice(0, 3).join(', ')} y ${nombres.length - 3} más`
          : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
      return [t(`Cambió ${cambios.length} datos: `), t(lista, true), t('.')]
    }
  }

  return []
}

const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/** "hace 5 minutos", "ayer", "hace 3 días" */
export function haceCuanto(iso: string): string {
  const seg = (new Date(iso).getTime() - Date.now()) / 1000
  const pasos: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unidad, s] of pasos)
    if (Math.abs(seg) >= s) return relativo.format(Math.round(seg / s), unidad)
  return 'hace un momento'
}
