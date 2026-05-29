/**
 * Estilos y configuraciones para la página de login
 * Constructora RyR - Sistema de Gestión Administrativa
 * ✅ SEPARACIÓN DE RESPONSABILIDADES: Todos los estilos centralizados
 */

export const loginStyles = {
  // Animaciones de entrada
  animations: {
    branding: {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6 },
    },
    form: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.3 },
    },
    error: {
      initial: { opacity: 0, scale: 0.95, y: -10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: -10 },
      transition: { duration: 0.2, ease: 'easeOut' as const },
    },
  },

  // Clases de Tailwind centralizadas
  classes: {
    // Layout principal
    container:
      'relative flex min-h-screen w-full items-center justify-center overflow-y-auto overflow-x-hidden py-8',
    backgroundWrapper: 'fixed inset-0 z-0 h-screen w-screen',
    backgroundImage: 'object-cover',
    overlay:
      'absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70',
    content:
      'relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center justify-center px-4',

    // Branding
    brandingContainer:
      'mb-8 flex w-full flex-col items-center justify-center space-y-4 text-center',
    logo1Container: 'relative h-28 w-full max-w-md',
    logo1Image: 'object-contain drop-shadow-2xl',
    mainTitle:
      'mt-4 max-w-xl text-2xl font-bold text-white drop-shadow-lg lg:text-3xl',

    // Formulario
    formWrapper: 'w-full max-w-md',
    formCard:
      'rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl',
    logo2Container: 'relative mb-6 h-16 w-full',
    logo2Image: 'object-contain drop-shadow-xl',
    formHeader: 'mb-8 text-center',
    formTitle: 'mb-2 text-3xl font-bold text-white drop-shadow-md',
    formSubtitle: 'text-white/80',
    form: 'space-y-5',

    // Inputs
    inputGroup: 'relative',
    label: 'mb-2 block text-sm font-medium text-white/90',
    iconWrapper:
      'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5',
    icon: 'h-5 w-5 text-white/60',
    inputWithIcon:
      'w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-100',
    passwordInput:
      'w-full rounded-lg border border-white/20 bg-white/10 py-3 pl-11 pr-12 text-white placeholder-white/50 backdrop-blur-sm transition-all focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-70 disabled:cursor-not-allowed',

    // Toggle password
    togglePasswordBtn:
      'absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/70 transition-all hover:bg-white/10 hover:text-white',

    // Checkbox
    checkboxContainer: 'flex items-center gap-2',
    checkbox:
      'h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-red-600 transition-all focus:ring-2 focus:ring-white/20 focus:ring-offset-0',
    checkboxLabel:
      'cursor-pointer select-none text-sm text-white/80 transition-colors hover:text-white',

    // Error
    errorContainer:
      'flex items-start gap-3 rounded-lg border p-4 backdrop-blur-md shadow-lg',
    errorBlocked: 'border-red-500/50 bg-red-500/20 text-red-50',
    errorWarning: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-50',
    errorNormal: 'border-red-500/40 bg-red-500/15 text-red-100',
    errorIconWrapper: 'flex-shrink-0 rounded-lg p-1.5',
    errorIconBgBlocked: 'bg-red-500/30',
    errorIconBgWarning: 'bg-yellow-500/30',
    errorIconBgNormal: 'bg-red-500/20',
    errorContent: 'flex-1 space-y-1',
    errorMessage: 'text-sm font-medium leading-relaxed',
    errorHint: 'text-xs opacity-90',

    // Botón submit
    submitButton:
      'w-full rounded-lg py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50',
    submitBlocked: 'bg-gradient-to-r from-red-800 to-red-900',
    submitSuccess: 'bg-gradient-to-r from-green-600 to-green-700',
    submitNormal:
      'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600',
    submitContent: 'flex items-center justify-center gap-2',
    spinner: 'h-5 w-5 animate-spin',
    checkIcon: 'h-5 w-5',

    // Reset password
    resetPasswordContainer: 'mt-6 text-center',
    resetPasswordBtn:
      'text-sm text-blue-300 transition-colors hover:text-blue-200 hover:underline',

    // Loading fallback
    loadingFallback: 'flex min-h-screen items-center justify-center',
    loadingText: 'text-white',
  },

  // Textos
  texts: {
    welcome: 'Bienvenido',
    systemTitle:
      'Bienvenido al Sistema de Gestión Administrativa de la Constructora RyR',
    loginSubtitle: 'Inicia sesión en tu cuenta',
    emailLabel: 'Email',
    emailPlaceholder: 'tu@email.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: '••••••••',
    rememberMe: 'Recordar mi correo electrónico',
    loginButton: 'Iniciar Sesión',
    loginSuccess: '¡Inicio Exitoso!',
    validating: 'Validando...',
    forgotPassword: '¿Olvidaste tu contraseña?',
    loading: 'Cargando...',
    blockedPrefix: '🔒 Bloqueado (',
    blockedSuffix: ' min)',
    errorHint: 'Por favor, verifica tus credenciales cuidadosamente.',
  },

  // Estilos inline (para casos que no pueden ser className)
  inlineStyles: {
    emailInput: {
      WebkitTextFillColor: 'white',
      opacity: 1,
    },
    logo1Filter: {
      filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))',
    },
    logo2Filter: {
      filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))',
    },
  },
}
