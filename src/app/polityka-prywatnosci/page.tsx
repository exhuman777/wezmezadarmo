import Link from 'next/link';
import type { Metadata } from 'next';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import { ZGODY, ZGODY_WERSJA } from '@/lib/zgody';

export const metadata: Metadata = metadaneStrony('/polityka-prywatnosci');

/**
 * Polityka prywatności (stan od 7.11.2026: bez kont, zgody na kontakt, kontakt przez asystenta AI).
 * Treść napisana bez powołań na numery przepisów: baza prawa (baza-prawa-pl) nie ma zweryfikowanych
 * wpisów o RODO, zgodach marketingowych ani o obowiązkach przejrzystości AI. Zmiana zgód = nowa ZGODY_WERSJA.
 */
export default function PolitykaPage() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <StronaJsonLd sciezka="/polityka-prywatnosci" />
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do strony głównej
        </Link>

        <h1 className="text-[24px] sm:text-[28px] font-bold text-text-1 mb-2">
          Polityka prywatności
        </h1>
        <p className="text-[13px] text-text-3 mb-8">
          Ostatnia aktualizacja: 7 listopada 2026 r. Wersja zgód: {ZGODY_WERSJA}.
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Najkrócej">
            <ul className="list-disc pl-6 space-y-1">
              <li>Na wezmezadarmo.com nie ma kont ani logowania. Strona nie zapisuje Twojego profilu ani dopasowanych świadczeń.</li>
              <li>Kalkulator, baza świadczeń, wnioski ZUS, dotacje, asystent AI, aktualności, statystyki, blog oraz przegląd KPiR i JPK działają bez podawania danych kontaktowych.</li>
              <li>E-mail i telefon podajesz tylko przy sprawdzeniu firmy po NIP. Sam e-mail podajesz też w formularzu „Napisz do nas”.</li>
              <li>Każda zgoda na kontakt to osobne pole, domyślnie niezaznaczone. Możesz ją wycofać w każdej chwili.</li>
              <li>Danych nie sprzedajemy i nie przekazujemy sieciom reklamowym.</li>
            </ul>
          </Section>

          <Section n="2" title="Kto odpowiada za dane">
            <P>Administratorem danych jest tuKamil, jednoosobowa działalność gospodarcza z Lublina, NIP 7133061369 (pełne dane firmy są w publicznym rejestrze CEIDG).</P>
            <P>Kontakt w sprawie danych: formularz <a href="#napisz-do-nas" className="text-accent hover:underline">„Napisz do nas”</a> w stopce każdej strony albo <a href="https://tukamil.com/#kontakt" target="_blank" rel="noopener" className="text-accent hover:underline">tukamil.com/#kontakt</a>.</P>
            <P>Serwis jest prywatny, nie rządowy. Wyniki mają charakter informacyjny i nie są decyzją urzędu.</P>
          </Section>

          <Section n="3" title="Co dzieje się z danymi w poszczególnych funkcjach">
            <TableWrapper>
              <thead>
                <tr><Th>Funkcja</Th><Th>Jakie dane</Th><Th>Po co i jak długo</Th></tr>
              </thead>
              <tbody>
                <Tr><Td>Kalkulator świadczeń (/)</Td><Td>Odpowiedzi z formularza: wiek, płeć, sytuacja rodzinna, dochód, zatrudnienie, województwo; opcjonalnie NIP</Td><Td>Dopasowanie świadczeń. Serwer liczy wynik i nic nie zapisuje. NIP idzie tylko do publicznych rejestrów CEIDG i Białej Listy VAT. Wynik widzisz tylko w otwartej karcie.</Td></Tr>
                <Tr><Td>Asystent AI (/agent, czat przy wynikach)</Td><Td>Treść pytań, profil z kalkulatora (bez imienia, PESEL, adresu i e-maila), skrót adresu IP</Td><Td>Odpowiedź asystenta. Skrót IP liczy limit 3 pytań dziennie i jest kasowany po 48 godzinach. Rozmowy nie zapisujemy.</Td></Tr>
                <Tr><Td>Wnioski ZUS (/wnioski)</Td><Td>Pola wniosku, w tym PESEL, jeśli wymaga go formularz</Td><Td>Wygenerowanie PDF. Serwer składa plik w pamięci i nic nie zapisuje. Szkic zostaje tylko w tej karcie przeglądarki i znika po jej zamknięciu. PESEL nie trafia do AI.</Td></Tr>
                <Tr><Td>Przegląd KPiR i JPK_V7</Td><Td>Wgrany plik</Td><Td>Plik czyta tylko Twoja przeglądarka. Nie wysyłamy go na serwer.</Td></Tr>
                <Tr><Td id="narzedzia">Sprawdzenie firmy po NIP</Td><Td>E-mail, telefon, opcjonalnie imię, zaznaczone zgody z wersją i datą, skrót adresu IP</Td><Td>Wysłanie linku potwierdzającego adres, otwarcie wyniku i kontakt w sprawie zgłoszenia oraz w zakresie zaznaczonych zgód. Trzymamy dane do wycofania zgody albo prośby o usunięcie. Skrót IP chroni przed nadużyciami.</Td></Tr>
                <Tr><Td>„Napisz do nas”</Td><Td>E-mail, treść wiadomości, opcjonalnie imię i firma, zaznaczone zgody z wersją i datą</Td><Td>Odpowiedź na wiadomość. Wiadomość trafia mailem do administratora. Kasujemy ją, gdy sprawa jest zamknięta, chyba że zgoda na inny kontakt dalej obowiązuje.</Td></Tr>
                <Tr><Td>Centrum Obywatela, NFZ, statystyki</Td><Td>Parametry zapytania, np. miasto, nazwa świadczenia, NIP kontrahenta</Td><Td>Zapytanie do publicznego API instytucji. Nie przekazujemy danych o Tobie.</Td></Tr>
              </tbody>
            </TableWrapper>
            <P>Dawne konta i newsletter: do 6 listopada 2026 można było założyć konto, a do 7 listopada zapisać się na newsletter. Nowych kont i zapisów nie ma. Dane dawnych kont i zapisów trzymamy do usunięcia na Twoją prośbę. Wypisanie z newslettera działa z linku w wiadomości.</P>
          </Section>

          <Section n="4" title="Zgody na kontakt" id="zgody">
            <P>Formularze, które pytają o e-mail, mają osobne pola zgód. Żadne nie jest zaznaczone z góry:</P>
            <ul className="list-disc pl-6 space-y-1">
              {ZGODY.map(z => (
                <li key={z.id}>{z.tresc}{z.tylkoZTelefonem ? ' Tylko w formularzu, który pyta o telefon.' : ''}</li>
              ))}
            </ul>
            <P>Wymagana jest tylko zgoda na kontakt e-mailem w sprawie zgłoszenia, bo bez niej nie wyślemy linku ani odpowiedzi. Pozostałe zgody są dobrowolne, a brak zgody niczego nie blokuje.</P>
            <P>Przy każdym wysłaniu formularza zapisujemy, które zgody zaznaczono, treść i wersję zgód oraz datę. Zgodę wycofasz przez formularz „Napisz do nas”. Wycofanie nie zmienia tego, co działo się wcześniej na podstawie zgody.</P>
          </Section>

          <Section n="5" title="Kontakt przez asystenta AI" id="ai">
            <P>Jeśli zaznaczysz tę zgodę, tuKamil może napisać do Ciebie albo zadzwonić przez asystenta AI, czyli program, który prowadzi rozmowę w jego imieniu.</P>
            <ul className="list-disc pl-6 space-y-1">
              <li>Na początku każdego takiego kontaktu mówimy, że rozmawiasz z programem AI.</li>
              <li>Asystent korzysta tylko z danych z formularza i nie podejmuje decyzji, które mają dla Ciebie skutki prawne.</li>
              <li>W każdej chwili możesz poprosić o rozmowę z człowiekiem albo wycofać zgodę.</li>
              <li>Telefonicznie asystent dzwoni tylko wtedy, gdy zaznaczysz też zgodę na kontakt telefoniczny.</li>
            </ul>
          </Section>

          <Section n="6" title="Sztuczna inteligencja na stronie">
            <P>Asystent na stronie i sprawdzanie wyników korzystają z modeli Google Gemini 2.5 Flash i Gemini 2.5 Flash Lite przez pośrednika: OpenRouter albo Vercel AI Gateway.</P>
            <P>Do modelu nie wysyłamy imienia, nazwiska, PESEL, adresu ani e-maila. Odpowiedzi są oznaczone jako odpowiedzi asystenta AI. AI może się pomylić, więc ważne rzeczy sprawdź w urzędzie albo w źródle podanym przy świadczeniu.</P>
          </Section>

          <Section n="7" title="Komu powierzamy dane">
            <TableWrapper>
              <thead>
                <tr><Th>Firma</Th><Th>Do czego</Th></tr>
              </thead>
              <tbody>
                <Tr><Td>Vercel Inc.</Td><Td>Hosting strony, logi techniczne (adres IP, przeglądarka), AI Gateway</Td></Tr>
                <Tr><Td>Supabase Inc. (serwery w UE)</Td><Td>Baza: zgłoszenia ze sprawdzenia po NIP, zapis zgód, licznik pytań do asystenta</Td></Tr>
                <Tr><Td>Resend Inc.</Td><Td>Wysyłka maila z linkiem potwierdzającym i wiadomości do administratora</Td></Tr>
                <Tr><Td>OpenRouter Inc., Google</Td><Td>Odpowiedzi asystenta AI (bez danych kontaktowych)</Td></Tr>
                <Tr><Td>Google Ireland Ltd.</Td><Td>Statystyki Google Analytics, tylko po Twojej zgodzie w banerze</Td></Tr>
              </tbody>
            </TableWrapper>
            <P>Część tych firm ma siedzibę w USA. Przekazanie danych poza Europejski Obszar Gospodarczy opiera się na standardowych klauzulach umownych zatwierdzonych przez Komisję Europejską.</P>
          </Section>

          <Section n="8" title="Ciasteczka i pamięć przeglądarki">
            <TableWrapper>
              <thead>
                <tr><Th>Nazwa</Th><Th>Po co</Th><Th>Jak długo</Th></tr>
              </thead>
              <tbody>
                <Tr><Td><code className="text-[12px]">wzd_nip_potwierdzony</code></Td><Td>Pamięta, że potwierdziłeś adres przy sprawdzeniu po NIP</Td><Td>30 dni</Td></Tr>
                <Tr><Td><code className="text-[12px]">wzd_cookie_consent</code></Td><Td>Twoja decyzja w sprawie statystyk</Td><Td>Do usunięcia w przeglądarce</Td></Tr>
                <Tr><Td><code className="text-[12px]">_ga</code>, <code className="text-[12px]">_gid</code></Td><Td>Statystyki Google Analytics, tylko po zgodzie</Td><Td>Do 13 miesięcy</Td></Tr>
                <Tr><Td><code className="text-[12px]">theme</code>, <code className="text-[12px]">wzd_air_city</code>, <code className="text-[12px]">wzd_nfz_recent_*</code></Td><Td>Jasny albo ciemny wygląd, miasto w widżecie powietrza, ostatnie wyszukiwania NFZ</Td><Td>Do usunięcia w przeglądarce</Td></Tr>
                <Tr><Td><code className="text-[12px]">wnioski_*</code> (pamięć karty)</Td><Td>Szkic wniosku ZUS</Td><Td>Do zamknięcia karty</Td></Tr>
              </tbody>
            </TableWrapper>
            <P>Statystyki są domyślnie wyłączone i włączają się dopiero po kliknięciu zgody w banerze. Nie używamy pikseli reklamowych ani śledzenia między stronami.</P>
          </Section>

          <Section n="9" title="Twoje prawa">
            <P>Możesz poprosić o dostęp do swoich danych, ich poprawienie, usunięcie, ograniczenie przetwarzania i przeniesienie. Możesz sprzeciwić się przetwarzaniu i w każdej chwili wycofać zgodę. Napisz przez formularz „Napisz do nas”, odpowiemy w ciągu 30 dni.</P>
            <P>Masz też prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych: <a href="https://uodo.gov.pl/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">uodo.gov.pl</a>.</P>
          </Section>

          <Section n="10" title="Zmiany">
            <P>Gdy zmienimy treść zgód, podniesiemy ich wersję i datę na górze tej strony. Zgody zebrane wcześniej zapisujemy z wersją, którą widziałeś.</P>
          </Section>

        </div>

        <div className="mt-12 pt-4 border-t border-border text-[12px] text-text-3">
          <Link href="/regulamin" className="text-accent hover:underline">
            Regulamin
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

function Section({ n, title, id, children }: { n: string; title: string; id?: string; children: React.ReactNode }) {
  return (
    <div id={id} style={id ? { scrollMarginTop: 80 } : undefined}>
      <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
        {n}. {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto mt-3 mb-2">
      <table className="w-full text-[13px] border-collapse">
        {children}
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left py-2 px-3 text-text-3 font-semibold border-b border-border bg-surface text-[12px] uppercase tracking-wide">
      {children}
    </th>
  );
}

function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-border">{children}</tr>;
}

function Td({ children, id }: { children: React.ReactNode; id?: string }) {
  return <td id={id} className="py-2 px-3 align-top text-text-2">{children}</td>;
}
