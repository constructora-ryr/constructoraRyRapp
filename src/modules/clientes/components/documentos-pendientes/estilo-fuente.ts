/**
 * Ícono y degradado de cada fuente de pago en los avisos y modales de
 * documentos pendientes. "Compartido" = documentación final del cliente
 * (boleta de registro), que no pertenece a una fuente.
 */

import type { LucideIcon } from 'lucide-react'
import { FileText, Gift, Home, Landmark, Stamp } from 'lucide-react'

import {
  esCreditoHipotecario,
  esSubsidioCajaCompensacion,
  esSubsidioMiCasaYa,
} from '@/shared/constants/fuentes-pago.constants'

export const TIPO_COMPARTIDO = 'Compartido'

export interface EstiloFuente {
  icon: LucideIcon
  /** Degradado + sombra para el ícono */
  degradado: string
}

const ESTILOS: Record<
  'credito' | 'caja' | 'miCasaYa' | 'final' | 'otra',
  EstiloFuente
> = {
  credito: {
    icon: Landmark,
    degradado: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
  },
  caja: {
    icon: Gift,
    degradado: 'from-violet-500 to-fuchsia-600 shadow-violet-500/30',
  },
  miCasaYa: {
    icon: Home,
    degradado: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
  },
  final: {
    icon: Stamp,
    degradado: 'from-cyan-500 to-sky-600 shadow-cyan-500/30',
  },
  otra: {
    icon: FileText,
    degradado: 'from-slate-500 to-slate-600 shadow-slate-500/30',
  },
}

export function estiloDeFuente(tipo: string): EstiloFuente {
  if (tipo === TIPO_COMPARTIDO) return ESTILOS.final
  if (esCreditoHipotecario(tipo)) return ESTILOS.credito
  if (esSubsidioCajaCompensacion(tipo)) return ESTILOS.caja
  if (esSubsidioMiCasaYa(tipo)) return ESTILOS.miCasaYa
  return ESTILOS.otra
}
