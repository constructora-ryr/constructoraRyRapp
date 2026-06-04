// ============================================
// SISTEMA ANTIGUO (Hardcodeado) - Deprecado
// ============================================
export { useCan, useIsAdmin, usePermissions, useRole } from './usePermissions'

// ============================================
// SISTEMA NUEVO (React Query + BD) - Recomendado ⭐
// ============================================
export {
  useActualizarPermisoMutation,
  useActualizarPermisosEnLoteMutation,
  useCan as useCanQuery,
  useIsAdmin as useIsAdminQuery,
  usePermisosQuery,
  useRole as useRoleQuery,
  useTodosLosPermisosQuery,
} from './usePermisosQuery'

// ============================================
// USUARIOS - Sistema Antiguo (useState)
// ============================================
export { useUsuarios } from './useUsuarios'

// ============================================
// USUARIOS v2 — Sistema Nuevo (React Query + buenas prácticas) ⭐
// ============================================
export {
  useActualizarUsuarioMutation,
  useCambiarEstadoMutation,
  useCambiarRolMutation,
  useCrearUsuarioMutation,
  useDesbloquearUsuarioMutation,
  useUsuarioDetailQuery,
  useUsuariosEstadisticasQuery,
  useUsuariosListQuery,
  usuariosKeys,
} from './useUsuariosQuery'

export { useEditarUsuario } from './useEditarUsuario'
export { useNuevoUsuario } from './useNuevoUsuario'
export { usePermisosAdmin } from './usePermisosAdmin'
export { useReenviarInvitacion } from './useReenviarInvitacion'
export { useUsuariosList } from './useUsuariosList'
