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
import { ReactQueryProvider } from '@/lib/react-query'
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
    default: 'RyR Constructora - Sistema de Gestión',
    template: '%s | RyR Constructora',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body
        className={`${inter.className} ${jakarta.variable} ${dmMono.variable}`}
        suppressHydrationWarning
      >
        <SessionInterceptor>
          <ReactQueryProvider>
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
