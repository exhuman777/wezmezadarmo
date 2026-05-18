import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import {
  S, val,
  PdfHeader, PdfDisclaimer, PdfSection, PdfField,
  PdfTips, PdfSteps, PdfFooter,
} from './shared'

export interface Zas53Data {
  imieNazwisko: string
  pesel: string
  adres: string
  telefon: string
  formaUbezpieczenia: string
  nazwaPlatinika: string
  nipPlatnika: string
  adresPlatnika: string
  numerZwolnienia: string
  dataOd: string
  dataDo: string
  wypadek: string
  dataWypadku: string
  nrKonta: string
}

const FORMA_LABELS: Record<string, string> = {
  pracownik: 'Pracownik etatowy',
  zleceniobiorca: 'Zleceniobiorca / umowa o dzielo',
  przedsiebiorca: 'Przedsiebiorca (DG) oplacajacy dobrowolne ubezpieczenie chorobowe',
  inne: 'Inne',
}

const TIPS = [
  'Kiedy skladac ZAS-53: Wniosek ten sklada sie bezposrednio do ZUS tylko gdy pracodawca nie jest platnikiem zasilkow (zatrudnia ponizej 20 pracownikow) lub gdy sam jestes platnikiem (DG).',
  'L4 i e-ZLA: Upewnij sie ze lekarz wystawil e-ZLA (elektroniczne zwolnienie). Numer e-ZLA widoczny jest na zwolnieniu lub przez IKP (Internetowe Konto Pacjenta). Dolacz go do wniosku.',
  'Wypadek przy pracy: Jeśli zwolnienie wynika z wypadku przy pracy lub choroby zawodowej, zasiłek wynosi 100% (nie 80%). Zaznacz to w wniosku i dołącz protokół powypadkowy.',
  'Termin wypłaty: ZUS ma 30 dni na wypłatę zasiłku od daty złożenia wniosku. Jeśli minął termin, można złożyć skargę do dyrektora oddziału ZUS.',
  'Przedsiebiorca: Majac DG i oplacajac dobrowolne ubezpieczenie chorobowe masz prawo do zasilku po 90 dniach od wstapienia do ubezpieczenia. Sprawdz daty.',
  'Stawka zasilku: 80% podstawy wymiaru (srednia z 12 miesiecy lub pelny rok dzialalnosci). W ciazy: 100%. Po wypadku przy pracy: 100%.',
  'Korekta: Jeśli ZUS zamiast zasiłku wysłał Ci odmowę, masz 30 dni na odwołanie do Oddziału ZUS. Warto się odwołać, często są błędy formalne.',
]

const STEPS = [
  'Pobierz oryginalny formularz ZAS-53 ze strony: zus.pl/wzory-formularzy (wyszukaj "ZAS-53").',
  'Przepisz dane z tego dokumentu do oficjalnego formularza.',
  'Dolacz e-ZLA (elektroniczne zwolnienie lekarskie) lub kserokopie papierowego L4.',
  'Jeśli wypadek przy pracy: dołącz protokół BHP powypadkowy wystawiony przez pracodawcę.',
  'Zloz formularz bezposrednio w oddziale ZUS lub wysylaj listem poleconym lub przez PUE ZUS.',
  'ZUS ma 30 dni na rozpatrzenie i wyplate zasilku.',
]

export function Zas53Pdf({ data, date }: { data: Zas53Data; date: string }) {
  return (
    <Document
      title={`ZAS-53 Zasiłek chorobowy: ${data.imieNazwisko}`}
      author="wezmezadarmo.com"
      subject="Dokument pomocniczy do wniosku ZAS-53"
    >
      <Page size="A4" style={S.page}>
        <PdfHeader symbol="ZAS-53" date={date} />

        <View style={{ marginBottom: 16 }}>
          <View style={S.formBadge}><Text style={S.formBadgeText}>ZAS-53 / ZUS</Text></View>
          <Text style={S.title}>Zasilek chorobowy</Text>
          <Text style={S.subtitle}>Wniosek bezposrednio do ZUS (gdy pracodawca nie jest platnikiem zasilkow)</Text>
        </View>

        <PdfDisclaimer />

        <PdfSection title="Dane wnioskodawcy">
          <PdfField label="Imie i nazwisko" value={val(data.imieNazwisko)} />
          <PdfField label="PESEL" value={val(data.pesel)} />
          <PdfField label="Adres zamieszkania" value={val(data.adres)} />
          <PdfField label="Telefon kontaktowy" value={val(data.telefon)} />
          <PdfField label="Forma ubezpieczenia" value={FORMA_LABELS[data.formaUbezpieczenia] ?? val(data.formaUbezpieczenia)} />
        </PdfSection>

        <PdfSection title="Platnik skladek">
          <PdfField label="Nazwa platnika / pracodawcy" value={val(data.nazwaPlatinika)} />
          <PdfField label="NIP platnika" value={val(data.nipPlatnika)} />
          <PdfField label="Adres platnika" value={val(data.adresPlatnika)} />
        </PdfSection>

        <PdfSection title="Zwolnienie lekarskie (L4)">
          <PdfField label="Numer e-ZLA" value={val(data.numerZwolnienia)} />
          <PdfField label="Niezdolnosc do pracy od" value={val(data.dataOd)} />
          <PdfField label="Niezdolnosc do pracy do" value={val(data.dataDo)} />
          <PdfField label="Wypadek przy pracy" value={data.wypadek === 'tak' ? 'TAK -- zasilek 100%' : 'NIE -- zasilek 80%'} />
          {data.wypadek === 'tak' && (
            <PdfField label="Data wypadku" value={val(data.dataWypadku)} />
          )}
        </PdfSection>

        <PdfSection title="Konto bankowe do wyplaty">
          <PdfField label="Numer rachunku bankowego" value={val(data.nrKonta)} />
        </PdfSection>

        <View style={{ marginBottom: 8 }}>
          <View style={S.fieldRow}>
            <Text style={S.fieldLabel}>Data i podpis wnioskodawcy</Text>
            <Text style={[S.fieldValue, { color: '#bbb' }]}>.............................. / ..............................{'\n'}(data)          (podpis)</Text>
          </View>
        </View>

        <PdfSteps steps={STEPS} />
        <PdfTips tips={TIPS} />

        <PdfFooter url="wezmezadarmo.com/wnioski/zus-zas53" />
      </Page>
    </Document>
  )
}
