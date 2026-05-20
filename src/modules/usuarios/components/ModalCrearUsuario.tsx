'use client'

import { useState } from 'react'

import { AlertCircle, Mail, Send } from 'lucide-react'

import { logger } from '@/lib/utils/logger'

import {
  ROLES,
  type CrearUsuarioData,
  type CrearUsuarioRespuesta,
  type Rol,
} from '../types'

import { Modal } from './Modal'
import { usuariosStyles as styles } from './usuarios.styles'

interface ModalCrearUsuarioProps {
  isOpen: boolean
  onClose: () => void
  onCrear: (datos: CrearUsuarioData) => Promise<CrearUsuarioRespuesta>
}

export function ModalCrearUsuario({
  isOpen,
  onClose,
  onCrear,
}: ModalCrearUsuarioProps) {
  const [formulario, setFormulario] = useState<CrearUsuarioData>({
    email: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    rol: 'Contabilidad',
  })

  const [errores, setErrores] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(false)
  const [emailInvitado, setEmailInvitado] = useState<string | null>(null)

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    if (!formulario.email) {
      nuevosErrores.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      nuevosErrores.email = 'Email inválido'
    }

    if (!formulario.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios'
    }

    if (!formulario.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarFormulario()) return

    try {
      setCargando(true)
      await onCrear(formulario)
      setEmailInvitado(formulario.email)
    } catch (error) {
      logger.error('Error invitando usuario:', error)
      setErrores({
        general:
          error instanceof Error ? error.message : 'Error al enviar invitación',
      })
    } finally {
      setCargando(false)
    }
  }

  const handleCerrar = () => {
    setFormulario({
      email: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      rol: 'Contabilidad',
    })
    setErrores({})
    setEmailInvitado(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCerrar}
      title='Invitar Usuario'
      maxWidth='lg'
    >
      {/* ── Éxito: invitación enviada ── */}
      {emailInvitado ? (
        <div className='space-y-4'>
          <div className='flex flex-col items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-800 dark:bg-green-900/20'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/40'>
              <Send className='h-7 w-7 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-green-800 dark:text-green-300'>
                ¡Invitación enviada!
              </h3>
              <p className='mt-1 text-sm text-green-700 dark:text-green-400'>
                Se envió un email a{' '}
                <strong className='font-semibold'>{emailInvitado}</strong> con
                un enlace para que el usuario establezca su propia contraseña.
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-800/50 dark:bg-blue-900/20'>
            <div className='flex items-start gap-2'>
              <Mail className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500' />
              <p className='text-xs text-blue-700 dark:text-blue-400'>
                El enlace vence en <strong>24 horas</strong>. Si el usuario no
                lo recibe, revisa la carpeta de spam o re-envía la invitación
                desde la lista de usuarios.
              </p>
            </div>
          </div>

          <div className={styles.modal.footer}>
            <button onClick={handleCerrar} className={styles.button.primary}>
              Entendido
            </button>
          </div>
        </div>
      ) : (
        /* ── Formulario ── */
        <form onSubmit={handleSubmit} className='space-y-3'>
          {errores.general && (
            <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'>
              <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
              <span>{errores.general}</span>
            </div>
          )}

          {/* Email */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Email <span className={styles.form.labelRequired}>*</span>
            </label>
            <input
              type='email'
              className={styles.form.input}
              value={formulario.email}
              onChange={e =>
                setFormulario({ ...formulario, email: e.target.value })
              }
              placeholder='usuario@ejemplo.com'
            />
            {errores.email && (
              <p className={styles.form.error}>{errores.email}</p>
            )}
          </div>

          {/* Nombres */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Nombres <span className={styles.form.labelRequired}>*</span>
            </label>
            <input
              type='text'
              className={styles.form.input}
              value={formulario.nombres}
              onChange={e =>
                setFormulario({ ...formulario, nombres: e.target.value })
              }
              placeholder='Juan Carlos'
            />
            {errores.nombres && (
              <p className={styles.form.error}>{errores.nombres}</p>
            )}
          </div>

          {/* Apellidos */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Apellidos <span className={styles.form.labelRequired}>*</span>
            </label>
            <input
              type='text'
              className={styles.form.input}
              value={formulario.apellidos}
              onChange={e =>
                setFormulario({ ...formulario, apellidos: e.target.value })
              }
              placeholder='García Pérez'
            />
            {errores.apellidos && (
              <p className={styles.form.error}>{errores.apellidos}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>Teléfono</label>
            <input
              type='tel'
              className={styles.form.input}
              value={formulario.telefono}
              onChange={e =>
                setFormulario({ ...formulario, telefono: e.target.value })
              }
              placeholder='+57 300 123 4567'
            />
            <p className={styles.form.hint}>Opcional</p>
          </div>

          {/* Rol */}
          <div className={styles.form.group}>
            <label className={styles.form.label}>
              Rol <span className={styles.form.labelRequired}>*</span>
            </label>
            <select
              className={styles.form.select}
              value={formulario.rol}
              onChange={e =>
                setFormulario({ ...formulario, rol: e.target.value as Rol })
              }
            >
              {ROLES.map(rol => (
                <option key={rol.value} value={rol.value}>
                  {rol.label} - {rol.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className={styles.modal.footer}>
            <button
              type='button'
              onClick={handleCerrar}
              className={styles.button.secondary}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className={styles.button.primary}
              disabled={cargando}
            >
              {cargando ? (
                <span className='flex items-center gap-2'>
                  <svg
                    className='h-4 w-4 animate-spin'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Enviando...
                </span>
              ) : (
                <span className='flex items-center gap-2'>
                  <Send className='h-4 w-4' />
                  Enviar invitación
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
