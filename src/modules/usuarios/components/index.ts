/**
 * ============================================
 * BARREL EXPORT: Componentes de Usuarios v2
 * ============================================
 *
 * ✨ VERSIÓN 2.0.0 - Sistema de Permisos Configurable
 */

// ── V2: Módulo reescrito ─────────────────────────────────────────────────
export { EditarUsuarioView } from './EditarUsuarioView'
export { NuevoUsuarioView } from './NuevoUsuarioView'
export { UsuariosPageMain } from './UsuariosPageMain'
export { UsuariosTabla } from './UsuariosTabla'

// ── Componentes de protección de acciones (compartidos) ──────────────────
export {
  AdminOnly,
  CanCreate,
  CanDelete,
  CanEdit,
  CanView,
  ManagerOrAbove,
  ProtectedAction,
} from './ProtectedAction'

// Componentes de protección de rutas
export { ProtectedRoute, RequireAdmin, RequireView } from './ProtectedRoute'

// Tabs + Gestión de Permisos v2
export { PermisosView } from './PermisosView'
export { UsuariosTabs } from './UsuariosTabs'
