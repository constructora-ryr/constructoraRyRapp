/**
 * Utilidades puras para las tarjetas de documentos.
 * Sin dependencias de React — importables en cualquier componente o hook.
 */

// ─── Color basado en tipo de archivo (independiente de categoría) ─────────────

export function getFileTypeColor(
  extension: string,
  mimeType?: string | null
): string {
  const ext = extension.toLowerCase()
  if (
    mimeType?.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)
  )
    return '#3b82f6' // blue-500
  if (['pdf'].includes(ext)) return '#ef4444' // red-500
  if (['doc', 'docx'].includes(ext)) return '#2563eb' // blue-700
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '#16a34a' // green-600
  if (['ppt', 'pptx'].includes(ext)) return '#ea580c' // orange-600
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return '#9333ea' // purple-600
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '#d97706' // amber-600
  return '#64748b' // slate-500 (fallback)
}

// El color del avatar de quien subió sale de su rol: ver AvatarUsuario

export function getInitials(nombres?: string, apellidos?: string): string {
  const n = nombres?.trim().charAt(0).toUpperCase() ?? ''
  const a = apellidos?.trim().charAt(0).toUpperCase() ?? ''
  return n + a || '?'
}
