-- Tabla para rastrear pagos recibidos que exceden el saldo pendiente del cliente.
-- Se crea cuando un admin registra un abono por más de lo que el cliente debía.
-- El flujo: admin registra overpayment → se crea registro aquí → banner en UI →
-- admin procesa la devolución y sube comprobante → estado cambia a 'procesado'.

CREATE TABLE IF NOT EXISTS public.pagos_excedentes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacion_id      UUID NOT NULL REFERENCES public.negociaciones(id) ON DELETE CASCADE,
  abono_id            UUID REFERENCES public.abonos_historial(id) ON DELETE SET NULL,
  fuente_tipo         TEXT,                          -- tipo de fuente donde ocurrió el excedente
  monto_pagado        DECIMAL(15,2) NOT NULL,        -- lo que el cliente pagó realmente
  monto_esperado      DECIMAL(15,2) NOT NULL,        -- lo que debía pagar
  monto_excedente     DECIMAL(15,2) NOT NULL,        -- diferencia a devolver (monto_pagado - monto_esperado)
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'procesado')),
  fecha_procesado     TIMESTAMPTZ,
  comprobante_url     TEXT,                          -- comprobante de la devolución al cliente
  procesado_por       UUID REFERENCES public.usuarios(id),
  notas               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID REFERENCES public.usuarios(id)
);

-- Solo admins activos pueden leer y escribir
ALTER TABLE public.pagos_excedentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_full_access_pagos_excedentes"
  ON public.pagos_excedentes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
        AND rol = 'Administrador'
        AND estado = 'Activo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
        AND rol = 'Administrador'
        AND estado = 'Activo'
    )
  );

-- Índices
CREATE INDEX idx_pagos_excedentes_negociacion ON public.pagos_excedentes(negociacion_id);
CREATE INDEX idx_pagos_excedentes_estado      ON public.pagos_excedentes(estado);
