/**
 * Reglas de negocio para el cierre financiero — LÓGICA PURA.
 *
 * Sin React, sin Supabase. Recibe datos, devuelve restricciones y mensajes.
 * Testeable con datos simples.
 */

import {
  esCreditoConstructora,
  esCuotaInicial,
} from '@/shared/constants/fuentes-pago.constants'
import { formatCurrency } from '@/shared/utils/format'

// ─── Types ─────────────────────────────────────────────────

export interface DatosFuenteParaReglas {
  id: string
  tipo: string
  monto_aprobado: number
  capital_para_cierre: number | null
  monto_recibido: number
  /** true si el crédito constructora ya tiene plan de cuotas */
  tienePlanCuotas?: boolean
  /** Fuente de verdad desde BD: false = desembolso único y exacto (CH, subsidios, tipos custom) */
  permite_multiples_abonos?: boolean
}

export interface RestriccionesFuente {
  // Permisos
  puedeEliminar: boolean
  puedeEditarMonto: boolean
  puedeEditarEntidad: boolean

  // Límites
  montoMinimo: number

  // Mensajes para UI
  razonBloqueoEliminar: string | null
  razonBloqueoMonto: string | null
  razonBloqueoEntidad: string | null
  advertencias: string[]

  // Estado visual
  esCompletada: boolean
  tieneAbonos: boolean
  esCreditoConPlan: boolean

  /** Valor que debe usarse para la ecuación de balance */
  montoParaCierre: number
}

// ─── Cálculo de restricciones por fuente ───────────────────

export function calcularRestriccionesFuente(
  fuente: DatosFuenteParaReglas
): RestriccionesFuente {
  const tieneAbonos = fuente.monto_recibido > 0
  const esCredito = esCreditoConstructora(fuente.tipo)

  // Fuentes de desembolso único: si recibieron cualquier monto, el desembolso ya ocurrió
  // por el total (el banco/gobierno gira exactamente el monto aprobado en un solo evento).
  // Fuente de verdad: permite_multiples_abonos de BD cuando está disponible;
  // fallback por código de tipo para compatibilidad con callers sin ese campo.
  const esDesembolsoUnicoTipo =
    fuente.permite_multiples_abonos !== undefined
      ? fuente.permite_multiples_abonos === false && !esCredito
      : !esCuotaInicial(fuente.tipo) && !esCredito
  const esCompletada =
    (fuente.monto_recibido >= fuente.monto_aprobado &&
      fuente.monto_aprobado > 0) ||
    (esDesembolsoUnicoTipo && tieneAbonos)
  const esCreditoConPlan = esCredito && (fuente.tienePlanCuotas ?? false)

  // Valor para el balance: capital_para_cierre para créditos, monto_aprobado para el resto
  const montoParaCierre = fuente.capital_para_cierre ?? fuente.monto_aprobado

  // ── COMPLETADA (100% desembolsada) → todo bloqueado ──
  if (esCompletada) {
    return {
      puedeEliminar: false,
      puedeEditarMonto: false,
      puedeEditarEntidad: false,
      montoMinimo: fuente.monto_aprobado,
      razonBloqueoEliminar: 'Fuente completamente desembolsada',
      razonBloqueoMonto: null,
      razonBloqueoEntidad: null,
      advertencias: [],
      esCompletada: true,
      tieneAbonos: true,
      esCreditoConPlan,
      montoParaCierre,
    }
  }

  // ── CON ABONOS (parcial) ──
  if (tieneAbonos) {
    const recibidoStr = formatCurrency(fuente.monto_recibido)

    // Crédito con plan y abonos → monto solo editable vía reestructurar
    if (esCreditoConPlan) {
      return {
        puedeEliminar: false,
        puedeEditarMonto: false,
        puedeEditarEntidad: false,
        montoMinimo: fuente.monto_recibido,
        razonBloqueoEliminar: `Ya recibió ${recibidoStr} en abonos`,
        razonBloqueoMonto:
          'Para modificar el crédito, usa "Reestructurar" desde el plan de cuotas',
        razonBloqueoEntidad: null,
        advertencias: [],
        esCompletada: false,
        tieneAbonos: true,
        esCreditoConPlan: true,
        montoParaCierre,
      }
    }

    return {
      puedeEliminar: false,
      puedeEditarMonto: true,
      puedeEditarEntidad: false,
      montoMinimo: fuente.monto_recibido,
      razonBloqueoEliminar: `Ya recibió ${recibidoStr} en abonos`,
      razonBloqueoMonto: null,
      razonBloqueoEntidad: `No se puede cambiar la entidad después del desembolso (${recibidoStr} recibido)`,
      advertencias: [`Mínimo: ${recibidoStr} (ya recibido)`],
      esCompletada: false,
      tieneAbonos: true,
      esCreditoConPlan,
      montoParaCierre,
    }
  }

  // ── SIN ABONOS → todo permitido ──
  const advertencias: string[] = []

  if (esCreditoConPlan) {
    advertencias.push('Se eliminará el plan de cuotas configurado')
  }

  if (esCredito && !esCreditoConPlan) {
    advertencias.push('El plan de cuotas se configura después de guardar')
  }

  return {
    puedeEliminar: true,
    puedeEditarMonto: true,
    puedeEditarEntidad: true,
    montoMinimo: 0,
    razonBloqueoEliminar: null,
    razonBloqueoMonto: null,
    razonBloqueoEntidad: null,
    advertencias,
    esCompletada: false,
    tieneAbonos: false,
    esCreditoConPlan,
    montoParaCierre,
  }
}

// ─── Validación global de rebalanceo ───────────────────────

export interface ErrorRebalanceo {
  campo: string
  mensaje: string
}

export function validarRebalanceo(
  ajustes: {
    id: string
    montoEditable: number
    paraEliminar: boolean
    restricciones: RestriccionesFuente
  }[],
  valorVivienda: number,
  subtotal: number
): ErrorRebalanceo[] {
  const errores: ErrorRebalanceo[] = []

  // Balance
  const diferencia = valorVivienda - subtotal
  if (Math.abs(diferencia) >= 1) {
    errores.push({
      campo: 'balance',
      mensaje:
        diferencia > 0
          ? `Faltan ${formatCurrency(diferencia)} para cubrir el valor de la vivienda`
          : `Excedente de ${formatCurrency(Math.abs(diferencia))} sobre el valor de la vivienda`,
    })
  }

  // Montos mínimos
  for (const a of ajustes) {
    if (a.paraEliminar) continue
    if (a.montoEditable < a.restricciones.montoMinimo) {
      errores.push({
        campo: a.id,
        mensaje: `El monto no puede ser menor a ${formatCurrency(a.restricciones.montoMinimo)} (ya recibido)`,
      })
    }
  }

  return errores
}
