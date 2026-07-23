/**
 * AccionBadge - Badge visual para tipo de acción de auditoría
 *
 * ✅ Componente presentacional puro
 * ✅ < 50 líneas
 * ✅ Sin lógica
 */

import { CheckCircle2, Edit3, Trash2, XCircle } from 'lucide-react'

interface AccionBadgeProps {
  accion: string
}

export function AccionBadge({ accion }: AccionBadgeProps) {
  const badges = {
    CREATE: {
      icon: CheckCircle2,
      className: `
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        bg-gradient-to-r from-green-500/20 to-emerald-500/20
        dark:from-green-500/20 dark:to-emerald-500/20
        border border-green-500/30
        text-green-700 dark:text-green-400
        font-bold shadow-md text-xs
      `.trim(),
      label: 'Creación',
    },
    UPDATE: {
      icon: Edit3,
      className: `
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        bg-gradient-to-r from-blue-500/20 to-indigo-500/20
        dark:from-blue-500/20 dark:to-indigo-500/20
        border border-blue-500/30
        text-blue-700 dark:text-blue-400
        font-bold shadow-md text-xs
      `.trim(),
      label: 'Actualización',
    },
    DELETE: {
      icon: Trash2,
      className: `
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        bg-gradient-to-r from-red-500/20 to-rose-500/20
        dark:from-red-500/20 dark:to-rose-500/20
        border border-red-500/30
        text-red-700 dark:text-red-400
        font-bold shadow-md text-xs
      `.trim(),
      label: 'Eliminación',
    },
    ANULAR: {
      icon: XCircle,
      className: `
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        bg-gradient-to-r from-orange-500/20 to-red-500/20
        dark:from-orange-500/20 dark:to-red-500/20
        border border-orange-500/30
        text-orange-700 dark:text-orange-400
        font-bold shadow-md text-xs
      `.trim(),
      label: 'Anulación',
    },
  }

  const badge = badges[accion as keyof typeof badges]

  if (!badge) {
    return (
      <span className='rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
        {accion}
      </span>
    )
  }

  const Icon = badge.icon

  return (
    <span className={badge.className}>
      <Icon className='h-3.5 w-3.5' />
      {badge.label}
    </span>
  )
}
