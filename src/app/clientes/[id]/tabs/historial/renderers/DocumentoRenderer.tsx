/**
 * Eventos de documentos del cliente. Según la operación:
 * subida, edición de datos, nueva versión, reemplazo de archivo, archivar,
 * restaurar, enviar a papelera o eliminar.
 */

import { useQuery } from '@tanstack/react-query'
import {
  Archive,
  CalendarDays,
  ExternalLink,
  FileText,
  Hash,
  IdCard,
  Info,
  Loader2,
  RotateCcw,
  Star,
  Tag,
  Trash2,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'
import { useVerDocumentoHistorial } from '@/modules/clientes/hooks/useVerDocumentoHistorial'
import type { EventoHistorialHumanizado } from '@/modules/clientes/types/historial.types'
import { MOTIVOS_ARCHIVADO } from '@/shared/documentos/constants/archivado.constants'
import { cn } from '@/shared/utils/helpers'

import { formatearValor } from './formatearValor'
import {
  Aviso,
  Banner,
  Dato,
  Datos,
  FilaCambio,
  Seccion,
  SinDatos,
  TextoLibre,
  type Tono,
} from './piezas'
import { VistaDocumentoCliente } from './piezas-archivo'

type Meta = Record<string, unknown>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** id → nombre de las categorías (para mostrar nombres en vez de UUIDs) */
function useNombresCategorias() {
  return useQuery({
    queryKey: ['categorias_documento_lookup'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categorias_documento')
        .select('id, nombre')
      return Object.fromEntries((data ?? []).map(c => [c.id, c.nombre]))
    },
    staleTime: 10 * 60 * 1000,
  }).data
}

/** Nombre del documento con el tono de la operación */
function EncabezadoDocumento({ titulo, tono }: { titulo: string; tono: Tono }) {
  return (
    <Banner
      compacto
      tono={tono}
      etiqueta='Documento'
      valor={titulo}
      chip={<FileText className='h-3.5 w-3.5' />}
    />
  )
}

/** Abre el archivo con una URL firmada (por eso es un botón y no un enlace) */
function BotonVer({
  ruta,
  clave,
  label,
  destacado = false,
}: {
  ruta: string
  clave: string
  label: string
  destacado?: boolean
}) {
  const { verDocumento, esCargando } = useVerDocumentoHistorial()
  const cargando = esCargando(clave)
  return (
    <button
      type='button'
      onClick={() => verDocumento(ruta, clave)}
      disabled={cargando}
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60',
        destacado
          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
      )}
    >
      {cargando ? (
        <Loader2 className='h-3.5 w-3.5 animate-spin' />
      ) : (
        <ExternalLink className='h-3.5 w-3.5' />
      )}
      {cargando ? 'Abriendo…' : label}
    </button>
  )
}

/** Fila de archivo (anterior tachado / nuevo) con botón para verlo */
function FilaArchivo({
  etiqueta,
  nombre,
  detalle,
  ruta,
  clave,
  anterior = false,
}: {
  etiqueta: string
  nombre: unknown
  detalle?: string
  ruta?: string
  clave: string
  anterior?: boolean
}) {
  if (!nombre && !ruta) return null
  return (
    <div className='flex items-center gap-2.5 py-2.5'>
      <FileText
        className={cn(
          'h-4 w-4 flex-shrink-0',
          anterior ? 'text-slate-400' : 'text-blue-500'
        )}
      />
      <div className='min-w-0 flex-1'>
        <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'>
          {etiqueta}
        </p>
        <p
          className={cn(
            'truncate text-sm',
            anterior
              ? 'text-slate-500 line-through dark:text-slate-400'
              : 'font-medium text-slate-800 dark:text-slate-100'
          )}
        >
          {nombre ? String(nombre) : '—'}
        </p>
        {detalle ? (
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {detalle}
          </p>
        ) : null}
      </div>
      {ruta ? (
        <BotonVer ruta={ruta} clave={clave} label='Ver' destacado={!anterior} />
      ) : null}
    </div>
  )
}

/** Datos de un documento borrado: categoría, archivo, versiones, identidad */
function DatosBorrado({
  categoria,
  archivo,
  versiones,
  esIdentidad,
}: {
  categoria: string | null
  archivo: unknown
  versiones?: number
  esIdentidad: boolean
}) {
  if (!categoria && !archivo && !versiones && !esIdentidad) return null
  return (
    <Datos titulo='Datos del documento'>
      <Dato icon={Tag} label='Categoría' valor={categoria} />
      <Dato icon={FileText} label='Archivo' valor={archivo} />
      <Dato icon={Hash} label='Versiones eliminadas' valor={versiones} />
      {esIdentidad ? (
        <Dato
          icon={IdCard}
          label='Importante'
          valor='Era el documento de identidad del cliente'
          destacado
        />
      ) : null}
    </Datos>
  )
}

export function DocumentoRenderer({
  evento,
}: {
  evento: EventoHistorialHumanizado
}) {
  const categorias = useNombresCategorias() ?? {}
  const d = evento.detalles ?? []
  const get = (campo: string) => d.find(x => x.campo === campo)?.valorNuevo
  const meta = (evento.metadata ?? {}) as Meta
  const titulo = String(get('titulo') ?? meta.titulo ?? '—')
  const operacion = String(meta.tipo_operacion ?? '')
  const nombreCategoria = (id: unknown) =>
    typeof id === 'string' ? (categorias[id] ?? null) : null

  // Eliminado definitivamente (desde la papelera)
  if (evento.tipo === 'documento_eliminado') {
    const versiones = meta.numero_versiones as number | undefined
    const anteriores = versiones && versiones > 1 ? versiones - 1 : 0
    return (
      <div className='space-y-4'>
        <EncabezadoDocumento titulo={titulo} tono='peligro' />
        <Aviso
          icon={Trash2}
          tono='peligro'
          etiqueta='Eliminado'
          texto={`Se envió a la papelera${
            anteriores
              ? ` con ${anteriores} ${anteriores === 1 ? 'versión anterior' : 'versiones anteriores'}`
              : ''
          }`}
        />
        <DatosBorrado
          categoria={nombreCategoria(get('categoria_id'))}
          archivo={get('nombre_original')}
          versiones={versiones}
          esIdentidad={Boolean(get('es_documento_identidad'))}
        />
      </div>
    )
  }

  if (evento.tipo === 'documento_actualizado') {
    switch (operacion) {
      case 'ARCHIVAR_DOCUMENTO': {
        const motivo = String(meta.motivo_categoria ?? '')
        return (
          <div className='space-y-4'>
            <EncabezadoDocumento titulo={titulo} tono='aviso' />
            <Datos titulo='Archivado' tono='aviso'>
              <Dato
                icon={Archive}
                label='Motivo'
                valor={
                  MOTIVOS_ARCHIVADO.find(m => m.value === motivo)?.label ??
                  motivo
                }
                destacado
              />
            </Datos>
            <TextoLibre
              icon={Info}
              titulo='Observaciones'
              texto={meta.motivo_detalle as string | undefined}
            />
          </div>
        )
      }

      case 'RESTAURAR_DOCUMENTO_ARCHIVADO':
        return (
          <div className='space-y-4'>
            <EncabezadoDocumento titulo={titulo} tono='exito' />
            <Aviso
              icon={RotateCcw}
              tono='exito'
              etiqueta='Restaurado'
              texto='Salió del archivo y está activo de nuevo'
            />
          </div>
        )

      case 'ELIMINAR_DOCUMENTO_SOFTDELETE':
        return (
          <div className='space-y-4'>
            <EncabezadoDocumento titulo={titulo} tono='peligro' />
            <Aviso
              icon={Trash2}
              tono='peligro'
              etiqueta='En la papelera'
              texto='Se movió a la papelera (se puede restaurar)'
            />
            <DatosBorrado
              categoria={nombreCategoria(meta.categoria_id)}
              archivo={meta.nombre_original}
              esIdentidad={Boolean(meta.es_documento_identidad)}
            />
          </div>
        )

      case 'NUEVA_VERSION_DOCUMENTO': {
        const version = meta.version_nueva as number | undefined
        const bytes = meta.tamano_bytes as number | undefined
        return (
          <div className='space-y-4'>
            <EncabezadoDocumento titulo={titulo} tono='info' />
            {version ? (
              <FilaCambio
                etiqueta='Versión'
                antes={`v${version - 1}`}
                ahora={`v${version}`}
              />
            ) : null}
            <Seccion titulo='Archivos'>
              <FilaArchivo
                etiqueta='Versión anterior'
                nombre={meta.nombre_archivo_anterior}
                ruta={meta.url_storage_anterior as string | undefined}
                clave='anterior'
                anterior
              />
              <FilaArchivo
                etiqueta='Versión nueva'
                nombre={meta.nombre_archivo_nuevo}
                detalle={bytes ? `${(bytes / 1024).toFixed(1)} KB` : undefined}
                ruta={meta.url_storage_nuevo as string | undefined}
                clave='nuevo'
              />
            </Seccion>
            {meta.url_storage_nuevo ? (
              <VistaDocumentoCliente
                titulo='Versión nueva'
                ruta={String(meta.url_storage_nuevo)}
              />
            ) : null}
            <TextoLibre
              icon={Star}
              titulo='Notas de la versión'
              texto={meta.cambios as string | undefined}
            />
          </div>
        )
      }

      case 'REEMPLAZO_ARCHIVO': {
        const original = (meta.archivo_original ?? {}) as Meta
        const nuevo = (meta.archivo_nuevo ?? {}) as Meta
        return (
          <div className='space-y-4'>
            <EncabezadoDocumento titulo={titulo} tono='aviso' />
            <TextoLibre
              icon={Info}
              tono='aviso'
              titulo='Motivo del reemplazo'
              texto={meta.motivo_reemplazo as string | undefined}
            />
            <Seccion titulo='Archivos'>
              <FilaArchivo
                etiqueta='Archivo anterior'
                nombre={original.nombre}
                detalle={`${String(original.tamano_mb ?? 0)} MB`}
                clave='original'
                anterior
              />
              <FilaArchivo
                etiqueta='Archivo nuevo'
                nombre={nuevo.nombre}
                detalle={`${String(nuevo.tamano_mb ?? 0)} MB`}
                clave='reemplazo'
              />
            </Seccion>
          </div>
        )
      }

      default: {
        // Edición de datos: antes → ahora (categorías por nombre)
        const formato = (campo: string, valor: unknown) =>
          campo === 'categoria_id' &&
          typeof valor === 'string' &&
          UUID.test(valor)
            ? (categorias[valor] ?? '(categoría no encontrada)')
            : formatearValor(valor)
        const cambios = d.filter(det => det.valorAnterior !== undefined)
        return (
          <div className='space-y-4'>
            <EncabezadoDocumento titulo={titulo} tono='info' />
            {cambios.length > 0 ? (
              <div className='space-y-2'>
                {cambios.map(det => (
                  <FilaCambio
                    key={det.campo}
                    etiqueta={det.etiqueta}
                    antes={formato(det.campo, det.valorAnterior)}
                    ahora={formato(det.campo, det.valorNuevo)}
                  />
                ))}
              </div>
            ) : (
              <SinDatos texto='No hay detalle de los cambios.' />
            )}
          </div>
        )
      }
    }
  }

  // Subida
  const ruta = meta.url_storage as string | undefined
  return (
    <div className='space-y-4'>
      <EncabezadoDocumento titulo={titulo} tono='info' />
      <Datos titulo='Datos del documento'>
        <Dato
          icon={Tag}
          label='Categoría'
          valor={meta.categoria_nombre ?? get('tipo_documento')}
        />
        <Dato
          icon={CalendarDays}
          label='Fecha del documento'
          valor={get('fecha_documento')}
        />
        <Dato
          icon={CalendarDays}
          label='Vence'
          valor={get('fecha_vencimiento')}
        />
        {get('es_importante') ? (
          <Dato
            icon={Star}
            label='Importancia'
            valor='Anclado como importante'
          />
        ) : null}
        <Dato
          icon={Info}
          label='Descripción'
          valor={get('descripcion') ?? meta.descripcion}
        />
      </Datos>
      {ruta ? (
        <VistaDocumentoCliente
          titulo='Archivo'
          ruta={ruta}
          mime={meta.tipo_mime as string | undefined}
        />
      ) : null}
    </div>
  )
}
