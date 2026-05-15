/**
 * NuevoUsuarioView — Formulario de creación de usuario
 * ✅ Página propia (REGLA #-11)
 * ✅ Validación inline
 * ✅ Muestra contraseña temporal si fue generada
 */

'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Mail,
  Save,
  Send,
  UserPlus,
} from 'lucide-react'

import { useNuevoUsuario } from '../hooks/useNuevoUsuario'
import { usuariosPageStyles as styles } from '../styles/usuarios-page.styles'
import { ROLES_UI, type Rol } from '../types'

export function NuevoUsuarioView() {
  const {
    form,
    errores,
    cargando,
    passwordTemporal,
    invitacionEnviada,
    handleChange,
    handleSubmit,
    handleVolver,
    handlePasswordConfirmado,
  } = useNuevoUsuario()

  const s = styles.formulario

  // ── Estado éxito: mostrar contraseña temporal ────────────────────────────
  if (passwordTemporal) {
    return (
      <div className={s.page}>
        <div className={s.content}>
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
                <CheckCircle className={s.headerIconInner} />
              </div>
              <div>
                <h1 className={s.headerTitle}>¡Usuario creado exitosamente!</h1>
                <p className={s.headerSubtitle}>
                  Comparte la contraseña temporal de forma segura
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card con contraseña */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={s.card}
          >
            <div className={s.alertSuccess}>
              <p className={s.alertSuccessTitle}>
                <CheckCircle className={s.alertSuccessIcon} />
                Contraseña temporal generada
              </p>
              <p className={s.alertSuccessText}>
                Esta contraseña solo se muestra una vez. El usuario deberá
                cambiarla al iniciar sesión.
              </p>
              <code className={s.alertSuccessCode}>{passwordTemporal}</code>
              <p className={s.alertSuccessHint}>
                Copia la contraseña antes de continuar — no se puede recuperar.
              </p>
            </div>

            <div className={`${s.footer} mt-4`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePasswordConfirmado}
                className={s.submitButton}
              >
                <CheckCircle className={s.submitIcon} />
                Entendido, ir al listado
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Estado éxito: invitación enviada ────────────────────────────────────
  if (invitacionEnviada) {
    return (
      <div className={s.page}>
        <div className={s.content}>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={s.header}
          >
            <div className={s.headerPattern} />
            <div className={s.headerContent}>
              <div className={s.headerIcon}>
                <Send className={s.headerIconInner} />
              </div>
              <div>
                <h1 className={s.headerTitle}>¡Invitación enviada!</h1>
                <p className={s.headerSubtitle}>
                  El usuario recibirá un email para configurar su contraseña
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={s.card}
          >
            <div className='flex flex-col items-center gap-4 py-4 text-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                <CheckCircle className='h-8 w-8 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  Se envió un email a
                </p>
                <p className='mt-0.5 text-base font-semibold text-gray-900 dark:text-white'>
                  {invitacionEnviada}
                </p>
              </div>
              <div className='w-full rounded-lg border border-blue-100 bg-blue-50 p-3 text-left dark:border-blue-800/50 dark:bg-blue-900/20'>
                <div className='flex items-start gap-2'>
                  <Mail className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500' />
                  <p className='text-xs text-blue-700 dark:text-blue-400'>
                    El enlace vence en <strong>24 horas</strong>. Si no lo
                    recibe, revisa la carpeta de spam o re-envía la invitación
                    desde la lista de usuarios.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${s.footer} mt-2`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePasswordConfirmado}
                className={s.submitButton}
              >
                <CheckCircle className={s.submitIcon} />
                Ir al listado de usuarios
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

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
              <UserPlus className={s.headerIconInner} />
            </div>
            <div>
              <h1 className={s.headerTitle}>Nuevo Usuario</h1>
              <p className={s.headerSubtitle}>
                Crear cuenta de acceso al sistema de gestión
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
            {/* Error general */}
            {errores.general ? (
              <div className={s.alertError}>
                <AlertCircle className={s.alertIcon} />
                <span>{errores.general}</span>
              </div>
            ) : null}

            {/* Sección: Datos de acceso */}
            <p className={s.sectionTitle}>Datos de acceso</p>

            <div className={s.grid1}>
              <div className={s.field}>
                <label htmlFor='email' className={s.labelRequired}>
                  Email
                </label>
                <input
                  id='email'
                  type='email'
                  autoComplete='off'
                  placeholder='usuario@empresa.com'
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={errores.email ? s.inputError : s.input}
                />
                {errores.email ? (
                  <p className={s.errorText}>{errores.email}</p>
                ) : null}
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
                  placeholder='Juan Carlos'
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
                  placeholder='Pérez Gómez'
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
                  placeholder='+57 300 123 4567'
                  value={form.telefono}
                  onChange={e => handleChange('telefono', e.target.value)}
                  className={s.input}
                />
              </div>
            </div>

            {/* Sección: Rol y permisos */}
            <p className={s.sectionTitle}>Rol y permisos</p>

            <div className={s.grid1}>
              <div className={s.field}>
                <label htmlFor='rol' className={s.labelRequired}>
                  Rol
                </label>
                <select
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
                </select>
                <p className={s.helperText}>
                  El rol determina qué módulos y acciones puede realizar el
                  usuario.
                </p>
              </div>
            </div>

            {/* Aviso: invitación siempre se envía */}
            <div className='flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-800/50 dark:bg-blue-900/20'>
              <Mail className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500' />
              <p className='text-xs text-blue-700 dark:text-blue-400'>
                Se enviará un email de invitación al usuario para que establezca
                su propia contraseña. El enlace vence en{' '}
                <strong>24 horas</strong>.
              </p>
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
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className={s.submitIcon} />
                    Crear Usuario
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
