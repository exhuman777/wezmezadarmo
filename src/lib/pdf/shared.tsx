import { Font, StyleSheet, Text, View, Page, Document } from '@react-pdf/renderer'
import path from 'path'

// Register Roboto for Polish character support
Font.register({
  family: 'Roboto',
  fonts: [
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf'), fontWeight: 'normal' },
    { src: path.join(process.cwd(), 'public', 'fonts', 'Roboto-Bold.ttf'), fontWeight: 'bold' },
  ],
})

export const S = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#1a1a1a',
    padding: '32pt 40pt',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: '2pt solid #c87a1a',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerBrand: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#c87a1a',
    letterSpacing: 0.5,
  },
  headerMeta: {
    fontSize: 8,
    color: '#888',
    textAlign: 'right',
  },
  formBadge: {
    backgroundColor: '#fff4e8',
    border: '1pt solid #c87a1a',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  formBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c87a1a',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 20,
  },
  disclaimer: {
    backgroundColor: '#f9f5f0',
    border: '1pt solid #e0d0b8',
    borderRadius: 4,
    padding: '8pt 12pt',
    marginBottom: 20,
    fontSize: 8,
    color: '#666',
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    backgroundColor: '#c87a1a',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  fieldRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e8e0d0',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 9,
    color: '#666',
    width: '38%',
    lineHeight: 1.4,
  },
  fieldValue: {
    fontSize: 9,
    color: '#111',
    fontWeight: 'bold',
    width: '62%',
    lineHeight: 1.4,
  },
  fieldEmpty: {
    fontSize: 9,
    color: '#bbb',
    fontStyle: 'italic',
    width: '62%',
  },
  tipsSection: {
    backgroundColor: '#f0f7f0',
    border: '1pt solid #a8d0a8',
    borderRadius: 4,
    padding: '10pt 14pt',
    marginBottom: 16,
  },
  tipsSectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2d6a2d',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 9,
    color: '#2d6a2d',
    width: 12,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 9,
    color: '#333',
    flex: 1,
    lineHeight: 1.5,
  },
  stepsSection: {
    backgroundColor: '#f0f4ff',
    border: '1pt solid #b0c0e8',
    borderRadius: 4,
    padding: '10pt 14pt',
    marginBottom: 16,
  },
  stepsSectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a3a8a',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  stepNum: {
    fontSize: 9,
    color: '#1a3a8a',
    fontWeight: 'bold',
    width: 18,
  },
  stepText: {
    fontSize: 9,
    color: '#333',
    flex: 1,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTop: '0.5pt solid #e0d0b8',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  footerLeft: {
    fontSize: 7,
    color: '#aaa',
    flex: 1,
    lineHeight: 1.4,
  },
  footerRight: {
    fontSize: 7,
    color: '#aaa',
    textAlign: 'right',
  },
})

// Helper: value or placeholder
export function val(v: string | undefined, placeholder = 'nie podano') {
  const s = (v ?? '').trim()
  return s.length > 0 ? s : placeholder
}

// Shared components
export function PdfHeader({ symbol, date }: { symbol?: string; date: string }) {
  return (
    <View style={S.header}>
      <Text style={S.headerBrand}>wezmezadarmo.com</Text>
      <View style={{ alignItems: 'flex-end' }}>
        {symbol && <Text style={[S.headerMeta, { color: '#c87a1a', fontWeight: 'bold' }]}>{symbol}</Text>}
        <Text style={S.headerMeta}>Przygotowano: {date}</Text>
        <Text style={S.headerMeta}>Dokument pomocniczy (NIE jest oficjalnym formularzem ZUS)</Text>
      </View>
    </View>
  )
}

export function PdfDisclaimer() {
  return (
    <View style={S.disclaimer}>
      <Text>
        Dokument przygotowany pomocniczo przez wezmezadarmo.com. Nie jest oficjalnym formularzem instytucji.{'\n'}
        Wnioskodawca samodzielnie podpisuje i sklada wniosek do wlasciwej instytucji. Serwis nie ponosi odpowiedzialnosci za tresc wniosku.{'\n'}
        Pobierz oryginalny formularz ze strony instytucji, przepisz dane i zloz go podpisany.
      </Text>
    </View>
  )
}

export function PdfSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={S.section}>
      <View style={S.sectionHeader}>
        <Text style={S.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

export function PdfField({ label, value }: { label: string; value: string }) {
  const isEmpty = !value || value.trim() === '' || value === 'nie podano'
  return (
    <View style={S.fieldRow}>
      <Text style={S.fieldLabel}>{label}</Text>
      {isEmpty
        ? <Text style={S.fieldEmpty}>-- nie podano --</Text>
        : <Text style={S.fieldValue}>{value}</Text>
      }
    </View>
  )
}

export function PdfTips({ title, tips }: { title?: string; tips: string[] }) {
  return (
    <View style={S.tipsSection}>
      <Text style={S.tipsSectionTitle}>{title ?? 'Wskazowki i dobre praktyki'}</Text>
      {tips.map((tip, i) => (
        <View key={i} style={S.tipItem}>
          <Text style={S.tipBullet}>+</Text>
          <Text style={S.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  )
}

export function PdfSteps({ title, steps }: { title?: string; steps: string[] }) {
  return (
    <View style={S.stepsSection}>
      <Text style={S.stepsSectionTitle}>{title ?? 'Co zrobić dalej: instrukcja złożenia'}</Text>
      {steps.map((step, i) => (
        <View key={i} style={S.stepItem}>
          <Text style={S.stepNum}>{i + 1}.</Text>
          <Text style={S.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  )
}

export function PdfFooter({ url }: { url: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerLeft}>
        Dokument pomocniczy. Wnioskodawca samodzielnie podpisuje i sklada wniosek.{'\n'}
        Serwis nie swiadczy pomocy prawnej ani nie sklada wnioskow w imieniu uzytkownika.
      </Text>
      <Text style={S.footerRight}>wezmezadarmo.com{'\n'}{url}</Text>
    </View>
  )
}

export { Text, View, Page, Document }
