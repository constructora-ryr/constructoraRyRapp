/**
 * ============================================
 * SERVICE: PDF Preview con React-PDF (PREMIUM)
 * ============================================
 *
 * ✅ Diseño moderno y profesional
 * ✅ Componentes React declarativos
 * ✅ Estilos consistentes con la aplicación
 * ✅ Logo de alta calidad
 * ✅ Marca de agua elegante
 *
 * @version 2.0.0 - 2025-12-02 (React-PDF Premium)
 */

import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'

import { getTodayDateString } from '@/lib/utils/date.utils'
import { logger } from '@/lib/utils/logger'

// ============================================
// TYPES
// ============================================

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
  fuentesPago: Array<{
    tipo: string
    monto: number
    entidad?: string
  }>
  notas?: string
}

// ============================================
// CONFIGURACIÓN DE FUENTES (OPCIONAL)
// ============================================

// Si tienes fuentes custom, registrarlas aquí:
// Font.register({
//   family: 'Inter',
//   src: '/fonts/Inter-Regular.ttf',
// })

// ============================================
// ESTILOS (DISEÃ‘O PREMIUM)
// ============================================

const styles = StyleSheet.create({
  // === PÁGINA ===
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },

  // === HEADER ===
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '3px solid #C41E3A',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 80,
    height: 35,
  },
  borradorBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    border: '2px solid #F59E0B',
  },
  borradorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C41E3A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },

  // === SECCIONES ===
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '2px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // === CARDS CON GLASSMORPHISM SIMULADO ===
  card: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHighlight: {
    backgroundColor: '#FEF2F2',
    border: '2px solid #FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  // === FILAS DE DATOS ===
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottom: '1px solid #F3F4F6',
  },
  dataRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'medium',
  },
  dataValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: 'bold',
  },
  dataValueAccent: {
    fontSize: 11,
    color: '#C41E3A',
    fontWeight: 'bold',
  },
  dataValueSuccess: {
    fontSize: 11,
    color: '#059669',
    fontWeight: 'bold',
  },

  // === RESUMEN FINANCIERO DESTACADO ===
  summaryBox: {
    backgroundColor: '#C41E3A',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#FEE2E2',
    fontWeight: 'medium',
  },
  summaryValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summaryTotal: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  summaryDivider: {
    borderTop: '1px solid #FCA5A5',
    marginVertical: 8,
  },

  // === TABLA DE FUENTES ===
  table: {
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#C41E3A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
  },

  // === COLUMNAS DE TABLA ===
  col40: { width: '40%' },
  col30: { width: '30%' },
  col20: { width: '20%', textAlign: 'right' },

  // === NOTAS ===
  notasBox: {
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  notasTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 6,
  },
  notasText: {
    fontSize: 9,
    color: '#78350F',
    lineHeight: 1.5,
  },

  // === FOOTER ===
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '1px solid #E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  footerBold: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: 'bold',
  },

  // === MARCA DE AGUA ===
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '15%',
    transform: 'rotate(-45deg)',
    opacity: 0.08,
    fontSize: 80,
    fontWeight: 'bold',
    color: '#F59E0B',
    letterSpacing: 4,
  },
})

// ============================================
// COMPONENTES DEL PDF
// ============================================

const PDFHeader = ({ cliente }: { cliente: DatosPreviewPDF['cliente'] }) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      {/* Logo RyR */}
      <Image src='/images/logo1.png' style={styles.logo} />

      <View style={styles.borradorBadge}>
        <Text style={styles.borradorText}>⚠️ BORRADOR - NO VÁLIDO ⚠️</Text>
      </View>
    </View>

    <Text style={styles.title}>PREVIEW - NEGOCIACIÓN</Text>
    <Text style={styles.subtitle}>
      Generado:{' '}
      {new Date().toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Text>
    <Text style={styles.subtitle}>
      Cliente: {cliente.nombres} {cliente.apellidos}
    </Text>
  </View>
)

const SeccionCliente = ({
  cliente,
}: {
  cliente: DatosPreviewPDF['cliente']
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>• DATOS DEL CLIENTE</Text>
    </View>
    <View style={styles.card}>
      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>Nombre Completo:</Text>
        <Text style={styles.dataValue}>
          {cliente.nombres} {cliente.apellidos}
        </Text>
      </View>
      {cliente.cedula ? (
        <View style={styles.dataRowLast}>
          <Text style={styles.dataLabel}>Cédula:</Text>
          <Text style={styles.dataValue}>{cliente.cedula}</Text>
        </View>
      ) : (
        <View style={styles.dataRowLast}>
          <Text style={styles.dataLabel}>Documento:</Text>
          <Text style={[styles.dataLabel, { fontStyle: 'italic' }]}>
            No especificado
          </Text>
        </View>
      )}
    </View>
  </View>
)

const SeccionVivienda = ({
  vivienda,
}: {
  vivienda: DatosPreviewPDF['vivienda']
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>• DETALLES DE LA VIVIENDA</Text>
    </View>
    <View style={styles.card}>
      <View style={styles.dataRow}>
        <Text style={styles.dataLabel}>Proyecto:</Text>
        <Text style={styles.dataValue}>{vivienda.proyecto}</Text>
      </View>
      {vivienda.manzana && (
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Manzana:</Text>
          <Text style={styles.dataValue}>{vivienda.manzana}</Text>
        </View>
      )}
      <View style={styles.dataRowLast}>
        <Text style={styles.dataLabel}>Número de Vivienda:</Text>
        <Text style={styles.dataValue}>{vivienda.numeroVivienda}</Text>
      </View>
    </View>
  </View>
)

const SeccionFinanciera = ({ datos }: { datos: DatosPreviewPDF }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>• RESUMEN FINANCIERO</Text>
    </View>

    <View style={styles.summaryBox}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Valor Base:</Text>
        <Text style={styles.summaryValue}>
          ${datos.valorBase.toLocaleString('es-CO')}
        </Text>
      </View>

      {datos.descuento > 0 && (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Descuento Aplicado:</Text>
            <Text style={styles.summaryValue}>
              -${datos.descuento.toLocaleString('es-CO')}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
        </>
      )}

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>VALOR FINAL:</Text>
        <Text style={styles.summaryTotal}>
          ${datos.valorFinal.toLocaleString('es-CO')}
        </Text>
      </View>
    </View>
  </View>
)

const SeccionFuentesPago = ({
  fuentes,
}: {
  fuentes: DatosPreviewPDF['fuentesPago']
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>• FUENTES DE PAGO</Text>
    </View>

    {fuentes.length === 0 ? (
      <View style={styles.card}>
        <Text style={[styles.dataLabel, { textAlign: 'center' }]}>
          Sin fuentes de pago configuradas
        </Text>
      </View>
    ) : (
      <View style={styles.table}>
        {/* Header de tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col40]}>Tipo</Text>
          <Text style={[styles.tableHeaderCell, styles.col30]}>Entidad</Text>
          <Text
            style={[
              styles.tableHeaderCell,
              styles.col30,
              { textAlign: 'right' },
            ]}
          >
            Monto Configurado
          </Text>
        </View>

        {/* Filas */}
        {fuentes.map((fuente, index) => (
          <View
            key={index}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={[styles.tableCellBold, styles.col40]}>
              {fuente.tipo}
            </Text>
            <Text style={[styles.tableCell, styles.col30]}>
              {fuente.entidad || 'N/A'}
            </Text>
            <Text
              style={[
                styles.tableCellBold,
                styles.col30,
                { textAlign: 'right' },
              ]}
            >
              ${fuente.monto.toLocaleString('es-CO')}
            </Text>
          </View>
        ))}

        {/* Total */}
        <View
          style={[
            styles.tableRow,
            { backgroundColor: '#FEF2F2', borderTop: '2px solid #C41E3A' },
          ]}
        >
          <Text style={[styles.tableCellBold, styles.col40]}>TOTAL</Text>
          <Text style={[styles.tableCell, styles.col30]}></Text>
          <Text
            style={[
              styles.tableCellBold,
              styles.col30,
              { textAlign: 'right', color: '#C41E3A', fontSize: 12 },
            ]}
          >
            $
            {fuentes
              .reduce((sum, f) => sum + f.monto, 0)
              .toLocaleString('es-CO')}
          </Text>
        </View>
      </View>
    )}
  </View>
)

const SeccionNotas = ({ notas }: { notas?: string }) => {
  if (!notas || !notas.trim()) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>• NOTAS Y OBSERVACIONES</Text>
      </View>
      <View style={styles.notasBox}>
        <Text style={styles.notasTitle}>Información Adicional:</Text>
        <Text style={styles.notasText}>{notas}</Text>
      </View>
    </View>
  )
}

const PDFFooter = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>
      Preview generado por el sistema de gestión de Constructora RyR Ltda.
    </Text>
    <Text style={styles.footerBold}>Página 1 de 1</Text>
  </View>
)

const MarcaAgua = () => <Text style={styles.watermark}>BORRADOR</Text>

// ============================================
// DOCUMENTO COMPLETO
// ============================================

const PDFPreviewDocument = ({ datos }: { datos: DatosPreviewPDF }) => (
  <Document>
    <Page size='LETTER' style={styles.page}>
      {/* Marca de agua diagonal */}
      <MarcaAgua />

      {/* Contenido */}
      <PDFHeader cliente={datos.cliente} />
      <SeccionCliente cliente={datos.cliente} />
      <SeccionVivienda vivienda={datos.vivienda} />
      <SeccionFinanciera datos={datos} />
      <SeccionFuentesPago fuentes={datos.fuentesPago} />
      <SeccionNotas notas={datos.notas} />

      {/* Footer */}
      <PDFFooter />
    </Page>
  </Document>
)

// ============================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ============================================

/**
 * Generar y descargar PDF preview de negociación
 * Usa React-PDF para diseño moderno y profesional
 */
export async function generarPDFPreview(datos: DatosPreviewPDF): Promise<void> {
  try {
    // Generar blob del PDF
    const blob = await pdf(<PDFPreviewDocument datos={datos} />).toBlob()

    // Crear URL del blob
    const url = URL.createObjectURL(blob)

    // Crear link de descarga
    const link = document.createElement('a')
    link.href = url
    link.download = `Preview_Negociacion_${datos.cliente.apellidos.replace(/\s+/g, '_')}_${getTodayDateString()}.pdf`

    // Trigger descarga
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    logger.error('❌ [PDF] Error al generar preview:', error)
    throw error
  }
}
