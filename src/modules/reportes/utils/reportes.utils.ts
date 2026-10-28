import { formatDateCompact } from '@/lib/utils/date.utils'

import type {
  CategoriaFinanciacion,
  ClienteEnEntidad,
  EntidadFinancieraResumen,
  EstadoDesembolso,
  TipoEntidadFinanciera,
} from '../types'

export function categoriaDe(
  tipo: TipoEntidadFinanciera
): CategoriaFinanciacion {
  return tipo === 'Caja de Compensación' ||
    tipo === 'Cooperativa' ||
    tipo === 'Gobierno'
    ? 'subsidios'
    : 'creditos'
}

/** Nombre del tipo para mostrar (Mi Casa Ya se guarda como "Gobierno") */
export function etiquetaTipo(tipo: TipoEntidadFinanciera): string {
  return tipo === 'Gobierno' ? 'Subsidio nacional' : tipo
}

/** Textos que cambian entre créditos y subsidios */
export const TEXTOS_CATEGORIA: Record<
  CategoriaFinanciacion,
  { valor: string; referencia: string }
> = {
  creditos: { valor: 'Crédito', referencia: 'Referencia' },
  subsidios: { valor: 'Subsidio', referencia: 'Acta' },
}

export function estadoDesembolso(
  aprobado: number,
  recibido: number
): EstadoDesembolso {
  if (recibido <= 0) return 'pendiente'
  return recibido >= aprobado ? 'desembolsado' : 'parcial'
}

/** % girado (0-100) */
export function avance(aprobado: number, recibido: number): number {
  return aprobado > 0 ? Math.min(100, (recibido / aprobado) * 100) : 0
}

/** "340 del 12 jun 2025" (subsidio) o la referencia del crédito */
export function textoReferencia(
  c: Pick<ClienteEnEntidad, 'numeroReferencia' | 'fechaActa'>,
  categoria: CategoriaFinanciacion
): string {
  if (categoria === 'creditos') return c.numeroReferencia ?? ''
  const fecha = c.fechaActa ? formatDateCompact(c.fechaActa) : ''
  return [c.numeroReferencia, fecha].filter(Boolean).join(' del ')
}

// ── Exportación a CSV ───────────────────────────────────────────────────────

const ESTADO_TEXTO: Record<EstadoDesembolso, string> = {
  desembolsado: 'Desembolsado',
  parcial: 'Parcial',
  pendiente: 'Pendiente',
}

function celda(valor: string | number): string {
  const texto = String(valor)
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

/**
 * Descarga las fuentes de las entidades como CSV. Separador ";" y BOM para
 * que Excel en español lo abra con columnas y tildes correctas.
 */
export function exportarCSV(
  entidades: EntidadFinancieraResumen[],
  nombreArchivo: string
): void {
  const encabezados = [
    'Entidad',
    'Tipo',
    'Vivienda',
    'Cliente',
    'Tipo doc.',
    'Documento',
    'Fuente',
    'Valor aprobado',
    'Desembolsado',
    'Pendiente',
    'Estado',
    'Referencia / acta',
    'Primer desembolso',
  ]
  const filas = entidades.flatMap(e =>
    e.clientes.map(c => [
      e.nombre,
      etiquetaTipo(e.tipo),
      c.viviendaLabel ?? '',
      c.clienteNombre,
      c.clienteTipoDocumento,
      c.clienteDocumento,
      c.tipoFuente,
      c.montoAprobado,
      c.montoRecibido,
      c.saldoPendiente,
      ESTADO_TEXTO[c.estadoDesembolso],
      textoReferencia(c, e.categoria),
      c.fechaDesembolso ? formatDateCompact(c.fechaDesembolso) : '',
    ])
  )
  const csv = [encabezados, ...filas]
    .map(fila => fila.map(celda).join(';'))
    .join('\r\n')

  const url = URL.createObjectURL(
    new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  )
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${nombreArchivo}.csv`
  enlace.click()
  URL.revokeObjectURL(url)
}

/** "financiacion-bancolombia-2026-10-28" */
export function nombreArchivo(...partes: string[]): string {
  const hoy = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Bogota',
  })
  return [...partes, hoy]
    .join('-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
}
