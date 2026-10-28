'use client'

import { memo, useState, type PointerEvent } from 'react'

import { motion } from 'framer-motion'

import type { DashboardStatsData } from '../hooks/useDashboardStats'
import { formatCOPCompact, formatMesCorto } from '../utils/dashboard-format'

const ANCHO = 240
const ALTO = 64
/** Aire arriba y abajo para que la línea no toque el borde */
const MARGEN = 6

interface SparklineRecaudoProps {
  data: DashboardStatsData['recaudoMensual']
}

/**
 * Tendencia de recaudo de 12 meses para el panel de marca: línea blanca que se
 * dibuja al cargar, área tenue debajo y un punto que late en el mes en curso.
 * Al pasar el cursor (o el dedo) muestra el mes y su recaudo; el detalle
 * accesible está en el gráfico "Recaudo mensual".
 */
function SparklineRecaudoComponent({ data }: SparklineRecaudoProps) {
  const [activo, setActivo] = useState<number | null>(null)

  if (data.length < 2) return null

  const max = Math.max(1, ...data.map(d => d.total))
  const puntos = data.map((d, i) => ({
    x: (i / (data.length - 1)) * ANCHO,
    y: ALTO - MARGEN - (d.total / max) * (ALTO - MARGEN * 2),
  }))
  const linea = puntos
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
  const area = `${linea} L${ANCHO},${ALTO} L0,${ALTO} Z`
  const ultimo = data.length - 1

  // Mes más cercano a la posición del puntero
  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect()
    const fraccion = (e.clientX - caja.left) / caja.width
    const i = Math.round(fraccion * ultimo)
    setActivo(Math.min(ultimo, Math.max(0, i)))
  }

  const marcado = activo ?? ultimo
  const punto = puntos[marcado]
  const pctX = (punto.x / ANCHO) * 100
  const mesActivo = activo !== null ? data[activo] : null

  return (
    <div>
      <div
        className='relative h-16 cursor-crosshair touch-pan-y'
        onPointerMove={alMover}
        onPointerDown={alMover}
        onPointerLeave={() => setActivo(null)}
      >
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          preserveAspectRatio='none'
          className='h-full w-full overflow-visible'
          aria-hidden
        >
          <defs>
            <linearGradient id='sparkline-area' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor='white' stopOpacity='0.3' />
              <stop offset='100%' stopColor='white' stopOpacity='0' />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill='url(#sparkline-area)'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          <motion.path
            d={linea}
            fill='none'
            stroke='white'
            strokeWidth={2}
            strokeLinejoin='round'
            strokeLinecap='round'
            vectorEffect='non-scaling-stroke'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Guía vertical del mes señalado */}
        {mesActivo && (
          <span
            aria-hidden
            className='pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-white/35'
            style={{ left: `${pctX}%` }}
          />
        )}

        {/* Punto: HTML para que no se deforme con el SVG. Late en el mes en
            curso; sigue al puntero cuando hay uno */}
        <span
          aria-hidden
          className='pointer-events-none absolute flex h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2'
          style={{ left: `${pctX}%`, top: `${(punto.y / ALTO) * 100}%` }}
        >
          {!mesActivo && (
            <span className='absolute inset-0 rounded-full bg-white opacity-75 motion-safe:animate-ping' />
          )}
          <span className='relative h-2.5 w-2.5 rounded-full bg-white ring-2 ring-red-700' />
        </span>

        {mesActivo && (
          <span
            className={`pointer-events-none absolute -top-9 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-xs font-semibold text-red-800 shadow-lg shadow-red-950/30 ${
              marcado < 2
                ? 'left-0'
                : marcado > ultimo - 2
                  ? 'right-0'
                  : '-translate-x-1/2'
            }`}
            style={
              marcado >= 2 && marcado <= ultimo - 2
                ? { left: `${pctX}%` }
                : undefined
            }
          >
            <span className='capitalize'>{formatMesCorto(mesActivo.mes)}</span>
            {' · '}
            {mesActivo.total > 0 ? formatCOPCompact(mesActivo.total) : '$0'}
          </span>
        )}
      </div>
      <div className='mt-1.5 flex justify-between text-[11px] font-medium uppercase tracking-wider text-white/80'>
        <span>{formatMesCorto(data[0].mes)}</span>
        <span>{formatMesCorto(data[ultimo].mes)}</span>
      </div>
    </div>
  )
}

export const SparklineRecaudo = memo(SparklineRecaudoComponent)
