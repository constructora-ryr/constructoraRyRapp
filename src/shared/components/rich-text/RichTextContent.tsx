'use client'

interface RichTextContentProps {
  html: string
  className?: string
}

// Detecta si el contenido es HTML enriquecido o texto plano
function isRichHtml(content: string): boolean {
  return /<(p|h[1-6]|ul|ol|li|strong|em|u|s|mark|blockquote|br)\b/.test(content)
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
        .rich-nota-content h2 { font-size: 15px; font-weight: 700; margin: 10px 0 5px; }
        .rich-nota-content h3 { font-size: 14px; font-weight: 700; margin: 8px 0 4px; }
        .rich-nota-content p { margin: 0 0 7px; line-height: 1.6; }
        .rich-nota-content p:last-child { margin-bottom: 0; }
        .rich-nota-content strong { font-weight: 700; }
        .rich-nota-content em { font-style: italic; }
        .rich-nota-content u { text-decoration: underline; }
        .rich-nota-content s { text-decoration: line-through; }
        .rich-nota-content mark { background: #fde68a; border-radius: 2px; padding: 0 2px; }
        .dark .rich-nota-content mark { background: #78350f; color: #fde68a; }
        .rich-nota-content ul { list-style: disc; padding-left: 18px; margin: 5px 0; }
        .rich-nota-content ol { list-style: decimal; padding-left: 18px; margin: 5px 0; }
        .rich-nota-content li { margin: 2px 0; }
        .rich-nota-content blockquote {
          border-left: 3px solid #a78bfa;
          padding-left: 10px;
          margin: 6px 0;
          color: #6b7280;
          font-style: italic;
        }
        .dark .rich-nota-content blockquote { color: #9ca3af; }
      `}</style>
      <div
        className={`rich-nota-content text-sm leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
