'use client'

/**
 * Solicitar el enlace para restablecer la contraseña (en la misma pantalla
 * del login). Siempre responde lo mismo, exista o no el correo, para no
 * revelar qué cuentas existen.
 */

import { useState, type FormEvent } from 'react'

import { AlertCircle, ArrowLeft, Loader2, Mail, MailCheck } from 'lucide-react'

import {
  AvisoAuth,
  BotonAuth,
  CampoAuth,
  EncabezadoAuth,
} from '@/components/auth/pantalla-auth'
import { supabase } from '@/lib/supabase/client'
import { traducirErrorSupabase } from '@/lib/utils/traducir-errores'
import { auditLogService } from '@/services/audit-log.service'

export function FormularioRecuperar({
  emailInicial,
  onVolver,
}: {
  emailInicial: string
  onVolver: () => void
}) {
  const [email, setEmail] = useState(emailInicial)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const { error: fallo } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setEnviando(false)
    if (fallo) {
      setError(traducirErrorSupabase(fallo.message))
      return
    }
    void auditLogService.logPasswordResetSolicitado(email)
    setEnviado(true)
  }

  return (
    <>
      <EncabezadoAuth
        titulo='Recupera tu contraseña'
        subtitulo='Te enviaremos un enlace para crear una nueva.'
      />

      {enviado ? (
        <AvisoAuth tono='exito' icon={MailCheck}>
          <p className='font-semibold'>Revisa tu correo</p>
          <p className='mt-0.5'>
            Si <strong>{email}</strong> tiene una cuenta, te llegará un enlace
            en unos minutos. Revisa también la carpeta de spam.
          </p>
        </AvisoAuth>
      ) : (
        <form onSubmit={enviar} className='space-y-4'>
          <CampoAuth
            id='recuperar-email'
            label='Correo electrónico'
            icon={Mail}
            type='email'
            autoComplete='username'
            inputMode='email'
            placeholder='tu@correo.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={enviando}
            autoFocus
            required
          />
          {error ? (
            <AvisoAuth tono='error' icon={AlertCircle}>
              {error}
            </AvisoAuth>
          ) : null}
          <BotonAuth type='submit' disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Enviando…
              </>
            ) : (
              'Enviar enlace'
            )}
          </BotonAuth>
        </form>
      )}

      <button
        type='button'
        onClick={onVolver}
        className='mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
      >
        <ArrowLeft className='h-4 w-4' />
        Volver a iniciar sesión
      </button>
    </>
  )
}
