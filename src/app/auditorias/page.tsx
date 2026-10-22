/**
 * Auditoría: solo administradores (lo valida el middleware y, en la base de
 * datos, la política de lectura de la tabla `auditoria`).
 */

import { AuditoriasView } from '@/modules/auditorias'

export const metadata = {
  title: 'Auditoría | Constructora RyR',
}

export default function AuditoriasPage() {
  return <AuditoriasView />
}
