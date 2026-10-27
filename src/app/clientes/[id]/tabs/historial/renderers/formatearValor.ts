/**
 * Utilidades compartidas por todos los renderers del historial
 */

import { formatearDiaGuardado } from '@/lib/utils/date.utils'

export function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  if (typeof valor === 'number') {
    if (valor > 1000 || valor < -1000) {
      return `$${valor.toLocaleString('es-CO')}`
    }
    return String(valor)
  }
  if (typeof valor === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return formatearDiaGuardado(valor)
    return valor
  }
  if (typeof valor === 'object') {
    return JSON.stringify(valor)
  }
  return String(valor)
}

export function esCampoMoneda(campo: string): boolean {
  return (
    campo.includes('valor') ||
    campo.includes('monto') ||
    campo.includes('precio') ||
    campo.includes('ingresos') ||
    campo.includes('presupuesto') ||
    campo.includes('descuento') ||
    campo.includes('saldo') ||
    campo.includes('escritura')
  )
}

export function formatearMoneda(valor: unknown): string {
  const n = Number(valor)
  if (isNaN(n)) return '—'
  return `$${n.toLocaleString('es-CO')}`
}
