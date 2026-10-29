'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import HighlightExt from '@tiptap/extension-highlight'
import PlaceholderExt from '@tiptap/extension-placeholder'
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from '@tiptap/react'
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
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react'

import { BarraFlotante } from './BarraFlotante'
import { BotonFormato } from './BotonFormato'
import { MenuComandos, type ManejadorTeclas } from './MenuComandos'
import {
  limpiarHtmlPegado,
  tieneFormatoWhatsapp,
  whatsappAHtml,
} from './pegado'
import { estilosRichText } from './rich-text.styles'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
  /** Ctrl/Cmd + Enter dentro del editor (p.ej. guardar) */
  onAtajoGuardar?: () => void
}

const ESTADO_INICIAL = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  highlight: false,
  h2: false,
  h3: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  puedeDeshacer: false,
  puedeRehacer: false,
}

/** Atajos de escritura que ya entiende el editor (se muestran al pie) */
const ATAJOS = [
  { teclas: '##', accion: 'título' },
  { teclas: '-', accion: 'viñetas' },
  { teclas: '1.', accion: 'numerada' },
  { teclas: '>', accion: 'cita' },
  { teclas: '/', accion: 'más opciones' },
]

function Grupo({ children }: { children: ReactNode }) {
  return <div className='flex items-center gap-0.5'>{children}</div>
}

function Divider() {
  return (
    <span className='mx-1 h-5 w-px self-center bg-slate-200 dark:bg-slate-700' />
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  minHeight = '180px',
  onAtajoGuardar,
}: RichTextEditorProps) {
  // Último HTML emitido por el editor: distingue los cambios externos (carga
  // de la nota al editar) de lo que el usuario escribe
  const lastEmitted = useRef<string>(value || '')
  const atajoGuardar = useRef(onAtajoGuardar)
  atajoGuardar.current = onAtajoGuardar
  // El menú "/" toma las flechas, Enter y Esc mientras está abierto
  const teclasMenu = useRef<ManejadorTeclas | null>(null)
  const editorRef = useRef<Editor | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Sin botón ni forma de mostrarlos: los atajos de markdown (`, ```, ---)
        // creaban formatos que el visor de notas descartaba
        code: false,
        codeBlock: false,
        horizontalRule: false,
        // Las URL escritas o pegadas quedan como enlace
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        },
      }),
      HighlightExt.configure({ multicolor: false }),
      PlaceholderExt.configure({ placeholder }),
    ],
    content: value || '',
    onCreate: ({ editor }) => {
      editorRef.current = editor
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const result = html === '<p></p>' ? '' : html
      lastEmitted.current = result
      onChange(result)
    },
    editorProps: {
      attributes: { class: 'outline-none' },
      handleKeyDown: (_view, event) => {
        if (teclasMenu.current?.(event)) return true
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          atajoGuardar.current?.()
          return true
        }
        return false
      },
      transformPastedHTML: limpiarHtmlPegado,
      // Texto plano con *negrita* / _cursiva_ / ~tachado~ (WhatsApp)
      handlePaste: (_view, event) => {
        const datos = event.clipboardData
        if (!datos || datos.getData('text/html')) return false
        const texto = datos.getData('text/plain')
        if (!texto || !tieneFormatoWhatsapp(texto)) return false
        editorRef.current?.commands.insertContent(whatsappAHtml(texto))
        return true
      },
    },
    immediatelyRender: false,
  })

  // Tiptap 3 no vuelve a renderizar en cada cambio: sin esto los botones no
  // mostraban si el formato estaba activo. Puede llegar vacío mientras el
  // editor se crea, así que la barra cae en "nada activo" en vez de ocultar
  // el editor
  const estado =
    useEditorState({
      editor,
      selector: ({ editor: e }) =>
        e
          ? {
              bold: e.isActive('bold'),
              italic: e.isActive('italic'),
              underline: e.isActive('underline'),
              strike: e.isActive('strike'),
              highlight: e.isActive('highlight'),
              h2: e.isActive('heading', { level: 2 }),
              h3: e.isActive('heading', { level: 3 }),
              bulletList: e.isActive('bulletList'),
              orderedList: e.isActive('orderedList'),
              blockquote: e.isActive('blockquote'),
              puedeDeshacer: e.can().undo(),
              puedeRehacer: e.can().redo(),
            }
          : null,
    }) ?? ESTADO_INICIAL

  // Sincronizar cuando el valor cambia por fuera (carga de la nota al editar)
  useEffect(() => {
    if (editor && value !== lastEmitted.current) {
      editor.commands.setContent(value || '', { emitUpdate: false })
      lastEmitted.current = value || ''
    }
  }, [editor, value])

  if (!editor) {
    return (
      <div
        className='rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60'
        style={{ minHeight: `calc(${minHeight} + 42px)` }}
      />
    )
  }
  const cadena = () => editor.chain().focus()

  return (
    <div className='rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-200 dark:border-slate-700 dark:bg-slate-900/60 dark:focus-within:ring-violet-900'>
      <div
        role='toolbar'
        aria-label='Formato del texto'
        className='flex flex-wrap items-center gap-y-1 rounded-t-xl border-b border-slate-100 bg-slate-50/80 px-1.5 py-1 dark:border-slate-700/70 dark:bg-slate-800/60'
      >
        <Grupo>
          <BotonFormato
            icon={Bold}
            label='Negrita'
            atajo='Ctrl+B'
            active={estado.bold}
            onClick={() => cadena().toggleBold().run()}
          />
          <BotonFormato
            icon={Italic}
            label='Cursiva'
            atajo='Ctrl+I'
            active={estado.italic}
            onClick={() => cadena().toggleItalic().run()}
          />
          <BotonFormato
            icon={Underline}
            label='Subrayado'
            atajo='Ctrl+U'
            active={estado.underline}
            onClick={() => cadena().toggleUnderline().run()}
          />
          <BotonFormato
            icon={Strikethrough}
            label='Tachado'
            atajo='Ctrl+Shift+S'
            active={estado.strike}
            onClick={() => cadena().toggleStrike().run()}
          />
          <BotonFormato
            icon={Highlighter}
            label='Resaltar'
            atajo='Ctrl+Shift+H'
            active={estado.highlight}
            onClick={() => cadena().toggleHighlight().run()}
          />
        </Grupo>
        <Divider />
        <Grupo>
          <BotonFormato
            icon={Heading2}
            label='Título'
            active={estado.h2}
            onClick={() => cadena().toggleHeading({ level: 2 }).run()}
          />
          <BotonFormato
            icon={Heading3}
            label='Subtítulo'
            active={estado.h3}
            onClick={() => cadena().toggleHeading({ level: 3 }).run()}
          />
        </Grupo>
        <Divider />
        <Grupo>
          <BotonFormato
            icon={List}
            label='Lista de viñetas'
            active={estado.bulletList}
            onClick={() => cadena().toggleBulletList().run()}
          />
          <BotonFormato
            icon={ListOrdered}
            label='Lista numerada'
            active={estado.orderedList}
            onClick={() => cadena().toggleOrderedList().run()}
          />
          <BotonFormato
            icon={Quote}
            label='Cita'
            active={estado.blockquote}
            onClick={() => cadena().toggleBlockquote().run()}
          />
        </Grupo>
        <div className='ml-auto flex items-center gap-0.5'>
          <BotonFormato
            icon={Undo2}
            label='Deshacer'
            atajo='Ctrl+Z'
            disabled={!estado.puedeDeshacer}
            onClick={() => cadena().undo().run()}
          />
          <BotonFormato
            icon={Redo2}
            label='Rehacer'
            atajo='Ctrl+Y'
            disabled={!estado.puedeRehacer}
            onClick={() => cadena().redo().run()}
          />
        </div>
      </div>

      <style>{`
        ${estilosRichText('.tiptap-nota-editor .tiptap')}
        .tiptap-nota-editor .tiptap {
          min-height: ${minHeight};
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.6;
          color: inherit;
        }
        .tiptap-nota-editor .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <div className='tiptap-nota-editor relative'>
        <EditorContent editor={editor} />
        <BarraFlotante editor={editor} />
        <MenuComandos editor={editor} teclasRef={teclasMenu} />
      </div>

      <p className='hidden flex-wrap items-center gap-x-3 gap-y-1 rounded-b-xl border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500 dark:border-slate-700/70 dark:text-slate-400 sm:flex'>
        <span className='font-medium'>Al empezar una línea:</span>
        {ATAJOS.map(a => (
          <span key={a.teclas} className='inline-flex items-center gap-1'>
            <kbd className='rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px] text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'>
              {a.teclas}
            </kbd>
            {a.accion}
          </span>
        ))}
      </p>
    </div>
  )
}
