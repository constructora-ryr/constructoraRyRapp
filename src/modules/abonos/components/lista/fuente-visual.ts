/**
 * Identidad visual de un abono, compartida por la tabla del listado y el
 * visor de detalle: color e ícono de la fuente, del método de pago y el
 * avatar del cliente.
 */

import {
  Banknote,
  Building2,
  CreditCard,
  FileCheck,
  Gift,
  HandCoins,
  KeyRound,
  Landmark,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { getColorScheme } from '../modal-registro-pago/ModalRegistroPago.styles'

// ── Fuente de pago ───────────────────────────────────────────────────────────
export interface FuenteVisual {
  icon: LucideIcon
  /** Degradado del cuadro del ícono (bg-gradient-to-br + estas clases) */
  gradient: string
  /** Color sólido para segmentos de barra y puntos */
  solid: string
  /** Color del texto de acento (entidad, leyenda) */
  text: string
}

const ICONO_FUENTE: Record<string, LucideIcon> = {
  'Cuota Inicial': Wallet,
  'Crédito Hipotecario': Landmark,
  'Subsidio Mi Casa Ya': Gift,
  'Subsidio Caja Compensación': Gift,
  'Crédito con la Constructora': HandCoins,
  Leasing: KeyRound,
}

/**
 * En el esquema del modal, Crédito con la Constructora comparte el violeta de
 * Mi Casa Ya; en el listado van lado a lado en la barra, así que aquí se
 * distingue en ámbar.
 */
const OVERRIDES: Record<string, Omit<FuenteVisual, 'icon'>> = {
  'Crédito con la Constructora': {
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    solid: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
}

export function fuenteVisual(tipo: string): FuenteVisual {
  const esquema = getColorScheme(tipo)
  const colores = OVERRIDES[tipo] ?? {
    gradient: esquema.gradient,
    solid: esquema.metodoBg,
    text: esquema.textAccent,
  }
  return { icon: ICONO_FUENTE[tipo] ?? Wallet, ...colores }
}

// ── Método de pago ───────────────────────────────────────────────────────────
const METODO_VISUAL: { clave: string; icon: LucideIcon; cls: string }[] = [
  {
    clave: 'transfer',
    icon: Landmark,
    cls: 'bg-blue-50 text-blue-600 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  },
  {
    clave: 'efectivo',
    icon: Banknote,
    cls: 'bg-emerald-50 text-emerald-600 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  },
  {
    clave: 'cheque',
    icon: FileCheck,
    cls: 'bg-amber-50 text-amber-600 ring-amber-600/25 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  },
  {
    clave: 'consignaci',
    icon: Building2,
    cls: 'bg-cyan-50 text-cyan-600 ring-cyan-600/20 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-400/20',
  },
]
const METODO_OTRO = {
  icon: CreditCard,
  cls: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20',
}

/** Ícono y clases (fondo + texto + anillo) del método de pago */
export const metodoVisual = (metodo: string) =>
  METODO_VISUAL.find(m => metodo.toLowerCase().includes(m.clave)) ?? METODO_OTRO

// ── Cliente ──────────────────────────────────────────────────────────────────
// Color estable por cliente: sus filas seguidas se reconocen de un vistazo
const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-400 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
  'from-indigo-500 to-violet-600',
  'from-lime-500 to-green-600',
]

export function avatarGradient(clienteId: string) {
  let h = 0
  for (let i = 0; i < clienteId.length; i++)
    h = (h * 31 + clienteId.charCodeAt(i)) | 0
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length]
}

export const inicialesCliente = (c: { nombres: string; apellidos: string }) =>
  `${c.nombres.trim()[0] ?? ''}${c.apellidos.trim()[0] ?? ''}`.toUpperCase()
