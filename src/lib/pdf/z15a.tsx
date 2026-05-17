import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import {
  S, val,
  PdfHeader, PdfDisclaimer, PdfSection, PdfField,
  PdfTips, PdfSteps, PdfFooter,
} from './shared'

export interface Z15aData {
  imieNazwisko: string
  pesel: string
  adres: string
  telefon: string
  relacjaDoZiecka: string
  imieNazwiskoDziecka: string
  peselDziecka: string
  dataUrodzeniaDziecka: string
  powodOpieki: string
  dataOd: string
  dataDo: string
  drugirodzicNieMoze: string
  nazwaPracodawcy: string
  nipPracodawcy: string
  adresPracodawcy: string
  nrKonta: string
}

const POWOD_LABELS: Record<string, string> = {
  choroba: 'Choroba dziecka',
  kwarantanna: 'Kwarantanna lub izolacja dziecka',
  placowka: 'Zamkniecie zlobka, przedszkola lub szkoly',
  inne: 'Inna przyczyna',
}

const RELACJA_LABELS: Record<string, string> = {
  matka: 'Matka',
  ojciec: 'Ojciec',
  opiekun: 'Opiekun prawny',
}

const TIPS = [
  'Termin: Zloz wniosek jak najszybciej po rozpoczeciu opieki -- zasilek jest liczony od dnia sprawowania opieki, ale wniosek musi dotrzec do pracodawcy w ciagu 7 dni.',
  'e-ZLA: Lekarz wystawia elektroniczne zwolnienie (e-ZLA). Pracodawca widzi je automatycznie przez PUE ZUS -- nie musisz dostarczac papierowego zwolnienia.',
  'Zamkniecie placowki: Jesli zamknieto szkole lub przedszkole, dostarcz zaswiadczenie od dyrektora lub printscreen komunikatu ze strony placowki. Warto zachowac SMS od wychowawcy.',
  'Limit 60 dni: Masz prawo do 60 dni zasilku opiekunczego rocznie na wszystkie dzieci do 14 lat lacznie. Sprawdz ile dni juz wykorzytalas/es w tym roku.',
  'Jeden rodzic na raz: Oboje rodzicow nie moze pobierac zasilku jednoczesnie za ten sam dzien. Zdecydujcie wczesniej, kto bierze opieke w jakie dni.',
  'Wysokosc zasilku: Zasilek wynosi 80% podstawy wymiaru, nie 80% wynagrodzenia brutto. Podstawa to srednia 12-miesiecy, bez premii jednorazowych.',
  'Pracodawca duzy vs maly: Przy pracodawcy powyzej 20 pracownikow -- zasilek wyplaca pracodawca i rozlicza z ZUS. Ponizej 20 pracownikow -- ZUS wyplaca bezposrednio na Twoje konto.',
  'Dziecko niepelnosprawne: Przy dziecku z orzeczeniem o niepelnosprawnosci limit wynosi 30 dodatkowych dni rocznie (lacznie 90 dni).',
]

const STEPS = [
  'Pobierz oryginalny formularz Z-15a ze strony: zus.pl/wzory-formularzy (wyszukaj "Z-15a").',
  'Przepisz dane z tego dokumentu do oryginalnego formularza PDF lub wypelnij online przez PUE ZUS.',
  'Dolacz e-ZLA od lekarza (zwolnienie elektroniczne) lub zaswiadczenie o zamknieciu placowki.',
  'Zloz komplet dokumentow u swojego pracodawcy -- NIE bezposrednio w ZUS.',
  'Pracodawca przetworzy wniosek i przesle do ZUS przez PUE ZUS.',
  'Zasilek zostanie wyplacony przy najblizszym terminie wynagrodzenia lub przez ZUS bezposrednio (do 30 dni od zlozenia).',
]

export function Z15aPdf({ data, date }: { data: Z15aData; date: string }) {
  return (
    <Document
      title={`Z-15a -- Zasilek opiekunczy -- ${data.imieNazwisko}`}
      author="wezmezadarmo.com"
      subject="Dokument pomocniczy do wniosku Z-15a"
    >
      <Page size="A4" style={S.page}>
        <PdfHeader symbol="Z-15a" date={date} />

        <View style={{ marginBottom: 16 }}>
          <View style={S.formBadge}><Text style={S.formBadgeText}>Z-15a / ZUS</Text></View>
          <Text style={S.title}>Zasilek opiekunczy</Text>
          <Text style={S.subtitle}>Opieka nad chorym dzieckiem lub zamkniecie placowki</Text>
        </View>

        <PdfDisclaimer />

        <PdfSection title="Dane wnioskodawcy">
          <PdfField label="Imie i nazwisko" value={val(data.imieNazwisko)} />
          <PdfField label="PESEL" value={val(data.pesel)} />
          <PdfField label="Adres zamieszkania" value={val(data.adres)} />
          <PdfField label="Telefon kontaktowy" value={val(data.telefon)} />
          <PdfField label="Stosunek do dziecka" value={RELACJA_LABELS[data.relacjaDoZiecka] ?? val(data.relacjaDoZiecka)} />
        </PdfSection>

        <PdfSection title="Dane dziecka">
          <PdfField label="Imie i nazwisko dziecka" value={val(data.imieNazwiskoDziecka)} />
          <PdfField label="PESEL dziecka" value={val(data.peselDziecka)} />
          <PdfField label="Data urodzenia dziecka" value={val(data.dataUrodzeniaDziecka)} />
        </PdfSection>

        <PdfSection title="Szczegoly opieki">
          <PdfField label="Powod sprawowania opieki" value={POWOD_LABELS[data.powodOpieki] ?? val(data.powodOpieki)} />
          <PdfField label="Okres opieki od" value={val(data.dataOd)} />
          <PdfField label="Okres opieki do" value={val(data.dataDo)} />
          <PdfField label="Drugi rodzic nie moze -- oswiadczenie" value={val(data.drugirodzicNieMoze)} />
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

        <PdfFooter url="wezmezadarmo.com/wnioski/zus-z15a" />
      </Page>
    </Document>
  )
}
