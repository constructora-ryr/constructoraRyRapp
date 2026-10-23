/**
 * UsuariosTabla - Vista de tabla para usuarios del sistema
 * ✅ DataTable variant='clean' con encabezado en degradado del módulo (fijo)
 * ✅ Colores de rol y estado desde ../config/usuarios-visual
 *
 * Columnas: Usuario (avatar del rol + email) · Rol · Estado · Último acceso ·
 * Creado · Acciones (menú ⋯ con confirmación)
 *
 * La fila abre la edición del usuario. En móvil (< md) se muestran tarjetas.
 */

'use client'

import { useState } from 'react'

import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import {
  KeyRound,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unlock,
  UserCheck,
  UserX,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth-context'
import { formatDateCompact, formatRelativeDate } from '@/lib/utils/date.utils'
import { ModalConfirmacion } from '@/shared'
import { DataTable } from '@/shared/components/table/DataTable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/utils/helpers'

import {
  ESTADO_USUARIO_VISUAL,
  estadoVisibleUsuario,
  estaEnLinea,
  rolVisual,
} from '../config/usuarios-visual'
import {
  useCambiarEstadoMutation,
  useDesbloquearUsuarioMutation,
  useEliminarUsuarioPendienteMutation,
} from '../hooks'
import { useReenviarInvitacion } from '../hooks/useReenviarInvitacion'
import type { UsuarioCompleto } from '../types'
import { getIniciales, getNombreCompleto } from '../types'

interface UsuariosTablaProps {
  usuarios: UsuarioCompleto[]
  canEdit: boolean
  onEditar: (usuario: UsuarioCompleto) => void
}

type Accion =
  | 'inactivar'
  | 'activar'
  | 'desbloquear'
  | 'reenviar'
  | 'eliminarInvitacion'

// ── Estilos del módulo ───────────────────────────────────────────────────────
const styles = {
  avatar:
    'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm',
  enLinea:
    'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800',
  nombre: 'block truncate text-sm font-semibold text-slate-900 dark:text-white',
  secundario: 'block truncate text-xs text-slate-500 dark:text-slate-400',
  badge:
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
  tu: 'rounded-full bg-indigo-100 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  accionesTrigger:
    'rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:data-[state=open]:bg-slate-700',
}

// ── Celdas (compartidas por la tabla y las tarjetas móviles) ─────────────────
function CeldaUsuario({ u, esYo }: { u: UsuarioCompleto; esYo: boolean }) {
  const rol = rolVisual(u.rol)
  const nombre = getNombreCompleto(u)
  const enLinea = estaEnLinea(u.ultimo_acceso)
  return (
    <div className='flex min-w-0 items-center gap-3'>
      <span
        aria-hidden
        className={cn(
          styles.avatar,
          rol.gradient,
          u.estado !== 'Activo' && 'opacity-50 grayscale'
        )}
      >
        {getIniciales(u)}
        {enLinea && <span className={styles.enLinea} />}
      </span>
      <span className='min-w-0'>
        <span className='flex items-center gap-1.5'>
          <span className={styles.nombre} title={nombre}>
            {nombre}
          </span>
          {esYo && <span className={styles.tu}>Tú</span>}
        </span>
        <span className={styles.secundario} title={u.email}>
          {u.email}
        </span>
      </span>
    </div>
  )
}

function CeldaRol({ u }: { u: UsuarioCompleto }) {
  const rol = rolVisual(u.rol)
  const Icono = rol.icon
  return (
    <span className={cn(styles.badge, rol.badge)}>
      <Icono className='h-3.5 w-3.5' />
      {rol.label}
    </span>
  )
}

function CeldaEstado({ u }: { u: UsuarioCompleto }) {
  const cfg = ESTADO_USUARIO_VISUAL[estadoVisibleUsuario(u)]
  const Icono = cfg.icon
  return (
    <span className='flex flex-col items-start gap-1'>
      <span className={cn(styles.badge, cfg.badge)}>
        <Icono className='h-3.5 w-3.5' />
        {cfg.label}
      </span>
      {u.debe_cambiar_password && u.ultimo_login && (
        <span className='flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400'>
          <KeyRound className='h-3 w-3' />
          Debe cambiar contraseña
        </span>
      )}
    </span>
  )
}

function CeldaAcceso({ u }: { u: UsuarioCompleto }) {
  const fecha = u.ultimo_acceso ?? u.ultimo_login
  if (!fecha)
    return (
      <span className='text-xs text-slate-300 dark:text-slate-600'>Nunca</span>
    )
  const enLinea = estaEnLinea(u.ultimo_acceso)
  return (
    <span className='min-w-0'>
      <span
        className={cn(
          'flex items-center gap-1.5 text-sm font-medium',
          enLinea
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-700 dark:text-slate-200'
        )}
      >
        {enLinea && (
          <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' />
        )}
        {enLinea ? 'En línea' : formatRelativeDate(fecha)}
      </span>
      <span className='block text-[11px] text-slate-400 dark:text-slate-500'>
        {formatDateCompact(fecha)}
      </span>
    </span>
  )
}

function CeldaCreado({ u }: { u: UsuarioCompleto }) {
  return (
    <span className='min-w-0'>
      <span className='block text-sm text-slate-700 dark:text-slate-200'>
        {formatDateCompact(u.fecha_creacion)}
      </span>
      {u.creado_por_nombre && (
        <span className='block truncate text-[11px] text-slate-400 dark:text-slate-500'>
          por {u.creado_por_nombre}
        </span>
      )}
    </span>
  )
}

interface MenuAccionesProps {
  u: UsuarioCompleto
  esYo: boolean
  canEdit: boolean
  onEditar: (u: UsuarioCompleto) => void
  onAccion: (accion: Accion, u: UsuarioCompleto) => void
}

function MenuAcciones({
  u,
  esYo,
  canEdit,
  onEditar,
  onAccion,
}: MenuAccionesProps) {
  if (!canEdit) return null
  const estado = estadoVisibleUsuario(u)

  return (
    // Evita que el clic en el menú abra la edición (la fila es clicable)
    <div
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      className='inline-flex'
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            aria-label={`Acciones para ${getNombreCompleto(u)}`}
            className={styles.accionesTrigger}
          >
            <MoreHorizontal className='h-4 w-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-52'>
          <DropdownMenuItem onClick={() => onEditar(u)}>
            <Pencil className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>

          {estado === 'Pendiente' && (
            <DropdownMenuItem onClick={() => onAccion('reenviar', u)}>
              <Mail className='mr-2 h-4 w-4' />
              Reenviar invitación
            </DropdownMenuItem>
          )}
          {estado === 'Bloqueado' && (
            <DropdownMenuItem onClick={() => onAccion('desbloquear', u)}>
              <Unlock className='mr-2 h-4 w-4' />
              Desbloquear
            </DropdownMenuItem>
          )}
          {estado === 'Inactivo' && (
            <DropdownMenuItem onClick={() => onAccion('activar', u)}>
              <UserCheck className='mr-2 h-4 w-4' />
              Activar
            </DropdownMenuItem>
          )}

          {/* Acciones destructivas: nunca sobre uno mismo */}
          {!esYo && (estado === 'Activo' || estado === 'Pendiente') && (
            <>
              <DropdownMenuSeparator />
              {estado === 'Activo' ? (
                <DropdownMenuItem
                  onClick={() => onAccion('inactivar', u)}
                  className='text-red-600 focus:text-red-700 dark:text-red-400'
                >
                  <UserX className='mr-2 h-4 w-4' />
                  Inactivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onAccion('eliminarInvitacion', u)}
                  className='text-red-600 focus:text-red-700 dark:text-red-400'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Cancelar invitación
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const CONFIRMACION: Record<
  Accion,
  {
    titulo: string
    mensaje: (nombre: string, email: string) => string
    boton: string
    variant: 'danger' | 'warning' | 'info' | 'success'
  }
> = {
  inactivar: {
    titulo: 'Inactivar usuario',
    mensaje: n =>
      `${n} ya no podrá entrar al sistema y se cerrarán sus sesiones abiertas. Puedes volver a activarlo cuando quieras.`,
    boton: 'Inactivar',
    variant: 'danger',
  },
  activar: {
    titulo: 'Activar usuario',
    mensaje: n => `${n} podrá volver a entrar al sistema con su rol actual.`,
    boton: 'Activar',
    variant: 'success',
  },
  desbloquear: {
    titulo: 'Desbloquear usuario',
    mensaje: n =>
      `Se reiniciarán los intentos fallidos y ${n} podrá volver a iniciar sesión.`,
    boton: 'Desbloquear',
    variant: 'info',
  },
  reenviar: {
    titulo: 'Reenviar invitación',
    mensaje: (_, e) => `Se enviará de nuevo el correo de invitación a ${e}.`,
    boton: 'Reenviar',
    variant: 'info',
  },
  eliminarInvitacion: {
    titulo: 'Cancelar invitación',
    mensaje: n =>
      `Se eliminará la cuenta de ${n}. Como nunca entró al sistema, no se pierde información.`,
    boton: 'Cancelar invitación',
    variant: 'danger',
  },
}

const ORDEN_INICIAL: SortingState = [{ id: 'usuario', desc: false }]

// ── Componente ───────────────────────────────────────────────────────────────
export function UsuariosTabla({
  usuarios,
  canEdit,
  onEditar,
}: UsuariosTablaProps) {
  const { user: currentUser } = useAuth()
  const [pendiente, setPendiente] = useState<{
    accion: Accion
    usuario: UsuarioCompleto
  } | null>(null)

  const { mutateAsync: cambiarEstado, isPending: cambiandoEstado } =
    useCambiarEstadoMutation()
  const { mutateAsync: desbloquear, isPending: desbloqueando } =
    useDesbloquearUsuarioMutation()
  const { mutateAsync: eliminarPendiente, isPending: eliminando } =
    useEliminarUsuarioPendienteMutation()
  const { reenviar, cargando: reenviando } = useReenviarInvitacion()

  const ocupado = cambiandoEstado || desbloqueando || eliminando || reenviando

  const ejecutar = async () => {
    if (!pendiente) return
    const { accion, usuario: u } = pendiente
    try {
      if (accion === 'inactivar')
        await cambiarEstado({ id: u.id, nuevoEstado: 'Inactivo' })
      else if (accion === 'activar')
        await cambiarEstado({ id: u.id, nuevoEstado: 'Activo' })
      else if (accion === 'desbloquear') await desbloquear(u.id)
      else if (accion === 'eliminarInvitacion') await eliminarPendiente(u.id)
      else if (accion === 'reenviar') {
        await reenviar(u.email)
        toast.success(`Invitación reenviada a ${u.email}`)
      }
      setPendiente(null)
    } catch {
      // Las mutaciones ya muestran su propio toast de error
      if (accion === 'reenviar')
        toast.error('No se pudo reenviar la invitación')
    }
  }

  const esYo = (u: UsuarioCompleto) => currentUser?.id === u.id
  const onAccion = (accion: Accion, usuario: UsuarioCompleto) =>
    setPendiente({ accion, usuario })

  const columns: ColumnDef<UsuarioCompleto>[] = [
    {
      id: 'usuario',
      header: 'Usuario',
      size: 320,
      accessorFn: u => getNombreCompleto(u),
      cell: ({ row }) => (
        <CeldaUsuario u={row.original} esYo={esYo(row.original)} />
      ),
    },
    {
      id: 'rol',
      header: 'Rol',
      size: 170,
      accessorFn: u => u.rol,
      cell: ({ row }) => <CeldaRol u={row.original} />,
    },
    {
      id: 'estado',
      header: 'Estado',
      size: 190,
      accessorFn: u => estadoVisibleUsuario(u),
      cell: ({ row }) => <CeldaEstado u={row.original} />,
    },
    {
      id: 'acceso',
      header: 'Último acceso',
      size: 150,
      accessorFn: u => u.ultimo_acceso ?? u.ultimo_login ?? '',
      sortDescFirst: true,
      cell: ({ row }) => <CeldaAcceso u={row.original} />,
    },
    {
      id: 'creado',
      header: 'Creado',
      size: 150,
      accessorFn: u => u.fecha_creacion,
      sortDescFirst: true,
      cell: ({ row }) => <CeldaCreado u={row.original} />,
    },
    {
      id: 'acciones',
      header: () => <span className='sr-only'>Acciones</span>,
      size: 56,
      enableSorting: false,
      meta: { align: 'right' },
      cell: ({ row }) => (
        <MenuAcciones
          u={row.original}
          esYo={esYo(row.original)}
          canEdit={canEdit}
          onEditar={onEditar}
          onAccion={onAccion}
        />
      ),
    },
  ]

  const conf = pendiente ? CONFIRMACION[pendiente.accion] : null
  const nombrePendiente = pendiente ? getNombreCompleto(pendiente.usuario) : ''

  return (
    <>
      {/* Móvil: tarjetas apiladas */}
      <ul className='space-y-3 md:hidden'>
        {usuarios.map(u => (
          <li key={u.id}>
            <div
              role={canEdit ? 'button' : undefined}
              tabIndex={canEdit ? 0 : undefined}
              onClick={canEdit ? () => onEditar(u) : undefined}
              onKeyDown={
                canEdit
                  ? e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onEditar(u)
                      }
                    }
                  : undefined
              }
              className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:active:bg-slate-700/40'
            >
              <div className='flex items-start justify-between gap-2'>
                <CeldaUsuario u={u} esYo={esYo(u)} />
                <MenuAcciones
                  u={u}
                  esYo={esYo(u)}
                  canEdit={canEdit}
                  onEditar={onEditar}
                  onAccion={onAccion}
                />
              </div>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <CeldaRol u={u} />
                <CeldaEstado u={u} />
              </div>
              <div className='mt-3 border-t border-slate-100 pt-3 dark:border-slate-700/60'>
                <CeldaAcceso u={u} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Escritorio: tabla */}
      <div className='hidden md:block'>
        <DataTable
          columns={columns}
          data={usuarios}
          initialSorting={ORDEN_INICIAL}
          onRowClick={canEdit ? onEditar : undefined}
          variant='clean'
          headerGradient='from-indigo-700 via-indigo-600 to-sky-500 dark:from-indigo-800 dark:via-indigo-700 dark:to-sky-700'
        />
      </div>

      <ModalConfirmacion
        isOpen={!!pendiente}
        onClose={() => (ocupado ? undefined : setPendiente(null))}
        onConfirm={ejecutar}
        title={conf?.titulo ?? ''}
        message={
          conf && pendiente
            ? conf.mensaje(nombrePendiente, pendiente.usuario.email)
            : ''
        }
        confirmText={conf?.boton}
        cancelText='Volver'
        variant={conf?.variant}
        isLoading={ocupado}
      />
    </>
  )
}
