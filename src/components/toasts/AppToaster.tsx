'use client'

/**
 * Sistema de toasts de la app (sonner en modo `unstyled` + Tailwind).
 * Se usa igual que siempre: `toast.success('Título', { description })`,
 * `toast.error(...)`, etc. La base visual está en toast-estilos.tsx.
 */

import { Toaster } from 'sonner'

import { ICONOS_TOAST, TARJETA_TOAST } from './toast-estilos'

export function AppToaster() {
  return (
    <Toaster
      position='bottom-right'
      duration={4000}
      gap={10}
      visibleToasts={4}
      closeButton
      icons={ICONOS_TOAST}
      toastOptions={{
        unstyled: true,
        classNames: {
          ...TARJETA_TOAST,
          // relative + tamaño: el spinner de carga de sonner (.sonner-loader)
          // va en absoluto centrado; sin esto se centra sobre todo el toast
          icon: 'relative h-10 w-10 flex-shrink-0',
          content: 'flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5',
          title:
            'text-sm font-semibold leading-snug text-slate-900 dark:text-white',
          description:
            'text-xs leading-relaxed text-slate-600 dark:text-slate-300',
          closeButton:
            'absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 opacity-60 transition-all hover:bg-slate-900/5 hover:text-slate-700 hover:opacity-100 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-slate-200 [&>svg]:h-3.5 [&>svg]:w-3.5',
          actionButton:
            'ml-1 flex-shrink-0 self-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
          cancelButton:
            'flex-shrink-0 self-center rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
        },
      }}
    />
  )
}
