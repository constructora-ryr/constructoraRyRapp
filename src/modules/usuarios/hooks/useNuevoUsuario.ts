/**
 * ============================================
 * HOOK: useNuevoUsuario
 * ============================================
 *
 * Lógica del formulario de creación de usuario.
 * Navega a /usuarios tras crear exitosamente,
 * o muestra la contraseña temporal si fue generada.
 */

'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import type { CrearUsuarioData, Rol } from '../types'

import { useCrearUsuarioMutation } from './useUsuariosQuery'

// ── Tipos ─────────────────────────────────────────────────────────────────

interface FormNuevoUsuario {
  email: string
  nombres: string
  apellidos: string
  telefono: string
  rol: Rol
  enviar_invitacion: boolean
}

type FormErrores = Partial<Record<keyof FormNuevoUsuario | 'general', string>>

// ── Hook ──────────────────────────────────────────────────────────────────

export function useNuevoUsuario() {
  const router = useRouter()
  const crearMutation = useCrearUsuarioMutation()

  const [form, setForm] = useState<FormNuevoUsuario>({
    email: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    rol: 'Contabilidad',
    enviar_invitacion: false,
  })

  const [errores, setErrores] = useState<FormErrores>({})
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null)
  const [invitacionEnviada, setInvitacionEnviada] = useState<string | null>(
    null
  )

  // ── Validación ──────────────────────────────────────────────────────────

  const validar = (): boolean => {
    const nuevos: FormErrores = {}

    if (!form.email.trim()) {
      nuevos.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevos.email = 'Email inválido'
    }

    if (!form.nombres.trim()) nuevos.nombres = 'Los nombres son obligatorios'
    if (!form.apellidos.trim())
      nuevos.apellidos = 'Los apellidos son obligatorios'

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleChange = (
    field: keyof FormNuevoUsuario,
    value: string | boolean
  ) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo al escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validar()) return

    const datos: CrearUsuarioData = {
      email: form.email.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      telefono: form.telefono.trim() || undefined,
      rol: form.rol,
      enviar_invitacion: form.enviar_invitacion,
    }

    crearMutation.mutate(datos, {
      onSuccess: respuesta => {
        if (respuesta.password_temporal) {
          setPasswordTemporal(respuesta.password_temporal)
        } else if (respuesta.invitacion_enviada) {
          setInvitacionEnviada(datos.email)
        } else {
          router.push('/usuarios')
        }
      },
      onError: (error: Error) => {
        setErrores(prev => ({ ...prev, general: error.message }))
      },
    })
  }

  const handleVolver = () => router.push('/usuarios')

  const handlePasswordConfirmado = () => router.push('/usuarios')

  // ── Return ───────────────────────────────────────────────────────────────

  return {
    form,
    errores,
    cargando: crearMutation.isPending,
    passwordTemporal,
    invitacionEnviada,
    handleChange,
    handleSubmit,
    handleVolver,
    handlePasswordConfirmado,
  }
}
