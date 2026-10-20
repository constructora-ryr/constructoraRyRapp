'use client'

import { memo, useEffect } from 'react'

import { animate, motion, useMotionValue, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  format?: (value: number) => string
}

const defaultFormat = (v: number) => Math.round(v).toLocaleString('es-CO')

function AnimatedCounterComponent({
  value,
  duration = 1,
  className,
  format = defaultFormat,
}: AnimatedCounterProps) {
  const count = useMotionValue(0)
  const display = useTransform(count, format)

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    })
    return controls.stop
  }, [count, value, duration])

  return <motion.span className={className}>{display}</motion.span>
}

export const AnimatedCounter = memo(AnimatedCounterComponent)
