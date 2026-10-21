/**
 * Base visual única de los toasts: recuadro del ícono con degradado y
 * tarjeta por tipo (franja superior + fondo suave). La usan AppToaster y los
 * toasts con ícono propio de custom-toasts.
 */

import type { ReactNode } from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/shared/utils/helpers'

export type TipoToast = 'success' | 'error' | 'warning' | 'info' | 'loading'

const GRADIENTE: Record<TipoToast, string> = {
  success: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
  error: 'from-rose-500 to-red-600 shadow-rose-500/30',
  warning: 'from-amber-400 to-orange-500 shadow-amber-500/30',
  info: 'from-sky-500 to-indigo-500 shadow-sky-500/30',
  loading: 'from-slate-500 to-slate-700 shadow-slate-500/30',
}

const ICONO_POR_TIPO: Record<TipoToast, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
}

/** Recuadro del ícono. `icon` reemplaza el del tipo (p.ej. LogIn) */
export function IconoToast({
  tipo,
  icon,
}: {
  tipo: TipoToast
  icon?: LucideIcon
}) {
  const Icon = icon ?? ICONO_POR_TIPO[tipo]
  return (
    <span
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
        GRADIENTE[tipo]
      )}
    >
      <Icon
        className={cn('h-5 w-5', tipo === 'loading' && 'animate-spin')}
        strokeWidth={2.25}
      />
    </span>
  )
}

export const ICONOS_TOAST: Record<TipoToast, ReactNode> = {
  success: <IconoToast tipo='success' />,
  error: <IconoToast tipo='error' />,
  warning: <IconoToast tipo='warning' />,
  info: <IconoToast tipo='info' />,
  loading: <IconoToast tipo='loading' />,
}

// Tarjeta base. Va en cada tipo y no en `classNames.toast`, que sonner
// también aplica a los toast.custom() (que traen su propio contenedor)
const tarjeta =
  'group flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 pr-10 shadow-xl shadow-slate-900/10 dark:border-slate-700/70 dark:bg-slate-900 dark:shadow-black/40 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r'

export const TARJETA_TOAST: Record<TipoToast, string> = {
  success: cn(
    tarjeta,
    'bg-gradient-to-br from-emerald-50 via-white to-white before:from-emerald-500 before:to-teal-400 dark:from-emerald-500/15 dark:via-slate-900 dark:to-slate-900'
  ),
  error: cn(
    tarjeta,
    'bg-gradient-to-br from-rose-50 via-white to-white before:from-rose-500 before:to-red-500 dark:from-rose-500/15 dark:via-slate-900 dark:to-slate-900'
  ),
  warning: cn(
    tarjeta,
    'bg-gradient-to-br from-amber-50 via-white to-white before:from-amber-400 before:to-orange-500 dark:from-amber-500/15 dark:via-slate-900 dark:to-slate-900'
  ),
  info: cn(
    tarjeta,
    'bg-gradient-to-br from-sky-50 via-white to-white before:from-sky-500 before:to-indigo-500 dark:from-sky-500/15 dark:via-slate-900 dark:to-slate-900'
  ),
  loading: cn(tarjeta, 'before:from-slate-400 before:to-slate-500'),
}
