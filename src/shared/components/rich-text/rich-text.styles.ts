/**
 * Estilos del texto enriquecido de las notas. Los usan el editor y el visor,
 * así lo que se escribe se ve igual a como queda guardado.
 */
export function estilosRichText(raiz: string): string {
  return `
    ${raiz} p { margin: 0 0 8px; }
    ${raiz} p:last-child { margin-bottom: 0; }
    ${raiz} h2 { font-size: 16px; font-weight: 700; margin: 12px 0 6px; }
    ${raiz} h3 { font-size: 14px; font-weight: 700; margin: 10px 0 4px; }
    ${raiz} strong { font-weight: 700; }
    ${raiz} em { font-style: italic; }
    ${raiz} u { text-decoration: underline; }
    ${raiz} s { text-decoration: line-through; }
    ${raiz} mark { background: #fde68a; border-radius: 2px; padding: 0 2px; }
    .dark ${raiz} mark { background: #78350f; color: #fde68a; }
    ${raiz} a { color: #7c3aed; text-decoration: underline; text-underline-offset: 2px; word-break: break-word; }
    .dark ${raiz} a { color: #c4b5fd; }
    ${raiz} ul { list-style: disc; padding-left: 20px; margin: 6px 0; }
    ${raiz} ol { list-style: decimal; padding-left: 20px; margin: 6px 0; }
    ${raiz} li { margin: 2px 0; }
    ${raiz} li p { margin: 0; }
    ${raiz} blockquote {
      border-left: 3px solid #a78bfa;
      padding-left: 12px;
      margin: 8px 0;
      color: #64748b;
      font-style: italic;
    }
    .dark ${raiz} blockquote { color: #94a3b8; }
  `
}
