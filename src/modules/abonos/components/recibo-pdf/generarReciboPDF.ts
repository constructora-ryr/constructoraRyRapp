/**
 * generarReciboPDF
 *
 * Genera el recibo de pago como HTML y lo muestra en una ventana de impresión.
 * El usuario guarda como PDF desde el diálogo de impresión del navegador.
 *
 * ⚠️ Solo se puede llamar desde código cliente (browser).
 */

import type { AbonoParaDetalle } from '../abono-detalle-modal/useAbonoDetalle'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

function formatFecha(fechaISO: string): string {
  try {
    const [y, m, d] = fechaISO.split('T')[0].split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return fechaISO
  }
}

function formatNumeroRecibo(n: number): string {
  return `RYR-${String(n).padStart(4, '0')}`
}

function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Interfaz de opciones ──────────────────────────────────────────────────────

interface OpcionesRecibo {
  logoUrl?: string
  valorTotal?: number
  totalAbonado?: number
  saldoPendiente?: number
  emisorNombre?: string
  emisorCargo?: string
}

// ─── Builder HTML ─────────────────────────────────────────────────────────────

function buildReciboHtml(
  abono: AbonoParaDetalle,
  opciones: OpcionesRecibo = {}
): string {
  const {
    logoUrl = '',
    valorTotal,
    totalAbonado,
    emisorNombre = '',
    emisorCargo = '',
  } = opciones

  const estaAnulado = abono.estado === 'Anulado'
  const numeroRecibo = formatNumeroRecibo(abono.numero_recibo)
  const nombreCompleto =
    `${abono.cliente.nombres} ${abono.cliente.apellidos}`.trim()

  const viviendaLabel = abono.vivienda.manzana.identificador
    ? `Manzana ${esc(abono.vivienda.manzana.identificador)} · Casa No. ${esc(abono.vivienda.numero)}`
    : `Casa No. ${esc(abono.vivienda.numero)}`

  const fechaPago = formatFecha(abono.fecha_abono)

  const hoy = new Date()
  const fechaGeneracion = hoy.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const horaGeneracion = hoy.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Financiero
  const saldoPendiente =
    valorTotal !== undefined && totalAbonado !== undefined
      ? Math.max(0, valorTotal - totalAbonado)
      : undefined
  const pct =
    valorTotal && totalAbonado
      ? Math.min(100, Math.max(0, (totalAbonado / valorTotal) * 100))
      : 0
  const pctStr = pct.toFixed(1)

  const fechaAnulacion = abono.fecha_anulacion
    ? formatFecha(abono.fecha_anulacion)
    : null

  // Sección financiera (solo si hay datos)
  const seccionFinanciera =
    valorTotal !== undefined && totalAbonado !== undefined
      ? `
      <div class="fin">
        <div class="sec-hdr" style="border-radius:0; border-bottom:1px solid #e5e7eb">
          <div class="sec-accent"></div>
          <div class="sec-title">Resumen Financiero</div>
        </div>
        <div class="fin-progress">
          <div class="fin-prog-row">
            <div class="fin-prog-main">
              <div class="fin-prog-amounts">${esc(formatCurrency(totalAbonado))} <span>de ${esc(formatCurrency(valorTotal))}</span> pagados</div>
              <div class="fin-prog-sub">Incluye el pago de este recibo · Valor total de la vivienda: ${esc(formatCurrency(valorTotal))}</div>
            </div>
            <div class="fin-prog-pct">${pctStr}%</div>
          </div>
          <div class="prog-track">
            <div class="prog-fill" style="width:${pctStr}%"></div>
          </div>
        </div>
        <div class="fin-fila"><span class="fin-lbl">Valor total de la vivienda:</span><span class="fin-val">${esc(formatCurrency(valorTotal))}</span></div>
        <div class="fin-fila"><span class="fin-lbl">Total abonado (incluye este pago):</span><span class="fin-val">${esc(formatCurrency(totalAbonado))}</span></div>
        <div class="fin-fila"><span class="fin-lbl">Este pago:</span><span class="fin-val verde">+ ${esc(formatCurrency(abono.monto))}</span></div>
        <div class="fin-total">
          <span class="fin-tot-lbl">Saldo pendiente después de este pago:</span>
          <span class="fin-tot-val">${esc(formatCurrency(saldoPendiente ?? 0))}</span>
        </div>
      </div>`
      : ''

  // Sección observaciones
  const seccionNotas = abono.notas
    ? `
      <div class="nota">
        <div class="nota-lbl">Observaciones:</div>
        <div class="nota-txt">"${esc(abono.notas)}"</div>
      </div>`
    : ''

  // Banner anulado
  const bannerAnulado = estaAnulado
    ? `
      <div class="banner-anulado">
        <div class="ban-hdr">
          <span style="font-size:12px;color:white">⚠</span>
          <span class="ban-hdr-txt">Este recibo ha sido anulado — no tiene validez como comprobante de pago</span>
        </div>
        <div class="ban-body">
          ${abono.motivo_categoria ? `<div class="fila"><div class="f-lbl">Motivo:</div><div class="f-val">${esc(abono.motivo_categoria)}</div></div>` : ''}
          ${abono.motivo_detalle ? `<div class="fila"><div class="f-lbl">Detalle:</div><div class="f-val">${esc(abono.motivo_detalle)}</div></div>` : ''}
          ${abono.anulado_por_nombre ? `<div class="fila"><div class="f-lbl">Anulado por:</div><div class="f-val">${esc(abono.anulado_por_nombre)}</div></div>` : ''}
          ${fechaAnulacion ? `<div class="fila"><div class="f-lbl">Fecha de anulación:</div><div class="f-val">${fechaAnulacion}</div></div>` : ''}
        </div>
      </div>`
    : ''

  // Firma del emisor
  const firmaEmisor =
    emisorNombre || emisorCargo
      ? `
      <div class="firma-emisor">
        <div>
          <div class="firma-label">Emitido por</div>
          <div class="firma-val">${esc(emisorNombre)}</div>
        </div>
        <div class="firma-sep"></div>
        <div>
          <div class="firma-label">Cargo</div>
          <div class="firma-val">${esc(emisorCargo)}</div>
        </div>
        <div class="firma-sep"></div>
        <div>
          <div class="firma-label">Fecha y hora</div>
          <div class="firma-val">${fechaGeneracion} · ${horaGeneracion}</div>
        </div>
      </div>`
      : `
      <div class="firma-emisor">
        <div>
          <div class="firma-label">Emitido por</div>
          <div class="firma-val">Constructora RyR Ltda.</div>
        </div>
        <div class="firma-sep"></div>
        <div>
          <div class="firma-label">Fecha y hora</div>
          <div class="firma-val">${fechaGeneracion} · ${horaGeneracion}</div>
        </div>
      </div>`

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(numeroRecibo)} — Constructora RyR</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      .toolbar { display: none !important; }
      body { background: white !important; padding: 0 !important; }
    }
    *, *::before, *::after {
      box-sizing: border-box; margin: 0; padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      background: #d1d5db;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      display: flex; flex-direction: column; align-items: center;
      padding: 28px 16px 48px; min-height: 100vh;
    }

    /* ── Toolbar ── */
    .toolbar {
      display: flex; gap: 10px; margin-bottom: 20px; align-items: center;
      background: white; border-radius: 10px; padding: 8px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .toolbar span { font-size: 11px; color: #6b7280; font-weight: 500; }
    .tbtn { padding: 6px 14px; border-radius: 6px; border: none; font-size: 11px; font-weight: 700; cursor: pointer; transition: opacity 0.15s; }
    .tbtn:hover { opacity: 0.85; }
    .tbtn-red { background: #be1522; color: white; }
    .tbtn-out { background: transparent; border: 1px solid #e5e7eb; color: #374151; }

    /* ── A4 Paper ── */
    .paper {
      width: 794px; min-height: 1123px; background: white;
      box-shadow: 0 8px 40px rgba(0,0,0,0.2);
      border-radius: 3px; position: relative; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .paper::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px;
      background: linear-gradient(180deg, #be1522 0%, #9b1019 50%, #111111 100%);
      z-index: 20;
    }
    .paper::after {
      content: '${esc(numeroRecibo)}';
      position: absolute; bottom: 80px; right: 30px;
      font-size: 72px; font-weight: 900; color: rgba(190,21,34,0.05);
      letter-spacing: -0.03em; pointer-events: none; z-index: 1;
      font-family: 'Helvetica Neue', Helvetica, sans-serif; user-select: none;
    }

    /* ── Watermark ── */
    .watermark {
      position: absolute; inset: 0; display: flex; align-items: center;
      justify-content: center; pointer-events: none; z-index: 10;
    }
    .watermark-text {
      font-size: 120px; font-weight: 900; color: rgba(190,21,34,0.10);
      transform: rotate(-35deg); letter-spacing: 0.05em; white-space: nowrap;
      user-select: none; text-transform: uppercase;
    }

    /* ── Header ── */
    .header {
      padding: 22px 40px 18px; display: flex; align-items: center;
      justify-content: space-between; border-bottom: 1px solid #e5e7eb; position: relative;
    }
    .header::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, #be1522 0%, #9b1019 55%, #111111 100%);
    }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .logo-img { height: 38px; object-fit: contain; }
    .logo-divider { width: 1px; height: 32px; background: #e5e7eb; }
    .header-tagline { font-size: 9px; color: #9ca3af; letter-spacing: 0.04em; }
    .header-nit { font-size: 9px; font-weight: 700; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; }
    .recibo-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #be1522; margin-bottom: 3px; }
    .recibo-numero { font-size: 26px; font-weight: 900; color: #111111; letter-spacing: -0.03em; line-height: 1; }
    .recibo-fecha { font-size: 9px; color: #6b7280; margin-top: 4px; }
    .estado-badge {
      display: inline-flex; align-items: center; gap: 5px; margin-top: 6px;
      border-radius: 20px; padding: 3px 12px;
      background: ${estaAnulado ? '#fef2f2' : '#f0fdf4'};
      border: 1px solid ${estaAnulado ? '#fca5a5' : '#86efac'};
    }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: ${estaAnulado ? '#dc2626' : '#16a34a'}; }
    .badge-txt { font-size: 9px; font-weight: 700; color: ${estaAnulado ? '#dc2626' : '#15803d'}; letter-spacing: 0.05em; }

    /* ── Monto banda ── */
    .monto-banda {
      background: linear-gradient(130deg, #be1522 0%, #9b1019 45%, #7f0a0f 75%, #111111 100%);
      padding: 26px 40px; display: flex; align-items: center;
      justify-content: space-between; position: relative; overflow: hidden;
    }
    .monto-banda::before {
      content: ''; position: absolute; inset: 0;
      background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0);
      background-size: 22px 22px;
    }
    .monto-banda::after {
      content: ''; position: absolute; right: -80px; top: -80px;
      width: 260px; height: 260px; border-radius: 50%;
      background: rgba(255,255,255,0.04); pointer-events: none;
    }
    .monto-left { position: relative; z-index: 1; }
    .monto-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 5px; }
    .monto-valor {
      font-size: 44px; font-weight: 900; color: white; letter-spacing: -0.04em;
      line-height: 1; text-shadow: 0 2px 16px rgba(0,0,0,0.25);
      ${estaAnulado ? 'text-decoration: line-through; opacity: 0.55;' : ''}
    }
    .monto-fecha { font-size: 9.5px; color: rgba(255,255,255,0.55); margin-top: 6px; }
    .monto-right { position: relative; z-index: 1; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .monto-metodo-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22);
      border-radius: 8px; padding: 7px 16px;
    }
    .monto-metodo-label { font-size: 8px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; }
    .monto-metodo-val { font-size: 12px; font-weight: 700; color: white; }
    .recibo-num-banda { font-size: 9px; color: rgba(255,255,255,0.45); }

    /* ── Contenido ── */
    .content { padding: 22px 40px; flex: 1; display: flex; flex-direction: column; gap: 14px; }
    .seccion { border-radius: 8px; overflow: hidden; }
    .sec-hdr { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; }
    .sec-accent { width: 3px; height: 14px; border-radius: 2px; background: #be1522; flex-shrink: 0; }
    .sec-title { font-size: 9px; font-weight: 800; color: #111111; text-transform: uppercase; letter-spacing: 0.12em; }
    .sec-body { padding: 13px 14px 11px; display: flex; flex-direction: column; gap: 8px; }
    .fila { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 7px; border-bottom: 1px solid #f3f4f6; }
    .fila:last-child { border-bottom: none; padding-bottom: 0; }
    .f-lbl { font-size: 9px; color: #6b7280; font-weight: 500; max-width: 40%; }
    .f-val { font-size: 10px; font-weight: 700; color: #111111; text-align: right; max-width: 58%; }
    .f-val.mono { font-family: 'Courier New', monospace; font-weight: 600; font-size: 9.5px; color: #374151; }
    .dos-col { display: flex; gap: 14px; }
    .col { flex: 1; }
    .prop-body { display: flex; }
    .prop-col { flex: 1; padding: 13px 14px; }
    .prop-col:first-child { border-right: 1px solid #f3f4f6; }

    /* ── Financiero ── */
    .fin { border-radius: 8px; overflow: hidden; }
    .fin-progress { padding: 12px 14px; background: #f9fafb; border-bottom: 1px solid #f3f4f6; }
    .fin-prog-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; }
    .fin-prog-main { display: flex; flex-direction: column; gap: 1px; }
    .fin-prog-amounts { font-size: 13px; font-weight: 800; color: #111111; letter-spacing: -0.02em; }
    .fin-prog-amounts span { color: #be1522; }
    .fin-prog-sub { font-size: 8.5px; color: #9ca3af; }
    .fin-prog-pct { font-size: 18px; font-weight: 900; color: #be1522; letter-spacing: -0.03em; }
    .prog-track { height: 8px; background: #e5e7eb; border-radius: 99px; overflow: hidden; }
    .prog-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#be1522,#9b1019); box-shadow: 0 0 10px rgba(190,21,34,0.35); }
    .fin-fila { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; border-bottom: 1px solid #f3f4f6; font-size: 9px; }
    .fin-fila:last-of-type { border-bottom: none; }
    .fin-lbl { color: #6b7280; }
    .fin-val { font-weight: 700; color: #111111; }
    .fin-val.verde { color: #16a34a; }
    .fin-total { display: flex; justify-content: space-between; align-items: center; padding: 13px 14px; background: #111111; }
    .fin-tot-lbl { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.75); }
    .fin-tot-val { font-size: 16px; font-weight: 900; color: white; letter-spacing: -0.03em; }

    /* ── Banner anulado ── */
    .banner-anulado { border: 2px solid #dc2626; border-radius: 8px; overflow: hidden; }
    .ban-hdr { background: #dc2626; padding: 9px 14px; display: flex; align-items: center; gap: 7px; }
    .ban-hdr-txt { font-size: 9px; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.1em; }
    .ban-body { background: #fef2f2; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }

    /* ── Nota ── */
    .nota { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; background: #f9fafb; }
    .nota-lbl { font-size: 8px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px; }
    .nota-txt { font-size: 9px; color: #374151; font-style: italic; line-height: 1.6; }

    /* ── Firma emisor ── */
    .firma-emisor {
      display: flex; justify-content: space-between; align-items: center;
      padding: 9px 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 8.5px;
    }
    .firma-label { color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
    .firma-val { color: #374151; font-weight: 700; }
    .firma-sep { width: 1px; height: 28px; background: #e5e7eb; }

    /* ── Fin del documento ── */
    .fin-doc { display: flex; align-items: center; gap: 10px; margin: 4px 0 2px; }
    .fin-doc-line { flex: 1; height: 1px; background: #e5e7eb; }
    .fin-doc-txt { font-size: 8px; color: #9ca3af; white-space: nowrap; letter-spacing: 0.08em; text-transform: uppercase; }

    /* ── Footer ── */
    .footer { padding: 14px 40px 18px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
    .footer-legal { font-size: 7.5px; color: #9ca3af; line-height: 1.65; text-align: center; margin-bottom: 10px; }
    .footer-legal strong { color: #6b7280; }
    .footer-bottom { display: flex; justify-content: space-between; align-items: center; }
    .footer-gen { font-size: 7.5px; color: #9ca3af; }
    .footer-doc { font-size: 7.5px; font-weight: 700; color: #6b7280; }
    .footer-digital { font-size: 7.5px; color: #9ca3af; text-align: center; margin-top: 6px; font-style: italic; }

    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none; }
      .paper { box-shadow: none; width: 100%; min-height: auto; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>

  <div class="toolbar">
    <span>Vista previa — ${esc(numeroRecibo)} · Constructora RyR</span>
    <button class="tbtn tbtn-red" onclick="window.print()">Imprimir / Guardar PDF</button>
    <button class="tbtn tbtn-out" onclick="window.close()">Cerrar</button>
  </div>

  <div class="paper">

    ${estaAnulado ? '<div class="watermark"><span class="watermark-text">ANULADO</span></div>' : ''}

    <!-- HEADER -->
    <div class="header">
      <div class="header-left">
        ${logoUrl ? `<img src="${esc(logoUrl)}" class="logo-img" alt="Constructora RyR Ltda." />` : ''}
        <div class="logo-divider"></div>
        <div>
          <div class="header-tagline">Comprobante de Pago</div>
          <div class="header-nit">NIT: 805.023.664</div>
        </div>
      </div>
      <div class="header-right">
        <div class="recibo-label">Recibo de Pago</div>
        <div class="recibo-numero">${esc(numeroRecibo)}</div>
        <div class="recibo-fecha">Fecha de pago: ${fechaPago}</div>
        <div class="estado-badge">
          <div class="badge-dot"></div>
          <span class="badge-txt">${estaAnulado ? '✗ ANULADO' : '✓ PAGO RECIBIDO'}</span>
        </div>
      </div>
    </div>

    <!-- MONTO BANDA -->
    <div class="monto-banda">
      <div class="monto-left">
        <div class="monto-label">${estaAnulado ? 'Valor anulado' : 'Valor recibido'}</div>
        <div class="monto-valor">${esc(formatCurrency(abono.monto))}</div>
        <div class="monto-fecha">Registrado el ${fechaPago}</div>
      </div>
      <div class="monto-right">
        <div class="monto-metodo-pill">
          <div>
            <div class="monto-metodo-label">Método de pago</div>
            <div class="monto-metodo-val">${esc(abono.metodo_pago)}</div>
          </div>
        </div>
        <div class="recibo-num-banda">Recibo: ${esc(numeroRecibo)}</div>
      </div>
    </div>

    <!-- CONTENIDO -->
    <div class="content">

      <!-- Cliente + Detalles -->
      <div class="dos-col">
        <div class="col">
          <div class="seccion">
            <div class="sec-hdr"><div class="sec-accent"></div><div class="sec-title">Datos del Cliente</div></div>
            <div class="sec-body">
              <div class="fila"><div class="f-lbl">Nombre completo:</div><div class="f-val">${esc(nombreCompleto)}</div></div>
              <div class="fila"><div class="f-lbl">Cédula / NIT:</div><div class="f-val mono">${esc(abono.cliente.numero_documento)}</div></div>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="seccion">
            <div class="sec-hdr"><div class="sec-accent"></div><div class="sec-title">Detalles del Pago</div></div>
            <div class="sec-body">
              <div class="fila"><div class="f-lbl">Concepto:</div><div class="f-val">${esc(abono.fuente_pago.tipo)}</div></div>
              <div class="fila"><div class="f-lbl">Fecha de pago:</div><div class="f-val">${fechaPago}</div></div>
              ${abono.numero_referencia ? `<div class="fila"><div class="f-lbl">N.° de referencia:</div><div class="f-val mono">${esc(abono.numero_referencia)}</div></div>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Propiedad -->
      <div class="seccion">
        <div class="sec-hdr"><div class="sec-accent"></div><div class="sec-title">Propiedad</div></div>
        <div class="prop-body">
          <div class="prop-col">
            <div class="fila"><div class="f-lbl">Proyecto:</div><div class="f-val">${esc(abono.proyecto.nombre)}</div></div>
          </div>
          <div class="prop-col">
            <div class="fila"><div class="f-lbl">Vivienda:</div><div class="f-val">${viviendaLabel}</div></div>
          </div>
        </div>
      </div>

      ${seccionFinanciera}
      ${seccionNotas}
      ${bannerAnulado}
      ${firmaEmisor}

      <!-- Fin del documento -->
      <div class="fin-doc">
        <div class="fin-doc-line"></div>
        <div class="fin-doc-txt">— Fin del documento —</div>
        <div class="fin-doc-line"></div>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-legal">
        Este documento constituye un comprobante de pago emitido por <strong>Constructora RyR Ltda.</strong>
        Cualquier verificación o aclaración podrá realizarse presentando este comprobante como soporte de su transacción.
        <strong>Este documento no constituye una factura electrónica de venta.</strong>
        &nbsp;·&nbsp; constructoraryrltda@hotmail.com &nbsp;·&nbsp; 318 4946116
      </div>
      <div class="footer-bottom">
        <div class="footer-gen">Generado el: ${fechaGeneracion} · ${horaGeneracion}</div>
        <div class="footer-doc">Documento: ${esc(numeroRecibo)}</div>
      </div>
      <div class="footer-digital">Documento generado digitalmente por el sistema Constructora RyR — no requiere firma física</div>
    </div>

  </div>

</body>
</html>`
}

// ─── Función principal ─────────────────────────────────────────────────────────

export async function generarYDescargarRecibo(
  abono: AbonoParaDetalle,
  opciones?: OpcionesRecibo
): Promise<void> {
  const logoUrl =
    opciones?.logoUrl ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}/images/logo1.png`
      : '')

  const html = buildReciboHtml(abono, { ...opciones, logoUrl })

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'width=940,height=760,scrollbars=yes')
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
