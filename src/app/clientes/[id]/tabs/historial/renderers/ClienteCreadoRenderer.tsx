/**
 * Cliente creado: los datos con que se registró, por secciones.
 */

import {
  Briefcase,
  Building,
  Calendar,
  CreditCard,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  Smile,
  User,
} from 'lucide-react'

import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'

import { Banner, Dato, Datos } from './piezas'

export function ClienteCreadoRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const tieneEconomico =
    get('ocupacion') ?? get('empresa') ?? get('ingresos_mensuales')

  const nombre = [get('nombres'), get('apellidos')].filter(Boolean).join(' ')
  const documento = [get('tipo_documento'), get('numero_documento')]
    .filter(Boolean)
    .join(' ')

  return (
    <div className='space-y-4'>
      <Banner
        compacto
        tono='info'
        etiqueta='Cliente registrado'
        valor={nombre || 'Cliente'}
        nota={documento || undefined}
      />

      <Datos titulo='Identidad' tono='info'>
        <Dato icon={User} label='Nombres' valor={get('nombres')} destacado />
        <Dato
          icon={User}
          label='Apellidos'
          valor={get('apellidos')}
          destacado
        />
        <Dato
          icon={CreditCard}
          label='Tipo de documento'
          valor={get('tipo_documento')}
        />
        <Dato
          icon={CreditCard}
          label='Número de documento'
          valor={get('numero_documento')}
          copiable
        />
        <Dato
          icon={Calendar}
          label='Fecha de nacimiento'
          valor={get('fecha_nacimiento')}
        />
        <Dato icon={Heart} label='Estado civil' valor={get('estado_civil')} />
      </Datos>

      <Datos titulo='Contacto'>
        <Dato icon={Phone} label='Teléfono' valor={get('telefono')} />
        <Dato
          icon={Phone}
          label='Teléfono alternativo'
          valor={get('telefono_alternativo')}
        />
        <Dato icon={Mail} label='Correo electrónico' valor={get('email')} />
      </Datos>

      <Datos titulo='Ubicación'>
        <Dato icon={Home} label='Dirección' valor={get('direccion')} />
        <Dato icon={MapPin} label='Ciudad' valor={get('ciudad')} />
        <Dato icon={MapPin} label='Departamento' valor={get('departamento')} />
      </Datos>

      {tieneEconomico ? (
        <Datos titulo='Información económica'>
          <Dato icon={Briefcase} label='Ocupación' valor={get('ocupacion')} />
          <Dato icon={Building} label='Empresa' valor={get('empresa')} />
          <Dato
            icon={Briefcase}
            label='Ingresos mensuales'
            valor={get('ingresos_mensuales')}
            formato='moneda'
          />
        </Datos>
      ) : null}

      <Datos titulo='Estado inicial'>
        <Dato icon={Smile} label='Estado del cliente' valor={get('estado')} />
      </Datos>
    </div>
  )
}
