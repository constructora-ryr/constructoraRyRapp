/**
 * UsuariosTabs — Navegación por pestañas del módulo de usuarios
 * ✅ "Usuarios": listado y gestión
 * ✅ "Permisos": matriz RBAC (solo Admin)
 */

'use client'

import { useState } from 'react'

import { Shield, Users } from 'lucide-react'

import { PermisosView } from './PermisosView'

type TabType = 'usuarios' | 'permisos'

const TABS: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'permisos', label: 'Permisos por rol', icon: Shield },
]

interface UsuariosTabsProps {
  /** Contenido de la pestaña de usuarios (tarjetas + buscador + tabla) */
  children: React.ReactNode
}

export function UsuariosTabs({ children }: UsuariosTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('usuarios')

  return (
    <div className='space-y-5'>
      <div
        role='tablist'
        aria-label='Secciones de usuarios'
        className='inline-flex gap-1 rounded-2xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60'
      >
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type='button'
              role='tab'
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300'
              }`}
            >
              <Icon className='h-4 w-4' />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'usuarios' ? children : <PermisosView />}
    </div>
  )
}
