'use client'

import { usePathname } from 'next/navigation'

import { isPublicUIRoute } from '@/shared/config/public-routes'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isPublicUIRoute(pathname)) {
    // Rutas públicas (login, restablecer, bienvenida): ancho completo y con
    // scroll propio (el contenedor de la app es h-screen overflow-hidden).
    // Cada página se centra a sí misma.
    return (
      <div
        className='custom-scrollbar flex flex-1 flex-col overflow-y-auto'
        suppressHydrationWarning
      >
        {children}
      </div>
    )
  }

  // Layout para rutas autenticadas (con sidebar)
  return (
    <main
      className='custom-scrollbar flex-1 overflow-auto'
      suppressHydrationWarning
    >
      {children}
    </main>
  )
}
