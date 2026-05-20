'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'

import { useAuth } from '@/hooks/auth/useAuthQuery'

import { formatearNumeroRecibo } from '../../utils/formato-recibo'

// ─── Tipo local compatible con AbonoConInfo de useAbonosList ─────────────────
export interface AbonoParaDetalle {
  id: string
  numero_recibo: string
  monto: number
  fecha_abono: string
  metodo_pago: string
  numero_referencia: string | null
  comprobante_url: string | null
  notas: string | null
  fecha_creacion: string
  registrado_por_nombre?: string | null
  // Campos de anulación (opcionales: datos previos a la migración no los tienen)
  estado?: 'Activo' | 'Anulado'
  motivo_categoria?: string | null
  motivo_detalle?: string | null
  anulado_por_nombre?: string | null
  fecha_anulacion?: string | null
  negociacion: {
    id: string
    estado: 'Activa' | 'Suspendida' | 'Cerrada por Renuncia' | 'Completada'
  }
  cliente: {
    id: string
    nombres: string
    apellidos: string
    numero_documento: string
  }
  vivienda: {
    id: string
    numero: string
    manzana: { identificador: string }
  }
  proyecto: {
    id: string
    nombre: string
  }
  fuente_pago: {
    id: string
    tipo: string
  }
}

interface UseAbonoDetalleProps {
  abono: AbonoParaDetalle | null
  isOpen: boolean
  onClose: () => void
  onAnulado?: () => void
  /** Datos financieros de la negociación — pasados desde el parent para evitar fetch extra */
  negociacionFinancials?: {
    valorTotal: number
    totalAbonado: number
    saldoPendiente: number
  } | null
}

export function useAbonoDetalle({
  abono,
  isOpen,
  onClose,
  onAnulado,
  negociacionFinancials,
}: UseAbonoDetalleProps) {
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null)
  const [loadingComprobante, setLoadingComprobante] = useState(false)
  const [generandoRecibo, setGenerandoRecibo] = useState(false)
  const [showModalAnular, setShowModalAnular] = useState(false)

  // Portal: montar solo en cliente (SSR-safe)
  const [mounted, setMounted] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Focus trap: mover foco al botón cerrar al abrir
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Construir URL del comprobante cuando cambia el abono
  useEffect(() => {
    if (!abono?.comprobante_url) {
      setComprobanteUrl(null)
      return
    }
    setLoadingComprobante(true)
    // La API route /api/abonos/comprobante hace redirect 302 al signed URL
    setComprobanteUrl(
      `/api/abonos/comprobante?path=${encodeURIComponent(abono.comprobante_url)}`
    )
    setLoadingComprobante(false)
  }, [abono?.comprobante_url])

  // Descargar el comprobante original
  const handleDescargarComprobante = useCallback(() => {
    if (!abono?.comprobante_url) return
    const url = `/api/abonos/comprobante?path=${encodeURIComponent(abono.comprobante_url)}`
    const link = document.createElement('a')
    link.href = url
    link.download = `comprobante-${formatearNumeroRecibo(abono.numero_recibo)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [abono])

  const { perfil } = useAuth()

  // Generar y descargar el recibo PDF (lazy import para no aumentar bundle)
  const handleGenerarRecibo = useCallback(async () => {
    if (!abono) return
    setGenerandoRecibo(true)
    try {
      const { generarYDescargarRecibo } = await import(
        '../recibo-pdf/generarReciboPDF'
      )
      await generarYDescargarRecibo(abono, {
        valorTotal: negociacionFinancials?.valorTotal,
        totalAbonado: negociacionFinancials?.totalAbonado,
        saldoPendiente: negociacionFinancials?.saldoPendiente,
        emisorNombre: perfil
          ? `${perfil.nombres} ${perfil.apellidos}`.trim()
          : undefined,
        emisorCargo: perfil?.rol ?? undefined,
      })
    } catch {
      toast.error('No se pudo generar el recibo PDF', {
        description: 'Intenta nuevamente o contacta soporte.',
      })
    } finally {
      setGenerandoRecibo(false)
    }
  }, [abono, negociacionFinancials, perfil])

  // Callback invocado por ModalAnularAbono cuando los datos cambian
  const handleAbonoAnulado = useCallback(() => {
    onAnulado?.()
  }, [onAnulado])

  const esAdmin = perfil?.rol === 'Administrador'
  const esNegociacionActiva = abono?.negociacion.estado === 'Activa'
  const estaAnulado = abono?.estado === 'Anulado'
  const tieneComprobante = Boolean(abono?.comprobante_url)

  // Valores derivados del abono (evitan cálculos en el componente)
  const esImagen = useMemo(
    () =>
      abono?.comprobante_url
        ? /\.(jpe?g|png|webp)$/i.test(abono.comprobante_url)
        : false,
    [abono?.comprobante_url]
  )

  const esPDF = useMemo(
    () =>
      abono?.comprobante_url ? /\.pdf$/i.test(abono.comprobante_url) : false,
    [abono?.comprobante_url]
  )

  const viviendaLabel = useMemo(() => {
    if (!abono) return ''
    return abono.vivienda.manzana.identificador
      ? `Mz.${abono.vivienda.manzana.identificador} Casa No. ${abono.vivienda.numero}`
      : `Casa No. ${abono.vivienda.numero}`
  }, [abono])

  return {
    mounted,
    closeButtonRef,
    comprobanteUrl,
    loadingComprobante,
    tieneComprobante,
    esImagen,
    esPDF,
    esNegociacionActiva,
    estaAnulado,
    generandoRecibo,
    showModalAnular,
    setShowModalAnular,
    esAdmin,
    viviendaLabel,
    handleDescargarComprobante,
    handleGenerarRecibo,
    handleAbonoAnulado,
  }
}
