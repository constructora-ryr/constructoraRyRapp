/**
 * ============================================
 * PÁGINA: Reportes
 * ============================================
 *
 * ✅ PROTEGIDA POR MIDDLEWARE
 * - Middleware ya validó autenticación
 * - No necesita <RequireView> wrapper
 *
 * ARQUITECTURA:
 * - Server Component (sin 'use client')
 * - Obtiene permisos del servidor
 * - Pasa permisos como props al Client Component
 */

import { Metadata } from 'next'

import { getServerPermissions } from '@/lib/auth/server'
import { ReportesPageMain } from '@/modules/reportes/components/ReportesPageMain'

export const metadata: Metadata = {
  title: 'Reportes - Constructora RyR',
  description: 'Análisis y estadísticas del portafolio',
}

export default async function ReportesPage() {
  const permisos = await getServerPermissions('reportes')
  return <ReportesPageMain {...permisos} />
}
