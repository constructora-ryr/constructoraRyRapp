'use client'

import {
  Check,
  FileText,
  Handshake,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

import {
  ETIQUETA_ACCION,
  ETIQUETA_MODULO,
} from '@/modules/usuarios/hooks/usePermisosAdmin'
import { usePermisosQuery } from '@/modules/usuarios/hooks/usePermisosQuery'
import {
  ACCIONES_DESCRIPCION,
  type Accion,
  type Modulo,
} from '@/modules/usuarios/types'
import { navigationGroups } from '@/shared/config/navigation.config'
import { cn } from '@/shared/utils/helpers'

import { estilos as e } from './estilos'

/** Módulos que tienen página propia: ícono y color del menú */
const RUTA_MODULO: Partial<Record<Modulo, string>> = {
  proyectos: '/proyectos',
  viviendas: '/viviendas',
  clientes: '/clientes',
  abonos: '/abonos',
  renuncias: '/renuncias',
  usuarios: '/usuarios',
  auditorias: '/auditorias',
  reportes: '/reportes',
  administracion: '/admin',
}
/** Los que viven dentro de otros módulos */
const SIN_PAGINA: Partial<Record<Modulo, LucideIcon>> = {
  negociaciones: Handshake,
  documentos: FileText,
}
const ORDEN = Object.keys(ETIQUETA_MODULO) as Modulo[]

const itemsMenu = navigationGroups.flatMap(g => g.items)

function visualModulo(modulo: Modulo): { icon: LucideIcon; tint: string } {
  const item = itemsMenu.find(i => i.href === RUTA_MODULO[modulo])
  if (item) return { icon: item.icon, tint: item.tint }
  return {
    icon: SIN_PAGINA[modulo] ?? ShieldCheck,
    tint: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
  }
}

/** Qué puede hacer el rol del usuario, módulo por módulo (solo lectura) */
export function SeccionPermisos() {
  const { esAdmin, todosLosPermisos, isLoading } = usePermisosQuery()

  if (esAdmin) {
    return (
      <section className={`${e.tarjeta} flex items-start gap-4 p-5`}>
        <span className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm shadow-red-500/25'>
          <ShieldCheck className='h-6 w-6' />
        </span>
        <div>
          <h2 className={e.titulo}>Acceso total</h2>
          <p className={e.subtitulo}>
            Como administrador puedes ver y hacer todo en la aplicación, y
            definir los permisos de los demás roles en Usuarios → Permisos.
          </p>
        </div>
      </section>
    )
  }

  const porModulo = new Map<Modulo, Accion[]>()
  for (const p of todosLosPermisos) {
    porModulo.set(p.modulo, [...(porModulo.get(p.modulo) ?? []), p.accion])
  }
  const modulos = ORDEN.filter(m => porModulo.has(m))

  return (
    <section className={e.tarjeta} aria-labelledby='permisos-titulo'>
      <div className={e.cabecera}>
        <h2 id='permisos-titulo' className={e.titulo}>
          Lo que puedes hacer
        </h2>
        <p className={e.subtitulo}>
          Los permisos dependen de tu rol. Si necesitas otro, pídeselo a un
          administrador.
        </p>
      </div>
      {isLoading ? (
        <div className='grid gap-3 p-5 sm:grid-cols-2' aria-busy='true'>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/50'
            />
          ))}
        </div>
      ) : modulos.length === 0 ? (
        <p className='px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400'>
          Tu rol aún no tiene permisos asignados.
        </p>
      ) : (
        <ul className='grid gap-3 p-5 sm:grid-cols-2'>
          {modulos.map(m => {
            const { icon: Icono, tint } = visualModulo(m)
            return (
              <li
                key={m}
                className='rounded-xl border border-slate-200 p-3.5 dark:border-slate-700'
              >
                <p className='flex items-center gap-2.5'>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg',
                      tint
                    )}
                  >
                    <Icono className='h-4 w-4' />
                  </span>
                  <span className='text-sm font-semibold text-slate-900 dark:text-white'>
                    {ETIQUETA_MODULO[m] ?? m}
                  </span>
                </p>
                <ul className='mt-2.5 flex flex-wrap gap-1.5'>
                  {porModulo.get(m)?.map(a => (
                    <li
                      key={a}
                      title={ACCIONES_DESCRIPCION[m]?.[a]}
                      className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700/60 dark:text-slate-200'
                    >
                      <Check className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                      {ETIQUETA_ACCION[a] ?? a}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
