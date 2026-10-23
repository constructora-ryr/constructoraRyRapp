/**
 * ============================================
 * SCRIPT DE MIGRACIÓN A SISTEMA DE THEMING
 * ============================================
 *
 * Este script ayuda a refactorizar componentes que tienen
 * colores hardcodeados para usar el sistema de theming.
 */

// Mapeo de colores hardcodeados a clases de theming
export const colorMigrationMap = {
  // ===========================
  // GRADIENTES
  // ===========================
  'from-green-500 to-emerald-600': 'theme.classes.gradient.primary',
  'from-green-600 to-emerald-600': 'theme.classes.gradient.primary',
  'from-green-600 via-emerald-600 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800':
    'theme.classes.gradient.triple',
  'from-green-50 to-emerald-50': 'theme.classes.gradient.background',
  'from-green-900/20 to-emerald-900/20':
    'theme.classes.gradient.backgroundDark',

  'from-green-100 to-emerald-100': 'theme.classes.gradient.background', // Icon backgrounds
  'dark:from-green-900/30 dark:to-emerald-900/30':
    'theme.classes.gradient.backgroundDark',

  // ===========================
  // BORDES
  // ===========================
  'border-green-200': 'theme.classes.border.light',
  'dark:border-green-800': '', // Incluido en border.light
  'border-green-200 dark:border-green-800': 'theme.classes.border.light',

  'border-green-300': 'theme.classes.border.light',
  'dark:border-green-700': '', // Similar a border.light

  'hover:border-green-400': 'theme.classes.border.hover',
  'dark:hover:border-green-500': '', // Incluido en border.hover

  // ===========================
  // BACKGROUNDS
  // ===========================
  'bg-green-50': 'theme.classes.bg.light',
  'dark:bg-green-900/20': '', // Incluido en bg.light
  'bg-green-50 dark:bg-green-900/20': 'theme.classes.bg.light',

  'hover:bg-green-50': 'theme.classes.bg.hover',
  'dark:hover:bg-green-900/30': '', // Incluido en bg.hover

  // ===========================
  // FOCUS RINGS
  // ===========================
  'focus:ring-green-500': 'theme.classes.focus.ring',
  'focus:ring-2 focus:ring-green-500': 'theme.classes.focus.ring',
  'focus:border-transparent': '', // Incluido en focus.ring
  'dark:focus:ring-green-400': '', // Incluido en focus.ring

  // ===========================
  // TEXTO
  // ===========================
  'text-green-600': 'theme.classes.text.primary',
  'dark:text-green-400': '', // Incluido en text.primary
  'text-green-600 dark:text-green-400': 'theme.classes.text.primary',

  'text-green-700': 'theme.classes.text.secondary',
  'dark:text-green-300': '', // Incluido en text.secondary
  'text-green-700 dark:text-green-300': 'theme.classes.text.secondary',

  // ===========================
  // BOTONES (STRINGS COMPLETOS)
  // ===========================
  'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all':
    'theme.classes.button.primary',

  'border border-green-300 bg-white text-green-700 hover:bg-green-50 dark:border-green-700 dark:bg-gray-700 dark:text-green-300 dark:hover:bg-gray-600':
    'theme.classes.button.secondary',
}

// ===========================
// CHECKLIST DE MIGRACIÓN
// ===========================
export const migrationChecklist = [
  '[ ] Agregar import: import { moduleThemes, type ModuleName } from "@/shared/config/module-themes"',
  '[ ] Agregar prop moduleName?: ModuleName a Props interface',
  '[ ] Agregar default value: moduleName = "proyectos"',
  '[ ] Obtener tema: const theme = moduleThemes[moduleName]',
  '[ ] Reemplazar colores hardcodeados según colorMigrationMap',
  '[ ] Cambiar className estático a template string cuando sea necesario',
  '[ ] Verificar modo oscuro',
  '[ ] Probar con diferentes moduleName',
  '[ ] Ejecutar TypeScript check',
  '[ ] Validar visualmente en UI',
]

// ===========================
// EJEMPLO DE REFACTORIZACIÓN
// ===========================
export const migrationExample = {
  before: `
export function MiComponente() {
  return (
    <div className='border border-green-200 dark:border-green-800'>
      <button className='bg-gradient-to-r from-green-600 to-emerald-600'>
        Click
      </button>
    </div>
  )
}
  `,
  after: `
import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'

interface MiComponenteProps {
  moduleName?: ModuleName
}

export function MiComponente({ moduleName = 'proyectos' }: MiComponenteProps) {
  const theme = moduleThemes[moduleName]

  return (
    <div className={\`border \${theme.classes.border.light}\`}>
      <button className={theme.classes.button.primary}>
        Click
      </button>
    </div>
  )
}
  `,
}

// ===========================
// PATRONES COMUNES
// ===========================
export const commonPatterns = {
  // Patrón 1: Border con light/dark
  pattern1: {
    find: /border-green-200 dark:border-green-800/g,
    replace: '${theme.classes.border.light}',
    needsTemplate: true,
  },

  // Patrón 2: Background con light/dark
  pattern2: {
    find: /bg-green-50 dark:bg-green-900\/20/g,
    replace: '${theme.classes.bg.light}',
    needsTemplate: true,
  },

  // Patrón 3: Gradiente de botón completo
  pattern3: {
    find: /bg-gradient-to-r from-green-600 to-emerald-600[^"']*/g,
    replace: '${theme.classes.button.primary}',
    needsTemplate: true,
  },

  // Patrón 4: Focus ring
  pattern4: {
    find: /focus:ring-2 focus:ring-green-500 focus:border-transparent/g,
    replace: '${theme.classes.focus.ring}',
    needsTemplate: true,
  },
}

// ===========================
// COMPONENTES PENDIENTES
// ===========================
export const pendingComponents = [
  {
    path: 'src/modules/documentos/components/lista/documento-card.tsx',
    hardcodedColors: [
      'from-green-100 to-emerald-100',
      'from-green-600 to-emerald-600',
    ],
    priority: 'high',
  },
  {
    path: 'src/modules/documentos/components/upload/documento-upload.tsx',
    hardcodedColors: ['multiple'],
    priority: 'high',
  },
  {
    path: 'src/modules/documentos/components/lista/documentos-filtros.tsx',
    hardcodedColors: ['multiple'],
    priority: 'high',
  },
]

// ===========================
// UTILIDADES
// ===========================

/**
 * Convierte className estático a template string si es necesario
 */
export function convertToTemplateString(
  className: string,
  hasTheme: boolean
): string {
  if (!hasTheme) return `'${className}'`
  return `\`${className}\``
}

/**
 * Verifica si una clase necesita template string
 */
export function needsTemplateString(className: string): boolean {
  return className.includes('${theme')
}

/**
 * Lista de imports necesarios
 */
export const requiredImports = [
  "import { moduleThemes, type ModuleName } from '@/shared/config/module-themes'",
]

/**
 * Template de prop interface
 */
export const propTemplate = `
interface [COMPONENT_NAME]Props {
  // ... props existentes
  moduleName?: ModuleName
}
`

/**
 * Template de función con theming
 */
export const functionTemplate = `
export function [COMPONENT_NAME]({
  // ... props existentes
  moduleName = 'proyectos'
}: [COMPONENT_NAME]Props) {
  const theme = moduleThemes[moduleName]

  // ... resto del componente
}
`
