'use client'

import { type SelectHTMLAttributes, forwardRef } from 'react'

import { ChevronDown } from 'lucide-react'

/**
 * Wrapper sobre <select> nativo que elimina el indicador del SO
 * y añade un chevron consistente con el design system.
 *
 * Preserva todos los className y props del select original —
 * sólo agrega `appearance-none pr-8` y el ícono absolutamente posicionado.
 */

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement>

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className = '', children, ...props }, ref) => (
    <div className='relative'>
      <select
        ref={ref}
        className={`appearance-none pr-8 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className='pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500' />
    </div>
  )
)
FormSelect.displayName = 'FormSelect'
