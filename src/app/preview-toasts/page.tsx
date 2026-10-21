import { notFound } from 'next/navigation'

import { PreviewToasts } from './preview-toasts'

/** Vista previa de los toasts. Solo en desarrollo: en producción da 404. */
export default function PreviewToastsPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <PreviewToasts />
}
