import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Globe,
  Heart,
  Mail,
  MessageCircle,
  Phone,
  Share2,
  User,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

/** Color e ícono por estado del interés (clave = cliente_intereses.estado) */
export const INTERES_ESTADO_VISUAL: Record<
  string,
  {
    label: string
    icon: LucideIcon
    badge: string
    gradient: string
    text: string
    selected: string
  }
> = {
  Activo: {
    label: 'Activo',
    icon: Heart,
    badge:
      'bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-500/10 dark:text-pink-300 dark:ring-pink-400/20',
    gradient: 'from-pink-500 to-rose-600',
    text: 'text-pink-600 dark:text-pink-400',
    selected:
      'border-pink-400 bg-pink-50/80 ring-2 ring-pink-400/40 dark:border-pink-500/60 dark:bg-pink-500/10',
  },
  Convertido: {
    label: 'Convertido',
    icon: CheckCircle2,
    badge:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
    gradient: 'from-emerald-500 to-green-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    selected:
      'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-400/40 dark:border-emerald-500/60 dark:bg-emerald-500/10',
  },
  Descartado: {
    label: 'Descartado',
    icon: XCircle,
    badge:
      'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20',
    gradient: 'from-slate-500 to-slate-700',
    text: 'text-slate-600 dark:text-slate-300',
    selected:
      'border-slate-400 bg-slate-100/80 ring-2 ring-slate-400/40 dark:border-slate-500/60 dark:bg-slate-500/10',
  },
}

/** Ícono por origen del contacto (clave = cliente_intereses.origen) */
export const ICONO_ORIGEN: Record<string, LucideIcon> = {
  'Visita Presencial': User,
  'Llamada Telefónica': Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
  'Redes Sociales': Share2,
  Referido: Users,
  'Sitio Web': Globe,
  Otro: AlertCircle,
}

export const ICONO_PROYECTO = Building2
