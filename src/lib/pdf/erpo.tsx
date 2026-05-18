import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import {
  S, val,
  PdfHeader, PdfDisclaimer, PdfSection, PdfField,
  PdfTips, PdfSteps, PdfFooter,
} from './shared'

export interface ErpoData {
  imieNazwisko: string
  imieOjca: string
  pesel: string
  adres: string
  telefon: string
  email: string
  plec: string
  rodzajEmerytury: string
  dataUrodzenia: string
  formaZatrudnienia: string
  latPracy: string
  latSkładkowych: string
  nrKonta: string
  pobieraRente: string
  numerDecyzjiRentowej: string
}

const RODZAJ_LABELS: Record<string, string> = {
  zwykla: 'Emerytura zwykla',
  czescisciowa: 'Emerytura czesciowa',
  pomostowa: 'Emerytura pomostowa (praca w szczegolnych warunkach)',
}

const FORMA_LABELS: Record<string, string> = {
  pracownik: 'Pracownik etatowy',
  przedsiebiorca: 'Przedsiebiorca (DG)',
  rolnik: 'Rolnik (KRUS)',
  inne: 'Inne',
}

const TIPS = [
  'Wiek emerytalny: Kobiety 60 lat, Mężczyźni 65 lat. Można przejść później (każdy miesiąc opóźnienia zwiększa emeryturę o ok. 0.07%).',
  'PUE ZUS: Wniosek ERPO najlatwiej zlozyc elektronicznie przez Platforme Uslug Elektronicznych ZUS (pue.zus.pl) z profilem zaufanym. Nie trzeba isc do ZUS osobiscie.',
  'Dokumenty do dostarczenia: Zbierz wszystkie swiadectwa pracy z historii zatrudnienia (od 1999 roku sa juz w systemie ZUS, wczesniejsze musisz dostarczyc).',
  'Staz: Do wniosku potrzebny jest lacznie co najmniej 20 lat (kobiety) lub 25 lat (mezczyzni) okresow skladkowych i nieskładkowych. Sprawdz swoj staz przez IKP lub PUE ZUS.',
  'Emerytura i praca: Mozesz podjac prace po przejsciu na emeryture bez limitow zarobkow (od 2024 r. zniesiono ograniczenia).',
  'Zawieszenie renty: Jeśli pobierasz rentę z tytułu niezdolności do pracy, automatycznie zmienia się ona w emeryturę po osiągnięciu wieku emerytalnego. Nie musisz składać osobnego wniosku.',
  'Termin wyplaty: Emerytura wyplacana jest od miesiaca zgloszenia wniosku (nie wstecznie). Zloz wniosek w miesiacu osigniecia wieku emerytalnego lub wczesniej.',
  'Fundusz emerytalny OFE: Jesli nalezysz do OFE, podczas skladania wniosku mozesz wybrac czy chcesz transferowac srodki do ZUS czy zostawic w OFE.',
]

const STEPS = [
  'Zaloguj sie do PUE ZUS (pue.zus.pl) z profilem zaufanym lub e-dowodem.',
  'Wypełnij wniosek ERPO elektronicznie na platformie PUE ZUS. Użyj danych z tego dokumentu.',
  'Alternatywnie: pobierz formularz ERPO z zus.pl/wzory-formularzy i przepisz dane.',
  'Dołącz historyczne świadectwa pracy (od 1999 roku ZUS ma dane w systemie; dla wcześniejszych lat dostarcz papierowe dokumenty).',
  'Jeśli masz okresy pracy za granicą (UE), dołącz zaświadczenia z tamtejszych instytucji ubezpieczeniowych.',
  'Zloz wniosek przez PUE ZUS, poczte (polecony), lub osobiscie w oddziale ZUS.',
  'ZUS wyda decyzję w ciągu 30 dni. Pierwsza wypłata w miesiącu złożenia lub następnym.',
]

export function ErpoPdf({ data, date }: { data: ErpoData; date: string }) {
  return (
    <Document
      title={`ERPO Wniosek o emeryturę: ${data.imieNazwisko}`}
      author="wezmezadarmo.com"
      subject="Dokument pomocniczy do wniosku o emeryture ERPO"
    >
      <Page size="A4" style={S.page}>
        <PdfHeader symbol="ERPO" date={date} />

        <View style={{ marginBottom: 16 }}>
          <View style={S.formBadge}><Text style={S.formBadgeText}>ERPO / ZUS</Text></View>
          <Text style={S.title}>Wniosek o emeryture</Text>
          <Text style={S.subtitle}>Emerytura z FUS: przyznanie świadczenia emerytalnego</Text>
        </View>

        <PdfDisclaimer />

        <PdfSection title="Dane wnioskodawcy">
          <PdfField label="Imie i nazwisko" value={val(data.imieNazwisko)} />
          <PdfField label="Imie ojca" value={val(data.imieOjca)} />
          <PdfField label="PESEL" value={val(data.pesel)} />
          <PdfField label="Data urodzenia" value={val(data.dataUrodzenia)} />
          <PdfField label="Plec" value={data.plec === 'K' ? 'Kobieta' : data.plec === 'M' ? 'Mezczyzna' : val(data.plec)} />
          <PdfField label="Adres zamieszkania" value={val(data.adres)} />
          <PdfField label="Telefon kontaktowy" value={val(data.telefon)} />
          <PdfField label="Adres e-mail" value={val(data.email)} />
        </PdfSection>

        <PdfSection title="Rodzaj emerytury i staz">
          <PdfField label="Rodzaj emerytury" value={RODZAJ_LABELS[data.rodzajEmerytury] ?? val(data.rodzajEmerytury)} />
          <PdfField label="Forma zatrudnienia" value={FORMA_LABELS[data.formaZatrudnienia] ?? val(data.formaZatrudnienia)} />
          <PdfField label="Szacunkowa liczba lat pracy" value={val(data.latPracy)} />
          <PdfField label="Szacunkowa liczba lat skladkowych" value={val(data.latSkładkowych)} />
        </PdfSection>

        <PdfSection title="Renta i konto bankowe">
          <PdfField label="Pobiera rente z niezdolnosci do pracy" value={data.pobieraRente === 'tak' ? 'TAK' : 'NIE'} />
          {data.pobieraRente === 'tak' && (
            <PdfField label="Numer decyzji rentowej" value={val(data.numerDecyzjiRentowej)} />
          )}
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

        <PdfFooter url="wezmezadarmo.com/wnioski/zus-erpo" />
      </Page>
    </Document>
  )
}
