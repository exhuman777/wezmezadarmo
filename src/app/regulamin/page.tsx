import Link from 'next/link';
import type { Metadata } from 'next';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';

export const metadata: Metadata = metadaneStrony('/regulamin');

/**
 * Regulamin (stan od 7.11.2026: bez kont i płatności, e-mail i telefon tylko przy sprawdzeniu po NIP).
 * Bez powołań na numery przepisów: baza prawa (baza-prawa-pl) nie ma zweryfikowanych wpisów
 * o usługach drogą elektroniczną, prawach konsumenta ani o AI.
 */
export default function RegulaminPage() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <StronaJsonLd sciezka="/regulamin" />
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do strony głównej
        </Link>

        <h1 className="text-[24px] sm:text-[28px] font-bold text-text-1 mb-2">
          Regulamin
        </h1>
        <p className="text-[13px] text-text-3 mb-8">
          Ostatnia aktualizacja: 7 listopada 2026 r.
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Kto prowadzi serwis">
            <P>1.1. Serwis wezmezadarmo.com prowadzi Mooning Charts Research (marka tuKamil), NIP 7133061369 (dalej: Operator).</P>
            <P>1.2. Kontakt: formularz „Napisz do nas” w stopce każdej strony albo <a href="https://tukamil.com/#kontakt" target="_blank" rel="noopener" className="text-accent hover:underline">tukamil.com/#kontakt</a>.</P>
            <P>1.3. Serwis jest prywatny, nie rządowy. Nie przyznaje świadczeń ani dotacji i nie gwarantuje ich uzyskania.</P>
          </Section>

          <Section n="2" title="Co jest w serwisie">
            <P>2.1. Serwis jest bezpłatny i nie przyjmuje płatności. Nie ma kont, rejestracji ani logowania. Dawne adresy paneli i logowania prowadzą do stron publicznych.</P>
            <P>2.2. Bez podawania danych kontaktowych działają:</P>
            <ul className="list-disc pl-6 space-y-1">
              <li>kalkulator świadczeń (/) i baza świadczeń z wyszukiwarką (/swiadczenia);</li>
              <li>wnioski ZUS z gotowym PDF (/wnioski);</li>
              <li>wyszukiwarka programów dotacji (/dotacje) i artykuły na blogu (/blog);</li>
              <li>asystent AI (/agent), do 3 pytań dziennie;</li>
              <li>aktualności (/aktualnosci), statystyki (/statystyki), Centrum Obywatela i wyszukiwarka NFZ;</li>
              <li>przegląd księgi KPiR i pliku JPK_V7 (/dla-firm/narzedzia): plik czyta tylko przeglądarka.</li>
            </ul>
            <P>2.3. Sprawdzenie firmy po NIP (/dla-firm/narzedzia/dofinansowania) wymaga podania e-maila, polskiego numeru telefonu i zgody na kontakt e-mailem w sprawie zgłoszenia. Adres potwierdzasz linkiem z wiadomości. Adresy z plusem (np. jan+1@firma.pl) i skrzynki jednorazowe nie działają.</P>
            <P>2.4. Formularz „Napisz do nas” służy do kontaktu z Operatorem. Wymaga e-maila, treści i zgody na odpowiedź e-mailem.</P>
          </Section>

          <Section n="3" title="Zgody na kontakt">
            <P>3.1. Każda zgoda to osobne pole, domyślnie niezaznaczone: kontakt e-mailem w sprawie zgłoszenia (wymagany), informacje i oferty e-mailem, kontakt telefoniczny (tylko w formularzu z telefonem) i kontakt przez asystenta AI. Szczegóły są w <Link href="/polityka-prywatnosci#zgody" className="text-accent hover:underline">polityce prywatności</Link>.</P>
            <P>3.2. Kontakt przez asystenta AI oznacza wiadomość albo rozmowę, którą prowadzi program AI w imieniu Operatora. Na początku takiego kontaktu Operator informuje, że rozmawiasz z AI, i na prośbę przekazuje sprawę człowiekowi.</P>
          </Section>

          <Section n="4" title="Informacje i sztuczna inteligencja">
            <P>4.1. Informacje o świadczeniach pochodzą z oficjalnych źródeł, a link do źródła jest przy każdym świadczeniu. Operator dba o aktualność, ale przepisy się zmieniają, więc przed złożeniem wniosku sprawdź źródło.</P>
            <P>4.2. Asystent AI odpowiada z bazy świadczeń i może się pomylić. Jego odpowiedź nie jest poradą prawną, podatkową ani finansową. O świadczeniu albo dotacji decyduje właściwy urząd lub instytucja.</P>
            <P>4.3. Za treść wniosku i prawdziwość danych we wniosku odpowiada osoba, która go składa.</P>
          </Section>

          <Section n="5" title="Zasady korzystania">
            <P>5.1. Nie podawaj cudzych danych bez zgody tej osoby i nie korzystaj z serwisu w sposób sprzeczny z prawem.</P>
            <P>5.2. Publiczne API pod /api/public (kursy NBP, kolejki NFZ, jakość powietrza, Biała Lista VAT, ostrzeżenia IMGW, akty prawne, dane GUS) działa bez klucza przy rozsądnym ruchu. Pozostałe endpointy obsługują stronę. Ich użycie z innych domen wymaga klucza, o który poprosisz przez formularz „Napisz do nas”.</P>
            <P>5.3. Operator może ograniczyć dostęp przy nadużyciach, np. masowym pobieraniu albo próbach obejścia limitów.</P>
          </Section>

          <Section n="6" title="Wymagania techniczne">
            <P>6.1. Wystarczy aktualna przeglądarka z włączonym JavaScriptem i dostęp do internetu. Nie trzeba niczego instalować.</P>
          </Section>

          <Section n="7" title="Odpowiedzialność">
            <P>7.1. Operator nie odpowiada za decyzje urzędów, przerwy w działaniu publicznych API (NFZ, NBP, GIOŚ, CEIDG, Biała Lista VAT, IMGW, Sejm, GUS) ani za serwisy zewnętrzne, do których prowadzą linki.</P>
          </Section>

          <Section n="8" title="Reklamacje">
            <P>8.1. Problem z działaniem serwisu zgłoś przez formularz „Napisz do nas”: opisz, co się stało, kiedy i na jakiej stronie.</P>
            <P>8.2. Operator odpowiada w ciągu 14 dni.</P>
            <P>8.3. Konsument może skorzystać z pozasądowych sposobów rozwiązywania sporów, np. z pomocy miejskiego lub powiatowego rzecznika konsumentów albo wojewódzkiego inspektoratu Inspekcji Handlowej.</P>
          </Section>

          <Section n="9" title="Zmiany regulaminu">
            <P>9.1. Aktualna wersja jest zawsze pod adresem /regulamin, z datą na górze. Zmiany nie dotyczą zgód zebranych wcześniej: te obowiązują w wersji, którą widziałeś.</P>
            <P>9.2. W sprawach, których regulamin nie opisuje, stosuje się prawo polskie i prawo Unii Europejskiej.</P>
          </Section>

        </div>

        <div className="mt-12 pt-4 border-t border-border text-[12px] text-text-3">
          <Link href="/polityka-prywatnosci" className="text-accent hover:underline">
            Polityka prywatności
          </Link>
          <span className="mx-2">|</span>
          <Link href="/" className="text-accent hover:underline">
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
        {n}. {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}
