'use client'

import { useState } from 'react'

import { useEditorState, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import {
  Bold,
  Check,
  Highlighter,
  Italic,
  Link2,
  Link2Off,
  Strikethrough,
  Underline,
} from 'lucide-react'

import { BotonFormato } from './BotonFormato'

/** "www.banco.com" → "https://www.banco.com"; vacío si no parece dirección */
function normalizarUrl(texto: string): string {
  const url = texto.trim()
  if (!url) return ''
  if (/^(https?:\/\/|mailto:)/i.test(url)) return url
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`
  return `https://${url}`
}

/**
 * Barra que aparece sobre el texto seleccionado: formato rápido y enlace,
 * como en Google Docs o Notion.
 */
export function BarraFlotante({ editor }: { editor: Editor }) {
  const [editandoEnlace, setEditandoEnlace] = useState(false)
  const [url, setUrl] = useState('')

  const estado = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      highlight: e.isActive('highlight'),
      enlace: e.isActive('link'),
      href: (e.getAttributes('link').href as string | undefined) ?? '',
    }),
  })
  const cadena = () => editor.chain().focus()

  const abrirEnlace = () => {
    setUrl(estado.href)
    setEditandoEnlace(true)
  }
  const aplicarEnlace = () => {
    const href = normalizarUrl(url)
    if (href) cadena().extendMarkRange('link').setLink({ href }).run()
    else cadena().extendMarkRange('link').unsetLink().run()
    setEditandoEnlace(false)
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: 'top',
        offset: 8,
        flip: true,
        shift: true,
        // Al cambiar la selección, la barra vuelve a sus botones
        onHide: () => setEditandoEnlace(false),
      }}
      // Solo con texto seleccionado (no en una selección de bloque vacía)
      shouldShow={({ state, from, to }) =>
        from !== to && state.doc.textBetween(from, to).trim().length > 0
      }
      className='z-10 flex items-center gap-0.5 rounded-xl bg-slate-900 p-1 shadow-xl shadow-slate-900/30 ring-1 ring-white/10 dark:bg-slate-950'
    >
      {editandoEnlace ? (
        <form
          onSubmit={e => {
            e.preventDefault()
            aplicarEnlace()
          }}
          className='flex items-center gap-1'
        >
          <input
            autoFocus
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                // Que no cierre la modal: solo cancela el enlace
                e.preventDefault()
                e.stopPropagation()
                setEditandoEnlace(false)
                editor.commands.focus()
              }
            }}
            placeholder='Pega o escribe la dirección'
            aria-label='Dirección del enlace'
            className='h-8 w-56 rounded-lg bg-white/10 px-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-violet-400'
          />
          <button
            type='submit'
            aria-label='Aplicar enlace'
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500 text-white hover:bg-violet-400'
          >
            <Check className='h-4 w-4' />
          </button>
        </form>
      ) : (
        <>
          <BotonFormato
            tono='oscuro'
            icon={Bold}
            label='Negrita'
            atajo='Ctrl+B'
            active={estado.bold}
            onClick={() => cadena().toggleBold().run()}
          />
          <BotonFormato
            tono='oscuro'
            icon={Italic}
            label='Cursiva'
            atajo='Ctrl+I'
            active={estado.italic}
            onClick={() => cadena().toggleItalic().run()}
          />
          <BotonFormato
            tono='oscuro'
            icon={Underline}
            label='Subrayado'
            atajo='Ctrl+U'
            active={estado.underline}
            onClick={() => cadena().toggleUnderline().run()}
          />
          <BotonFormato
            tono='oscuro'
            icon={Strikethrough}
            label='Tachado'
            active={estado.strike}
            onClick={() => cadena().toggleStrike().run()}
          />
          <BotonFormato
            tono='oscuro'
            icon={Highlighter}
            label='Resaltar'
            active={estado.highlight}
            onClick={() => cadena().toggleHighlight().run()}
          />
          <span className='mx-0.5 h-5 w-px bg-white/15' />
          {estado.enlace ? (
            <>
              <BotonFormato
                tono='oscuro'
                icon={Link2}
                label='Editar enlace'
                active
                onClick={abrirEnlace}
              />
              <BotonFormato
                tono='oscuro'
                icon={Link2Off}
                label='Quitar enlace'
                onClick={() =>
                  cadena().extendMarkRange('link').unsetLink().run()
                }
              />
            </>
          ) : (
            <BotonFormato
              tono='oscuro'
              icon={Link2}
              label='Agregar enlace'
              onClick={abrirEnlace}
            />
          )}
        </>
      )}
    </BubbleMenu>
  )
}
