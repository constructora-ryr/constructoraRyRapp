/**
 * Íconos de Lucide disponibles para las categorías de documentos, por grupo.
 * Incluye los que ya usan las categorías del sistema en la BD.
 */

export interface IconoCategoria {
  icono: string
  label: string
}

export const ICONOS_CATEGORIA: { grupo: string; iconos: IconoCategoria[] }[] = [
  {
    grupo: 'Generales',
    iconos: [
      { icono: 'Folder', label: 'Carpeta' },
      { icono: 'FolderOpen', label: 'Carpeta abierta' },
      { icono: 'FileText', label: 'Documento' },
      { icono: 'FileCheck', label: 'Licencia' },
      { icono: 'FileSignature', label: 'Contrato' },
      { icono: 'FilePen', label: 'Promesa' },
      { icono: 'ClipboardCheck', label: 'Acta' },
      { icono: 'BookMarked', label: 'Certificado de tradición' },
    ],
  },
  {
    grupo: 'Identidad',
    iconos: [
      { icono: 'IdCard', label: 'Identificación' },
      { icono: 'CreditCard', label: 'Tarjeta' },
      { icono: 'UserCheck', label: 'Verificación' },
      { icono: 'User', label: 'Usuario' },
      { icono: 'Shield', label: 'Seguridad' },
    ],
  },
  {
    grupo: 'Legales',
    iconos: [
      { icono: 'Scale', label: 'Legal' },
      { icono: 'Gavel', label: 'Notarial' },
      { icono: 'ScrollText', label: 'Escritura' },
      { icono: 'Award', label: 'Certificado' },
      { icono: 'BadgeCheck', label: 'Aprobación' },
      { icono: 'FileWarning', label: 'Importante' },
    ],
  },
  {
    grupo: 'Financieros',
    iconos: [
      { icono: 'Receipt', label: 'Factura' },
      { icono: 'Banknote', label: 'Dinero' },
      { icono: 'Wallet', label: 'Pago' },
      { icono: 'Landmark', label: 'Banco / desembolso' },
      { icono: 'Calculator', label: 'Avalúo' },
      { icono: 'DollarSign', label: 'Financiero' },
    ],
  },
  {
    grupo: 'Propiedad y obra',
    iconos: [
      { icono: 'Home', label: 'Vivienda' },
      { icono: 'Building2', label: 'Edificio' },
      { icono: 'Key', label: 'Llave' },
      { icono: 'MapPin', label: 'Ubicación' },
      { icono: 'Map', label: 'Plano' },
      { icono: 'Compass', label: 'Técnico' },
      { icono: 'Ruler', label: 'Medidas' },
      { icono: 'Hammer', label: 'Construcción' },
    ],
  },
  {
    grupo: 'Multimedia',
    iconos: [
      { icono: 'Camera', label: 'Fotografía' },
      { icono: 'Image', label: 'Imagen' },
      { icono: 'Video', label: 'Video' },
    ],
  },
]
