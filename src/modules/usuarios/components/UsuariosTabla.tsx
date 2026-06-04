/**
 * UsuariosTabla — Vista tabla del módulo de usuarios
 * ✅ Columnas: Avatar+Nombre | Email | Rol | Estado | Último acceso | Acciones
 * ✅ Badges de rol/estado con colores del sistema
 * ✅ Hover por fila con botón de edición
 * ✅ Skeleton loader y empty state
 */

'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { Mail, Pencil, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from 'next/navigation'

import { formatDateCompact } from '@/lib/utils/date.utils'

import { useReenviarInvitacion } from '../hooks/useReenviarInvitacion'
import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'
import type { UsuarioCompleto } from '../types'
import {
  esPendiente,
  getEstadoUI,
  getIniciales,
  getNombreCompleto,
  getRolUI,
} from '../types'

interface UsuariosTablaProps {
  usuarios: UsuarioCompleto[]
  cargando: boolean
  hayFiltrosActivos: boolean
  canEdit: boolean
}

export function UsuariosTabla({
  usuarios,
  cargando,
  hayFiltrosActivos,
  canEdit,
}: UsuariosTablaProps) {
  const router = useRouter()

  if (cargando) {
    return <SkeletonTabla />
  }

  if (usuarios.length === 0) {
    return (
      <EmptyState
        hayFiltrosActivos={hayFiltrosActivos}
        canCreate={canEdit}
        onNuevo={() => router.push('/usuarios/nueva')}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className={styles.tabla.container}
    >
      <div className={styles.tabla.wrapper}>
        <table className={styles.tabla.table}>
          <thead className={styles.tabla.thead}>
            <tr>
              <th className={styles.tabla.th}>Usuario</th>
              <th className={styles.tabla.th}>Email</th>
              <th className={styles.tabla.th}>Rol</th>
              <th className={styles.tabla.th}>Estado</th>
              <th className={styles.tabla.th}>Último login</th>
              <th className={styles.tabla.th}>Último acceso</th>
              {canEdit ? (
                <th className={styles.tabla.thRight}>Acciones</th>
              ) : null}
            </tr>
          </thead>
          <tbody className={styles.tabla.tbody}>
            {usuarios.map(usuario => (
              <FilaUsuario
                key={usuario.id}
                usuario={usuario}
                canEdit={canEdit}
                onEditar={() => router.push(`/usuarios/${usuario.id}/editar`)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

// ── Fila individual ────────────────────────────────────────────────────────

interface FilaUsuarioProps {
  usuario: UsuarioCompleto
  canEdit: boolean
  onEditar: () => void
}

function FilaUsuario({ usuario, canEdit, onEditar }: FilaUsuarioProps) {
  const rolUI = getRolUI(usuario.rol)
  const estadoUI = getEstadoUI(usuario.estado)
  const iniciales = getIniciales(usuario)
  const nombreCompleto = getNombreCompleto(usuario)
  const pendiente = esPendiente(usuario)

  const { reenviar, cargando } = useReenviarInvitacion()
  const [reenviado, setReenviado] = useState(false)

  const handleReenviar = async () => {
    try {
      await reenviar(usuario.email)
      setReenviado(true)
      toast.success(`Invitación reenviada a ${usuario.email}`)
    } catch {
      toast.error('No se pudo reenviar la invitación')
    }
  }

  return (
    <tr className={styles.tabla.tr}>
      {/* Avatar + Nombre */}
      <td className={styles.tabla.td}>
        <div className={styles.tabla.avatarCell}>
          <div className={styles.tabla.avatar}>{iniciales}</div>
          <div>
            <p className={styles.tabla.avatarName}>{nombreCompleto}</p>
            {pendiente ? (
              <p className='text-xs text-amber-500 dark:text-amber-400'>
                Invitación pendiente
              </p>
            ) : usuario.debe_cambiar_password ? (
              <p className={styles.tabla.avatarWarning}>
                Debe cambiar contraseña
              </p>
            ) : null}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className={styles.tabla.td}>
        <span className={styles.tabla.email}>{usuario.email}</span>
      </td>

      {/* Rol */}
      <td className={styles.tabla.td}>
        <span className={`${styles.tabla.badge} ${rolUI.badgeClass}`}>
          {rolUI.label}
        </span>
      </td>

      {/* Estado */}
      <td className={styles.tabla.td}>
        {pendiente ? (
          <span className='inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'>
            <span className='h-1.5 w-1.5 rounded-full bg-amber-400' />
            Pendiente
          </span>
        ) : (
          <span className={`${styles.tabla.badge} ${estadoUI.badgeClass}`}>
            {estadoUI.label}
          </span>
        )}
      </td>

      {/* Último login */}
      <td className={styles.tabla.td}>
        <span className={styles.tabla.fecha}>
          {usuario.ultimo_login
            ? formatDateCompact(usuario.ultimo_login)
            : 'Nunca'}
        </span>
      </td>

      {/* Último acceso */}
      <td className={styles.tabla.td}>
        <span className={styles.tabla.fecha}>
          {usuario.ultimo_acceso
            ? formatDateCompact(usuario.ultimo_acceso)
            : 'Nunca'}
        </span>
      </td>

      {/* Acciones */}
      {canEdit ? (
        <td className={styles.tabla.tdRight}>
          <div className='flex items-center justify-end gap-1'>
            {pendiente && !reenviado ? (
              <button
                onClick={handleReenviar}
                disabled={cargando}
                className='inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40'
                title={`Reenviar invitación a ${usuario.email}`}
                aria-label={`Reenviar invitación a ${nombreCompleto}`}
              >
                <Mail className='h-3.5 w-3.5' />
                {cargando ? 'Enviando...' : 'Reenviar'}
              </button>
            ) : pendiente && reenviado ? (
              <span className='text-xs text-green-600 dark:text-green-400'>
                ✓ Enviado
              </span>
            ) : null}
            <button
              onClick={onEditar}
              className={styles.tabla.actionButton}
              title={`Editar ${nombreCompleto}`}
              aria-label={`Editar ${nombreCompleto}`}
            >
              <Pencil className='h-4 w-4' />
            </button>
          </div>
        </td>
      ) : null}
    </tr>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonTabla() {
  return (
    <div className={styles.tabla.container}>
      <div className={styles.tabla.wrapper}>
        <table className={styles.tabla.table}>
          <thead className={styles.tabla.thead}>
            <tr>
              {['Usuario', 'Email', 'Rol', 'Estado', 'Último acceso', ''].map(
                h => (
                  <th key={h} className={styles.tabla.th}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className={styles.tabla.tbody}>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className={styles.tabla.tr}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className={styles.tabla.td}>
                    <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  hayFiltrosActivos: boolean
  canCreate: boolean
  onNuevo?: () => void
}

function EmptyState({
  hayFiltrosActivos,
  canCreate,
  onNuevo,
}: EmptyStateProps) {
  return (
    <div className={styles.empty.container}>
      <div className={styles.empty.iconWrapper}>
        <UserPlus className={styles.empty.icon} />
      </div>
      <p className={styles.empty.title}>
        {hayFiltrosActivos ? 'Sin resultados' : 'No hay usuarios'}
      </p>
      <p className={styles.empty.subtitle}>
        {hayFiltrosActivos
          ? 'Ningún usuario coincide con los filtros actuales.'
          : 'Aún no hay usuarios registrados en el sistema.'}
      </p>
      {!hayFiltrosActivos && canCreate && onNuevo ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNuevo}
          className='mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:from-indigo-700 hover:to-purple-700'
        >
          <UserPlus className='h-4 w-4' />
          Crear primer usuario
        </motion.button>
      ) : null}
    </div>
  )
}
