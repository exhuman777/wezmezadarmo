import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import {
  S, val,
  PdfHeader, PdfDisclaimer, PdfSection, PdfField,
  PdfTips, PdfSteps, PdfFooter,
} from './shared'

export interface Z15bData {
  imieNazwisko: string
  pesel: string
  adres: string
  telefon: string
  imieNazwiskoPodopiecznego: string
  peselPodopiecznego: string
  dataUrodzeniaPodopiecznego: string
  relacjaDoWnioskodawcy: string
  powodOpieki: string
  dataOd: string
  dataDo: string
  innyOpieka: string
  nazwaPracodawcy: string
  nipPracodawcy: string
  adresPracodawcy: string
  nrKonta: string
}

const POWOD_LABELS: Record<string, string> = {
  choroba: 'Choroba czlonka rodziny',
  kwarantanna: 'Kwarantanna lub izolacja',
  inne: 'Inna przyczyna',
}

const RELACJA_LABELS: Record<string, string> = {
  malzonek: 'Malzonek / malzonka',
  rodzic: 'Rodzic (ojciec/matka)',
  tesciowie: 'Tesciowa / Tesc',
  rodzenstwo: 'Rodzenstwo',
  dziecko: 'Dziecko powyzej 14 lat',
  inne: 'Inna osoba pozostajaca we wspolnym gospodarstwie',
}

const TIPS = [
  'Wiek podopiecznego: Formularz Z-15b dotyczy opieki nad dorosłym czlonkiem rodziny (powyzej 14 lat). Dla dziecka do 14 lat uzyj formularza Z-15a.',
  'Komu przysługuje: Zasilek przysługuje maksymalnie 14 dni rocznie za opieke nad chorym malzonkiem, rodzicem, tesciowym lub dzieckiem powyzej 14 lat.',
  'Termin: Wniosek zloz jak najszybciej po rozpoczeciu opieki. Pracodawca akceptuje wnioski z mocą wsteczna (do daty rozpoczecia choroby).',
  'Zaswiadczenie lekarskie: Do wniosku dolacz zwolnienie lekarskie (e-ZLA) lub zaswiadczenie o stanie zdrowia osoby chorej wystawione przez lekarza.',
  'Wspólne gospodarstwo: Podopieczny musi pozostawać z Tobą we wspólnym gospodarstwie domowym. Jeśli mieszka oddzielnie, zasiłek nie przysługuje (poza małżonkiem i dziećmi).',
  'Osoby w szpitalu: Jesli podopieczny jest w szpitalu, zasilek za te dni nie przysluguje. Liczony jest od dnia powrotu do domu.',
  'Prawo do limitu: Masz prawo do 14 dni zasilku opiekunczego na chorego dorosłego czlonka rodziny rocznie, niezaleznie od liczby chorujacych osob.',
]

const STEPS = [
  'Pobierz oryginalny formularz Z-15b ze strony: zus.pl/wzory-formularzy (wyszukaj "Z-15b").',
  'Przepisz dane z tego dokumentu do oficjalnego formularza.',
  'Dolacz zaswiadczenie lekarskie potwierdzajace chorobe podopiecznego (e-ZLA lub papierowe zaswiadczenie).',
  'Złóż komplet dokumentów u swojego pracodawcy (NIE bezpośrednio w ZUS).',
  'Pracodawca przetworzy wniosek i przesle do ZUS przez PUE ZUS.',
  'Zasilek zostanie wyplacony przy najblizszym terminie wynagrodzenia lub przez ZUS bezposrednio.',
]

export function Z15bPdf({ data, date }: { data: Z15bData; date: string }) {
  return (
    <Document
      title={`Z-15b Zasiłek opiekuńczy (dorosły): ${data.imieNazwisko}`}
      author="wezmezadarmo.com"
      subject="Dokument pomocniczy do wniosku Z-15b"
    >
      <Page size="A4" style={S.page}>
        <PdfHeader symbol="Z-15b" date={date} />

        <View style={{ marginBottom: 16 }}>
          <View style={S.formBadge}><Text style={S.formBadgeText}>Z-15b / ZUS</Text></View>
          <Text style={S.title}>Zasilek opiekunczy</Text>
          <Text style={S.subtitle}>Opieka nad chorym czlonkiem rodziny powyzej 14 lat</Text>
        </View>

        <PdfDisclaimer />

        <PdfSection title="Dane wnioskodawcy">
          <PdfField label="Imie i nazwisko" value={val(data.imieNazwisko)} />
          <PdfField label="PESEL" value={val(data.pesel)} />
          <PdfField label="Adres zamieszkania" value={val(data.adres)} />
          <PdfField label="Telefon kontaktowy" value={val(data.telefon)} />
        </PdfSection>

        <PdfSection title="Dane podopiecznego (osoba chora)">
          <PdfField label="Imie i nazwisko" value={val(data.imieNazwiskoPodopiecznego)} />
          <PdfField label="PESEL" value={val(data.peselPodopiecznego)} />
          <PdfField label="Data urodzenia" value={val(data.dataUrodzeniaPodopiecznego)} />
          <PdfField label="Stosunek pokrewienstwa" value={RELACJA_LABELS[data.relacjaDoWnioskodawcy] ?? val(data.relacjaDoWnioskodawcy)} />
        </PdfSection>

        <PdfSection title="Szczegoly opieki">
          <PdfField label="Powod sprawowania opieki" value={POWOD_LABELS[data.powodOpieki] ?? val(data.powodOpieki)} />
          <PdfField label="Okres opieki od" value={val(data.dataOd)} />
          <PdfField label="Okres opieki do" value={val(data.dataDo)} />
          <PdfField label="Brak innych opiekunów (oświadczenie)" value={val(data.innyOpieka)} />
        </PdfSection>

        <PdfSection title="Dane pracodawcy (platnik skladek)">
          <PdfField label="Nazwa pracodawcy" value={val(data.nazwaPracodawcy)} />
          <PdfField label="NIP pracodawcy" value={val(data.nipPracodawcy)} />
          <PdfField label="Adres pracodawcy" value={val(data.adresPracodawcy)} />
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

        <PdfFooter url="wezmezadarmo.com/wnioski/zus-z15b" />
      </Page>
    </Document>
  )
}
