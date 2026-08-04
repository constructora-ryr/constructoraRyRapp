'use client'

import { Check, ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

export interface FilterOption {
  value: string
  label: string
  /** Clase CSS de color para el punto indicador (ej. 'bg-emerald-400') */
  dot?: string
}

interface FilterDropdownProps {
  value: string
  placeholder: string
  options: FilterOption[]
  onChange: (value: string) => void
  /** Valor que representa "sin filtro activo" (default: '') */
  allValue?: string
  align?: 'start' | 'center' | 'end'
}

export function FilterDropdown({
  value,
  placeholder,
  options,
  onChange,
  allValue = '',
  align = 'start',
}: FilterDropdownProps) {
  const selected = options.find(o => o.value === value)
  const isActive = value !== allValue

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={[
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all focus:outline-none',
            isActive
              ? 'border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-500/70 dark:bg-orange-900/20 dark:text-orange-300'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800/70',
          ].join(' ')}
        >
          {selected?.dot && isActive && (
            <span className={`h-2 w-2 shrink-0 rounded-full ${selected.dot}`} />
          )}
          <span>{selected?.label ?? placeholder}</span>
          <ChevronDown className='h-3.5 w-3.5 shrink-0 opacity-50' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className='min-w-[190px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800'
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className='flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700'
          >
            {option.dot ? (
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${option.dot} ${option.value === allValue ? 'invisible' : ''}`}
              />
            ) : (
              <span className='h-2 w-2 shrink-0' />
            )}
            <span className='flex-1'>{option.label}</span>
            {option.value === value && (
              <Check className='h-3.5 w-3.5 shrink-0 text-orange-500' />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
