import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reportes - Constructora RyR',
  description: 'Reportes y estadísticas del sistema',
}

export default function ReportesPage() {
  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Reportes
          </h1>
          <p className='mt-1 text-gray-600 dark:text-gray-400'>
            Módulo en construcción
          </p>
        </div>
      </div>

      <div className='rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800'>
        <div className='mx-auto max-w-md space-y-4'>
          <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700'>
            <svg
              className='h-10 w-10 text-gray-400 dark:text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Módulo en Desarrollo
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            El módulo de reportes estará disponible próximamente. Aquí podrás
            generar reportes financieros, de ventas, proyectos y más.
          </p>
        </div>
      </div>
    </div>
  )
}
