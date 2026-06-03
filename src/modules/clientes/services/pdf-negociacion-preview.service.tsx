'use client'

/**
 * pdf-negociacion-preview.service
 *
 * Resumen de Negociación (Carta de Intención de Compra) — Constructora RyR Ltda.
 * Migrado a @react-pdf/renderer para mantener consistencia visual con el
 * recibo de abonos (ReciboAbonoPDF).
 *
 * Diseño:
 *  - Franja lateral roja + línea superior de marca
 *  - Banda roja con "Total a pagar" protagonista + valor escritura
 *  - Secciones con acento lateral rojo
 *  - Badge BORRADOR + marca de agua diagonal (documento preliminar)
 *  - Tabla de fuentes de pago con header negro
 */

import {
  Document,
  Font,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

Font.registerHyphenationCallback(word => [word])

// ─── Datos ───────────────────────────────────────────────────────────────────
export interface DatosPreviewPDF {
  cliente: {
    nombres: string
    apellidos: string
    cedula?: string
  }
  vivienda: {
    proyecto: string
    manzana?: string
    numeroVivienda: string
  }
  valorBase: number
  descuento: number
  valorFinal: number
  /** Opcional — gastos notariales (si aplica) */
  gastosNotariales?: number
  /** Opcional — valor de escritura pública (si aplica) */
  valorEscrituraPublica?: number
  fuentesPago: Array<{
    tipo: string
    monto: number
    entidad?: string
  }>
  notas?: string
  /** Usuario que genera el documento */
  generadoPor?: string
}

// ─── Paleta de marca (idéntica al recibo) ──────────────────────────────────────
const C = {
  rojo: '#be1522',
  rojoDark: '#9b1019',
  rojoDeep: '#7f0a0f',
  negro: '#111111',
  blanco: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray700: '#374151',
  ambar: '#d97706',
  ambarBg: '#fffbeb',
  ambarBorder: '#fcd34d',
  ambarText: '#b45309',
  verde: '#10b981',
  azul: '#3b82f6',
}

// Colores rotativos para el indicador de cada fuente de pago
const FUENTE_DOTS = ['#10b981', '#3b82f6', '#a855f7', '#f97316', '#6366f1']

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.blanco,
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingLeft: 5,
  },

  // Franja lateral
  franja: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: C.rojo,
  },

  // Watermark BORRADOR
  watermark: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 340,
    textAlign: 'center',
    transform: 'rotate(-35deg)',
    opacity: 0.06,
  },
  watermarkText: {
    fontSize: 110,
    fontFamily: 'Helvetica-Bold',
    color: C.rojo,
    letterSpacing: 4,
  },

  // Header
  headerStripe: { height: 4, backgroundColor: C.rojo },
  header: {
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { height: 38, width: 145, objectFit: 'contain' },
  logoDivider: { width: 1, height: 32, backgroundColor: C.gray200 },
  headerTagline: { fontSize: 8, color: C.gray400, marginBottom: 2 },
  headerNit: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.gray500 },

  headerRight: { alignItems: 'flex-end' },
  docLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    color: C.rojo,
    marginBottom: 3,
  },
  docTitle: {
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    color: C.negro,
    letterSpacing: -0.3,
    textAlign: 'right',
    lineHeight: 1.1,
  },
  docFecha: { fontSize: 8, color: C.gray500, marginTop: 4 },
  borradorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: C.ambarBg,
    borderWidth: 1,
    borderColor: C.ambarBorder,
  },
  borradorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.ambar,
  },
  borradorTxt: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.ambarText,
    letterSpacing: 0.4,
  },

  // Banda
  banda: {
    backgroundColor: C.rojoDark,
    paddingVertical: 24,
    paddingHorizontal: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bandaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 5,
  },
  bandaValor: {
    fontSize: 38,
    fontFamily: 'Helvetica-Bold',
    color: C.blanco,
    letterSpacing: -1,
    lineHeight: 1,
  },
  bandaSub: { fontSize: 8.5, color: 'rgba(255,255,255,0.55)', marginTop: 6 },
  bandaRight: { alignItems: 'flex-end' },
  bandaPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#7a0c17',
    borderRadius: 8,
  },
  bandaPillLabel: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bandaPillVal: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.blanco,
    marginTop: 1,
  },

  // Contenido
  content: { paddingTop: 20, paddingHorizontal: 36, flex: 1, gap: 12 },

  // Sección
  seccion: {
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 6,
    overflow: 'hidden',
  },
  secHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: C.gray50,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  secAccent: { width: 3, height: 12, borderRadius: 2, backgroundColor: C.rojo },
  secTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: C.negro,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  secBody: { paddingHorizontal: 14, paddingVertical: 12 },

  // Chips de datos
  chips: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderColor: C.gray200,
  },
  chipLabel: {
    fontSize: 7,
    color: C.gray400,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  chipVal: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.negro },

  // Filas financieras
  finFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
  },
  finLbl: { fontSize: 9, color: C.gray500 },
  finLblRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  finVal: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.negro },
  finValRojo: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.rojo },
  finBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  finBadgeTxt: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.rojo },
  finTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: C.rojoDark,
  },
  finTotalLbl: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: 'rgba(255,255,255,0.85)',
  },
  finTotalVal: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.blanco,
    letterSpacing: -0.5,
  },
  finExtra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: C.gray50,
  },

  // Tabla fuentes
  tablaHead: {
    flexDirection: 'row',
    backgroundColor: C.negro,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tablaHeadCell: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.blanco,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tablaRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.gray100,
    alignItems: 'center',
  },
  tablaRowAlt: { backgroundColor: C.gray50 },
  tablaTotal: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#fef2f2',
    borderTopWidth: 2,
    borderTopColor: C.rojo,
    alignItems: 'center',
  },
  colFuente: {
    width: '42%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colEntidad: { width: '38%' },
  colMonto: { width: '20%', textAlign: 'right' },
  fuenteDot: { width: 6, height: 6, borderRadius: 2 },
  cellFuente: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.negro },
  cellEntidad: { fontSize: 9, color: C.gray500 },
  cellMonto: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: C.negro,
    textAlign: 'right',
  },
  cellTotalLbl: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.negro },
  cellTotalMonto: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.rojo,
    textAlign: 'right',
  },

  // Nota
  nota: {
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 6,
    padding: 11,
    backgroundColor: C.gray50,
  },
  notaLbl: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  notaTxt: {
    fontSize: 8.5,
    color: C.gray700,
    fontStyle: 'italic',
    lineHeight: 1.5,
  },

  // Fin documento
  finDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  finDocLine: { flex: 1, height: 1, backgroundColor: C.gray200 },
  finDocTxt: {
    fontSize: 7.5,
    color: C.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 36,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: C.gray50,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
  },
  footerLegal: {
    fontSize: 7,
    color: C.gray400,
    lineHeight: 1.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerLegalBold: { fontFamily: 'Helvetica-Bold', color: C.gray500 },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerGen: { fontSize: 7, color: C.gray400 },
  footerDoc: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray500 },
})

// ─── Helpers ───────────────────────────────────────────────────────────────────
function cop(v: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)
}

function fechaLarga(): string {
  return new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
function fechaHora(): string {
  return new Date().toLocaleString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Documento ──────────────────────────────────────────────────────────────────
function ResumenNegociacionDoc({
  datos,
  logoUrl,
}: {
  datos: DatosPreviewPDF
  logoUrl?: string
}) {
  const nombreCompleto =
    `${datos.cliente.nombres} ${datos.cliente.apellidos}`.trim()
  const viviendaLabel = datos.vivienda.manzana
    ? `Manzana ${datos.vivienda.manzana} · Casa ${datos.vivienda.numeroVivienda}`
    : `Casa ${datos.vivienda.numeroVivienda}`

  const pctDescuento =
    datos.valorBase > 0 ? (datos.descuento / datos.valorBase) * 100 : 0
  const totalFuentes = datos.fuentesPago.reduce((s, f) => s + f.monto, 0)

  return (
    <Document
      title={`Resumen Negociación - ${nombreCompleto}`}
      author='Constructora RyR Ltda.'
      subject='Resumen de Negociación'
      creator='Sistema RyR'
    >
      <Page size='A4' style={styles.page}>
        {/* Watermark BORRADOR */}
        <View style={styles.watermark} fixed>
          <Text style={styles.watermarkText}>BORRADOR</Text>
        </View>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : null}
            <View style={styles.logoDivider} />
            <View>
              <Text style={styles.headerTagline}>Resumen de Negociación</Text>
              <Text style={styles.headerNit}>NIT: 805.023.664</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docLabel}>Documento Preliminar</Text>
            <Text style={styles.docTitle}>Resumen de Negociación</Text>
            <Text style={styles.docFecha}>Generado: {fechaLarga()}</Text>
            <View style={styles.borradorBadge}>
              <View style={styles.borradorDot} />
              <Text style={styles.borradorTxt}>
                BORRADOR · SIN VALIDEZ LEGAL
              </Text>
            </View>
          </View>
        </View>

        {/* BANDA TOTAL */}
        <View style={styles.banda}>
          <View>
            <Text style={styles.bandaLabel}>Total a pagar</Text>
            <Text style={styles.bandaValor}>{cop(datos.valorFinal)}</Text>
            <Text style={styles.bandaSub}>
              {datos.descuento > 0
                ? 'Valor negociado con descuento aplicado'
                : 'Valor negociado'}
            </Text>
          </View>
          {datos.valorEscrituraPublica !== undefined ? (
            <View style={styles.bandaRight}>
              <View style={styles.bandaPill}>
                <Text style={styles.bandaPillLabel}>
                  Valor escritura pública
                </Text>
                <Text style={styles.bandaPillVal}>
                  {cop(datos.valorEscrituraPublica)}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* CONTENIDO */}
        <View style={styles.content}>
          {/* Datos de la negociación */}
          <View style={styles.seccion}>
            <View style={styles.secHdr}>
              <View style={styles.secAccent} />
              <Text style={styles.secTitle}>Datos de la Negociación</Text>
            </View>
            <View style={styles.secBody}>
              <View style={styles.chips}>
                <View style={styles.chip}>
                  <Text style={styles.chipLabel}>Cliente</Text>
                  <Text style={styles.chipVal}>{nombreCompleto}</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipLabel}>Proyecto</Text>
                  <Text style={styles.chipVal}>{datos.vivienda.proyecto}</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipLabel}>Vivienda</Text>
                  <Text style={styles.chipVal}>{viviendaLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Resumen financiero */}
          <View style={styles.seccion}>
            <View style={styles.secHdr}>
              <View style={styles.secAccent} />
              <Text style={styles.secTitle}>Resumen Financiero</Text>
            </View>
            <View style={styles.finFila}>
              <Text style={styles.finLbl}>Valor base de la vivienda:</Text>
              <Text style={styles.finVal}>{cop(datos.valorBase)}</Text>
            </View>
            {datos.gastosNotariales !== undefined &&
            datos.gastosNotariales > 0 ? (
              <View style={styles.finFila}>
                <Text style={styles.finLbl}>Gastos notariales:</Text>
                <Text style={styles.finVal}>{cop(datos.gastosNotariales)}</Text>
              </View>
            ) : null}
            {datos.descuento > 0 ? (
              <View style={styles.finFila}>
                <View style={styles.finLblRow}>
                  <Text style={styles.finLbl}>Descuento aplicado</Text>
                  <View style={styles.finBadge}>
                    <Text style={styles.finBadgeTxt}>
                      {pctDescuento.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.finValRojo}>− {cop(datos.descuento)}</Text>
              </View>
            ) : null}
            <View style={styles.finTotal}>
              <Text style={styles.finTotalLbl}>Total a Pagar</Text>
              <Text style={styles.finTotalVal}>{cop(datos.valorFinal)}</Text>
            </View>
            {datos.valorEscrituraPublica !== undefined ? (
              <View style={styles.finExtra}>
                <Text style={styles.finLbl}>Valor escritura pública:</Text>
                <Text style={styles.finVal}>
                  {cop(datos.valorEscrituraPublica)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Fuentes de pago */}
          <View style={styles.seccion}>
            <View style={styles.secHdr}>
              <View style={styles.secAccent} />
              <Text style={styles.secTitle}>Fuentes de Pago</Text>
            </View>
            {datos.fuentesPago.length === 0 ? (
              <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
                <Text
                  style={{
                    fontSize: 9,
                    color: C.gray400,
                    fontStyle: 'italic',
                    textAlign: 'center',
                  }}
                >
                  Sin fuentes de pago configuradas
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.tablaHead}>
                  <Text style={[styles.tablaHeadCell, styles.colFuente]}>
                    Fuente
                  </Text>
                  <Text style={[styles.tablaHeadCell, styles.colEntidad]}>
                    Entidad / Referencia
                  </Text>
                  <Text style={[styles.tablaHeadCell, styles.colMonto]}>
                    Monto
                  </Text>
                </View>
                {datos.fuentesPago.map((f, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tablaRow,
                      ...(i % 2 === 1 ? [styles.tablaRowAlt] : []),
                    ]}
                  >
                    <View style={styles.colFuente}>
                      <View
                        style={[
                          styles.fuenteDot,
                          {
                            backgroundColor:
                              FUENTE_DOTS[i % FUENTE_DOTS.length],
                          },
                        ]}
                      />
                      <Text style={styles.cellFuente}>{f.tipo}</Text>
                    </View>
                    <Text style={[styles.cellEntidad, styles.colEntidad]}>
                      {f.entidad || '—'}
                    </Text>
                    <Text style={[styles.cellMonto, styles.colMonto]}>
                      {cop(f.monto)}
                    </Text>
                  </View>
                ))}
                <View style={styles.tablaTotal}>
                  <Text style={[styles.cellTotalLbl, styles.colFuente]}>
                    Total fuentes
                  </Text>
                  <Text style={styles.colEntidad}></Text>
                  <Text style={[styles.cellTotalMonto, styles.colMonto]}>
                    {cop(totalFuentes)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Observaciones */}
          {datos.notas && datos.notas.trim() ? (
            <View style={styles.nota}>
              <Text style={styles.notaLbl}>Observaciones:</Text>
              <Text style={styles.notaTxt}>“{datos.notas}”</Text>
            </View>
          ) : null}

          {/* Fin del documento */}
          <View style={styles.finDocRow}>
            <View style={styles.finDocLine} />
            <Text style={styles.finDocTxt}>— Fin del documento —</Text>
            <View style={styles.finDocLine} />
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLegal}>
            Este documento es un{' '}
            <Text style={styles.footerLegalBold}>
              resumen preliminar de negociación
            </Text>{' '}
            emitido por{' '}
            <Text style={styles.footerLegalBold}>Constructora RyR Ltda.</Text>{' '}
            No constituye un contrato ni compromiso legal de compraventa. Los
            valores aquí presentados están sujetos a verificación y aprobación
            final.
            {' · constructoraryrltda@hotmail.com · 318 4946116'}
          </Text>
          <View style={styles.footerBottom}>
            <Text style={styles.footerGen}>
              Generado el: {fechaHora()}
              {datos.generadoPor ? ` · Por: ${datos.generadoPor}` : ''}
            </Text>
            <Text style={styles.footerDoc}>
              Documento generado digitalmente · No requiere firma física
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// ─── Generación + descarga ────────────────────────────────────────────────────
export async function generarPDFPreview(datos: DatosPreviewPDF): Promise<void> {
  const logoUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/images/logo1.png`
      : undefined

  try {
    const blob = await pdf(
      <ResumenNegociacionDoc datos={datos} logoUrl={logoUrl} />
    ).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Resumen_Negociacion_${datos.cliente.apellidos.replace(/\s+/g, '_')}_${getTodayDateString()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  } catch (error) {
    logger.error('❌ [PDF] Error al generar resumen de negociación:', error)
    throw error
  }
}
