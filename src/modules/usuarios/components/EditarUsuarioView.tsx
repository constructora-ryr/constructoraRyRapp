/**
 * EditarUsuarioView — Formulario de edición de usuario
 * ✅ Página propia (REGLA #-11)
 * ✅ Datos precargados desde useEditarUsuario
 * ✅ Email en solo lectura (no editable)
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Loader2, Save, UserCog } from 'lucide-react'

import { FormSelect } from '@/shared/components/ui/form-select'

import { useEditarUsuario } from '../hooks/useEditarUsuario'
import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'
import {
  ESTADOS_USUARIO_UI,
  ROLES_UI,
  getIniciales,
  type EstadoUsuario,
  type Rol,
} from '../types'

interface EditarUsuarioViewProps {
  id: string
}

export function EditarUsuarioView({ id }: EditarUsuarioViewProps) {
  const {
    usuario,
    form,
    errores,
    cargandoUsuario,
    cargando,
    errorCarga,
    handleChange,
    handleSubmit,
    handleVolver,
  } = useEditarUsuario(id)

  const s = styles.formulario

  // ── Loading ───────────────────────────────────────────────────────────────
  if (cargandoUsuario) {
    return (
      <div className={s.page}>
        <div className={s.content}>
          <div className='flex items-center justify-center py-20'>
            <div className='flex flex-col items-center gap-3'>
              <div className='border-3 h-10 w-10 animate-spin rounded-full border-indigo-500 border-t-transparent' />
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Cargando usuario...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error de carga o usuario no encontrado ────────────────────────────────
  if (errorCarga || !usuario) {
    return (
      <div className={s.page}>
        <div className={s.content}>
          <nav className={s.nav}>
            <button onClick={handleVolver} className={s.backButton}>
              <ArrowLeft className={s.backIcon} />
              Volver a Usuarios
            </button>
          </nav>
          <div className={`${s.card} py-12 text-center`}>
            <AlertCircle className='mx-auto mb-3 h-10 w-10 text-red-400' />
            <p className='text-sm font-semibold text-gray-900 dark:text-white'>
              Usuario no encontrado
            </p>
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
              El usuario solicitado no existe o no tienes permisos para
              editarlo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const iniciales = getIniciales(usuario)

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>
      <div className={s.content}>
        {/* Breadcrumb nav */}
        <nav className={s.nav}>
          <button onClick={handleVolver} className={s.backButton}>
            <ArrowLeft className={s.backIcon} />
            Volver a Usuarios
          </button>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={s.header}
        >
          <div className={s.headerPattern} />
          <div className={s.headerContent}>
            <div className={s.headerIcon}>
              <UserCog className={s.headerIconInner} />
            </div>
            <div>
              <h1 className={s.headerTitle}>Editar Usuario</h1>
              <p className={s.headerSubtitle}>
                Modifica los datos y permisos del usuario
              </p>
            </div>
          </div>
        </motion.div>

        {/* Card formulario */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={s.card}
        >
          <form onSubmit={handleSubmit} noValidate className={s.section}>
            {/* Info del usuario (solo lectura) */}
            <div className={s.infoCard}>
              <div className={s.infoIcon}>{iniciales}</div>
              <div>
                <p className={s.infoLabel}>Cuenta de acceso</p>
                <p className={s.infoValue}>{usuario.email}</p>
              </div>
            </div>

            {/* Sección: Datos personales */}
            <p className={s.sectionTitle}>Datos personales</p>

            <div className={s.grid2}>
              <div className={s.field}>
                <label htmlFor='nombres' className={s.labelRequired}>
                  Nombres
                </label>
                <input
                  id='nombres'
                  type='text'
                  value={form.nombres}
                  onChange={e => handleChange('nombres', e.target.value)}
                  className={errores.nombres ? s.inputError : s.input}
                />
                {errores.nombres ? (
                  <p className={s.errorText}>{errores.nombres}</p>
                ) : null}
              </div>

              <div className={s.field}>
                <label htmlFor='apellidos' className={s.labelRequired}>
                  Apellidos
                </label>
                <input
                  id='apellidos'
                  type='text'
                  value={form.apellidos}
                  onChange={e => handleChange('apellidos', e.target.value)}
                  className={errores.apellidos ? s.inputError : s.input}
                />
                {errores.apellidos ? (
                  <p className={s.errorText}>{errores.apellidos}</p>
                ) : null}
              </div>
            </div>

            <div className={s.grid1}>
              <div className={s.field}>
                <label htmlFor='telefono' className={s.label}>
                  Teléfono
                </label>
                <input
                  id='telefono'
                  type='tel'
                  value={form.telefono}
                  onChange={e => handleChange('telefono', e.target.value)}
                  className={s.input}
                />
              </div>
            </div>

            {/* Sección: Rol y estado */}
            <p className={s.sectionTitle}>Rol y estado</p>

            <div className={s.grid2}>
              <div className={s.field}>
                <label htmlFor='rol' className={s.labelRequired}>
                  Rol
                </label>
                <FormSelect
                  id='rol'
                  value={form.rol}
                  onChange={e => handleChange('rol', e.target.value as Rol)}
                  className={s.select}
                >
                  {ROLES_UI.map(rol => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div className={s.field}>
                <label htmlFor='estado' className={s.labelRequired}>
                  Estado
                </label>
                <FormSelect
                  id='estado'
                  value={form.estado}
                  onChange={e =>
                    handleChange('estado', e.target.value as EstadoUsuario)
                  }
                  className={s.select}
                >
                  {ESTADOS_USUARIO_UI.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>

            {/* Footer */}
            <div className={s.footer}>
              <button
                type='button'
                onClick={handleVolver}
                className={s.cancelButton}
                disabled={cargando}
              >
                Cancelar
              </button>
              <motion.button
                type='submit'
                whileHover={{ scale: cargando ? 1 : 1.02 }}
                whileTap={{ scale: cargando ? 1 : 0.98 }}
                disabled={cargando}
                className={s.submitButton}
              >
                {cargando ? (
                  <>
                    <Loader2 className={`${s.submitIcon} animate-spin`} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className={s.submitIcon} />
                    Guardar Cambios
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
