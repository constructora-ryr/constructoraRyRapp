-- Migración: campos para devolución de excedente en negociaciones
-- Caso de uso: cliente tiene fuentes > valor_total_pagar → se le debe devolver la diferencia
-- La devolución es independiente de la renuncia; el cliente conserva la vivienda.

ALTER TABLE negociaciones
  ADD COLUMN IF NOT EXISTS excedente_devolucion_estado TEXT
    CHECK (excedente_devolucion_estado IN ('pendiente', 'procesada')),
  ADD COLUMN IF NOT EXISTS excedente_devolucion_monto NUMERIC(15,2),
  ADD COLUMN IF NOT EXISTS excedente_devolucion_fecha DATE,
  ADD COLUMN IF NOT EXISTS excedente_devolucion_metodo TEXT,
  ADD COLUMN IF NOT EXISTS excedente_devolucion_numero_comprobante TEXT,
  ADD COLUMN IF NOT EXISTS excedente_devolucion_comprobante_url TEXT,
  ADD COLUMN IF NOT EXISTS excedente_devolucion_notas TEXT,
  ADD COLUMN IF NOT EXISTS excedente_devolucion_procesado_por TEXT,
  ADD COLUMN IF NOT EXISTS excedente_devolucion_procesado_en TIMESTAMPTZ;

COMMENT ON COLUMN negociaciones.excedente_devolucion_estado IS 'null = sin excedente, pendiente = excedente pendiente de devolver, procesada = devolución realizada';
COMMENT ON COLUMN negociaciones.excedente_devolucion_monto IS 'Monto exacto a devolver al cliente (totalFuentes - valor_total_pagar)';
