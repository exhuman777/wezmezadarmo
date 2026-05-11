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
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 border-b sticky top-0 z-50"
      style={{
        background: theme === 'dark' ? 'rgba(17,17,17,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--color-pl-red-border)',
      }}
    >
      {/* Polish flag mini stripe */}
      <div className="flex flex-col gap-0 shrink-0 mr-1" style={{ width: '3px', height: '16px' }}>
        <div style={{ flex: 1, background: '#ffffff', borderRadius: '1px 1px 0 0', border: '0.5px solid rgba(0,0,0,0.1)' }} />
        <div style={{ flex: 1, background: '#dc143c', borderRadius: '0 0 1px 1px' }} />
      </div>
      <span className="text-[12px] sm:text-[14px] font-extrabold tracking-[1px] sm:tracking-[1.5px] text-text-1 uppercase">
        wezme za darmo
      </span>
      <span className="text-[10px] sm:text-[11px] font-bold tracking-wider" style={{ color: 'var(--color-pl-red)' }}>.com</span>
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
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] sm:text-[12px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-pl-red)' }}>
          Przykładowe świadczenia
        </span>
        <span className="flex-1 border-t border-border" />
      </div>
      {visible.map((b, i) => (
        <div
          key={`${startIndex}-${i}`}
          className="p-2.5 rounded-xl transition-opacity duration-500"
          style={{
            background: 'var(--color-bg-2)',
            border: '1px solid var(--color-border)',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-[13px] sm:text-[14px] font-semibold text-text-1">{b.nazwa}</span>
            <span className="text-[13px] sm:text-[14px] font-bold shrink-0" style={{ color: 'var(--color-pl-red)' }}>{b.kwota}</span>
          </div>
          <p className="text-[11px] sm:text-[12px] text-text-3 mt-0.5">{b.opis}</p>
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
      <div className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-4 sm:py-6">

        {/* ====== MAIN CARD ====== */}
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden bg-bg-1"
          style={{
            border: '1px solid var(--color-pl-red-border)',
            boxShadow: '0 4px 30px var(--color-pl-red-glow), 0 8px 40px rgba(0,0,0,0.06)',
            animation: 'redPulse 4s ease-in-out infinite',
          }}
        >
          <TopBar theme={theme} onToggle={toggleTheme} />

          {/* Polish flag top stripe accent */}
          <div className="flex" style={{ height: '3px' }}>
            <div style={{ flex: 1, background: '#ffffff' }} />
            <div style={{ flex: 1, background: '#dc143c' }} />
          </div>

          {/* Hero */}
          <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
            <h1 className="text-[24px] sm:text-[28px] font-extrabold text-text-1 mb-2 leading-tight">
              Sprawdź co Ci się należy
            </h1>

            {/* Key stats - bold */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
              <span className="text-[14px] sm:text-[15px] font-bold" style={{ color: 'var(--color-pl-red)' }}>99 świadczeń</span>
              <span className="text-[14px] sm:text-[15px] font-bold text-text-3">|</span>
              <span className="text-[14px] sm:text-[15px] font-bold" style={{ color: 'var(--color-pl-red)' }}>13 kategorii</span>
              <span className="text-[14px] sm:text-[15px] font-bold text-text-3">|</span>
              <span className="text-[14px] sm:text-[15px] font-bold" style={{ color: 'var(--color-pl-red)' }}>2 minuty</span>
            </div>

            <p className="text-text-2 text-[13px] sm:text-[14px] leading-relaxed mb-3">
              Zasiłki, ulgi podatkowe, darmowe badania, dotacje na mieszkanie, programy dla rodzin, seniorów, przedsiębiorców.
              Nasz <strong className="text-text-1">asystent AI</strong> sprawdzi które Ci przysługują i pomoże złożyć wniosek krok po kroku.
            </p>

            {/* Trust badges - compact, inline */}
            <div className="space-y-1 mb-4">
              <div className="flex items-start gap-2 text-[12px] sm:text-[13px] text-text-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                <span>PESEL nie opuszcza Twojej przeglądarki</span>
              </div>
              <div className="flex items-start gap-2 text-[12px] sm:text-[13px] text-text-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                <span>Brak zapisu Twoich danych do zewnętrznych baz danych</span>
              </div>
              <div className="flex items-start gap-2 text-[12px] sm:text-[13px] text-text-2">
                <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                <span>Połączenie szyfrowane HTTPS</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 sm:mx-6 border-t border-border" />

          {/* Form section */}
          <div className="px-4 sm:px-6 pt-4 pb-4 sm:pb-5">
            <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />

            {/* Links row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              <button
                onClick={() => setShowPeselInfo(true)}
                className="text-[12px] sm:text-[13px] text-text-3 hover:text-text-1 cursor-pointer bg-transparent border-none font-medium transition-colors"
              >

                Bezpieczeństwo PESEL {'->'}
              </button>
              <a href="/swiadczenia" className="text-[12px] sm:text-[13px] font-medium no-underline hover:underline" style={{ color: 'var(--color-pl-red)' }}>
                Przeglądaj bazę bez formularza {'->'}
              </a>
            </div>
          </div>

          {/* Disclaimer footer */}
          <div className="px-4 sm:px-6 py-2.5 text-[11px] text-text-3 leading-relaxed border-t border-border" style={{ background: 'var(--color-bg-2)' }}>
            Informacja orientacyjna, nie decyzja urzędowa.
            PESEL nie opuszcza przeglądarki. NIP używany jednorazowo i nie jest przechowywany.
          </div>
        </div>

        {/* ====== OKI SECTION ====== */}
        <div
          className="w-full max-w-lg mt-4 rounded-2xl overflow-hidden bg-bg-1 p-4 sm:p-5"
          style={{
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] sm:text-[12px] font-bold tracking-wider uppercase" style={{ color: 'var(--color-pl-red)' }}>Czy wiesz?</span>
            <span className="flex-1 border-t border-border" />
          </div>
          <h3 className="text-[15px] sm:text-[17px] font-bold text-text-1 mb-2">
            OKI: 100 000 PLN wolne od podatku
          </h3>
          <p className="text-[12px] sm:text-[13px] text-text-2 leading-relaxed mb-2">
            Ogólnopolskie Konto Inwestycyjne -- sposób na inwestowanie bez podatku Belki (19%).
            Do <strong>100 000 PLN rocznie</strong> bez ani złotówki podatku od zysków.
          </p>
          <div className="space-y-1">
            <div className="flex gap-2 text-[12px] sm:text-[13px] text-text-2">
              <span className="font-bold shrink-0" style={{ color: 'var(--color-pl-red)' }}>{'>'}</span>
              <span>ETF-y na Bitcoin, złoto, S&P 500 lub inne aktywa</span>
            </div>
            <div className="flex gap-2 text-[12px] sm:text-[13px] text-text-2">
              <span className="font-bold shrink-0" style={{ color: 'var(--color-pl-red)' }}>{'>'}</span>
              <span>XTB: bez prowizji od polskich i zagranicznych ETF-ów</span>
            </div>
            <div className="flex gap-2 text-[12px] sm:text-[13px] text-text-2">
              <span className="font-bold shrink-0" style={{ color: 'var(--color-pl-red)' }}>{'>'}</span>
              <span>Zyski całkowicie zwolnione z podatku</span>
            </div>
          </div>
        </div>

        {/* ====== EXAMPLES ====== */}
        <div
          className="w-full max-w-lg mt-4 rounded-2xl overflow-hidden bg-bg-1 p-4 sm:p-5"
          style={{
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}
        >
          <RotatingExamples />
        </div>

        {/* Footer links */}
        <div className="mt-3 text-[11px] sm:text-[12px] text-text-3 text-center">
          <a href="/regulamin" className="text-text-3 hover:text-text-1 hover:underline">Regulamin</a>
          <span className="mx-2">|</span>
          <a href="/polityka-prywatnosci" className="text-text-3 hover:text-text-1 hover:underline">Polityka prywatności</a>
        </div>

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
            <span className="text-[13px] sm:text-[14px] font-bold tracking-[1px]" style={{ color: 'var(--color-pl-red)' }}>
              {questionIndex + 1}/{QUESTIONS.length}
            </span>
          </TopBar>

          {/* Progress bar */}
          <div className="h-1.5 bg-bg-3">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--color-pl-red), var(--color-pl-red-light))',
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
                borderTopColor: 'var(--color-pl-red)',
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
