import { SesionesActivas } from '@/modules/auth/components/SesionesActivas'

export const metadata = { title: 'Mi perfil' }

export default function PerfilPage() {
  return (
    <div className='container max-w-2xl space-y-6 py-8'>
      <div>
        <h1 className='text-2xl font-semibold'>Mi perfil</h1>
        <p className='text-sm text-muted-foreground'>
          Gestiona tu cuenta y sesiones activas.
        </p>
      </div>

      <SesionesActivas />
    </div>
  )
}
