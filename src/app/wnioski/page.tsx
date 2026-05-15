import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pomoc w wypełnieniu wniosku z AI | wezmezadarmo',
  description: 'Wypełniaj wnioski ZUS, PFRON, MOPS, granty i dofinansowania krok po kroku z pomocą AI. Twoje dane nie wychodzą poza przeglądarkę.',
};

interface Form {
  slug: string;
  symbol?: string;
  name: string;
  institution: string;
  amount: string;
  deadline?: string;
  deadlineUrgent?: boolean;
  description: string;
  available: boolean;
}

interface Category {
  id: string;
  label: string;
  forms: Form[];
}

const CATEGORIES: Category[] = [
  {
    id: 'zus',
    label: 'ZUS: Zakład Ubezpieczeń Społecznych',
    forms: [
      {
        slug: 'zus-z15a',
        symbol: 'Z-15a',
        name: 'Zasiłek opiekuńczy: opieka nad chorym dzieckiem',
        institution: 'ZUS / pracodawca',
        amount: '80% wynagrodzenia',
        description: 'Przysługuje gdy nie możesz pracować bo opiekujesz się chorym dzieckiem do 14 lat lub gdy zamknięto żłobek/przedszkole/szkołę.',
        available: true,
      },
      {
        slug: 'zus-z15b',
        symbol: 'Z-15b',
        name: 'Zasiłek opiekuńczy: opieka nad chorym dorosłym',
        institution: 'ZUS / pracodawca',
        amount: '80% wynagrodzenia',
        description: 'Przysługuje gdy opiekujesz się chorym małżonkiem, rodzicem lub innym dorosłym członkiem rodziny powyżej 14 lat.',
        available: false,
      },
      {
        slug: 'zus-zas53',
        symbol: 'ZAS-53',
        name: 'Zasiłek chorobowy: wniosek bezpośrednio do ZUS',
        institution: 'ZUS',
        amount: '80% wynagrodzenia (100% w ciąży)',
        description: 'Gdy pracodawca nie wypłaca zasiłku chorobowego lub jesteś osobą prowadzącą działalność.',
        available: false,
      },
      {
        slug: 'zus-emp',
        symbol: 'EMP',
        name: 'Wniosek o emeryturę',
        institution: 'ZUS',
        amount: 'indywidualnie',
        description: 'Wniosek dla osób osiągających wiek emerytalny: kobiety 60 lat, mężczyźni 65 lat.',
        available: false,
      },
      {
        slug: 'zus-ern',
        symbol: 'ERN',
        name: 'Renta z tytułu niezdolności do pracy',
        institution: 'ZUS',
        amount: 'od 1901 PLN',
        description: 'Dla osób które stały się niezdolne do pracy w wyniku choroby lub wypadku i mają odpowiedni staż składkowy.',
        available: false,
      },
      {
        slug: 'zus-ersu',
        symbol: 'ERSU',
        name: 'Mama 4+ / Tata 4+: rodzicielskie świadczenie uzupełniające',
        institution: 'ZUS',
        amount: '1901 PLN / mies.',
        description: 'Dla rodziców 4+ dzieci którzy zrezygnowali z pracy by wychowywać dzieci i nie mają prawa do emerytury lub mają ją poniżej minimum.',
        available: false,
      },
      {
        slug: 'zus-esun',
        symbol: 'ESUN',
        name: 'Świadczenie uzupełniające dla osób niezdolnych do samodzielnej egzystencji',
        institution: 'ZUS',
        amount: 'do 1901 PLN',
        description: 'Dla osób ze znacznym stopniem niepełnosprawności lub orzeczeniem lekarskim o niezdolności do samodzielnej egzystencji.',
        available: false,
      },
    ],
  },
  {
    id: 'pfron',
    label: 'PFRON: Fundusz Rehabilitacji Niepełnosprawnych',
    forms: [
      {
        slug: 'pfron-as1',
        name: 'Aktywny Samorząd Moduł I: sprzęt rehabilitacyjny i elektryczny wózek',
        institution: 'PFRON / PCPR',
        amount: 'do 10 000 PLN',
        description: 'Dofinansowanie do wózka elektrycznego, protezy, urządzenia lektorskiego, utrzymania sprawności technicznej wózka.',
        available: false,
      },
      {
        slug: 'pfron-as2',
        name: 'Aktywny Samorząd Moduł II: dofinansowanie do studiów',
        institution: 'PFRON / PCPR',
        amount: 'do 1100 PLN/mies.',
        description: 'Dofinansowanie kosztów nauki dla studentów ze znacznym lub umiarkowanym stopniem niepełnosprawności.',
        available: false,
      },
      {
        slug: 'pfron-turnusy',
        name: 'Dofinansowanie do turnusu rehabilitacyjnego',
        institution: 'PFRON / PCPR',
        amount: 'do 2079 PLN',
        description: 'Jednorazowe dofinansowanie rocznego udziału w turnusie rehabilitacyjnym dla osób z orzeczeniem.',
        available: false,
      },
    ],
  },
  {
    id: 'mops',
    label: 'MOPS / Gmina: świadczenia społeczne',
    forms: [
      {
        slug: 'mops-800plus',
        name: 'Świadczenie wychowawcze 800+',
        institution: 'ZUS (od 2024) / gmina',
        amount: '800 PLN / mies. na dziecko',
        description: 'Dla każdego dziecka do 18 roku życia bez progu dochodowego. Składany przez PUE ZUS lub bankowość elektroniczną.',
        available: false,
      },
      {
        slug: 'mops-becikowe',
        name: 'Becikowe: jednorazowa zapomoga z tytułu urodzenia dziecka',
        institution: 'Gmina / MOPS',
        amount: '1000 PLN',
        description: 'Jednorazowe świadczenie dla rodzin z dochodem do 1922 PLN netto na osobę. Złożyć w ciągu 12 miesięcy od urodzenia.',
        available: false,
      },
      {
        slug: 'mops-dobrystart',
        name: 'Dobry Start 300+',
        institution: 'ZUS',
        amount: '300 PLN / rok na dziecko',
        description: 'Jednorazowe świadczenie na wyprawkę szkolną dla dzieci uczących się do 20 lat (24 lata przy niepełnosprawności).',
        available: false,
      },
      {
        slug: 'mops-zasilekokresowyStaly',
        name: 'Zasiłek stały i zasiłek okresowy',
        institution: 'MOPS / OPS',
        amount: 'do 1901 PLN',
        description: 'Dla osób w trudnej sytuacji materialnej: zasiłek stały dla niezdolnych do pracy, okresowy dla bezrobotnych w trakcie trudności.',
        available: false,
      },
      {
        slug: 'mops-pomoc-mieszkaniowa',
        name: 'Dodatek mieszkaniowy i energetyczny',
        institution: 'Gmina',
        amount: 'do 1500 PLN / mies.',
        description: 'Dopłata do czynszu i rachunków za energię dla osób z niskim dochodem. Składany w urzędzie gminy.',
        available: false,
      },
    ],
  },
  {
    id: 'pracagov',
    label: 'Urząd Pracy: praca.gov.pl',
    forms: [
      {
        slug: 'pup-jednorazowe',
        name: 'Jednorazowe środki na podjęcie działalności gospodarczej',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'do 45 000 PLN',
        description: 'Dla zarejestrowanych bezrobotnych chcących założyć firmę. Bezzwrotna dotacja z Funduszu Pracy.',
        available: false,
      },
      {
        slug: 'pup-bon-szkoleniowy',
        name: 'Bon szkoleniowy',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'do 16 000 PLN',
        description: 'Dofinansowanie szkoleń i kursów dla bezrobotnych do 30 roku życia. Pokrywa koszty szkolenia, przejazdu, zakwaterowania.',
        available: false,
      },
      {
        slug: 'pup-bon-zasiedlenie',
        name: 'Bon na zasiedlenie',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'do 15 669 PLN',
        description: 'Dla bezrobotnych do 30 lat którzy znajdą pracę lub założą firmę w odległości ponad 80 km od miejsca zamieszkania.',
        available: false,
      },
      {
        slug: 'pup-staz',
        name: 'Wniosek o staż z urzędu pracy',
        institution: 'Powiatowy Urząd Pracy',
        amount: 'stypendium ~1901 PLN',
        description: 'Dla pracodawców i bezrobotnych chcących zorganizować staż finansowany przez PUP. Czas trwania: 3-6 miesięcy.',
        available: false,
      },
    ],
  },
  {
    id: 'nfz',
    label: 'NFZ: refundacje i dofinansowania zdrowotne',
    forms: [
      {
        slug: 'nfz-okulary',
        name: 'Refundacja okularów i soczewek kontaktowych',
        institution: 'NFZ',
        amount: '50-700 PLN na okulary / do 600 PLN na soczewki',
        description: 'Co 2 lata (częściej u dzieci). Wymagane zlecenie od okulisty z NFZ. Realizowane w optykach z umową.',
        available: false,
      },
      {
        slug: 'nfz-aparat-sluchowy',
        name: 'Dofinansowanie aparatu słuchowego',
        institution: 'NFZ',
        amount: 'do 2700 PLN / 5 lat',
        description: 'Dla osób z ubytkiem słuchu potwierdzonym badaniem audiologicznym. Wymagane skierowanie od laryngologa z NFZ.',
        available: false,
      },
    ],
  },
  {
    id: 'granty',
    label: 'Granty i dofinansowania: przedsiębiorcy i projekty',
    forms: [
      {
        slug: 'nlnet',
        name: 'NLnet NGI Zero Commons Fund',
        institution: 'NLnet Foundation / UE Horizon Europe',
        amount: 'do €50 000',
        deadline: '1 czerwca 2026, 12:00',
        deadlineUrgent: true,
        description: 'Grant dla projektów open-source z impaktem społecznym. Dla civic tech, narzędzi AI, infrastruktury cyfrowej.',
        available: true,
      },
      {
        slug: 'step',
        name: 'NCBiR STEP Ścieżka A',
        institution: 'NCBiR / FENG 2021-2027',
        amount: 'do 18 mln PLN',
        deadline: '17 czerwca 2026',
        description: 'Dofinansowanie na projekty B+R w obszarze technologii cyfrowych i krytycznych.',
        available: false,
      },
      {
        slug: 'eic',
        name: 'EIC Accelerator',
        institution: 'European Innovation Council',
        amount: 'do €2,5 mln',
        deadline: '8 lipca 2026',
        description: 'Europejski program dla startupów z przełomowymi innowacjami i globalnym potencjałem.',
        available: false,
      },
      {
        slug: 'parp-startup',
        name: 'PARP Startup Booster Tech Impact',
        institution: 'PARP / FENG',
        amount: 'do 400 000 PLN',
        description: 'Dla startupów realizujących Cele Zrównoważonego Rozwoju ONZ. Przez akredytowane akceleratory.',
        available: false,
      },
    ],
  },
];

export default function WnioskiPage() {
  const totalForms = CATEGORIES.reduce((s, c) => s + c.forms.length, 0);
  const availableForms = CATEGORIES.reduce((s, c) => s + c.forms.filter(f => f.available).length, 0);

  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do strony głównej
        </Link>

        <h1 className="text-[24px] sm:text-[28px] font-bold text-text-1 mb-3">
          Pomoc w wypełnieniu wniosku z AI
        </h1>
        <p className="text-[15px] text-text-2 mb-2 leading-[1.7]">
          Podaj swoje dane. AI automatycznie wypełni formularz, ty przeglądasz pole po polu i pobierasz gotowy tekst. Działa dla wniosków ZUS, PFRON, MOPS, urzędu pracy i grantów.
        </p>
        <div className="flex items-center gap-4 mb-8">
          <span className="text-[13px] text-text-3">{totalForms} formularzy w bazie</span>
          <span className="text-[12px] text-text-3">|</span>
          <span className="text-[13px] text-accent font-medium">{availableForms} dostępne teraz</span>
          <span className="text-[12px] text-text-3">|</span>
          <span className="text-[13px] text-text-3">Twoje dane nie wychodzą poza przeglądarkę</span>
        </div>

        <div className="mb-6 p-4 border border-accent/30 bg-accent/5 rounded-[8px]">
          <p className="text-[13px] text-text-2 leading-[1.6]">
            Usługa w fazie beta: aktualnie bezpłatna. Pomagamy w przygotowaniu wniosku, nie w jego złożeniu. Wypełniony tekst kopiujesz lub pobierasz i wklejasz do oryginalnego formularza instytucji.
          </p>
        </div>

        <div className="space-y-10">
          {CATEGORIES.map((cat) => (
            <section key={cat.id}>
              <h2 className="text-[13px] font-mono font-medium text-text-3 uppercase tracking-wider mb-3 pb-2 border-b border-border">
                {cat.label}
              </h2>
              <div className="space-y-3">
                {cat.forms.map((form) => (
                  <FormCard key={form.slug} form={form} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-[15px] font-bold text-text-1 mb-4">Jak to działa</h2>
          <ol className="space-y-3 text-[14px] text-text-2">
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">1.</span>
              <span>Wybierz formularz i wpisz swoje dane: AI wyjaśni co znaczy każde pole.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">2.</span>
              <span>AI automatycznie generuje treść wszystkich pól na podstawie tego co podałeś.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">3.</span>
              <span>Przechodzisz pole po polu, czytasz, poprawiasz i akceptujesz.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">4.</span>
              <span>Pobierasz gotowy tekst i wklejasz do oryginalnego formularza lub drukujesz.</span>
            </li>
          </ol>
        </div>

        <div className="mt-8 p-4 bg-bg-1 rounded-[8px] text-[13px] text-text-3 leading-[1.7]">
          <p className="mb-1 font-medium text-text-2">Prywatność</p>
          <p>Twoje dane (PESEL, imię, adres) są wpisywane bezpośrednio w przeglądarce i nie są nigdy wysyłane na serwer. Do AI trafia tylko tyle ile potrzeba by wypełnić dane pole: bez identyfikatorów. Nic nie jest zapisywane.</p>
        </div>

        <div className="mt-6 text-[13px] text-text-3">
          Brakuje wniosku który potrzebujesz? Napisz: <a href="mailto:sobkowicz.kamil@gmail.com" className="text-accent hover:underline">sobkowicz.kamil@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

function FormCard({ form }: { form: Form }) {
  return (
    <div className={`border rounded-[8px] p-4 transition-colors ${form.available ? 'border-accent/40 bg-bg-1' : 'border-border bg-bg-0'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {form.symbol && (
              <span className="text-[11px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded-[4px] shrink-0">{form.symbol}</span>
            )}
            <h3 className={`text-[14px] font-medium leading-snug ${form.available ? 'text-text-1' : 'text-text-2'}`}>{form.name}</h3>
            {!form.available && (
              <span className="text-[10px] text-text-3 border border-border rounded-[4px] px-1.5 py-0.5 shrink-0">wkrótce</span>
            )}
          </div>
          <p className="text-[11px] text-text-3 mb-1">{form.institution}</p>
          <p className="text-[12px] text-text-2 leading-[1.6]">{form.description}</p>
          {form.deadline && (
            <p className="mt-1 text-[11px]">
              <span className="text-text-3">Termin: </span>
              <span className={form.deadlineUrgent ? 'text-amber-400 font-medium' : 'text-text-2'}>{form.deadline}</span>
              {form.deadlineUrgent && <span className="ml-1 text-amber-400 font-medium">PILNE</span>}
            </p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="text-[13px] font-mono font-bold text-accent whitespace-nowrap">{form.amount}</span>
          {form.available ? (
            <Link
              href={`/wnioski/${form.slug}`}
              className="text-[12px] font-medium text-bg-0 bg-accent hover:bg-accent/90 px-3 py-1.5 rounded-[5px] transition-colors whitespace-nowrap"
            >
              Wypełnij z AI
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
