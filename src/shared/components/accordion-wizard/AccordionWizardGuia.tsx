/**
 * Guía del paso activo: tarjeta suave con el color del módulo, ícono de
 * bombilla y las indicaciones. La primera línea de `texto` es la indicación
 * principal; las siguientes (separadas por \n) se muestran como consejos.
 */

'use client'

import { Lightbulb } from 'lucide-react'

import { cn } from '@/lib/utils'
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

// Strings completos por módulo (Tailwind JIT no ve clases interpoladas)
const FONDO: Record<string, string> = {
  proyectos:
    'border-green-200/70 from-green-50 to-emerald-50/40 dark:border-green-800/40 dark:from-green-950/40 dark:to-emerald-950/10',
  viviendas:
    'border-orange-200/70 from-orange-50 to-amber-50/40 dark:border-orange-800/40 dark:from-orange-950/40 dark:to-amber-950/10',
  clientes:
    'border-cyan-200/70 from-cyan-50 to-blue-50/40 dark:border-cyan-800/40 dark:from-cyan-950/40 dark:to-blue-950/10',
  negociaciones:
    'border-pink-200/70 from-pink-50 to-purple-50/40 dark:border-pink-800/40 dark:from-pink-950/40 dark:to-purple-950/10',
  abonos:
    'border-blue-200/70 from-blue-50 to-indigo-50/40 dark:border-blue-800/40 dark:from-blue-950/40 dark:to-indigo-950/10',
  documentos:
    'border-red-200/70 from-red-50 to-rose-50/40 dark:border-red-800/40 dark:from-red-950/40 dark:to-rose-950/10',
  auditorias:
    'border-blue-200/70 from-blue-50 to-indigo-50/40 dark:border-blue-800/40 dark:from-blue-950/40 dark:to-indigo-950/10',
}

const VINETA: Record<string, string> = {
  proyectos: 'bg-green-500',
  viviendas: 'bg-orange-500',
  clientes: 'bg-cyan-500',
  negociaciones: 'bg-pink-500',
  abonos: 'bg-blue-500',
  documentos: 'bg-red-500',
  auditorias: 'bg-blue-500',
}

export function AccordionWizardGuia({
  texto,
  moduleName,
}: {
  texto: string
  moduleName: ModuleName
}) {
  const [principal, ...consejos] = texto.split('\n').filter(Boolean)
  const degradado = moduleThemes[moduleName].classes.gradient.primary

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border bg-gradient-to-br p-3',
        FONDO[moduleName] ?? FONDO.proyectos
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
          degradado
        )}
      >
        <Lightbulb className='h-4 w-4' />
      </span>
      <div className='min-w-0 pt-0.5'>
        <p className='text-sm font-medium leading-snug text-gray-800 dark:text-gray-100'>
          {principal}
        </p>
        {consejos.length ? (
          <ul className='mt-1.5 space-y-1'>
            {consejos.map(c => (
              <li
                key={c}
                className='flex items-start gap-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400'
              >
                <span
                  className={cn(
                    'mt-1.5 h-1 w-1 flex-shrink-0 rounded-full',
                    VINETA[moduleName] ?? VINETA.proyectos
                  )}
                />
                {c}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
