#!/bin/bash
# Dump exacto de las tablas de config desde dev → aplica en prod
# Así no se pierde ningún campo

DEV="postgresql://postgres:vTSK53nUyrRFL6uy@db.swyjhwgvkfcfdtemkyad.supabase.co:5432/postgres"
PROD="postgresql://postgres:BC5wR4MaBXqviR9T@db.qnaqakdcicwzkfttmmmw.supabase.co:5432/postgres"

TABLES=(
  "fuentes_pago_requisitos_config"
  "requisitos_fuentes_pago_config"
)

for TABLE in "${TABLES[@]}"; do
  echo "→ Sincronizando $TABLE..."
  pg_dump "$DEV" --data-only --table="$TABLE" --no-owner | psql "$PROD"
done

echo "✅ Listo"
