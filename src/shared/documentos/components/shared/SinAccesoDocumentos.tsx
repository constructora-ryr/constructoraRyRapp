import { Lock } from 'lucide-react'

/** Estado del tab Documentos cuando el rol no tiene permiso de ver */
export function SinAccesoDocumentos({ entidad }: { entidad: string }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'>
      <span className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-700/60 dark:ring-slate-600'>
        <Lock className='h-7 w-7 text-slate-400' />
      </span>
      <p className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
        Sin acceso a documentos
      </p>
      <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
        No tienes permiso para ver los documentos de {entidad}.
      </p>
    </div>
  )
}
