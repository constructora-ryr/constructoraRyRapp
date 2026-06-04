/**
 * ============================================
 * TIPOS DEL MÓDULO DE USUARIOS v2
 * ============================================
 *
 * Fuente única de verdad para tipos, constantes de UI
 * y helpers de presentación del módulo de usuarios.
 *
 * NOTA: Los permisos viven en la tabla `permisos_rol` de la BD.
 * La lógica de verificación usa `usePermisosQuery` + `permisos.service.ts`.
 * NO hardcodear permisos aquí.
 */

// ============================================
// ROLES Y ESTADOS
// ============================================

/** Roles disponibles en el sistema */
export type Rol =
  | 'Administrador'
  | 'Contabilidad'
  | 'Administrador de Obra'
  | 'Gerencia'

/** Estados posibles de un usuario */
export type EstadoUsuario = 'Activo' | 'Inactivo' | 'Bloqueado'

// ============================================
// MÓDULOS Y ACCIONES DEL SISTEMA
// ============================================

/** Módulos disponibles en el sistema (deben coincidir con columna `modulo` en permisos_rol) */
export type Modulo =
  | 'proyectos'
  | 'viviendas'
  | 'clientes'
  | 'negociaciones'
  | 'documentos'
  | 'abonos'
  | 'renuncias'
  | 'usuarios'
  | 'auditorias'
  | 'reportes'
  | 'administracion'

/** Acciones disponibles (deben coincidir con columna `accion` en permisos_rol) */
export type Accion =
  | 'ver'
  | 'crear'
  | 'subir'
  | 'editar'
  | 'eliminar'
  | 'archivar'
  | 'ver_historial'
  // Acciones específicas del módulo clientes
  | 'registrar_interes'
  | 'anotar_historial'
  // Acciones específicas del módulo abonos
  | 'registrar'
  | 'anular'
  // Acciones específicas del módulo negociaciones
  | 'asignar'
  | 'trasladar'
  | 'renunciar'
  | 'descuento'
  | 'escritura'
  | 'ajustar'

// ============================================
// ENTIDADES DE USUARIO
// ============================================

/** Usuario base de la tabla `usuarios` */
export interface Usuario {
  id: string
  email: string
  nombres: string
  apellidos: string
  nombre_completo?: string
  telefono: string | null
  rol: Rol
  estado: EstadoUsuario
  avatar_url: string | null
  preferencias: Record<string, unknown>
  creado_por: string | null
  ultimo_acceso: string | null
  ultimo_login: string | null
  fecha_creacion: string
  fecha_actualizacion: string
  debe_cambiar_password: boolean
  intentos_fallidos: number
  bloqueado_hasta: string | null
}

/** Usuario enriquecido desde `vista_usuarios_completos` */
export interface UsuarioCompleto extends Usuario {
  creado_por_nombre: string | null
  fecha_registro_auth: string
  ultimo_login_auth: string | null // alias desde auth.users.last_sign_in_at
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/** Datos para crear un nuevo usuario */
export interface CrearUsuarioData {
  email: string
  nombres: string
  apellidos: string
  telefono?: string
  rol: Rol
  /** Si no se proporciona, se genera automáticamente */
  password?: string
  /** Enviar email de invitación al usuario */
  enviar_invitacion?: boolean
}

/** Datos para actualizar un usuario existente */
export interface ActualizarUsuarioData {
  nombres?: string
  apellidos?: string
  telefono?: string
  rol?: Rol
  estado?: EstadoUsuario
  avatar_url?: string
  preferencias?: Record<string, unknown>
}

/** Respuesta de creación de usuario */
export interface CrearUsuarioRespuesta {
  usuario: Usuario
  /** Solo presente si la contraseña fue generada automáticamente */
  password_temporal?: string
  invitacion_enviada: boolean
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

/** Filtros disponibles para la lista de usuarios */
export interface FiltrosUsuarios {
  busqueda?: string
  rol?: Rol
  estado?: EstadoUsuario
}

// ============================================
// ESTADÍSTICAS
// ============================================

/** Estadísticas del módulo de usuarios */
export interface EstadisticasUsuarios {
  total: number
  activos: number
  inactivos: number
  bloqueados: number
  por_rol: Record<Rol, number>
  activos_hoy: number
}

// ============================================
// PERMISOS (tipos para la matriz de la UI)
// ============================================

/** Fila de la tabla `permisos_rol` */
export interface PermisoRolRow {
  id: string
  rol: Rol
  modulo: Modulo
  accion: Accion
  permitido: boolean
}

/** Agrupación de permisos de un módulo para la matriz de la UI */
export interface PermisosModuloUI {
  modulo: Modulo
  label: string
  icono: string
  acciones: {
    accion: Accion
    descripcion: string
    permitido: boolean
    permiso_id: string
  }[]
}

// ============================================
// CONSTANTES DE UI
// ============================================

/** Metadata de roles para mostrar en la UI */
export const ROLES_UI: {
  value: Rol
  label: string
  descripcion: string
  color: string
  badgeClass: string
}[] = [
  {
    value: 'Administrador',
    label: 'Administrador',
    descripcion: 'Control total del sistema',
    color: 'red',
    badgeClass:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  },
  {
    value: 'Gerencia',
    label: 'Gerencia',
    descripcion: 'Lectura completa + aprobaciones',
    color: 'purple',
    badgeClass:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  },
  {
    value: 'Contabilidad',
    label: 'Contabilidad',
    descripcion: 'Crear, editar y aprobar abonos',
    color: 'blue',
    badgeClass:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  {
    value: 'Administrador de Obra',
    label: 'Admin de Obra',
    descripcion: 'Lectura + exportación',
    color: 'gray',
    badgeClass:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  },
]

/** Metadata de estados para mostrar en la UI */
export const ESTADOS_USUARIO_UI: {
  value: EstadoUsuario
  label: string
  descripcion: string
  badgeClass: string
  dotClass: string
}[] = [
  {
    value: 'Activo',
    label: 'Activo',
    descripcion: 'Puede acceder al sistema',
    badgeClass:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    dotClass: 'bg-green-500',
  },
  {
    value: 'Inactivo',
    label: 'Inactivo',
    descripcion: 'Acceso suspendido temporalmente',
    badgeClass:
      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
    dotClass: 'bg-gray-400',
  },
  {
    value: 'Bloqueado',
    label: 'Bloqueado',
    descripcion: 'Bloqueado por seguridad',
    badgeClass:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    dotClass: 'bg-red-500',
  },
]

/** Labels de módulos para la matriz de permisos */
export const MODULOS_LABELS: Record<Modulo, { label: string }> = {
  proyectos: { label: 'Proyectos' },
  viviendas: { label: 'Viviendas' },
  clientes: { label: 'Clientes' },
  negociaciones: { label: 'Negociaciones' },
  documentos: { label: 'Documentos' },
  abonos: { label: 'Abonos' },
  renuncias: { label: 'Renuncias' },
  usuarios: { label: 'Usuarios' },
  auditorias: { label: 'Auditorías' },
  reportes: { label: 'Reportes' },
  administracion: { label: 'Administración' },
}

/** Descripciones de acciones por módulo para la UI de permisos */
export const ACCIONES_DESCRIPCION: Record<
  Modulo,
  Partial<Record<Accion, string>>
> = {
  proyectos: {
    ver: 'Acceder al módulo y ver listado',
    crear: 'Crear nuevos proyectos',
    editar: 'Modificar datos del proyecto',
    eliminar: 'Eliminar proyectos',
  },
  viviendas: {
    ver: 'Acceder al módulo y ver listado',
    crear: 'Registrar nuevas viviendas',
    editar: 'Modificar datos de la vivienda',
    eliminar: 'Eliminar viviendas',
  },
  clientes: {
    ver: 'Acceder al módulo y ver listado',
    crear: 'Registrar nuevos clientes',
    editar: 'Modificar datos del cliente',
    eliminar: 'Eliminar clientes',
  },
  negociaciones: {
    ver: 'Ver tab de negociaciones del cliente',
    crear: 'Crear negociaciones',
    editar: 'Modificar negociaciones',
    eliminar: 'Eliminar negociaciones',
  },
  documentos: {
    ver: 'Ver tab de documentos',
    subir: 'Subir nuevos documentos',
    editar: 'Renombrar y editar metadatos',
    eliminar: 'Eliminar documentos',
    archivar: 'Archivar documentos',
  },
  abonos: {
    ver: 'Acceder al módulo y ver listado',
    crear: 'Registrar abonos',
    editar: 'Modificar abonos',
    eliminar: 'Eliminar abonos',
  },
  renuncias: {
    ver: 'Acceder al módulo y ver listado',
    crear: 'Registrar renuncias',
    editar: 'Modificar renuncias',
    eliminar: 'Eliminar renuncias',
  },
  usuarios: {
    ver: 'Ver lista de usuarios y permisos',
    crear: 'Crear nuevos usuarios',
    editar: 'Modificar datos y rol de usuarios',
    eliminar: 'Desactivar usuarios',
  },
  auditorias: {
    ver: 'Ver registros de auditoría',
  },
  reportes: {
    ver: 'Ver reportes y estadísticas',
  },
  administracion: {
    ver: 'Acceder al panel de administración',
  },
}

// ============================================
// HELPERS DE PRESENTACIÓN
// ============================================

/** Obtiene la metadata de UI de un rol */
export function getRolUI(rol: Rol) {
  return ROLES_UI.find(r => r.value === rol) ?? ROLES_UI[3]
}

/** Obtiene la metadata de UI de un estado */
export function getEstadoUI(estado: EstadoUsuario) {
  return (
    ESTADOS_USUARIO_UI.find(e => e.value === estado) ?? ESTADOS_USUARIO_UI[0]
  )
}

/** Retorna el nombre completo de un usuario */
export function getNombreCompleto(
  usuario: Pick<Usuario, 'nombres' | 'apellidos'>
): string {
  return `${usuario.nombres} ${usuario.apellidos}`.trim()
}

/** Retorna true si el usuario fue invitado pero aún no ha completado su setup */
export function esPendiente(
  usuario: Pick<Usuario, 'ultimo_login' | 'debe_cambiar_password'>
): boolean {
  return !usuario.ultimo_login && usuario.debe_cambiar_password
}

/** Retorna las iniciales de un usuario para el avatar */
export function getIniciales(
  usuario: Pick<Usuario, 'nombres' | 'apellidos'>
): string {
  const primeraLetraNombre = usuario.nombres.charAt(0).toUpperCase()
  const primeraLetraApellido = usuario.apellidos.charAt(0).toUpperCase()
  return `${primeraLetraNombre}${primeraLetraApellido}`
}

// ============================================
// LEGACY EXPORTS (compatibilidad con código existente)
// Migrar gradualmente al nuevo patrón
// ============================================

/** @deprecated Usar ROLES_UI */
export const ROLES = ROLES_UI.map(r => ({
  value: r.value,
  label: r.label,
  descripcion: r.descripcion,
  color: r.color,
}))

/** @deprecated Usar ESTADOS_USUARIO_UI */
export const ESTADOS_USUARIO = ESTADOS_USUARIO_UI.map(e => ({
  value: e.value,
  label: e.label,
  descripcion: e.descripcion,
  color:
    e.value === 'Activo' ? 'green' : e.value === 'Bloqueado' ? 'red' : 'gray',
}))
