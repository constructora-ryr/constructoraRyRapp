import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  Home,
  Loader2,
  Trash2,
  User,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

import { notFound } from 'next/navigation'

import {
  Cargador,
  PantallaCarga,
  type TemaCarga,
} from '@/shared/components/carga'

/** Vista previa de los indicadores de carga. Solo desarrollo (404 en prod). */

const MODULOS: { modulo: TemaCarga; icon: LucideIcon; label: string }[] = [
  { modulo: 'clientes', icon: Users, label: 'Cargando clientes' },
  { modulo: 'proyectos', icon: Building2, label: 'Cargando proyectos' },
  { modulo: 'viviendas', icon: Home, label: 'Cargando viviendas' },
  { modulo: 'abonos', icon: CreditCard, label: 'Cargando abonos' },
  { modulo: 'negociaciones', icon: Heart, label: 'Cargando negociación' },
  { modulo: 'documentos', icon: FileText, label: 'Cargando documentos' },
  { modulo: 'usuarios', icon: User, label: 'Cargando usuarios' },
  { modulo: 'auditorias', icon: ClipboardList, label: 'Cargando auditorías' },
  { modulo: 'renuncias', icon: XCircle, label: 'Cargando renuncias' },
  { modulo: 'papelera', icon: Trash2, label: 'Cargando papelera' },
  { modulo: 'app', icon: Building2, label: 'Preparando tu sesión' },
]

function Bloque({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
      <h2 className='mb-4 text-sm font-bold text-slate-900 dark:text-white'>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

export default function PreviewCargasPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className='h-full overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950'>
      <div className='mx-auto max-w-5xl space-y-6'>
        <header>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            Vista previa de cargas
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Solo en desarrollo. Revisa también en modo oscuro y en celular.
          </p>
        </header>

        <Bloque titulo='Por módulo (tamaño mediano: pestañas, secciones, modales)'>
          <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4'>
            {MODULOS.map(m => (
              <Cargador
                key={m.modulo}
                modulo={m.modulo}
                icon={m.icon}
                label={m.label}
              />
            ))}
          </div>
        </Bloque>

        <Bloque titulo='Tamaños'>
          <div className='flex flex-wrap items-end justify-around gap-6'>
            <Cargador
              modulo='clientes'
              icon={Users}
              tamano='sm'
              label='Pequeño'
            />
            <Cargador
              modulo='clientes'
              icon={Users}
              tamano='md'
              label='Mediano'
            />
            <Cargador
              modulo='clientes'
              icon={Users}
              tamano='lg'
              label='Grande'
            />
            <Cargador modulo='proyectos' label='Sin ícono' />
          </div>
        </Bloque>

        <Bloque titulo='Dentro de botones (Loader2)'>
          <div className='flex flex-wrap gap-3'>
            <button
              type='button'
              disabled
              className='inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 text-sm font-semibold text-white opacity-80'
            >
              <Loader2 className='h-4 w-4 animate-spin' />
              Guardando…
            </button>
            <button
              type='button'
              disabled
              className='inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              <Loader2 className='h-4 w-4 animate-spin' />
              Cargando
            </button>
          </div>
        </Bloque>

        <Bloque titulo='Pantalla completa (al cambiar de página)'>
          <div className='overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700'>
            <PantallaCarga
              modulo='viviendas'
              icon={Home}
              label='Cargando viviendas'
              className='min-h-[360px]'
            />
          </div>
        </Bloque>
      </div>
    </div>
  )
}
