# Shared - Recursos Globales Compartidos

> Infraestructura compartida para toda la aplicación Constructora RyR

## 📁 Estructura

```
src/shared/
├── hooks/           # Custom hooks reutilizables
├── constants/       # Configuraciones y constantes
├── types/          # Tipos de TypeScript
├── utils/          # Funciones de utilidad
├── styles/         # Animaciones y clases CSS
├── components/     # Componentes UI compartidos
└── index.ts        # Exportaciones centralizadas
```

## 🎣 Hooks

### useMediaQuery

Detecta breakpoints responsivos.

```tsx
import { useMediaQuery, useIsMobile, useIsTablet } from '@/shared'

const isMobile = useIsMobile() // < 768px
const isTablet = useIsTablet() // >= 768px && < 1024px
const isLargeScreen = useMediaQuery('(min-width: 1280px)')
```

### useLocalStorage

Estado persistente en localStorage con tipado.

```tsx
import { useLocalStorage } from '@/shared'

const [user, setUser] = useLocalStorage<User>('user', null)
```

### useDebounce

Debounce de valores (útil para búsquedas).

```tsx
import { useDebounce } from '@/shared'

const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 500)
```

### useClickOutside

Detecta clics fuera de un elemento.

```tsx
import { useClickOutside } from '@/shared'

const ref = useClickOutside<HTMLDivElement>(() => {
  console.log('Clicked outside!')
})

return <div ref={ref}>Content</div>
```

### useScroll

Detecta posición de scroll.

```tsx
import { useScroll } from '@/shared'

const { scrollY, isScrolled } = useScroll()
```

### useMounted

Previene problemas de hidratación en SSR.

```tsx
import { useMounted } from '@/shared'

const mounted = useMounted()
if (!mounted) return null
```

## 🔧 Constants

### Routes

```tsx
import { ROUTES, NAVIGATION, ROUTE_LABELS } from '@/shared'

// Rutas
ROUTES.HOME // '/'
ROUTES.PROYECTOS.INDEX // '/proyectos'
ROUTES.PROYECTOS.NUEVO // '/proyectos/nuevo'

// Navegación
NAVIGATION.main // Array de items principales
NAVIGATION.settings // Array de items de configuración

// Labels
ROUTE_LABELS['/proyectos'] // 'Proyectos'
```

### Config

```tsx
import { APP_CONFIG, API_CONFIG, PAGINATION } from '@/shared'

APP_CONFIG.name // 'Constructora RyR'
API_CONFIG.timeout // 10000
PAGINATION.defaultPageSize // 20
```

### Messages

```tsx
import { ERROR, SUCCESS, CONFIRM, EMPTY } from '@/shared'

ERROR.GENERIC // 'Ocurrió un error...'
SUCCESS.CREATE // 'Creado exitosamente'
CONFIRM.DELETE // '¿Estás seguro de eliminar?'
EMPTY.NO_DATA // 'No hay datos disponibles'
```

## 📘 Types

### Common Types

```tsx
import type {
  ApiResponse,
  PaginatedResponse,
  AsyncState,
  SortConfig,
  FilterConfig,
} from '@/shared'

// Respuesta API
const response: ApiResponse<Project> = {
  success: true,
  data: project,
}

// Estado asíncrono
const [state, setState] = useState<AsyncState<Project[]>>({
  data: [],
  isLoading: false,
  error: null,
})
```

## 🛠️ Utils

### Format

```tsx
import {
  formatCurrency,
  formatDate,
  formatPhone,
  truncate,
  capitalize,
} from '@/shared'

formatCurrency(1500000) // '$1,500,000'
formatDate(new Date()) // '15 de enero de 2025'
formatPhone('3001234567') // '300 123 4567'
truncate('Long text...', 20) // 'Long text...'
capitalize('hello') // 'Hello'
```

### Validation

```tsx
import { isValidEmail, isValidPhone, isValidNIT, isInRange } from '@/shared'

isValidEmail('test@email.com') // true
isValidPhone('3001234567') // true
isValidNIT('900123456-1') // true
isInRange(5, 1, 10) // true
```

### Helpers

```tsx
import { groupBy, sortBy, unique, deepClone, getNestedValue } from '@/shared'

groupBy(projects, 'estado') // { activo: [...], completado: [...] }
sortBy(projects, 'nombre') // Sorted array
unique([1, 2, 2, 3]) // [1, 2, 3]
deepClone(object) // Deep copy
getNestedValue(obj, 'user.name') // Nested property access
```

## 🎨 Styles

### Animations (Framer Motion)

```tsx
import { fadeInUp, staggerContainer, scaleIn } from '@/shared'

<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>

<motion.div variants={staggerContainer}>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Classes (Tailwind)

```tsx
import { containers, buttons, inputs, badges, cn } from '@/shared'

// Contenedores
<div className={containers.page}>
<div className={containers.card}>

// Botones
<button className={cn(buttons.base, buttons.primary, buttons.md)}>

// Inputs
<input className={cn(inputs.base, inputs.default)} />

// Badges
<span className={cn(badges.base, badges.success)}>

// Helper cn()
<div className={cn(
  'custom-class',
  isActive && 'active',
  error && 'error-state'
)}>
```

## 🧩 Components

### Loading

```tsx
import { LoadingSpinner, LoadingOverlay, Skeleton } from '@/shared'

<LoadingSpinner size="lg" color="primary" />
<LoadingOverlay message="Cargando..." />
<Skeleton variant="rectangular" width={200} height={100} />
```

### EmptyState

```tsx
import { EmptyState } from '@/shared'
;<EmptyState
  icon={<FileX className='h-12 w-12' />}
  title='No hay proyectos'
  description='Comienza creando tu primer proyecto'
  action={{
    label: 'Crear Proyecto',
    onClick: () => navigate('/proyectos/nuevo'),
  }}
/>
```

### Notification

```tsx
import { NotificationComponent, NotificationContainer } from '@/shared'
;<NotificationContainer
  notifications={notifications}
  onClose={removeNotification}
  position='top-right'
/>
```

### Modal

```tsx
import { Modal, ConfirmModal } from '@/shared'

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Título"
  size="md"
  footer={<>Footer content</>}
>
  Modal content
</Modal>

<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Confirmar eliminación"
  message="¿Estás seguro?"
  variant="danger"
/>
```

## 📦 Uso Centralizado

Importa todo desde un solo lugar:

```tsx
// ✅ Buena práctica
import {
  useDebounce,
  formatCurrency,
  ROUTES,
  LoadingSpinner,
  type ApiResponse,
} from '@/shared'

// ❌ Evitar múltiples imports
import { useDebounce } from '@/shared/hooks/useDebounce'
import { formatCurrency } from '@/shared/utils/format'
```

## 🔄 Actualización

Cuando agregues nuevos recursos compartidos:

1. Crea el archivo en la carpeta correspondiente
2. Agrégalo al `index.ts` de esa carpeta
3. El `index.ts` principal los exportará automáticamente

## 📋 Checklist de Uso

- [ ] Usar hooks compartidos para lógica común
- [ ] Importar constantes en lugar de hardcodear valores
- [ ] Usar tipos compartidos para consistencia
- [ ] Aplicar utilidades de formato y validación
- [ ] Reutilizar animaciones y clases CSS
- [ ] Usar componentes UI compartidos

---

**Nota**: Estos recursos están diseñados para ser usados en TODOS los módulos de la aplicación. Mantén la consistencia usando siempre los recursos compartidos disponibles.
