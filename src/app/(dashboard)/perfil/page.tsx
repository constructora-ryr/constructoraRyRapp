import { User } from 'lucide-react'

import { SesionesActivas } from '@/modules/auth/components/SesionesActivas'
import { ModuleContainer } from '@/shared/components/layout/ModuleContainer'
import { ModuleHeader } from '@/shared/components/layout/ModuleHeader'

export const metadata = { title: 'Mi perfil' }

export default function PerfilPage() {
  return (
    <ModuleContainer maxWidth='md'>
      <ModuleHeader
        title='Mi perfil'
        description='Gestiona tu cuenta y sesiones activas en todos tus dispositivos.'
        icon={<User className='h-7 w-7' />}
      />
      <SesionesActivas />
    </ModuleContainer>
  )
}
