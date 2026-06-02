#!/usr/bin/env node
/**
 * @file audit-performance.js
 * @description Benchmark de queries clave a Supabase
 * @usage npm run audit
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// ─── Colores ────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
}
const bold = s => c.bold + s + c.reset
const col = (color, s) => c[color] + s + c.reset

// ─── Umbrales (ms) ──────────────────────────────────────────────────────────
const THRESHOLDS = {
  ok: 300, // verde  ✅
  warn: 600, // amarillo ⚠️  (> 300ms)
  // rojo ❌     (> 600ms)
}

// ─── Cargar .env.local ───────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) throw new Error('.env.local no encontrado')

  const env = {}
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const match = line.match(/^\s*([^#][^=]*)\s*=\s*(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, '')
        env[key] = value
      }
    })
  return env
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusIcon(ms) {
  if (ms <= THRESHOLDS.ok) return col('green', '✅')
  if (ms <= THRESHOLDS.warn) return col('yellow', '⚠️ ')
  return col('red', '❌')
}

function statusColor(ms) {
  if (ms <= THRESHOLDS.ok) return 'green'
  if (ms <= THRESHOLDS.warn) return 'yellow'
  return 'red'
}

async function measure(label, queryFn) {
  const start = performance.now()
  let rows = 0
  let error = null
  try {
    const result = await queryFn()
    if (result.error) throw result.error
    rows = Array.isArray(result.data) ? result.data.length : result.data ? 1 : 0
  } catch (e) {
    error = e.message || String(e)
  }
  const ms = Math.round(performance.now() - start)
  return { label, ms, rows, error }
}

// ─── Queries a auditar ───────────────────────────────────────────────────────
function buildBenchmarks(supabase) {
  return [
    {
      group: 'Viviendas',
      queries: [
        {
          label: 'vista_viviendas_completas (lista)',
          fn: () => supabase.from('vista_viviendas_completas').select('*'),
        },
        {
          label: 'negociaciones (batch para saldos)',
          fn: () =>
            supabase
              .from('negociaciones')
              .select('id, valor_total_pagar, total_abonado')
              .not('id', 'is', null)
              .limit(50),
        },
      ],
    },
    {
      group: 'Clientes',
      queries: [
        {
          label: 'clientes (lista base)',
          fn: () =>
            supabase
              .from('clientes')
              .select(
                'id, nombres, apellidos, estado, tipo_documento, numero_documento'
              )
              .order('fecha_creacion', { ascending: false })
              .limit(50),
        },
        {
          label: 'negociaciones (con vivienda y abonos)',
          fn: () =>
            supabase
              .from('negociaciones')
              .select(
                'id, cliente_id, estado, valor_total, valor_total_pagar, total_abonado, saldo_pendiente, vivienda_id'
              )
              .order('fecha_creacion', { ascending: false })
              .limit(50),
        },
      ],
    },
    {
      group: 'Abonos',
      queries: [
        {
          label: 'abonos_historial (activos)',
          fn: () =>
            supabase
              .from('abonos_historial')
              .select('id, monto, fecha_abono, negociacion_id')
              .eq('estado', 'Activo')
              .order('fecha_abono', { ascending: false })
              .limit(100),
        },
      ],
    },
    {
      group: 'Proyectos',
      queries: [
        {
          label: 'proyectos (todos)',
          fn: () => supabase.from('proyectos').select('id, nombre, estado'),
        },
        {
          label: 'manzanas (todas)',
          fn: () => supabase.from('manzanas').select('id, nombre, proyecto_id'),
        },
      ],
    },
    {
      group: 'Auth / Permisos',
      queries: [
        {
          label: 'usuarios (lista)',
          fn: () =>
            supabase
              .from('usuarios')
              .select('id, nombres, apellidos, rol')
              .limit(50),
        },
      ],
    },
  ]
}

// ─── Runner ───────────────────────────────────────────────────────────────────
async function runAudit() {
  console.log('')
  console.log(bold(col('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')))
  console.log(bold(col('cyan', '   🔍  RyR · Audit de Performance · Supabase')))
  console.log(bold(col('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')))
  console.log(col('gray', `   ${new Date().toLocaleString('es-CO')}`))
  console.log('')

  // Cargar credenciales
  let supabase
  try {
    const env = loadEnv()
    const url = env['NEXT_PUBLIC_SUPABASE_URL']
    const key = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    if (!url || !key)
      throw new Error(
        'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
      )
    supabase = createClient(url, key)
  } catch (e) {
    console.error(col('red', `❌ Error al cargar credenciales: ${e.message}`))
    process.exit(1)
  }

  const benchmarks = buildBenchmarks(supabase)
  const allResults = []

  for (const { group, queries } of benchmarks) {
    console.log(bold(`  ${group}`))
    console.log(col('gray', '  ' + '─'.repeat(50)))

    for (const { label, fn } of queries) {
      const result = await measure(label, fn)
      allResults.push(result)

      const icon = result.error ? col('red', '❌') : statusIcon(result.ms)
      const msStr = col(
        result.error ? 'red' : statusColor(result.ms),
        `${result.ms}ms`.padStart(6)
      )
      const rowsStr = result.error
        ? col('red', result.error.slice(0, 50))
        : col('gray', `${result.rows} filas`)

      console.log(`  ${icon}  ${label.padEnd(42)} ${msStr}  ${rowsStr}`)
    }
    console.log('')
  }

  // ─── Resumen ───────────────────────────────────────────────────────────────
  const ok = allResults.filter(r => !r.error && r.ms <= THRESHOLDS.ok).length
  const warn = allResults.filter(
    r => !r.error && r.ms > THRESHOLDS.ok && r.ms <= THRESHOLDS.warn
  ).length
  const fail = allResults.filter(r => !r.error && r.ms > THRESHOLDS.warn).length
  const err = allResults.filter(r => r.error).length
  const total = allResults.length
  const slowest = allResults
    .filter(r => !r.error)
    .sort((a, b) => b.ms - a.ms)[0]

  console.log(
    bold(col('cyan', '  ── Resumen ─────────────────────────────────────'))
  )
  console.log(
    `  ${col('green', `✅ Rápidas  (≤${THRESHOLDS.ok}ms):`)}  ${ok}/${total}`
  )
  if (warn > 0)
    console.log(
      `  ${col('yellow', `⚠️  Lentas   (${THRESHOLDS.ok}-${THRESHOLDS.warn}ms):`)}  ${warn}/${total}`
    )
  if (fail > 0)
    console.log(
      `  ${col('red', `❌ Críticas (>${THRESHOLDS.warn}ms):`)}  ${fail}/${total}`
    )
  if (err > 0)
    console.log(`  ${col('red', `💥 Errores:`)}              ${err}/${total}`)
  if (slowest)
    console.log(
      `  ${col('gray', `⏱  Más lenta: ${slowest.label} (${slowest.ms}ms)`)}`
    )

  console.log('')
  console.log(bold(col('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')))
  console.log('')

  const exitCode = fail > 0 || err > 0 ? 1 : 0
  process.exit(exitCode)
}

runAudit().catch(e => {
  console.error(col('red', `\nError inesperado: ${e.message}`))
  process.exit(1)
})
