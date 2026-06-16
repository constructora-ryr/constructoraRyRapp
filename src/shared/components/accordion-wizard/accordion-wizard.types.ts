/**
 * Tipos compartidos para el sistema Accordion Wizard
 * Usado por todos los módulos de creación (Proyectos, Viviendas, Clientes)
 */

import type { LucideIcon } from 'lucide-react'

import type { ModuleName } from '@/shared/config/module-themes'

/** Configuración de un paso del wizard */
export interface WizardStepConfig {
  /** ID numérico del paso (1-based) */
  id: number
  /** Título mostrado en la sección */
  title: string
  /** Descripción corta (opcional, se muestra debajo del título en estado activo) */
  description?: string
  /** Ícono del paso (lucide-react) */
  icon?: LucideIcon
}

/** Estado visual de una sección del accordion */
export type SectionStatus = 'completed' | 'active' | 'pending'

/** Item de resumen para sección completada */
export interface SummaryItem {
  label: string
  value: string | number | null | undefined
}

/** Props base del AccordionWizardLayout */
export interface AccordionWizardLayoutProps {
  /** Módulo para theming */
  moduleName: ModuleName
  /** Breadcrumbs: array de { label, href? } */
  breadcrumbs: BreadcrumbItem[]
  /** Children: las secciones del wizard */
  children: React.ReactNode
  /** ¿Está enviando el formulario? Muestra overlay de loading */
  isSubmitting?: boolean
  /** Texto del overlay de loading (ej: "Creando Proyecto...") */
  submitLoadingLabel?: string
  /** Destino del botón "Cancelar". Por defecto usa el último breadcrumb con href */
  cancelHref?: string
}

/** Item de breadcrumb */
export interface BreadcrumbItem {
  label: string
  href?: string
}

/** Props del AccordionWizardSection */
export interface AccordionWizardSectionProps {
  /** Estado de la sección */
  status: SectionStatus
  /** Número del paso */
  stepNumber: number
  /** Título del paso */
  title: string
  /** Descripción del paso (se muestra en estado activo) */
  description?: string
  /** Ícono del paso (se muestra junto al número) */
  icon?: LucideIcon
  /** Chip informativo: "N obligatorios · M opcionales" */
  fieldCount?: { required: number; optional: number }
  /** Paso actual (para indicador "Paso X de Y") */
  currentStep?: number
  /** Total de pasos */
  totalSteps?: number
  /** Progreso del wizard (0-100), se muestra como barra en sección activa */
  progress?: number
  /** Módulo para theming */
  moduleName: ModuleName
  /** Items de resumen (para estado completado) */
  summaryItems?: SummaryItem[]
  /** Callback al hacer click en "Editar" (sección completada) */
  onEdit?: () => void
  /** Cantidad de cambios detectados en este paso (solo edición) */
  changeCount?: number
  /** Contenido del paso (solo se renderiza en estado activo) */
  children?: React.ReactNode
}

/** Props del AccordionWizardNavigation */
export interface AccordionWizardNavigationProps {
  /** Paso actual (1-based) */
  currentStep: number
  /** Total de pasos */
  totalSteps: number
  /** ¿Es el primer paso? */
  isFirst: boolean
  /** ¿Es el último paso? */
  isLast: boolean
  /** ¿Está enviando? */
  isSubmitting?: boolean
  /** ¿Está validando async? */
  isValidating?: boolean
  /** Módulo para theming */
  moduleName: ModuleName
  /** Texto del botón submit (ej: "Crear Proyecto") */
  submitLabel?: string
  /** ¿Deshabilitar submit? (ej: sin cambios detectados en edición) */
  disableSubmit?: boolean
  /** Mensaje cuando submit está deshabilitado */
  disableSubmitMessage?: string
  /** Callback atrás */
  onBack: () => void
  /** Callback siguiente */
  onNext: () => void
  /** Callback submit (último paso) */
  onSubmit?: () => void
}

/** Props del AccordionWizardField */
export interface AccordionWizardFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label del campo */
  label: string
  /** Tipo de input */
  type?: 'text' | 'date' | 'number' | 'email' | 'tel'
  /** Mensaje de error */
  error?: string
  /** ¿Es requerido? */
  required?: boolean
  /** Módulo para theming */
  moduleName: ModuleName
}

/** Props del AccordionWizardSelect */
export interface AccordionWizardSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label del campo */
  label: string
  /** Mensaje de error */
  error?: string
  /** ¿Es requerido? */
  required?: boolean
  /** Módulo para theming */
  moduleName: ModuleName
  /** Options como children */
  children: React.ReactNode
}

/** Props del AccordionWizardTextarea */
export interface AccordionWizardTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label del campo */
  label: string
  /** Mensaje de error */
  error?: string
  /** ¿Es requerido? */
  required?: boolean
  /** Módulo para theming */
  moduleName: ModuleName
}
