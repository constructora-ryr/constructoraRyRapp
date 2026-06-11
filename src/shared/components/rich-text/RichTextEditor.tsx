'use client'

import { useEffect, useRef } from 'react'

import HighlightExt from '@tiptap/extension-highlight'
import PlaceholderExt from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

type ToolbarButtonProps = {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type='button'
      title={title}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        active
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <span className='mx-0.5 h-5 w-px self-center bg-gray-200 dark:bg-gray-600' />
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  minHeight = '180px',
}: RichTextEditorProps) {
  // Rastrea el último HTML emitido por el editor para distinguir
  // cambios externos (carga de notaData) de cambios internos (el usuario escribe)
  const lastEmitted = useRef<string>(value || '')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      HighlightExt.configure({ multicolor: false }),
      PlaceholderExt.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const result = html === '<p></p>' ? '' : html
      lastEmitted.current = result
      onChange(result)
    },
    editorProps: {
      attributes: {
        class: 'outline-none',
      },
    },
    immediatelyRender: false,
  })

  // Sincronizar cuando el valor cambia externamente (ej: carga de notaData en modo edición)
  useEffect(() => {
    if (editor && value !== lastEmitted.current) {
      editor.commands.setContent(value || '', { emitUpdate: false })
      lastEmitted.current = value || ''
    }
  }, [editor, value])

  if (!editor) return null

  const e = editor

  return (
    <div className='overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 transition-colors focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800'>
      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-white px-2 py-1.5 dark:border-gray-700 dark:bg-gray-900'>
        {/* Formato básico */}
        <ToolbarButton
          onClick={() => e.chain().focus().toggleBold().run()}
          active={e.isActive('bold')}
          title='Negrita (Ctrl+B)'
        >
          <Bold className='h-3.5 w-3.5' strokeWidth={2.5} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => e.chain().focus().toggleItalic().run()}
          active={e.isActive('italic')}
          title='Cursiva (Ctrl+I)'
        >
          <Italic className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => e.chain().focus().toggleUnderline().run()}
          active={e.isActive('underline')}
          title='Subrayado (Ctrl+U)'
        >
          <Underline className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => e.chain().focus().toggleStrike().run()}
          active={e.isActive('strike')}
          title='Tachado'
        >
          <Strikethrough className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => e.chain().focus().toggleHighlight().run()}
          active={e.isActive('highlight')}
          title='Resaltar texto'
        >
          <Highlighter className='h-3.5 w-3.5' />
        </ToolbarButton>

        <Divider />

        {/* Encabezados */}
        <ToolbarButton
          onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()}
          active={e.isActive('heading', { level: 2 })}
          title='Título'
        >
          <Heading2 className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()}
          active={e.isActive('heading', { level: 3 })}
          title='Subtítulo'
        >
          <Heading3 className='h-3.5 w-3.5' />
        </ToolbarButton>

        <Divider />

        {/* Listas */}
        <ToolbarButton
          onClick={() => e.chain().focus().toggleBulletList().run()}
          active={e.isActive('bulletList')}
          title='Lista de viñetas'
        >
          <List className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => e.chain().focus().toggleOrderedList().run()}
          active={e.isActive('orderedList')}
          title='Lista numerada'
        >
          <ListOrdered className='h-3.5 w-3.5' />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => e.chain().focus().toggleBlockquote().run()}
          active={e.isActive('blockquote')}
          title='Cita'
        >
          <Quote className='h-3.5 w-3.5' />
        </ToolbarButton>
      </div>

      {/* Área de escritura */}
      <style>{`
        .tiptap-nota-editor .tiptap {
          min-height: ${minHeight};
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.6;
          color: inherit;
        }
        .tiptap-nota-editor .tiptap p { margin: 0 0 8px; }
        .tiptap-nota-editor .tiptap p:last-child { margin-bottom: 0; }
        .tiptap-nota-editor .tiptap h2 { font-size: 16px; font-weight: 700; margin: 12px 0 6px; }
        .tiptap-nota-editor .tiptap h3 { font-size: 14px; font-weight: 700; margin: 10px 0 4px; }
        .tiptap-nota-editor .tiptap strong { font-weight: 700; }
        .tiptap-nota-editor .tiptap em { font-style: italic; }
        .tiptap-nota-editor .tiptap u { text-decoration: underline; }
        .tiptap-nota-editor .tiptap s { text-decoration: line-through; }
        .tiptap-nota-editor .tiptap mark { background: #fde68a; border-radius: 2px; padding: 0 2px; }
        .dark .tiptap-nota-editor .tiptap mark { background: #78350f; color: #fde68a; }
        .tiptap-nota-editor .tiptap ul { list-style: disc; padding-left: 20px; margin: 6px 0; }
        .tiptap-nota-editor .tiptap ol { list-style: decimal; padding-left: 20px; margin: 6px 0; }
        .tiptap-nota-editor .tiptap li { margin: 2px 0; }
        .tiptap-nota-editor .tiptap blockquote {
          border-left: 3px solid #a78bfa;
          padding-left: 12px;
          margin: 8px 0;
          color: #6b7280;
          font-style: italic;
        }
        .dark .tiptap-nota-editor .tiptap blockquote { color: #9ca3af; }
        .tiptap-nota-editor .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <div className='tiptap-nota-editor'>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
