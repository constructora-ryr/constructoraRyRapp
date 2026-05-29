'use client'

import { Suspense, useEffect, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

import { loginStyles } from './page.styles'
import { ResetPasswordModal } from './reset-password-modal'
import { useLogin } from './useLogin'

const { classes: s, texts: t, animations: a, inlineStyles } = loginStyles

function LoginForm() {
  const {
    email,
    password,
    loading,
    error,
    estaBloqueado,
    minutosRestantes,
    intentosRestantes,
    loginExitoso,
    recordarUsuario,
    setEmail,
    setPassword,
    setRecordarUsuario,
    handleSubmit,
  } = useLogin()

  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // ✅ Refs para autofocus inteligente
  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // ✅ Autofocus inteligente: Si hay email guardado -> password, si no -> email
  useEffect(() => {
    // Esperar a que recordarUsuario y email estén inicializados desde el hook
    const timer = setTimeout(() => {
      if (recordarUsuario && email) {
        // Si hay email guardado, hacer foco en la contraseña
        passwordInputRef.current?.focus()
      } else {
        // Si no hay email guardado, hacer foco en el email
        emailInputRef.current?.focus()
      }
    }, 150) // Aumentar el delay para asegurar que el hook haya cargado el email

    return () => clearTimeout(timer)
  }, [recordarUsuario, email]) // ✅ Ejecutar cuando recordarUsuario o email cambien

  // Mostrar toast cuando login es exitoso
  // ❌ DESACTIVADO: Ahora usamos toast moderno personalizado en useLogin.ts
  // useEffect(() => {
  //   if (loginExitoso) {
  //     setShowToast(true)
  //   }
  // }, [loginExitoso])

  return (
    <div className={s.container}>
      {/* Fondo personalizado - FULL WIDTH */}
      <div className={s.backgroundWrapper}>
        <Image
          src='/images/fondo-login.png'
          alt='Fondo Constructora RyR'
          fill
          sizes='100vw'
          className={s.backgroundImage}
          priority
          fetchPriority='low'
          quality={90}
        />
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className={s.overlay} />
      </div>

      {/* Contenido del login - ABSOLUTAMENTE CENTRADO */}
      <div className={s.content}>
        {/* Branding - Logo principal centrado */}
        <motion.div {...a.branding} className={s.brandingContainer}>
          {/* Logo principal - versión dark optimizada */}
          <div className={s.logo1Container}>
            <Image
              src='/images/logo1-dark.png'
              alt='Logo Constructora RyR'
              fill
              sizes='(max-width: 640px) 280px, (max-width: 1024px) 400px, 600px'
              className={s.logo1Image}
              style={inlineStyles.logo1Filter}
              priority
              fetchPriority='high'
            />
          </div>

          <h2 className={s.mainTitle}>{t.systemTitle}</h2>
        </motion.div>

        {/* Formulario - Centrado debajo de los logos */}
        <motion.div {...a.form} className={s.formWrapper}>
          <div className={s.formCard}>
            {/* Logo secundario dentro del formulario */}
            <div className={s.logo2Container}>
              <Image
                src='/images/logo2-dark.png'
                alt='Logo Constructora RyR 2'
                fill
                sizes='(max-width: 768px) 100vw, 600px'
                className={s.logo2Image}
                style={inlineStyles.logo2Filter}
              />
            </div>

            <div className={s.formHeader}>
              <h1 className={s.formTitle}>{t.welcome}</h1>
              <p className={s.formSubtitle}>{t.loginSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className={s.form}>
              <div>
                <label className={s.label}>{t.emailLabel}</label>
                <div className={s.inputGroup}>
                  <div className={s.iconWrapper}>
                    <Mail className={s.icon} />
                  </div>
                  <input
                    ref={emailInputRef}
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading || loginExitoso}
                    className={s.inputWithIcon}
                    style={inlineStyles.emailInput}
                    placeholder={t.emailPlaceholder}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={s.label}>{t.passwordLabel}</label>
                <div className={s.inputGroup}>
                  <div className={s.iconWrapper}>
                    <Lock className={s.icon} />
                  </div>
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading || loginExitoso}
                    className={s.passwordInput}
                    placeholder={t.passwordPlaceholder}
                    required
                    minLength={6}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={s.togglePasswordBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className={s.icon} />
                    ) : (
                      <Eye className={s.icon} />
                    )}
                  </button>
                </div>
              </div>

              {/* Recordar usuario */}
              <div className={s.checkboxContainer}>
                <input
                  type='checkbox'
                  id='recordar-usuario'
                  checked={recordarUsuario}
                  onChange={e => setRecordarUsuario(e.target.checked)}
                  className={s.checkbox}
                />
                <label htmlFor='recordar-usuario' className={s.checkboxLabel}>
                  {t.rememberMe}
                </label>
              </div>

              {error && (
                <motion.div
                  {...a.error}
                  className={`${s.errorContainer} ${
                    estaBloqueado
                      ? s.errorBlocked
                      : intentosRestantes <= 2 && intentosRestantes > 0
                        ? s.errorWarning
                        : s.errorNormal
                  }`}
                >
                  <div
                    className={`${s.errorIconWrapper} ${
                      estaBloqueado
                        ? s.errorIconBgBlocked
                        : intentosRestantes <= 2 && intentosRestantes > 0
                          ? s.errorIconBgWarning
                          : s.errorIconBgNormal
                    }`}
                  >
                    <AlertCircle className={s.icon} />
                  </div>
                  <div className={s.errorContent}>
                    <p className={s.errorMessage}>{error}</p>
                    {intentosRestantes > 0 &&
                      intentosRestantes <= 2 &&
                      !estaBloqueado && (
                        <p className={s.errorHint}>{t.errorHint}</p>
                      )}
                  </div>
                </motion.div>
              )}

              <button
                type='submit'
                disabled={loading || estaBloqueado || loginExitoso}
                className={`${s.submitButton} ${
                  estaBloqueado
                    ? s.submitBlocked
                    : loginExitoso
                      ? s.submitSuccess
                      : s.submitNormal
                }`}
              >
                {loginExitoso ? (
                  <span className={s.submitContent}>
                    <svg
                      className={s.checkIcon}
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    {t.loginSuccess}
                  </span>
                ) : loading ? (
                  <span className={s.submitContent}>
                    <svg
                      className={s.spinner}
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
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    {t.validating}
                  </span>
                ) : estaBloqueado ? (
                  `${t.blockedPrefix}${minutosRestantes}${t.blockedSuffix}`
                ) : (
                  t.loginButton
                )}
              </button>
            </form>

            <div className={s.resetPasswordContainer}>
              <button
                onClick={() => setShowResetPassword(true)}
                className={s.resetPasswordBtn}
              >
                {t.forgotPassword}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de Reset Password */}
      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />

      {/* ❌ OVERLAY REMOVIDO - Usamos spinner inline en el botón */}

      {/* ❌ TOAST VIEJO DESACTIVADO - Ahora usamos toast moderno en useLogin.ts */}
      {/* <Toast
        show={showToast}
        message={mensajeExito}
        onClose={() => setShowToast(false)}
        type="success"
        duration={2000}
      /> */}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={s.loadingFallback}>
          <div className={s.loadingText}>{t.loading}</div>
        </div>
      }
    >
      {/* ✅ SOLUCIÓN: Wrapper con key para forzar remontaje */}
      <LoginFormWrapper />
    </Suspense>
  )
}

// ✅ Wrapper para obtener searchParams y aplicar key
function LoginFormWrapper() {
  const searchParams = useSearchParams()
  const timestamp = searchParams?.get('_t') || 'initial'

  // ✅ Key cambia después de logout, forzando remontaje completo
  return <LoginForm key={timestamp} />
}
