'use client'

import { useEffect, useState, type MutableRefObject } from 'react'

import type { ChainedCommands, Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import {
  Heading2,
  Heading3,
  Highlighter,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  type LucideIcon,
} from 'lucide-react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/utils/helpers'

/** Manejador de teclas que el editor consulta antes de procesar la tecla */
export type ManejadorTeclas = (evento: KeyboardEvent) => boolean

interface Comando {
  id: string
  label: string
  descripcion: string
  icon: LucideIcon
  /** Otras palabras con las que se encuentra */
  alias: string[]
  aplicar: (c: ChainedCommands) => ChainedCommands
}

const COMANDOS: Comando[] = [
  {
    id: 'texto',
    label: 'Texto',
    descripcion: 'Párrafo normal',
    icon: Pilcrow,
    alias: ['parrafo', 'normal'],
    aplicar: c => c.setParagraph(),
  },
  {
    id: 'titulo',
    label: 'Título',
    descripcion: 'Encabezado de sección',
    icon: Heading2,
    alias: ['h2', 'encabezado'],
    aplicar: c => c.setHeading({ level: 2 }),
  },
  {
    id: 'subtitulo',
    label: 'Subtítulo',
    descripcion: 'Encabezado más pequeño',
    icon: Heading3,
    alias: ['h3'],
    aplicar: c => c.setHeading({ level: 3 }),
  },
  {
    id: 'vinetas',
    label: 'Lista de viñetas',
    descripcion: 'Puntos sin orden',
    icon: List,
    alias: ['lista', 'puntos'],
    aplicar: c => c.toggleBulletList(),
  },
  {
    id: 'numerada',
    label: 'Lista numerada',
    descripcion: 'Pasos en orden: 1, 2, 3',
    icon: ListOrdered,
    alias: ['lista', 'numeros', 'pasos'],
    aplicar: c => c.toggleOrderedList(),
  },
  {
    id: 'cita',
    label: 'Cita',
    descripcion: 'Lo que dijo alguien, tal cual',
    icon: Quote,
    alias: ['comillas', 'dijo'],
    aplicar: c => c.toggleBlockquote(),
  },
  {
    id: 'resaltado',
    label: 'Resaltado',
    descripcion: 'Lo que escribas sale en amarillo',
    icon: Highlighter,
    alias: ['marcar', 'amarillo', 'importante'],
    aplicar: c => c.setMark('highlight'),
  },
]

const ALTO_MENU = 320

const normalizar = (texto: string) =>
  texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function filtrar(texto: string): Comando[] {
  const q = normalizar(texto)
  if (!q) return COMANDOS
  return COMANDOS.filter(c =>
    [c.label, ...c.alias].some(p => normalizar(p).includes(q))
  )
}

/**
 * Menú de "/": al escribir "/" al inicio de una línea (o tras un espacio)
 * aparece la lista de bloques; se filtra escribiendo ("/lista") y se elige
 * con ↑ ↓ y Enter, o con el dedo.
 */
export function MenuComandos({
  editor,
  teclasRef,
}: {
  editor: Editor
  teclasRef: MutableRefObject<ManejadorTeclas | null>
}) {
  const consulta = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const { selection } = e.state
      if (!selection.empty || !e.isFocused) return null
      const { $from } = selection
      if ($from.parent.type.name !== 'paragraph') return null
      const antes = $from.parent.textBetween(0, $from.parentOffset)
      const m = /(?:^|\s)\/([\p{L}\p{N}]*)$/u.exec(antes)
      if (!m) return null
      return {
        texto: m[1],
        desde: $from.pos - m[1].length - 1,
        hasta: $from.pos,
      }
    },
  })

  const [indice, setIndice] = useState(0)
  // Esc cierra el menú para ese "/" (sigue escribiendo normal)
  const [descartadoEn, setDescartadoEn] = useState<number | null>(null)

  const opciones = consulta ? filtrar(consulta.texto) : []
  const visible =
    consulta !== null && opciones.length > 0 && consulta.desde !== descartadoEn

  useEffect(() => setIndice(0), [consulta?.texto])
  useEffect(() => {
    if (!consulta) setDescartadoEn(null)
  }, [consulta])

  const ejecutar = (comando: Comando) => {
    if (!consulta) return
    comando
      .aplicar(
        editor
          .chain()
          .focus()
          .deleteRange({ from: consulta.desde, to: consulta.hasta })
      )
      .run()
  }

  // El editor pregunta aquí antes de procesar cada tecla
  useEffect(() => {
    if (!visible || !consulta) {
      teclasRef.current = null
      return
    }
    teclasRef.current = evento => {
      switch (evento.key) {
        case 'ArrowDown':
          setIndice(i => (i + 1) % opciones.length)
          return true
        case 'ArrowUp':
          setIndice(i => (i - 1 + opciones.length) % opciones.length)
          return true
        case 'Enter':
        case 'Tab':
          ejecutar(opciones[Math.min(indice, opciones.length - 1)])
          return true
        case 'Escape':
          setDescartadoEn(consulta.desde)
          return true
        default:
          return false
      }
    }
    return () => {
      teclasRef.current = null
    }
  })

  if (!visible || !consulta) return null

  // Coordenadas en pantalla del "/": el menú va debajo, o arriba si no cabe
  const pos = editor.view.coordsAtPos(consulta.desde)
  const arriba = pos.bottom + ALTO_MENU > window.innerHeight
  const estilo = arriba
    ? { left: pos.left, bottom: window.innerHeight - pos.top + 6 }
    : { left: pos.left, top: pos.bottom + 6 }

  return createPortal(
    <div
      role='listbox'
      aria-label='Insertar bloque'
      style={{ ...estilo, maxHeight: ALTO_MENU }}
      // Encima de la modal (z-[500])
      className='fixed z-[600] w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-800'
    >
      <p className='px-2 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
        Insertar
      </p>
      {opciones.map((c, i) => {
        const Icono = c.icon
        const activo = i === indice
        return (
          <button
            key={c.id}
            type='button'
            role='option'
            aria-selected={activo}
            onMouseDown={e => e.preventDefault()}
            onMouseEnter={() => setIndice(i)}
            onClick={() => ejecutar(c)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors',
              activo
                ? 'bg-violet-50 dark:bg-violet-500/15'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border',
                activo
                  ? 'border-violet-200 bg-white text-violet-600 dark:border-violet-500/40 dark:bg-slate-900 dark:text-violet-300'
                  : 'border-slate-200 bg-white text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400'
              )}
            >
              <Icono className='h-4 w-4' />
            </span>
            <span className='min-w-0'>
              <span className='block text-sm font-medium text-slate-900 dark:text-white'>
                {c.label}
              </span>
              <span className='block truncate text-xs text-slate-500 dark:text-slate-400'>
                {c.descripcion}
              </span>
            </span>
          </button>
        )
      })}
    </div>,
    document.body
  )
}
