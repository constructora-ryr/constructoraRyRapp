/**
 * Ícono de cada tipo de fuente de pago: `tipos_fuentes_pago.icono` guarda el
 * nombre del ícono de lucide (lo elige el admin en /admin/configuracion).
 */

import {
  BadgeDollarSign,
  Banknote,
  Building2,
  CreditCard,
  DollarSign,
  Gift,
  HandCoins,
  Home,
  KeyRound,
  Landmark,
  Shield,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

const ICONOS_FUENTE: Record<string, LucideIcon> = {
  BadgeDollarSign,
  Banknote,
  Building2,
  CreditCard,
  DollarSign,
  Gift,
  HandCoins,
  Home,
  KeyRound,
  Landmark,
  Shield,
  Wallet,
}

export function iconoFuente(nombre?: string | null): LucideIcon {
  return (nombre && ICONOS_FUENTE[nombre]) || Wallet
}
