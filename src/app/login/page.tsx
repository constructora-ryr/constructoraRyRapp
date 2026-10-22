'use client'

/**
 * Página de login: marco de acceso (foto + marca | formulario) con dos
 * vistas en la misma tarjeta, iniciar sesión y recuperar contraseña.
 */

import { Suspense, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'

import { useSearchParams } from 'next/navigation'

import { PantallaAuth } from '@/components/auth/pantalla-auth'
import { Cargador } from '@/shared/components/carga'

import { FormularioLogin } from './components/FormularioLogin'
import { FormularioRecuperar } from './components/FormularioRecuperar'

function Login({ restablecida }: { restablecida: boolean }) {
  const [recuperar, setRecuperar] = useState<{ email: string } | null>(null)

  return (
    <PantallaAuth>
      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={recuperar ? 'recuperar' : 'login'}
          initial={{ opacity: 0, x: recuperar ? 16 : -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: recuperar ? -16 : 16 }}
          transition={{ duration: 0.18 }}
        >
          {recuperar ? (
            <FormularioRecuperar
              emailInicial={recuperar.email}
              onVolver={() => setRecuperar(null)}
            />
          ) : (
            <FormularioLogin
              restablecida={restablecida}
              onOlvideContrasena={email => setRecuperar({ email })}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </PantallaAuth>
  )
}

/** Tras cerrar sesión llega ?_t=…: la key fuerza un formulario limpio */
function LoginConReinicio() {
  const params = useSearchParams()
  const marca = params?.get('_t') ?? 'inicial'
  return (
    <Login key={marca} restablecida={params?.get('restablecida') === '1'} />
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Cargador label='Cargando' className='min-h-dvh' />}>
      <LoginConReinicio />
    </Suspense>
  )
}
