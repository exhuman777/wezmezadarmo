import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pomoc w wypełnieniu wniosku z AI | wezmezadarmo',
  description: 'Wypełniaj wnioski o granty, dofinansowania i świadczenia krok po kroku z pomocą AI. Twoje dane nie wychodzą poza przeglądarkę.',
};

const FORMS = [
  {
    slug: 'nlnet',
    name: 'NLnet NGI Zero Commons Fund',
    institution: 'NLnet Foundation / UE Horizon Europe',
    amount: 'do €50 000',
    deadline: '1 czerwca 2026, 12:00',
    deadlineUrgent: true,
    description: 'Grant dla projektów open-source z impaktem społecznym. Idealne dla civic tech, narzędzi AI i infrastruktury cyfrowej.',
    fields: 10,
    available: true,
  },
  {
    slug: 'step',
    name: 'NCBiR STEP Ścieżka A',
    institution: 'NCBiR / FENG 2021-2027',
    amount: 'do 18 mln PLN',
    deadline: '17 czerwca 2026',
    deadlineUrgent: false,
    description: 'Dofinansowanie na projekty B+R w obszarze technologii cyfrowych i krytycznych.',
    fields: 14,
    available: false,
  },
  {
    slug: 'eic',
    name: 'EIC Accelerator',
    institution: 'European Innovation Council',
    amount: 'do €2,5 mln',
    deadline: '8 lipca 2026',
    deadlineUrgent: false,
    description: 'Europejski program dla startupów z przełomowymi technologiami i potencjalem rynkowym.',
    fields: 12,
    available: false,
  },
  {
    slug: 'parp-startup',
    name: 'PARP Startup Booster Tech Impact',
    institution: 'PARP / FENG',
    amount: 'do 400 000 PLN',
    deadline: 'nabory przez akceleratory -- Q3 2026',
    deadlineUrgent: false,
    description: 'Dofinansowanie dla startupów realizujących Cele Zrównoważonego Rozwoju ONZ.',
    fields: 8,
    available: false,
  },
];

export default function WnioskiPage() {
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
          Podaj dane o swoim projekcie. AI automatycznie wypełni formularz, a ty przeglądasz i poprawiasz pole po polu. Na koniec pobierasz gotowy tekst.
        </p>
        <p className="text-[13px] text-text-3 mb-8">
          Twoje dane nie wychodzą poza przeglądarkę. Nic nie jest zapisywane na serwerze.
        </p>

        <div className="mb-6 p-4 border border-accent/30 bg-accent/5 rounded-[8px]">
          <p className="text-[13px] text-text-2 leading-[1.6]">
            Usługa w fazie beta -- aktualnie bezplatna. Pomagamy w przygotowaniu wniosku, nie w jego złożeniu. Wypełniony tekst kopiujesz lub pobierasz i wklejasz do oryginalnego formularza.
          </p>
        </div>

        <div className="space-y-4">
          {FORMS.map((form) => (
            <FormCard key={form.slug} form={form} />
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-[16px] font-bold text-text-1 mb-4">Jak to działa</h2>
          <ol className="space-y-3 text-[14px] text-text-2">
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">1.</span>
              <span>Wybierz formularz i opisz swój projekt w kilku zdaniach po angielsku (lub polsku -- AI przetlumaczy).</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">2.</span>
              <span>AI automatycznie generuje odpowiedzi do wszystkich pól formularza na podstawie Twoich danych.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">3.</span>
              <span>Przechodzisz przez każde pole: czytasz, poprawiasz, akceptujesz. Masz pełną kontrolę.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent font-mono font-bold shrink-0">4.</span>
              <span>Pobierasz gotowy tekst i wklejasz do oryginalnego formularza instytucji.</span>
            </li>
          </ol>
        </div>

        <div className="mt-8 p-4 bg-bg-1 rounded-[8px] text-[13px] text-text-3">
          <p className="mb-1 font-medium text-text-2">Prywatnosc</p>
          <p>Wszystkie dane wpisujesz bezposrednio w przegladarce. Informacje o projekcie sa uzywane wylacznie do generowania odpowiedzi i nie sa zapisywane na serwerze. Do AI trafia tylko tresc potrzebna do wypelnienia danego pola -- bez Twoich danych osobowych.</p>
        </div>

        <div className="mt-8 text-[13px] text-text-3">
          Pytania i sugestie co do nowych formularzy: <a href="mailto:sobkowicz.kamil@gmail.com" className="text-accent hover:underline">sobkowicz.kamil@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

function FormCard({ form }: { form: typeof FORMS[0] }) {
  return (
    <div className={`border rounded-[8px] p-5 ${form.available ? 'border-accent/40 bg-bg-1' : 'border-border bg-bg-0 opacity-60'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-[15px] font-bold text-text-1">{form.name}</h3>
            {!form.available && (
              <span className="text-[11px] text-text-3 border border-border rounded-[4px] px-2 py-0.5">wkrotce</span>
            )}
          </div>
          <p className="text-[12px] text-text-3 mb-2">{form.institution}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[15px] font-mono font-bold text-accent">{form.amount}</div>
        </div>
      </div>

      <p className="text-[13px] text-text-2 mb-3">{form.description}</p>

      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[12px] text-text-3">Termin: </span>
          <span className={`text-[12px] font-medium ${form.deadlineUrgent ? 'text-amber-400' : 'text-text-2'}`}>
            {form.deadline}
          </span>
          {form.deadlineUrgent && (
            <span className="ml-2 text-[11px] text-amber-400 font-medium">-- PILNE</span>
          )}
        </div>
        {form.available ? (
          <Link
            href={`/wnioski/${form.slug}`}
            className="text-[13px] font-medium text-bg-0 bg-accent hover:bg-accent/90 px-4 py-2 rounded-[6px] transition-colors shrink-0"
          >
            Wypelnij z AI
          </Link>
        ) : (
          <span className="text-[12px] text-text-3 shrink-0">{form.fields} pol</span>
        )}
      </div>
    </div>
  );
}
