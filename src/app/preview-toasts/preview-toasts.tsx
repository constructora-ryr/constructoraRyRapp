'use client'

/** Botones para disparar cada variante de toast real de la app */

import { Clock } from 'lucide-react'
import { toast } from 'sonner'

import {
  showEntitySuccessToast,
  showLoginSuccessToast,
  showLogoutErrorToast,
  showLogoutToast,
} from '@/components/toasts/custom-toasts'
import { IconoToast } from '@/components/toasts/toast-estilos'

const GRUPOS: {
  titulo: string
  ejemplos: { label: string; run: () => void }[]
}[] = [
  {
    titulo: 'Tipos básicos',
    ejemplos: [
      {
        label: 'Éxito',
        run: () =>
          toast.success('Documento subido correctamente', {
            description: 'ABONO CUOTA INICIAL #2 - CIRLY PAOLA CONTRERAS',
          }),
      },
      {
        label: 'Error',
        run: () =>
          toast.error('No se pudo guardar el abono', {
            description: 'Revisa tu conexión e intenta nuevamente.',
          }),
      },
      {
        label: 'Advertencia',
        run: () =>
          toast.warning('Documento por vencer', {
            description: 'El certificado de tradición vence en 5 días.',
          }),
      },
      {
        label: 'Información',
        run: () =>
          toast.info('Hay una versión más reciente', {
            description: 'Recarga para ver los últimos cambios.',
          }),
      },
      { label: 'Solo título', run: () => toast.success('Cambios guardados') },
    ],
  },
  {
    titulo: 'Con acciones',
    ejemplos: [
      {
        label: 'Acción (Ver cliente)',
        run: () =>
          toast.success('Felipe Santiago Morel Jackson', {
            description: 'Cliente creado correctamente',
            action: { label: 'Ver cliente', onClick: () => undefined },
          }),
      },
      {
        label: 'Confirmar / cancelar',
        run: () =>
          toast.warning('¿Salir sin guardar?', {
            description: 'Los cambios no guardados se perderán.',
            action: { label: 'Sí, salir', onClick: () => undefined },
            cancel: { label: 'Quedarse', onClick: () => undefined },
          }),
      },
      {
        label: 'Cargando → éxito',
        run: () => {
          const id = toast.loading('Generando recibo PDF…')
          setTimeout(
            () =>
              toast.success('Recibo generado', {
                id,
                description: 'Se descargó RYR-0042.pdf',
              }),
            2000
          )
        },
      },
    ],
  },
  {
    titulo: 'Con ícono propio',
    ejemplos: [
      { label: 'Bienvenida (login)', run: showLoginSuccessToast },
      { label: 'Sesión cerrada', run: showLogoutToast },
      { label: 'Error al cerrar sesión', run: showLogoutErrorToast },
      {
        label: 'Entidad creada',
        run: () =>
          showEntitySuccessToast({
            entityName: 'Bancolombia',
            action: 'created',
          }),
      },
      {
        label: 'Inactividad',
        run: () =>
          toast.info('Inactividad detectada', {
            description:
              'Tu sesión expirará en 2 minutos si no detectamos actividad.',
            icon: <IconoToast tipo='info' icon={Clock} />,
            action: { label: 'Mantener activa', onClick: () => undefined },
          }),
      },
    ],
  },
  {
    titulo: 'Casos límite',
    ejemplos: [
      {
        label: 'Texto largo',
        run: () =>
          toast.error('No se puede eliminar esta categoría', {
            description:
              'Tiene 18 documento(s) asociado(s): 18 en Clientes. Muévelos a otra categoría antes de eliminarla para no perder la clasificación.',
          }),
      },
      {
        label: 'Varios seguidos',
        run: () => {
          toast.success('Abono registrado')
          setTimeout(() => toast.info('Recibo listo para descargar'), 250)
          setTimeout(() => toast.warning('Saldo pendiente: $10.858.000'), 500)
          setTimeout(() => toast.error('Falta el documento de identidad'), 750)
        },
      },
    ],
  },
]

export function PreviewToasts() {
  return (
    <div className='h-full overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950'>
      <div className='mx-auto max-w-3xl space-y-6'>
        <header>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            Vista previa de toasts
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Solo en desarrollo. Pulsa cada botón; prueba también en modo oscuro
            y en celular.
          </p>
        </header>

        {GRUPOS.map(grupo => (
          <section
            key={grupo.titulo}
            className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900'
          >
            <h2 className='mb-3 text-sm font-bold text-slate-900 dark:text-white'>
              {grupo.titulo}
            </h2>
            <div className='flex flex-wrap gap-2'>
              {grupo.ejemplos.map(ejemplo => (
                <button
                  key={ejemplo.label}
                  type='button'
                  onClick={ejemplo.run}
                  className='rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                >
                  {ejemplo.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
