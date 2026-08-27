import { dehydrate } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'

import { DM_Mono, Inter, Plus_Jakarta_Sans } from 'next/font/google'

import { ConditionalLayout } from '@/components/conditional-layout'
import { ConditionalSidebar } from '@/components/conditional-sidebar'
import { IdleTimerProvider } from '@/components/IdleTimerProvider'
import { ProtectedApp } from '@/components/protected-app'
import { SessionInterceptor } from '@/components/SessionInterceptor'
// import { PageTransition } from '@/components/page-transition' // ← DESHABILITADO para navegación instantánea
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { UnsavedChangesProvider } from '@/contexts/unsaved-changes-context'
import { getServerUserProfile } from '@/lib/auth/server'
import { getQueryClient } from '@/lib/get-query-client'
import { ReactQueryProvider } from '@/lib/react-query'
import { permisosKeys } from '@/modules/usuarios/hooks/usePermisosQuery'
import { obtenerPermisosPorRolServer } from '@/modules/usuarios/services/permisos.service.server'
import type { Rol } from '@/modules/usuarios/types'
import {
  AlertModal,
  ConfirmModal,
  ModalProvider,
} from '@/shared/components/modals'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Constructora RyR - Sistema de Gestión',
    template: '%s | Constructora RyR',
  },
  description: 'Sistema de gestión administrativa para constructora RyR',
  icons: {
    icon: '/images/favicon.png',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Prefetch de permisos en el servidor para hidratar el caché del cliente.
  // Así el sidebar y los botones tienen permisos disponibles desde el primer
  // render sin una segunda round-trip al browser.
  const queryClient = getQueryClient()
  try {
    const perfil = await getServerUserProfile()
    if (perfil && perfil.rol !== 'Administrador') {
      await queryClient.prefetchQuery({
        queryKey: permisosKeys.byRol(perfil.rol as Rol),
        queryFn: () => obtenerPermisosPorRolServer(perfil.rol),
      })
    }
  } catch {
    // Si falla el prefetch no bloqueamos el render; el cliente carga solo
  }

  return (
    <html lang='es' suppressHydrationWarning>
      <body
        className={`${inter.className} ${jakarta.variable} ${dmMono.variable}`}
        suppressHydrationWarning
      >
        <SessionInterceptor>
          <ReactQueryProvider dehydratedState={dehydrate(queryClient)}>
            <AuthProvider>
              {/* Sistema profesional de inactividad */}
              <IdleTimerProvider />

              <ThemeProvider>
                <ModalProvider>
                  <UnsavedChangesProvider>
                    {/* 🔐 VALIDACIÓN DE ROL: Bloquea TODO si el rol es inválido */}
                    <ProtectedApp>
                      <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900'>
                        <ConditionalSidebar />
                        <ConditionalLayout>
                          {/* PageTransition deshabilitado para navegación instantánea (-400ms) */}
                          {children}
                        </ConditionalLayout>
                      </div>
                    </ProtectedApp>

                    <Toaster position='bottom-right' duration={4000} gap={8} />

                    {/* Modales globales */}
                    <ConfirmModal />
                    <AlertModal />
                  </UnsavedChangesProvider>
                </ModalProvider>
              </ThemeProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </SessionInterceptor>

        {/* Vercel Analytics — mide page views y Core Web Vitals */}
        <Analytics />
        {/* Vercel Speed Insights — mide LCP, FID, CLS en producción */}
        <SpeedInsights />
      </body>
    </html>
  )
}
