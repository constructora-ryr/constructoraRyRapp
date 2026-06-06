'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Check, ChevronDown, Search, X } from 'lucide-react'

interface EntidadOption {
  value: string
  label: string
}

interface EntidadComboboxProps {
  opciones: EntidadOption[]
  value: string
  onChange: (value: string) => void
  /** Callback adicional que recibe el objeto completo {value: UUID, label: nombre} al seleccionar */
  onSelectOption?: (opt: EntidadOption) => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  error?: boolean
}

export function EntidadCombobox({
  opciones,
  value,
  onChange,
  onSelectOption,
  disabled = false,
  loading = false,
  placeholder = 'Buscar entidad...',
  error = false,
}: EntidadComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => opciones.find(o => o.label === value || o.value === value),
    [opciones, value]
  )

  const filtered = useMemo(() => {
    if (!searchTerm) return opciones
    const term = searchTerm.toLowerCase().trim()
    return opciones.filter(o => o.label.toLowerCase().includes(term))
  }, [opciones, searchTerm])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchTerm])

  useEffect(() => {
    if (isOpen && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [highlightedIndex, isOpen])

  const handleSelect = (opt: EntidadOption) => {
    onChange(opt.label)
    onSelectOption?.(opt)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(0)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setHighlightedIndex(0)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[highlightedIndex]) handleSelect(filtered[highlightedIndex])
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const borderColor = error
    ? 'border-red-500 dark:border-red-600 focus-within:ring-red-500/20'
    : isOpen
      ? 'border-cyan-500 dark:border-cyan-600 ring-2 ring-cyan-500/20'
      : 'border-gray-200 dark:border-gray-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20'

  return (
    <div ref={wrapperRef} className='relative'>
      <div
        className={`flex w-full items-center rounded-lg border-2 bg-white transition-all duration-200 dark:bg-gray-900 ${borderColor} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <Search className='ml-3 h-4 w-4 flex-shrink-0 text-gray-400' />
        <input
          ref={inputRef}
          type='text'
          value={isOpen ? searchTerm : (selectedOption?.label ?? '')}
          onChange={e => {
            setSearchTerm(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            setSearchTerm('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Cargando...' : placeholder}
          disabled={disabled || loading}
          className='flex-1 bg-transparent px-2 py-2 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500'
        />
        <div className='flex items-center gap-0.5 pr-2'>
          {value && !disabled && (
            <button
              type='button'
              onClick={handleClear}
              className='rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              <X className='h-3.5 w-3.5 text-gray-400' />
            </button>
          )}
          <button
            type='button'
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className='rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
          >
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className='absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-2xl shadow-cyan-500/10 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800'
          >
            {filtered.length > 0 ? (
              <>
                <div className='border-b border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900'>
                  <p className='text-[10px] font-medium text-gray-500 dark:text-gray-400'>
                    {filtered.length} entidad{filtered.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div
                  ref={listRef}
                  className='max-h-[220px] overflow-y-auto p-1.5'
                >
                  {filtered.map((opt, index) => {
                    const isSelected =
                      opt.label === value || opt.value === value
                    const isHighlighted = index === highlightedIndex
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => handleSelect(opt)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all ${
                          isHighlighted
                            ? 'bg-cyan-50 dark:bg-cyan-900/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <Building2
                          className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-cyan-500' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-sm ${isSelected ? 'font-semibold text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white'}`}
                        >
                          {opt.label}
                        </span>
                        {isSelected && (
                          <Check className='ml-auto h-4 w-4 flex-shrink-0 text-cyan-500' />
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className='p-4 text-center'>
                <Building2 className='mx-auto mb-1 h-8 w-8 text-gray-300 dark:text-gray-600' />
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {searchTerm ? 'No se encontraron entidades' : 'Sin opciones'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
