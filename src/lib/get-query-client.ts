import { cache } from 'react'

import { QueryClient } from '@tanstack/react-query'

/**
 * Devuelve un QueryClient por request (usando React cache).
 * Permite prefetchar datos en Server Components y pasarlos al cliente
 * vía HydrationBoundary sin hacer una segunda consulta en el browser.
 *
 * IMPORTANTE: Este módulo es solo para Server Components.
 * El cliente usa su propio QueryClient creado en ReactQueryProvider.
 */
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // En el servidor no hay ventana ni foco, solo generamos el snapshot.
          staleTime: 0,
        },
      },
    })
)
