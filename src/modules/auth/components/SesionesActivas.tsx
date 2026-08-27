'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Laptop, Loader2, Monitor, Smartphone, Tablet } from 'lucide-react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

import {
  useSesionesActivas,
  useRevocarSesion,
} from '../hooks/useSesionesActivas'
import type { SesionActiva } from '../services/sesiones.service'

function DeviceIcon({ dispositivo }: { dispositivo: string | null }) {
  const d = dispositivo?.toLowerCase() ?? ''
  if (d.includes('iphone') || d.includes('android'))
    return <Smartphone className='h-5 w-5 text-muted-foreground' />
  if (d.includes('ipad'))
    return <Tablet className='h-5 w-5 text-muted-foreground' />
  if (d.includes('mac') || d.includes('windows') || d.includes('linux'))
    return <Monitor className='h-5 w-5 text-muted-foreground' />
  return <Laptop className='h-5 w-5 text-muted-foreground' />
}

function SesionRow({
  sesion,
  onRevocar,
  isRevoking,
}: {
  sesion: SesionActiva
  onRevocar: (id: string) => void
  isRevoking: boolean
}) {
  const lastSeen = formatDistanceToNow(new Date(sesion.last_seen_at), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className='flex items-center justify-between gap-4 py-3'>
      <div className='flex min-w-0 items-center gap-3'>
        <DeviceIcon dispositivo={sesion.dispositivo} />
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='truncate text-sm font-medium'>
              {sesion.dispositivo ?? 'Dispositivo desconocido'}
            </span>
            {sesion.es_actual && (
              <Badge variant='secondary' className='shrink-0 text-xs'>
                Esta sesión
              </Badge>
            )}
          </div>
          <p className='truncate text-xs text-muted-foreground'>
            {sesion.navegador ?? 'Navegador desconocido'} ·{' '}
            {sesion.ip ?? 'IP desconocida'} · Activo {lastSeen}
          </p>
        </div>
      </div>

      {!sesion.es_actual && (
        <Button
          variant='outline'
          size='sm'
          className='shrink-0 text-destructive hover:text-destructive'
          onClick={() => onRevocar(sesion.id)}
          disabled={isRevoking}
        >
          {isRevoking ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Cerrar'}
        </Button>
      )}
    </div>
  )
}

export function SesionesActivas() {
  const { data: sesiones, isLoading, error, refetch } = useSesionesActivas()
  const {
    mutate: revocar,
    isPending,
    variables: revocandoId,
  } = useRevocarSesion()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones activas</CardTitle>
          <CardDescription>
            Dispositivos donde tienes sesión iniciada
          </CardDescription>
        </CardHeader>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones activas</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <p className='text-sm text-muted-foreground'>
            No se pudieron cargar las sesiones.
          </p>
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const sesionesOrdenadas = [...(sesiones ?? [])].sort(
    (a, b) => Number(b.es_actual) - Number(a.es_actual)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sesiones activas</CardTitle>
        <CardDescription>
          Dispositivos donde tienes sesión iniciada. Puedes cerrar sesiones que
          no reconoces.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sesionesOrdenadas.length === 0 ? (
          <p className='py-4 text-center text-sm text-muted-foreground'>
            No hay sesiones activas registradas.
          </p>
        ) : (
          <div className='divide-y'>
            {sesionesOrdenadas.map(sesion => (
              <div key={sesion.id}>
                <SesionRow
                  sesion={sesion}
                  onRevocar={id => revocar(id)}
                  isRevoking={isPending && revocandoId === sesion.id}
                />
              </div>
            ))}
          </div>
        )}

        {sesionesOrdenadas.length > 1 && (
          <>
            <div className='my-4 border-t' />
            <Button
              variant='outline'
              size='sm'
              className='text-destructive hover:text-destructive'
              disabled={isPending}
              onClick={() => {
                const otras = sesionesOrdenadas.filter(s => !s.es_actual)
                otras.forEach(s => revocar(s.id))
              }}
            >
              Cerrar todas las otras sesiones
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
