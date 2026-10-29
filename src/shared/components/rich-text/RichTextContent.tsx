'use client'

import DOMPurify from 'dompurify'

import { estilosRichText } from './rich-text.styles'

interface RichTextContentProps {
  html: string
  className?: string
}

const ALLOWED_TAGS = [
  'p',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'u',
  's',
  'mark',
  'blockquote',
  'br',
  'a',
]

// Los enlaces abren en otra pestaña y sin dar acceso a esta página.
// DOMPurify ya descarta href peligrosos (javascript:, data:)
if (typeof window !== 'undefined') {
  DOMPurify.addHook('afterSanitizeAttributes', nodo => {
    if (nodo.tagName === 'A') {
      nodo.setAttribute('target', '_blank')
      nodo.setAttribute('rel', 'noopener noreferrer nofollow')
    }
  })
}

// Detecta si el contenido es HTML enriquecido o texto plano
function isRichHtml(content: string): boolean {
  return /<(p|h[1-6]|ul|ol|li|strong|em|u|s|mark|blockquote|br|a)\b/.test(
    content
  )
}

function sanitize(html: string): string {
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

export function RichTextContent({
  html,
  className = '',
}: RichTextContentProps) {
  const rich = isRichHtml(html)

  if (!rich) {
    return (
      <p className={`whitespace-pre-wrap text-sm leading-relaxed ${className}`}>
        {html}
      </p>
    )
  }

  return (
    <>
      <style>{`
        ${estilosRichText('.rich-nota-content')}
        .rich-nota-content p { line-height: 1.6; }
      `}</style>
      <div
        className={`rich-nota-content text-sm leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitize(html) }}
      />
    </>
  )
}
