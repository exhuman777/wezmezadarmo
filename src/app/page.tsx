'use client';

import { useState, useEffect } from 'react';
import { IntakeForm } from '@/components/IntakeForm';
import { ChatWindow, ChatMessage } from '@/components/ChatWindow';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PeselInfoModal } from '@/components/PeselInfoModal';
import { useTheme } from '@/hooks/useTheme';
import { MatchResult, UserProfile } from '@/engine/types';
import { CeidgBusinessData } from '@/lib/ceidg';

type Phase = 'landing' | 'questions' | 'loading' | 'chat';

const LOADING_MESSAGES = [
  'Szukamy pieniędzy dla Twojej rodziny...',
  'Sprawdzamy 99 świadczeń w 15 kategoriach...',
  'Szukam dla Ciebie funduszy...',
  'Analizujemy Twój profil...',
  'Twoje darmowe pieniądze od Państwa w zasięgu ręki...',
];

const EXAMPLE_BENEFITS = [
  { nazwa: 'Świadczenie 800+', kwota: '800 PLN/mies.', opis: 'Na każde dziecko do 18 roku życia, bez progu dochodowego' },
  { nazwa: 'Bon energetyczny', kwota: 'do 1200 PLN', opis: 'Jednorazowe wsparcie na rachunki za prąd i gaz' },
  { nazwa: 'Ulga na dziecko (PIT)', kwota: 'do 2700 PLN/rok', opis: 'Odliczenie od podatku za każde dziecko' },
  { nazwa: 'Dodatek mieszkaniowy', kwota: 'do 1500 PLN/mies.', opis: 'Dopłata do czynszu przy niskim dochodzie' },
  { nazwa: 'Refundacja okularów (NFZ)', kwota: 'do 500 PLN', opis: 'Dofinansowanie do soczewek i oprawek' },
  { nazwa: 'Zasiłek pogrzebowy', kwota: '4000 PLN', opis: 'Jednorazowe świadczenie na pokrycie kosztów pogrzebu' },
  { nazwa: 'Trzynasta emerytura', kwota: '1780 PLN', opis: 'Dodatkowe roczne świadczenie dla emerytów i rencistów' },
  { nazwa: 'Becikowe', kwota: '1000 PLN', opis: 'Jednorazowa zapomoga z tytułu urodzenia dziecka' },
];

interface QualifyingQuestion {
  id: string;
  question: string;
  options: { label: string; value: string }[];
  profileKey: keyof UserProfile;
}

const QUESTIONS: QualifyingQuestion[] = [
  {
    id: 'stanCywilny',
    question: 'Jaki jest Twój stan cywilny?',
    options: [
      { label: 'Wolny/wolna', value: 'wolny' },
      { label: 'W związku małżeńskim', value: 'malzenstwo' },
      { label: 'Rozwiedziony/a', value: 'rozwiedziony' },
      { label: 'Wdowiec/wdowa', value: 'wdowiec' },
    ],
    profileKey: 'stanCywilny',
  },
  {
    id: 'liczbaDzieci',
    question: 'Ile masz dzieci poniżej 18 roku życia?',
    options: [
      { label: 'Brak', value: '0' },
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3 lub więcej', value: '3' },
    ],
    profileKey: 'liczbaDzieci',
  },
  {
    id: 'dochodMiesiecznie',
    question: 'Jaki jest miesięczny dochód netto Twojego gospodarstwa domowego?',
    options: [
      { label: 'Poniżej 2000 PLN', value: '1500' },
      { label: '2000-4000 PLN', value: '3000' },
      { label: '4000-7000 PLN', value: '5500' },
      { label: 'Powyżej 7000 PLN', value: '9000' },
    ],
    profileKey: 'dochodMiesiecznie',
  },
  {
    id: 'zatrudnienie',
    question: 'Jaki jest Twój status zatrudnienia?',
    options: [
      { label: 'Umowa o pracę', value: 'umowa_o_prace' },
      { label: 'Działalność gospodarcza', value: 'dzialalnosc' },
      { label: 'Umowa zlecenie/dzieło', value: 'umowa_zlecenie' },
      { label: 'Bezrobotny/a', value: 'bezrobotny' },
      { label: 'Emeryt/rencista', value: 'emeryt' },
    ],
    profileKey: 'zatrudnienie',
  },
  {
    id: 'niepelnosprawnosc',
    question: 'Czy posiadasz orzeczenie o niepełnosprawności?',
    options: [
      { label: 'Nie', value: 'brak' },
      { label: 'Lekki stopień', value: 'lekki' },
      { label: 'Umiarkowany stopień', value: 'umiarkowany' },
      { label: 'Znaczny stopień', value: 'znaczny' },
    ],
    profileKey: 'niepelnosprawnosc',
  },
  {
    id: 'wlasnosc',
    question: 'Jaka jest Twoja sytuacja mieszkaniowa?',
    options: [
      { label: 'Własne mieszkanie', value: 'mieszkanie' },
      { label: 'Własny dom', value: 'dom' },
      { label: 'Wynajem', value: 'wynajem' },
      { label: 'Zamieszkanie z rodziną', value: 'rodzina' },
    ],
    profileKey: 'wlasnosc',
  },
  {
    id: 'wojewodztwo',
    question: 'W jakim województwie mieszkasz?',
    options: [
      { label: 'Mazowieckie', value: 'mazowieckie' },
      { label: 'Małopolskie', value: 'malopolskie' },
      { label: 'Śląskie', value: 'slaskie' },
      { label: 'Wielkopolskie', value: 'wielkopolskie' },
      { label: 'Dolnośląskie', value: 'dolnoslaskie' },
      { label: 'Inne', value: 'inne' },
    ],
    profileKey: 'wojewodztwo',
  },
  {
    id: 'ciaza',
    question: 'Czy ktoś w Twoim gospodarstwie domowym jest w ciąży?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'ciaza',
  },
  {
    id: 'student',
    question: 'Czy jesteś studentem/studentką?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'student',
  },
  {
    id: 'rolnik',
    question: 'Czy jesteś ubezpieczony/a w KRUS (rolnik)?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'rolnik',
  },
  {
    id: 'bezrobotnyZarejestrowany',
    question: 'Czy jesteś zarejestrowany/a jako bezrobotny/a w urzędzie pracy (PUP)?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'bezrobotnyZarejestrowany',
  },
];

function TopBar({ theme, onToggle, children }: { theme: 'light' | 'dark'; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border sticky top-0 z-50"
      style={{
        background: theme === 'dark' ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ background: 'var(--color-accent)', boxShadow: '0 0 6px var(--color-amber-border)' }} />
      <span className="text-[12px] sm:text-[14px] font-extrabold tracking-[1.5px] sm:tracking-[2px] text-text-1">
        wezmezadarmo
      </span>
      <span className="flex-1" />
      {children}
      <ThemeToggle theme={theme} onToggle={onToggle} />
    </div>
  );
}

function RotatingExamples() {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 3) % EXAMPLE_BENEFITS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const visible = [];
  for (let i = 0; i < 3; i++) {
    visible.push(EXAMPLE_BENEFITS[(startIndex + i) % EXAMPLE_BENEFITS.length]);
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] sm:text-[12px] font-bold tracking-wider text-accent uppercase mb-2">
        Przykładowe świadczenia
      </div>
      {visible.map((b, i) => (
        <div
          key={`${startIndex}-${i}`}
          className="p-3 rounded-xl transition-opacity duration-500"
          style={{
            background: 'var(--color-bg-2)',
            border: '1px solid var(--color-border)',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-[14px] sm:text-[15px] font-semibold text-text-1">{b.nazwa}</span>
            <span className="text-[13px] sm:text-[14px] font-bold text-accent shrink-0">{b.kwota}</span>
          </div>
          <p className="text-[12px] sm:text-[13px] text-text-3 mt-1">{b.opis}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [phase, setPhase] = useState<Phase>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [guideBenefitId, setGuideBenefitId] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [showPeselInfo, setShowPeselInfo] = useState(false);

  // Rotate loading messages
  useEffect(() => {
    if (phase !== 'loading') return;
    setLoadingMsgIndex(0);
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [phase]);

  async function handleIntakeSubmit(data: { pesel: string; wiek: number; plec: 'K' | 'M'; nip?: string }) {
    setProfile((prev) => ({ ...prev, wiek: data.wiek, plec: data.plec }));

    if (data.nip) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ceidg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nip: data.nip }),
        });
        if (res.ok) {
          const ceidg: CeidgBusinessData = await res.json();
          setProfile((prev) => ({
            ...prev,
            prowadzDzialalnosc: ceidg.aktywna,
            dataDzialalnosci: ceidg.dataRejestracji ?? undefined,
            pkd: ceidg.pkd,
          }));
        }
      } catch {
        // CEIDG lookup failed, continue without business data
      }
      setIsLoading(false);
    }

    setPhase('questions');
  }

  function handleQuestionAnswer(value: string) {
    const q = QUESTIONS[questionIndex];
    const key = q.profileKey;

    const updated = { ...profile };
    if (key === 'liczbaDzieci' || key === 'dochodMiesiecznie') {
      (updated as Record<string, unknown>)[key] = parseInt(value, 10);
    } else if (key === 'ciaza' || key === 'student' || key === 'rolnik' || key === 'bezrobotnyZarejestrowany') {
      (updated as Record<string, unknown>)[key] = value === 'true';
    } else {
      (updated as Record<string, unknown>)[key] = value;
    }

    if (updated.dochodMiesiecznie != null) {
      const familySize = 1 + (typeof updated.liczbaDzieci === 'number' ? updated.liczbaDzieci : 0) +
        (updated.stanCywilny === 'malzenstwo' ? 1 : 0);
      updated.dochodNaOsobe = Math.round((updated.dochodMiesiecznie as number) / familySize);
    }

    setProfile(updated);

    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      runVerification(updated as UserProfile);
    }
  }

  function handleQuestionBack() {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    } else {
      setPhase('landing');
    }
  }

  async function runVerification(fullProfile: UserProfile) {
    setIsLoading(true);
    setPhase('loading');

    const completeProfile: UserProfile = {
      wiek: fullProfile.wiek,
      plec: fullProfile.plec,
      stanCywilny: fullProfile.stanCywilny ?? 'wolny',
      liczbaDzieci: fullProfile.liczbaDzieci ?? 0,
      wiekDzieci: [],
      dochodMiesiecznie: fullProfile.dochodMiesiecznie ?? 5000,
      dochodNaOsobe: fullProfile.dochodNaOsobe ?? 5000,
      zatrudnienie: fullProfile.zatrudnienie ?? 'umowa_o_prace',
      niepelnosprawnosc: fullProfile.niepelnosprawnosc ?? 'brak',
      wlasnosc: fullProfile.wlasnosc ?? 'mieszkanie',
      wojewodztwo: fullProfile.wojewodztwo ?? 'inne',
      prowadzDzialalnosc: fullProfile.prowadzDzialalnosc ?? false,
      pierwszaDzialalnosc: fullProfile.pierwszaDzialalnosc ?? false,
      dataDzialalnosci: fullProfile.dataDzialalnosci,
      pkd: fullProfile.pkd,
      ciaza: fullProfile.ciaza ?? false,
      student: fullProfile.student ?? false,
      emeryt: fullProfile.zatrudnienie === 'emeryt',
      rolnik: fullProfile.rolnik ?? false,
      bezrobotnyZarejestrowany: fullProfile.bezrobotnyZarejestrowany ?? false,
    };

    setProfile(completeProfile);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: completeProfile }),
      });

      if (!res.ok) throw new Error('Błąd weryfikacji');

      const data = await res.json();
      const matchedResults: MatchResult[] = data.results ?? [];
      setResults(matchedResults);

      const pewne = matchedResults.filter((r) => r.status === 'PRZYSLUGUJE').length;
      const mozliwe = matchedResults.filter((r) => r.status === 'MOZLIWE').length;
      const total = matchedResults.length;

      let welcomeText: string;
      if (total > 0) {
        welcomeText = `Znalazłem ${total} świadczeń dla Ciebie`;
        if (pewne > 0 && mozliwe > 0) welcomeText += ` (${pewne} pewnych, ${mozliwe} do weryfikacji)`;
        else if (pewne > 0) welcomeText += ` (${pewne} pewnych)`;
        else if (mozliwe > 0) welcomeText += ` (${mozliwe} do weryfikacji)`;
        welcomeText += '.\n\n';

        welcomeText += 'Przejdź do zakładki "Świadczenia" żeby zobaczyć listę. Kliknij dowolne świadczenie żeby zobaczyć jak złożyć wniosek krok po kroku.\n\n';

        welcomeText += 'Jestem Twoim asystentem AI. Oto co mogę dla Ciebie zrobić:\n\n';
        welcomeText += '>>> Przeprowadzę Cię przez składanie wniosku krok po kroku\n';
        welcomeText += '>>> Wyjaśnię warunki, wymagane dokumenty i terminy\n';
        welcomeText += '>>> Odpowiem na pytania o dowolne świadczenie\n';
        welcomeText += '>>> Pomogę ocenić czy dane świadczenie jest dla Ciebie opłacalne\n\n';
        welcomeText += 'Napisz pytanie, jestem tutaj żeby pomóc.';
      } else {
        welcomeText = 'Nie znalazłem świadczeń pasujących do Twojego profilu.\n\n';
        welcomeText += 'Opisz mi swoją sytuację, a sprawdzę czy czegoś nie przeoczyłem. Mogę też odpowiedzieć na pytania o dowolne świadczenie w Polsce.';
      }

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeText,
      }]);
    } catch {
      setMessages([{
        id: 'error',
        role: 'assistant',
        content: 'Wystąpił błąd podczas weryfikacji. Spróbuj ponownie za chwilę.',
      }]);
    }

    setPhase('chat');
    setIsLoading(false);
  }

  async function handleSendMessage(text: string) {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    const assistantMsg: ChatMessage = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const chatMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          profile: profile as UserProfile,
          verifiedResults: results,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Błąd czatu');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.id === assistantMsg.id) {
                  updated[updated.length - 1] = { ...last, content: fullContent };
                }
                return updated;
              });
            }
          } catch {
            // skip malformed SSE chunks
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.id === assistantMsg.id) {
          updated[updated.length - 1] = {
            ...last,
            content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
          };
        }
        return updated;
      });
    }

    setIsStreaming(false);
  }

  // LANDING
  if (phase === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-6">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden bg-bg-1"
          style={{
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          <TopBar theme={theme} onToggle={toggleTheme}>
            <span className="text-[11px] sm:text-[12px] text-text-3 tracking-[1px]">v1.0</span>
          </TopBar>

          {/* Header content */}
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
            <h1 className="text-[22px] sm:text-[26px] font-bold text-text-1 mb-1.5 leading-tight">
              Sprawdź co Ci się należy
            </h1>
            <p className="text-text-2 text-[14px] sm:text-[15px] mb-2">
              Polska oferuje jeden z najszerszych systemów świadczeń w Europie. Zasiłki, ulgi podatkowe, darmowe badania, dotacje na mieszkanie, programy dla rodzin, seniorów, przedsiębiorców. W naszej bazie znajdziesz 99 świadczeń z 13 kategorii. Sprawdź w 2 minuty, które Ci przysługują, a nasz asystent AI pomoże Ci złożyć wniosek krok po kroku.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
              <span className="text-[11px] sm:text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', border: '1px solid var(--color-green-border)' }}>
                {'\u2713'} PESEL nie opuszcza Twojej przeglądarki
              </span>
              <span className="text-[11px] sm:text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', border: '1px solid var(--color-green-border)' }}>
                {'\u2713'} Brak zapisu danych do zewnętrznej bazy
              </span>
              <span className="text-[11px] sm:text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', border: '1px solid var(--color-green-border)' }}>
                {'\u2713'} Połączenie szyfrowane HTTPS
              </span>
            </div>
          </div>

          {/* Form section */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-5">
            <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
              <a href="/swiadczenia" className="flex items-center gap-2 text-[13px] sm:text-[14px] font-semibold text-accent no-underline hover:underline">
                <span>{'\u2192'}</span>
                <span>Przeglądaj pełną bazę {99} świadczeń bez wypełniania formularza</span>
              </a>
            </div>
            <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />

            {/* PESEL safety link */}
            <button
              onClick={() => setShowPeselInfo(true)}
              className="mt-3 text-[12px] sm:text-[13px] text-accent hover:underline cursor-pointer bg-transparent border-none font-medium"
            >
              Czy podanie PESEL jest bezpieczne? {'\u2192'}
            </button>
          </div>

          {/* Disclaimer footer */}
          <div className="px-4 sm:px-6 py-3 text-[11px] sm:text-[12px] text-text-3 leading-relaxed border-t border-border bg-bg-2">
            To informacja orientacyjna, nie decyzja urzędowa.
            Twój numer PESEL nie opuszcza Twojej przeglądarki. NIP jest używany jednorazowo
            do sprawdzenia statusu firmy i nie jest przechowywany.
          </div>
        </div>

        {/* OKI Section (info only, no button) */}
        <div
          className="w-full max-w-lg mt-5 rounded-2xl overflow-hidden bg-bg-1 p-4 sm:p-5"
          style={{
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div className="text-[11px] sm:text-[12px] font-bold tracking-wider text-accent uppercase mb-2">Czy wiesz?</div>
          <h3 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-2">
            OKI: 100 000 PLN wolne od podatku
          </h3>
          <p className="text-[13px] sm:text-[14px] text-text-2 leading-relaxed mb-3">
            Ogólnopolskie Konto Inwestycyjne (OKI) to sposób na inwestowanie bez płacenia podatku Belki (19% od zysków kapitałowych). Możesz zainwestować do 100 000 PLN rocznie i nie zapłacisz ani złotówki podatku od zysków.
          </p>
          <div className="space-y-2">
            <div className="flex gap-2 text-[13px] sm:text-[14px] text-text-2">
              <span className="text-accent font-bold shrink-0">{'\u2192'}</span>
              <span>Kup ETF-y na Bitcoin, złoto, S&P 500 lub inne aktywa</span>
            </div>
            <div className="flex gap-2 text-[13px] sm:text-[14px] text-text-2">
              <span className="text-accent font-bold shrink-0">{'\u2192'}</span>
              <span>Możesz otworzyć OKI na platformie XTB, bez prowizji od polskich i zagranicznych ETF-ów</span>
            </div>
            <div className="flex gap-2 text-[13px] sm:text-[14px] text-text-2">
              <span className="text-accent font-bold shrink-0">{'\u2192'}</span>
              <span>Zyski z inwestycji są całkowicie zwolnione z podatku</span>
            </div>
          </div>
        </div>

        {/* Rotating benefit examples */}
        <div
          className="w-full max-w-lg mt-5 rounded-2xl overflow-hidden bg-bg-1 p-4 sm:p-5"
          style={{
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <RotatingExamples />
        </div>

        <div className="mt-4 text-[12px] sm:text-[13px] text-text-3 text-center space-y-1">
          <div>Baza: 99 świadczeń | 15 kategorii</div>
          <div>
            <a href="/regulamin" className="text-accent hover:underline">Regulamin</a>
            <span className="mx-1.5">|</span>
            <a href="/polityka-prywatnosci" className="text-accent hover:underline">Polityka prywatności</a>
          </div>
        </div>

        {/* PESEL Info Modal */}
        <PeselInfoModal isOpen={showPeselInfo} onClose={() => setShowPeselInfo(false)} />
      </div>
    );
  }

  // QUESTIONS
  if (phase === 'questions') {
    const q = QUESTIONS[questionIndex];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-6">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden bg-bg-1"
          style={{
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          <TopBar theme={theme} onToggle={toggleTheme}>
            <span className="text-[13px] sm:text-[14px] font-bold tracking-[1px] text-accent">
              {questionIndex + 1}/{QUESTIONS.length}
            </span>
          </TopBar>

          {/* Progress bar */}
          <div className="h-1.5 bg-bg-3">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-2))',
              }}
            />
          </div>

          {/* Question content */}
          <div className="px-4 sm:px-6 py-5 sm:py-7">
            <h2 className="text-[16px] sm:text-[18px] font-semibold text-text-1 mb-5 sm:mb-6 leading-relaxed">
              {q.question}
            </h2>

            <div className="space-y-2.5 sm:space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => handleQuestionAnswer(opt.value)}
                  disabled={isLoading}
                  className="w-full text-left px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl text-[14px] sm:text-[15px] border border-border bg-bg-2 text-text-1 transition-all active:scale-[0.98] hover:shadow-sm disabled:opacity-40 cursor-pointer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-amber-border)';
                    e.currentTarget.style.background = 'var(--color-amber-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.background = 'var(--color-bg-2)';
                  }}
                >
                  <span className="font-bold mr-2 text-accent">
                    {String.fromCharCode(97 + i)})
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Back button */}
            <button
              onClick={handleQuestionBack}
              className="mt-4 text-[13px] sm:text-[14px] font-semibold text-text-3 hover:text-text-1 cursor-pointer bg-transparent border-none transition-colors"
            >
              {'\u2190'} {questionIndex === 0 ? 'Wróć do formularza' : 'Poprzednie pytanie'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-6">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden bg-bg-1"
          style={{
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          <TopBar theme={theme} onToggle={toggleTheme} />

          <div className="px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center text-center">
            {/* Spinner */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mb-6 sm:mb-8"
              style={{
                border: '3px solid var(--color-bg-3)',
                borderTopColor: 'var(--color-accent)',
                animation: 'spin 0.8s linear infinite',
              }}
            />

            {/* Rotating message */}
            <p
              className="text-[16px] sm:text-[18px] font-semibold text-text-1 mb-3 transition-opacity duration-500"
              key={loadingMsgIndex}
              style={{ animation: 'fadeInUp 2.5s ease-in-out' }}
            >
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>

            <p className="text-[13px] sm:text-[14px] text-text-3">
              To zajmuje kilka sekund...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CHAT
  return (
    <div className="fixed inset-0 flex flex-col bg-bg-0">
      <TopBar theme={theme} onToggle={toggleTheme} />

      <ChatWindow
        messages={messages}
        results={results}
        isStreaming={isStreaming}
        onSendMessage={handleSendMessage}
        onGuide={setGuideBenefitId}
        guideBenefitId={guideBenefitId}
        onCloseGuide={() => setGuideBenefitId(null)}
      />
    </div>
  );
}
