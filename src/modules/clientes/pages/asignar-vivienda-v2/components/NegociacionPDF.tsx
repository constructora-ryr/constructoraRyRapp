/**
 * NegociacionPDF — Carta de Intención de Compra
 *
 * Diseño basado en: ui_kits/app/ResumenNegociacionPDF.html
 * Paleta: Brand Red #be1522 / Brand Black #111111 / White
 */

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

// ── Types ──────────────────────────────────────────────────────

export interface FuentePDFItem {
  nombre: string
  entidad?: string
  monto: number
  color?: string
}

export interface NegociacionPDFProps {
  clienteNombre: string
  proyectoNombre: string
  viviendaLabel: string
  valorBase: number
  gastosNotariales: number
  recargoEsquinera: number
  descuentoAplicado: number
  valorTotal: number
  valorEscrituraPublica?: number
  aplicarDescuento: boolean
  fuentes: FuentePDFItem[]
  notas?: string
  fechaGeneracion: string
  esBorrador?: boolean
}

// ── Brand tokens ───────────────────────────────────────────────
const RED = '#be1522'
const BLACK = '#111111'
const WHITE = '#ffffff'
const GRAY_50 = '#f9fafb'
const GRAY_100 = '#f3f4f6'
const GRAY_200 = '#e5e7eb'
const GRAY_400 = '#9ca3af'
const GRAY_500 = '#6b7280'
const GRAY_700 = '#374151'
const RED_TINT = '#fef2f2'
const RED_BORDER = '#fca5a5'

// ── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: WHITE,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BLACK,
    position: 'relative',
  },

  // Left accent bar
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: RED,
  },

  // Top gradient bar inside header
  headerTopBar: {
    height: 4,
    backgroundColor: RED,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 18,
    paddingLeft: 50,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 100,
    height: 32,
    objectFit: 'contain',
  },
  logoDivider: {
    width: 1,
    height: 28,
    backgroundColor: GRAY_200,
    marginHorizontal: 12,
  },
  headerTagline: {
    fontSize: 7,
    color: GRAY_400,
    letterSpacing: 0.4,
  },
  headerNit: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_500,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  docLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: RED,
    marginBottom: 3,
  },
  docTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    letterSpacing: -0.3,
    lineHeight: 1.1,
    textAlign: 'right',
  },
  docFecha: {
    fontSize: 8,
    color: GRAY_500,
    marginTop: 4,
  },
  borradorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  borradorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d97706',
  },
  borradorTxt: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#b45309',
    letterSpacing: 0.4,
  },

  // Banda total — gradiente simulado con Views de colores escalonados
  banda: {
    position: 'relative',
  },
  // Fila de Views de colores que simulan el gradiente (ocupa el espacio)
  bandaGradRow: {
    flexDirection: 'row',
    height: 88,
  },
  // Contenido superpuesto sobre el gradiente
  bandaInner: {
    position: 'absolute',
    top: 0,
    left: 50,
    right: 40,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bandaLeft: {},
  bandaLabelTxt: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#fca5a5',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  bandaValor: {
    fontSize: 38,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: -1,
    lineHeight: 1,
  },
  bandaSub: {
    fontSize: 8,
    color: '#fca5a5',
    marginTop: 5,
  },
  // Pill sin border (rgba no funciona en react-pdf) — fondo levemente más oscuro
  bandaPill: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#7f0a0f',
    alignItems: 'flex-end',
  },
  bandaPillLabel: {
    fontSize: 7,
    color: '#fca5a5',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  bandaPillVal: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    marginTop: 2,
  },

  // Content area
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingLeft: 50,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 14,
  },

  // Section container
  seccion: {
    borderWidth: 1,
    borderColor: GRAY_200,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: WHITE,
  },
  secHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: GRAY_50,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
  },
  secAccent: {
    width: 3,
    height: 13,
    borderRadius: 2,
    backgroundColor: RED,
  },
  secTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secBody: {
    padding: 12,
  },

  // Chips (datos negociación)
  chips: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flex: 1,
    padding: 10,
    borderRadius: 7,
    backgroundColor: GRAY_50,
    borderWidth: 1,
    borderColor: GRAY_200,
  },
  chipLabel: {
    fontSize: 7,
    color: GRAY_400,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  chipVal: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },

  // Filas financieras
  finFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  finLbl: {
    fontSize: 9,
    color: GRAY_500,
  },
  finVal: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
  },
  finValRojo: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: RED,
  },
  finBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: RED_TINT,
    borderWidth: 1,
    borderColor: RED_BORDER,
    marginLeft: 6,
  },
  finBadgeTxt: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: RED,
  },
  finTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: RED,
  },
  finTotalLbl: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: 'rgba(255,255,255,0.85)',
  },
  finTotalVal: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: -0.5,
  },
  finExtra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: GRAY_50,
  },

  // Tabla fuentes
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: BLACK,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tablaHdrTxt: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tablaRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
    alignItems: 'center',
  },
  tablaRowAlt: {
    backgroundColor: GRAY_50,
  },
  tablaTotalRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: RED_TINT,
    borderTopWidth: 2,
    borderTopColor: RED,
  },
  colFuente: { flex: 3 },
  colEntidad: { flex: 3 },
  colMonto: { flex: 2 },
  cellTxt: { fontSize: 9.5, color: BLACK, fontFamily: 'Helvetica-Bold' },
  cellSub: { fontSize: 8, color: GRAY_500 },
  cellMonto: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: BLACK,
    textAlign: 'right',
  },
  cellMontoRojo: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    textAlign: 'right',
  },
  fuenteDot: {
    width: 6,
    height: 6,
    borderRadius: 2,
    marginRight: 5,
  },

  // Nota / observaciones
  nota: {
    borderWidth: 1,
    borderColor: GRAY_200,
    borderRadius: 7,
    padding: 10,
    backgroundColor: GRAY_50,
  },
  notaLbl: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  notaTxt: {
    fontSize: 8.5,
    color: GRAY_700,
    fontStyle: 'italic',
    lineHeight: 1.6,
  },

  // Fin del documento
  finDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  finDocLine: {
    flex: 1,
    height: 1,
    backgroundColor: GRAY_200,
  },
  finDocTxt: {
    fontSize: 7,
    color: GRAY_400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Footer
  footer: {
    paddingHorizontal: 40,
    paddingLeft: 50,
    paddingVertical: 12,
    backgroundColor: GRAY_50,
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
  },
  footerLegal: {
    fontSize: 7,
    color: GRAY_400,
    lineHeight: 1.65,
    textAlign: 'center',
    marginBottom: 7,
  },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerGen: {
    fontSize: 7,
    color: GRAY_400,
  },
  footerDoc: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_500,
  },
})

// ── Helpers ─────────────────────────────────────────────────────

function formatCOP(value: number) {
  return `$${value.toLocaleString('es-CO')}`
}

const FUENTE_COLORS: Record<string, string> = {
  'Cuota Inicial': '#10b981',
  'Crédito Hipotecario': '#3b82f6',
  Subsidio: '#f59e0b',
  'Crédito Constructor': '#8b5cf6',
  'Mi Casa Ya': '#06b6d4',
}

function getFuenteColor(nombre: string, override?: string): string {
  if (override) return override
  for (const [key, color] of Object.entries(FUENTE_COLORS)) {
    if (nombre.toLowerCase().includes(key.toLowerCase())) return color
  }
  return '#6b7280'
}

// ── Component ───────────────────────────────────────────────────

export function NegociacionPDF({
  clienteNombre,
  proyectoNombre,
  viviendaLabel,
  valorBase,
  gastosNotariales,
  recargoEsquinera,
  descuentoAplicado,
  valorTotal,
  valorEscrituraPublica,
  aplicarDescuento,
  fuentes,
  notas,
  fechaGeneracion,
  esBorrador = true,
}: NegociacionPDFProps) {
  const valorBaseTotal = valorBase + gastosNotariales + recargoEsquinera
  const pctDescuento =
    valorBaseTotal > 0
      ? ((descuentoAplicado / valorBaseTotal) * 100).toFixed(1)
      : '0'

  const totalFuentes = fuentes.reduce((sum, f) => sum + f.monto, 0)

  return (
    <Document
      title={`Negociación — ${clienteNombre}`}
      author='Constructora RyR Ltda.'
      subject='Resumen de asignación de vivienda y fuentes de pago'
    >
      <Page size='A4' style={s.page}>
        {/* ── Barra izquierda de acento ── */}
        <View style={s.accentBar} />

        {/* ── Barra superior del header ── */}
        <View style={s.headerTopBar} />

        {/* ── HEADER ────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image src='/images/logo1.png' style={s.logoImg} />
            <View style={s.logoDivider} />
            <View>
              <Text style={s.headerTagline}>Resumen de Negociación</Text>
              <Text style={s.headerNit}>NIT: 805.023.664</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.docLabel}>Documento Preliminar</Text>
            <Text style={s.docTitle}>{'Carta de Intención\nde Compra'}</Text>
            <Text style={s.docFecha}>Generado: {fechaGeneracion}</Text>
            {esBorrador && (
              <View style={s.borradorBadge}>
                <View style={s.borradorDot} />
                <Text style={s.borradorTxt}>BORRADOR · SIN VALIDEZ LEGAL</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── BANDA TOTAL ───────────────────────── */}
        <View style={s.banda}>
          {/* Gradiente simulado: fila de Views con colores escalonados */}
          <View style={s.bandaGradRow}>
            <View style={{ flex: 3, backgroundColor: '#be1522' }} />
            <View style={{ flex: 2, backgroundColor: '#9b1019' }} />
            <View style={{ flex: 1.5, backgroundColor: '#7f0a0f' }} />
            <View style={{ flex: 1, backgroundColor: '#4a0608' }} />
            <View style={{ flex: 0.5, backgroundColor: '#111111' }} />
          </View>
          {/* Contenido superpuesto */}
          <View style={s.bandaInner}>
            <View style={s.bandaLeft}>
              <Text style={s.bandaLabelTxt}>Total a pagar</Text>
              <Text style={s.bandaValor}>{formatCOP(valorTotal)}</Text>
              <Text style={s.bandaSub}>
                Valor negociado{' '}
                {aplicarDescuento && descuentoAplicado > 0
                  ? 'con descuento aplicado'
                  : 'sin descuento'}
              </Text>
            </View>
            {valorEscrituraPublica && valorEscrituraPublica > 0 ? (
              <View style={s.bandaPill}>
                <Text style={s.bandaPillLabel}>Valor escritura pública</Text>
                <Text style={s.bandaPillVal}>
                  {formatCOP(valorEscrituraPublica)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── CONTENIDO ────────────────────────── */}
        <View style={s.content}>
          {/* Datos de la negociación */}
          <View style={s.seccion}>
            <View style={s.secHdr}>
              <View style={s.secAccent} />
              <Text style={s.secTitle}>Datos de la Negociación</Text>
            </View>
            <View style={s.secBody}>
              <View style={s.chips}>
                <View style={s.chip}>
                  <Text style={s.chipLabel}>Cliente</Text>
                  <Text style={s.chipVal}>{clienteNombre}</Text>
                </View>
                <View style={s.chip}>
                  <Text style={s.chipLabel}>Proyecto</Text>
                  <Text style={s.chipVal}>{proyectoNombre}</Text>
                </View>
                <View style={s.chip}>
                  <Text style={s.chipLabel}>Vivienda</Text>
                  <Text style={s.chipVal}>{viviendaLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Resumen financiero */}
          <View style={s.seccion}>
            <View style={s.secHdr}>
              <View style={s.secAccent} />
              <Text style={s.secTitle}>Resumen Financiero</Text>
            </View>
            <View style={s.finFila}>
              <Text style={s.finLbl}>Valor base de la vivienda:</Text>
              <Text style={s.finVal}>{formatCOP(valorBase)}</Text>
            </View>
            {gastosNotariales > 0 && (
              <View style={s.finFila}>
                <Text style={s.finLbl}>Gastos notariales:</Text>
                <Text style={s.finVal}>{formatCOP(gastosNotariales)}</Text>
              </View>
            )}
            {recargoEsquinera > 0 && (
              <View style={s.finFila}>
                <Text style={s.finLbl}>Recargo esquinera:</Text>
                <Text style={s.finVal}>{formatCOP(recargoEsquinera)}</Text>
              </View>
            )}
            {aplicarDescuento && descuentoAplicado > 0 && (
              <View style={s.finFila}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={s.finLbl}>Descuento aplicado</Text>
                  <View style={s.finBadgeBox}>
                    <Text style={s.finBadgeTxt}>{pctDescuento}%</Text>
                  </View>
                </View>
                <Text style={s.finValRojo}>
                  − {formatCOP(descuentoAplicado)}
                </Text>
              </View>
            )}
            <View style={s.finTotal}>
              <Text style={s.finTotalLbl}>Total a Pagar</Text>
              <Text style={s.finTotalVal}>{formatCOP(valorTotal)}</Text>
            </View>
            {valorEscrituraPublica && valorEscrituraPublica > 0 && (
              <View style={s.finExtra}>
                <Text style={s.finLbl}>Valor escritura pública:</Text>
                <Text style={s.finVal}>{formatCOP(valorEscrituraPublica)}</Text>
              </View>
            )}
          </View>

          {/* Fuentes de pago */}
          {fuentes.length > 0 && (
            <View style={s.seccion}>
              <View style={s.secHdr}>
                <View style={s.secAccent} />
                <Text style={s.secTitle}>Fuentes de Pago</Text>
              </View>
              <View style={s.tablaHeader}>
                <Text style={[s.tablaHdrTxt, s.colFuente]}>Fuente</Text>
                <Text style={[s.tablaHdrTxt, s.colEntidad]}>
                  Entidad / Referencia
                </Text>
                <Text
                  style={[s.tablaHdrTxt, s.colMonto, { textAlign: 'right' }]}
                >
                  Monto
                </Text>
              </View>
              {fuentes.map((f, i) => (
                <View
                  key={`${f.nombre}-${i}`}
                  style={[s.tablaRow, i % 2 === 1 ? s.tablaRowAlt : {}]}
                >
                  <View
                    style={[
                      s.colFuente,
                      { flexDirection: 'row', alignItems: 'center' },
                    ]}
                  >
                    <View
                      style={[
                        s.fuenteDot,
                        { backgroundColor: getFuenteColor(f.nombre, f.color) },
                      ]}
                    />
                    <Text style={s.cellTxt}>{f.nombre}</Text>
                  </View>
                  <View style={s.colEntidad}>
                    <Text style={s.cellSub}>{f.entidad || '—'}</Text>
                  </View>
                  <Text style={[s.cellMonto, s.colMonto]}>
                    {formatCOP(f.monto)}
                  </Text>
                </View>
              ))}
              <View style={s.tablaTotalRow}>
                <Text style={[s.cellTxt, s.colFuente]}>Total fuentes</Text>
                <View style={s.colEntidad} />
                <Text style={[s.cellMontoRojo, s.colMonto]}>
                  {formatCOP(totalFuentes)}
                </Text>
              </View>
            </View>
          )}

          {/* Observaciones */}
          {notas ? (
            <View style={s.nota}>
              <Text style={s.notaLbl}>Observaciones:</Text>
              <Text style={s.notaTxt}>&quot;{notas}&quot;</Text>
            </View>
          ) : null}

          {/* Fin del documento */}
          <View style={s.finDocRow}>
            <View style={s.finDocLine} />
            <Text style={s.finDocTxt}>— Fin del documento —</Text>
            <View style={s.finDocLine} />
          </View>
        </View>

        {/* ── FOOTER ───────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLegal}>
            {`Este documento es un resumen preliminar de negociación emitido por Constructora RyR Ltda. No constituye un contrato ni compromiso legal de compraventa. Los valores aquí presentados están sujetos a verificación y aprobación final.\nconstructoraryrltda@hotmail.com · 318 4946116`}
          </Text>
          <View style={s.footerBottom}>
            <Text style={s.footerGen}>Generado el: {fechaGeneracion}</Text>
            <Text style={s.footerDoc}>
              Documento generado digitalmente · No requiere firma física
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
