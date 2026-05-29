/**
 * Componente: NegociacionPDF
 *
 * Genera el PDF de resumen de negociación usando @react-pdf/renderer.
 * Diseño A4, una página, con branding Constructora RyR.
 *
 * Nota: Este componente solo puede renderizarse en el cliente (browser)
 * porque usa APIs del renderer de PDF.
 */

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

// ============================================
// TYPES
// ============================================

export interface FuentePDFItem {
  nombre: string
  entidad?: string
  monto: number
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
}

// ============================================
// ESTILOS
// ============================================

const CYAN = '#06b6d4'
const DARK = '#0f172a'
const GRAY = '#64748b'
const LIGHT = '#f8fafc'
const BORDER = '#e2e8f0'

const s = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: DARK,
  },

  // ── Header ──────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: CYAN,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
  },
  headerTitles: {
    flexDirection: 'column',
    gap: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  headerSubtitle: {
    fontSize: 9,
    color: GRAY,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerDate: {
    fontSize: 9,
    color: GRAY,
    textAlign: 'right',
  },

  // ── Título del documento ─────────────────
  docTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: CYAN,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ── Sección ─────────────────────────────
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  // ── Grid de datos ────────────────────────
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridItem: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  gridLabel: {
    fontSize: 8,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  gridValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },

  // ── Tabla fuentes ────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: DARK,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: LIGHT,
  },
  colFuente: { flex: 3 },
  colEntidad: { flex: 3 },
  colMonto: { flex: 2, textAlign: 'right' },
  cellText: {
    fontSize: 10,
    color: DARK,
  },
  cellSubtext: {
    fontSize: 8,
    color: GRAY,
    marginTop: 1,
  },
  cellMonto: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    textAlign: 'right',
  },

  // ── Total ───────────────────────────────
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CYAN,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },

  // ── Línea de descuento ───────────────────
  descuentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  descuentoLabel: { fontSize: 9, color: GRAY },
  descuentoValue: {
    fontSize: 9,
    color: '#ef4444',
    fontFamily: 'Helvetica-Bold',
  },

  // ── Fila financiero ──────────────────────
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  financialLabel: { fontSize: 9, color: GRAY },
  financialValue: { fontSize: 9, color: DARK },

  // ── Notas ───────────────────────────────
  notasBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  notasText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.4,
  },

  // ── Footer ──────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: GRAY,
  },
  footerBrand: {
    fontSize: 8,
    color: CYAN,
    fontFamily: 'Helvetica-Bold',
  },
})

// ============================================
// HELPERS
// ============================================

function formatCOP(value: number) {
  return `$ ${value.toLocaleString('es-CO')}`
}

// ============================================
// COMPONENTE
// ============================================

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
}: NegociacionPDFProps) {
  const valorBaseTotal = valorBase + gastosNotariales + recargoEsquinera
  const pctDescuento =
    valorBaseTotal > 0
      ? ((descuentoAplicado / valorBaseTotal) * 100).toFixed(1)
      : '0'

  return (
    <Document
      title={`Negociación - ${clienteNombre}`}
      author='Constructora RyR'
      subject='Resumen de Negociación de Vivienda'
    >
      <Page size='A4' style={s.page}>
        {/* ── HEADER ─────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image src='/images/logo1.png' style={s.logo} />
            <View style={s.headerTitles}>
              <Text style={s.headerTitle}>Constructora RyR</Text>
              <Text style={s.headerSubtitle}>Resumen de Negociación</Text>
            </View>
          </View>
          <View>
            <Text style={s.headerDate}>{fechaGeneracion}</Text>
          </View>
        </View>

        {/* ── TÍTULO ─────────────────────────────── */}
        <Text style={s.docTitle}>Carta de Intención de Compra</Text>

        {/* ── DATOS BÁSICOS ──────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Datos de la Negociación</Text>
          <View style={s.grid}>
            <View style={s.gridItem}>
              <Text style={s.gridLabel}>Cliente</Text>
              <Text style={s.gridValue}>{clienteNombre}</Text>
            </View>
            <View style={s.gridItem}>
              <Text style={s.gridLabel}>Proyecto</Text>
              <Text style={s.gridValue}>{proyectoNombre}</Text>
            </View>
            <View style={s.gridItem}>
              <Text style={s.gridLabel}>Vivienda</Text>
              <Text style={s.gridValue}>{viviendaLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── RESUMEN FINANCIERO ─────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Resumen Financiero</Text>

          <View style={s.financialRow}>
            <Text style={s.financialLabel}>Valor base</Text>
            <Text style={s.financialValue}>{formatCOP(valorBase)}</Text>
          </View>

          {gastosNotariales > 0 ? (
            <View style={s.financialRow}>
              <Text style={s.financialLabel}>Gastos notariales</Text>
              <Text style={s.financialValue}>
                {formatCOP(gastosNotariales)}
              </Text>
            </View>
          ) : null}

          {recargoEsquinera > 0 ? (
            <View style={s.financialRow}>
              <Text style={s.financialLabel}>Recargo esquinera</Text>
              <Text style={s.financialValue}>
                {formatCOP(recargoEsquinera)}
              </Text>
            </View>
          ) : null}

          {aplicarDescuento && descuentoAplicado > 0 ? (
            <View style={s.descuentoRow}>
              <Text style={s.descuentoLabel}>Descuento ({pctDescuento}%)</Text>
              <Text style={s.descuentoValue}>
                − {formatCOP(descuentoAplicado)}
              </Text>
            </View>
          ) : null}

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total a Pagar</Text>
            <Text style={s.totalValue}>{formatCOP(valorTotal)}</Text>
          </View>

          {valorEscrituraPublica && valorEscrituraPublica > 0 ? (
            <View style={s.financialRow}>
              <Text style={s.financialLabel}>Valor escritura pública</Text>
              <Text style={s.financialValue}>
                {formatCOP(valorEscrituraPublica)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── FUENTES DE PAGO ────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Fuentes de Pago</Text>

          {/* Cabecera tabla */}
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderText, s.colFuente]}>Fuente</Text>
            <Text style={[s.tableHeaderText, s.colEntidad]}>
              Entidad / Referencia
            </Text>
            <Text style={[s.tableHeaderText, s.colMonto]}>Monto</Text>
          </View>

          {fuentes.map((f, i) => (
            <View
              key={f.nombre}
              style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <View style={s.colFuente}>
                <Text style={s.cellText}>{f.nombre}</Text>
              </View>
              <View style={s.colEntidad}>
                <Text style={s.cellText}>{f.entidad || '—'}</Text>
              </View>
              <Text style={s.cellMonto}>{formatCOP(f.monto)}</Text>
            </View>
          ))}
        </View>

        {/* ── NOTAS ──────────────────────────────── */}
        {notas ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Notas</Text>
            <View style={s.notasBox}>
              <Text style={s.notasText}>{notas}</Text>
            </View>
          </View>
        ) : null}

        {/* ── FOOTER ─────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Documento generado automáticamente · No tiene validez legal sin
            firma
          </Text>
          <Text style={s.footerBrand}>Constructora RyR Ltda.</Text>
        </View>
      </Page>
    </Document>
  )
}
