'use client';

import { useState, useEffect, useRef } from 'react';
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
  'Sprawdzamy 104 świadczenia w 13 kategoriach...',
  'Szukam dla Ciebie funduszy...',
  'Analizujemy Twój profil...',
  'Twoje darmowe pieniądze od Państwa w zasięgu ręki...',
];

const CATEGORIES = [
  { id: 'family', label: 'Rodzina', count: 18 },
  { id: 'senior', label: 'Seniorzy', count: 9 },
  { id: 'disability', label: 'Niepełnosprawność', count: 11 },
  { id: 'biz', label: 'Przedsiębiorcy', count: 8 },
  { id: 'job', label: 'Bezrobotni', count: 6 },
  { id: 'student', label: 'Studenci', count: 7 },
  { id: 'farm', label: 'Rolnicy', count: 5 },
  { id: 'house', label: 'Mieszkanie', count: 8 },
  { id: 'health', label: 'Zdrowie', count: 7 },
  { id: 'meds', label: 'Leki', count: 4 },
  { id: 'transport', label: 'Transport', count: 5 },
  { id: 'tax', label: 'Ulgi podatkowe', count: 8 },
  { id: 'docs', label: 'Dokumenty', count: 3 },
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

/* ---- CountUp ticker ---- */
function CountUp({ to, suffix = '', delay = 0 }: { to: number; suffix?: string; delay?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    let t0: number;
    const duration = 1400;
    const easing = (t: number) => 1 - Math.pow(1 - t, 3);
    const start = () => {
      t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setVal(Math.round(to * easing(p)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const id = setTimeout(start, delay);
    return () => { clearTimeout(id); cancelAnimationFrame(raf); };
  }, [to, delay]);
  return <span>{val}{suffix}</span>;
}

/* ---- FlagStripe ---- */
function FlagStripe({ width = 60, thickness = 3 }: { width?: number; thickness?: number }) {
  return (
    <span style={{
      display: 'inline-flex',
      flexDirection: 'column',
      width,
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 0 0 1px var(--color-border)',
    }}>
      <span style={{ height: thickness, background: '#FFFFFF' }} />
      <span style={{ height: thickness, background: 'var(--color-pl-red)' }} />
    </span>
  );
}

/* ---- Logo ---- */
function Logo({ size = 18 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="red-dot" />
      <span style={{
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.02em',
        color: 'var(--color-text-1)',
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 2,
      }}>
        wezmezadarmo
        <span className="mono" style={{ color: 'var(--color-text-3)', fontWeight: 400, fontSize: size * 0.65 }}>.com</span>
      </span>
    </div>
  );
}

/* ---- Chip ---- */
function Chip({ children, tone = 'default', mono = false }: { children: React.ReactNode; tone?: string; mono?: boolean }) {
  const tones: Record<string, { bg: string; color: string; border: string }> = {
    default: { bg: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: 'var(--color-border)' },
    primary: { bg: 'var(--color-accent-soft)', color: 'var(--color-accent)', border: 'transparent' },
    success: { bg: 'var(--color-green-bg)', color: 'var(--color-green)', border: 'transparent' },
    ghost: { bg: 'transparent', color: 'var(--color-text-3)', border: 'var(--color-border)' },
  };
  const t = tones[tone] || tones.default;
  return (
    <span className={mono ? 'mono' : ''} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 9px',
      background: t.bg,
      color: t.color,
      border: `1px solid ${t.border}`,
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: mono ? '0.04em' : '-0.005em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

/* ---- TopBar ---- */
function TopBar({ theme, onToggle, children }: { theme: 'light' | 'dark'; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: theme === 'dark'
        ? 'rgba(11,10,8,0.8)'
        : 'rgba(250,248,242,0.8)',
      backdropFilter: 'saturate(140%) blur(14px)',
      WebkitBackdropFilter: 'saturate(140%) blur(14px)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {children}
          <ThemeToggle theme={theme} onToggle={onToggle} />
        </div>
      </div>
    </header>
  );
}

/* ---- Icons ---- */
const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 6l-6 6 6 6"/>
  </svg>
);

const SESSION_KEY = 'wzd_session_v1';
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

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

  // Loading progress for ring animation
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingCatIdx, setLoadingCatIdx] = useState(0);

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data.savedAt || Date.now() - data.savedAt > SESSION_TTL) {
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(data.messages);
        setResults(data.results ?? []);
        setProfile(data.profile ?? {});
        setPhase('chat');
      }
    } catch {
      // corrupted session data, ignore
    }
  }, []);

  // Save session to localStorage when in chat phase
  useEffect(() => {
    if (phase !== 'chat' || typeof window === 'undefined') return;
    if (messages.length === 0) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        messages,
        results,
        profile,
        savedAt: Date.now(),
      }));
    } catch {
      // storage quota exceeded, ignore
    }
  }, [phase, messages, results, profile]);

  function handleClearHistory() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
    setMessages([]);
    setResults([]);
    setProfile({});
    setPhase('landing');
  }

  useEffect(() => {
    if (phase !== 'loading') return;
    setLoadingMsgIndex(0);
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [phase]);

  // Animated progress for loading ring
  useEffect(() => {
    if (phase !== 'loading') return;
    let raf: number;
    const t0 = performance.now();
    const total = 4200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / total);
      setLoadingProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Rotate category index for loading
  useEffect(() => {
    if (phase !== 'loading') return;
    const id = setInterval(() => setLoadingCatIdx(i => (i + 1) % CATEGORIES.length), 380);
    return () => clearInterval(id);
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
      const aiVerified: boolean = data.aiVerified ?? false;
      setResults(matchedResults);

      const pewne = matchedResults.filter((r) => r.status === 'PRZYSLUGUJE').length;
      const mozliwe = matchedResults.filter((r) => r.status === 'MOZLIWE').length;
      const total = matchedResults.length;

      let welcomeText: string;
      if (total > 0) {
        welcomeText = `Znalazłem ${total} świadczeń, z których teoretycznie możesz skorzystać`;
        if (pewne > 0 && mozliwe > 0) welcomeText += ` (${pewne} pewnych, ${mozliwe} do weryfikacji)`;
        else if (pewne > 0) welcomeText += ` (${pewne} pewnych)`;
        else if (mozliwe > 0) welcomeText += ` (${mozliwe} do weryfikacji)`;
        welcomeText += '.\n\n';

        welcomeText += 'Jak to działa:\n';
        welcomeText += '>>> Krok 1: Algorytm dopasował świadczenia do Twojego profilu na podstawie kryteriów (wiek, dochód, status)\n';
        if (aiVerified) {
          welcomeText += '>>> Krok 2: AI zweryfikowała wyniki i oznaczyła wątpliwe pozycje do samodzielnego sprawdzenia\n';
        } else {
          welcomeText += '>>> Krok 2: Wyniki nie zostały zweryfikowane przez AI (weryfikator niedostępny)\n';
        }
        welcomeText += '>>> Każde świadczenie ma link do oficjalnego źródła rządowego\n\n';
        welcomeText += 'Sprawdź dokładnie wymagania każdego świadczenia. Nie wszystkie muszą dotyczyć Twojej sytuacji.\n\n';

        welcomeText += 'Przejdź do zakładki "Świadczenia" żeby zobaczyć listę. Kliknij dowolne świadczenie żeby zobaczyć jak złożyć wniosek krok po kroku.\n\n';

        welcomeText += 'Jestem asystentem AI. Moje odpowiedzi opierają się na zweryfikowanej bazie danych, ale nie jestem urzędnikiem. Mogę:\n\n';
        welcomeText += '>>> Przeprowadzić Cię przez składanie wniosku krok po kroku\n';
        welcomeText += '>>> Wyjaśnić warunki, wymagane dokumenty i terminy\n';
        welcomeText += '>>> Odpowiedzieć na pytania o dowolne świadczenie\n\n';
        welcomeText += 'Napisz pytanie, jestem tutaj żeby pomóc.';
      } else {
        welcomeText = 'Nie znalazłem świadczeń pasujących do Twojego profilu.\n\n';
        welcomeText += 'Algorytm przeszukał 104 świadczenia z 13 kategorii. Opisz mi swoją sytuację, a sprawdzę czy czegoś nie przeoczyłem.\n\n';
        welcomeText += 'Jestem asystentem AI. Moje odpowiedzi opierają się na zweryfikowanej bazie danych, ale zawsze sprawdź informacje na stronach źródłowych.';
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

      if (res.status === 429) {
        const data = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.id === assistantMsg.id) {
            updated[updated.length - 1] = { ...last, content: data.message };
          }
          return updated;
        });
        setIsStreaming(false);
        return;
      }

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

  // ===================== LANDING =====================
  if (phase === 'landing') {
    return (
      <div style={{ minHeight: '100vh' }}>
        <TopBar theme={theme} onToggle={toggleTheme} />

        <section style={{ position: 'relative', paddingTop: 32, paddingBottom: 80 }}>
          <div className="grain-bg" />
          <div className="container" style={{ position: 'relative' }}>

            {/* Eyebrow row */}
            <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
              <FlagStripe width={28} thickness={3} />
              <span className="label-eyebrow">Niezależne narzędzie | 2026 | bez rejestracji</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span className="label-eyebrow hide-mobile" style={{ color: 'var(--color-muted-2)' }}>zaktualizowano 12.05.2026</span>
            </div>

            {/* Split: hero left + form right */}
            <div className="grid-hero" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 64, alignItems: 'start' }}>

              {/* LEFT */}
              <div>
                <h1 className="display rise" style={{ fontSize: 'clamp(48px, 7vw, 96px)', marginBottom: 28, animationDelay: '60ms' }}>
                  Sprawdź<br />
                  co Ci<br />
                  <span style={{ color: 'var(--color-accent)' }}>się należy</span>
                  <span style={{ display: 'inline-block', width: 12, height: 12, marginLeft: 12, background: 'var(--color-pl-red)', borderRadius: '50%', verticalAlign: 'baseline', transform: 'translateY(-12px)' }} />
                </h1>

                <p className="rise" style={{
                  maxWidth: 540,
                  fontSize: 18, lineHeight: 1.55,
                  color: 'var(--color-text-2)',
                  marginBottom: 40,
                  animationDelay: '120ms',
                }}>
                  Polska ma ponad 100 świadczeń, ulg i dotacji wartych miliardy złotych rocznie.
                  Większość ludzi nie wie, że im przysługują.{' '}
                  <span className="serif" style={{ fontSize: 20 }}>Sprawdź to teraz.</span> W dwie minuty, bez logowania, bez wysyłania danych.
                  Wiele osób nie wie, że przysługuje im nawet kilka tysięcy złotych rocznie. Czasem wystarczy po prostu złożyć wniosek lub się gdzieś zgłosić. Zero większych wymagań. Liczy się to, czy o tym wiesz. AI chat na stronie dobrze zna te ulgi i programy, więc jak coś jest niejasne, śmiało go pytaj.
                </p>

                {/* Stat counters */}
                <div className="rise grid-stats" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 0, marginBottom: 44, animationDelay: '180ms',
                  borderTop: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '20px 0',
                }}>
                  {[
                    { n: 104, suf: '', lbl: 'świadczeń w bazie' },
                    { n: 13, suf: '', lbl: 'kategorii życiowych' },
                    { n: 2, suf: ' min', lbl: 'średni czas analizy' },
                  ].map((s, i) => (
                    <div key={i} style={{ borderLeft: i ? '1px solid var(--color-border)' : 'none', paddingLeft: i ? 28 : 0 }}>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{
                        fontSize: 56, fontWeight: 400, letterSpacing: '-0.04em',
                        lineHeight: 1, color: 'var(--color-text-1)',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        <CountUp to={s.n} suffix={s.suf} delay={300 + i * 120} />
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 8 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Trust row */}
                <div className="rise" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 36, animationDelay: '240ms' }}>
                  {[
                    { label: 'PESEL nie opuszcza przeglądarki', icon: <IconLock /> },
                    { label: 'Brak bazy danych', icon: <IconShield /> },
                    { label: 'Połączenie HTTPS', icon: <IconCheck /> },
                  ].map((item, i) => (
                    <a key={i} href="/o-projekcie" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-2)', textDecoration: 'none' }}>
                      <span style={{ color: 'var(--color-green)', display: 'inline-flex' }}>{item.icon}</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* RIGHT -- form card */}
              <div className="rise" style={{ animationDelay: '300ms', position: 'relative' }}>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-3)',
                  padding: 32,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Polish flag top accent */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, display: 'flex' }}>
                    <div style={{ flex: 1, background: '#fff' }} />
                    <div style={{ flex: 1, background: 'var(--color-pl-red)' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                    <span className="label-eyebrow">Formularz | krok 1 / 3</span>
                    <Chip tone="success" mono>ANONIMOWO</Chip>
                  </div>

                  <h3 style={{ fontSize: 22, marginBottom: 6, letterSpacing: '-0.02em' }}>Podaj swoje dane</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>
                    PESEL jest dekodowany lokalnie. Nie wysyłamy go nigdzie.
                  </p>

                  <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 13 }}>
                    <button
                      onClick={() => setShowPeselInfo(true)}
                      className="link-u"
                      style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
                    >
                      Bezpieczeństwo PESEL <IconArrowRight />
                    </button>
                    <a className="link-u" href="/swiadczenia" style={{ color: 'var(--color-accent)' }}>
                      Przeglądaj bazę <IconArrowRight />
                    </a>
                  </div>
                </div>

                {/* Disclaimer callout */}
                <div style={{
                  marginTop: 16,
                  padding: '14px 18px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  background: 'var(--color-surface)',
                  fontSize: 13, color: 'var(--color-text-3)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <IconLock />
                  Informacja orientacyjna, nie decyzja urzędowa. Weryfikuj na stronach źródłowych.
                </div>
              </div>
            </div>

            {/* Example benefits */}
            <div className="rise" style={{ marginTop: 80, animationDelay: '420ms' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                <span className="label-eyebrow">Przykładowe świadczenia</span>
                <span className="label-eyebrow" style={{ color: 'var(--color-muted-2)' }}>3 z 104</span>
              </div>
              <div className="grid-benefits" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {EXAMPLE_BENEFITS.slice(0, 3).map((b, i) => (
                  <a key={i} href="/swiadczenia" className="hover-lift" style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: '22px',
                    display: 'flex', flexDirection: 'column', gap: 10,
                    textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em' }}>{b.nazwa}</div>
                      <Chip tone="primary" mono>#{String(i + 1).padStart(2, '0')}</Chip>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.5, flex: 1 }}>{b.opis}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                      <div>
                        <div className="mono" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)' }}>{b.kwota}</div>
                      </div>
                      <span className="label-eyebrow" style={{ color: 'var(--color-accent)' }}>Sprawdź <IconArrowRight /></span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* OKI section */}
            <div className="rise" style={{ marginTop: 80, animationDelay: '480ms' }}>
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px',
                boxShadow: 'var(--shadow-2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span className="label-eyebrow" style={{ color: 'var(--color-accent)' }}>Czy wiesz?</span>
                  <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                </div>
                <h3 style={{ fontSize: 24, letterSpacing: '-0.025em', marginBottom: 12 }}>
                  OKI: 100 000 PLN wolne od podatku
                </h3>
                <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.55, marginBottom: 16, maxWidth: 680 }}>
                  Ogólnopolskie Konto Inwestycyjne: sposób na inwestowanie bez podatku Belki (19%).
                  Do <strong>100 000 PLN rocznie</strong> bez ani złotówki podatku od zysków.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'ETF-y na Bitcoin, złoto, S&P 500 lub inne aktywa',
                    'XTB: bez prowizji od polskich i zagranicznych ETF-ów',
                    'Zyski całkowicie zwolnione z podatku',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--color-text-2)' }}>
                      <span style={{ color: 'var(--color-accent)', display: 'inline-flex' }}><IconArrowRight /></span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--color-border)', padding: '60px 0 40px', marginTop: 60 }}>
          <div className="container">
            <div className="grid-footer" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
              <div>
                <Logo />
                <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginTop: 16, maxWidth: 360, lineHeight: 1.6 }}>
                  Sprawdź czy należą Ci się świadczenia od państwa. 104 świadczenia, 13 kategorii. Strona przygotowana i dostępna również w wersji dla agentów AI w pliku <a href="/llm.md" style={{ color: 'var(--color-accent)' }}>llm.md</a>.
                </p>
                <div style={{ marginTop: 20 }}>
                  <FlagStripe width={36} thickness={4} />
                </div>
              </div>
              <div>
                <div className="label-eyebrow" style={{ marginBottom: 14 }}>Nawigacja</div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li><a className="link-u" href="/swiadczenia" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Baza świadczeń</a></li>
                  <li><a className="link-u" href="/o-projekcie" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>O projekcie</a></li>
                  <li><a className="link-u" href="/llm.md" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Dla agentów AI</a></li>
                  <li><a className="link-u" href="https://www.linkedin.com/in/kamil-sobkowicz/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Kontakt / LinkedIn</a></li>
                </ul>
              </div>
              <div>
                <div className="label-eyebrow" style={{ marginBottom: 14 }}>Prawne</div>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li><a className="link-u" href="/regulamin" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Regulamin</a></li>
                  <li><a className="link-u" href="/polityka-prywatnosci" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Polityka prywatności</a></li>
                  <li><a className="link-u" href="/polityka-prywatnosci" style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Cookies</a></li>
                </ul>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-3)' }}>
              <span>2026 wezmezadarmo.com | projekt społeczny Kamila Sobkowicza</span>
              <span className="mono" style={{ letterSpacing: '0.1em' }}>MADE IN POLAND</span>
            </div>
          </div>
        </footer>

        <PeselInfoModal isOpen={showPeselInfo} onClose={() => setShowPeselInfo(false)} />
      </div>
    );
  }

  // ===================== QUESTIONS =====================
  if (phase === 'questions') {
    const q = QUESTIONS[questionIndex];
    const progress = ((questionIndex + 1) / QUESTIONS.length) * 100;
    return (
      <div style={{ minHeight: '100vh' }}>
        <TopBar theme={theme} onToggle={toggleTheme}>
          <Chip mono>{questionIndex + 1}/{QUESTIONS.length}</Chip>
        </TopBar>

        <section style={{ position: 'relative', minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center' }}>
          <div className="grain-bg" />
          <div className="container" style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
            {/* Progress bar */}
            <div style={{ height: 2, background: 'var(--color-border)', borderRadius: 1, overflow: 'hidden', marginBottom: 48 }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--color-text-1)',
                transition: 'width 300ms var(--ease-out)',
              }} />
            </div>

            <div className="label-eyebrow" style={{ marginBottom: 16 }}>
              Pytanie {questionIndex + 1} z {QUESTIONS.length}
            </div>

            <h2 className="display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 36 }}>
              {q.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => handleQuestionAnswer(opt.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px 20px',
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-1)',
                    fontSize: 15,
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    transition: 'all 200ms var(--ease-out)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-text-1)';
                    e.currentTarget.style.background = 'var(--color-surface-2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.04em' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleQuestionBack}
              className="link-u"
              style={{
                marginTop: 32,
                background: 'none',
                border: 'none',
                fontSize: 13,
                color: 'var(--color-text-3)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <IconArrowLeft />
              {questionIndex === 0 ? 'Wróć do formularza' : 'Poprzednie pytanie'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ===================== LOADING =====================
  if (phase === 'loading') {
    const counted = Math.round(loadingProgress * 104);
    const pct = Math.round(loadingProgress * 100);
    const segments = 13;
    const ringR = 130;
    const cx = 160, cy = 160;
    const innerR = 100;

    return (
      <div style={{ minHeight: '100vh' }}>
        <TopBar theme={theme} onToggle={toggleTheme}>
          <Chip mono>ANALIZA</Chip>
        </TopBar>

        <section style={{ position: 'relative', minHeight: 'calc(100vh - 65px)', display: 'flex', alignItems: 'center' }}>
          <div className="grain-bg" />
          <div className="container" style={{ position: 'relative' }}>
            <div className="grid-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

              {/* LEFT: status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <span className="red-dot" />
                  <span className="label-eyebrow">Analiza w toku</span>
                </div>

                <h1 className="display" style={{ fontSize: 'clamp(40px, 6vw, 80px)', marginBottom: 36 }}>
                  Sprawdzamy<br />
                  <span style={{ color: 'var(--color-accent)' }}>{counted}/104</span>
                  <span style={{ color: 'var(--color-text-3)' }}> świadczeń</span>
                </h1>

                <p style={{ fontSize: 17, color: 'var(--color-text-2)', maxWidth: 480, marginBottom: 32, lineHeight: 1.5 }}>
                  Dopasowujemy 104 świadczenia z 13 kategorii do Twojej sytuacji.
                  Wszystko dzieje się w Twojej przeglądarce. Żadne dane nie opuszczają urządzenia.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--color-text-3)' }}>{String(pct).padStart(2, '0')}%</div>
                  <div style={{ flex: 1, height: 2, background: 'var(--color-border)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-text-1)', transition: 'width 200ms' }} />
                  </div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--color-text-3)' }}>{Math.max(0, Math.round((1 - loadingProgress) * 5))}s</div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CATEGORIES.map((c, i) => {
                    const active = i / CATEGORIES.length <= loadingProgress;
                    const current = i === loadingCatIdx;
                    return (
                      <span key={c.id} className="mono" style={{
                        fontSize: 11,
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: `1px solid ${active ? 'var(--color-text-1)' : 'var(--color-border)'}`,
                        background: current ? 'var(--color-text-1)' : (active ? 'var(--color-surface)' : 'transparent'),
                        color: current ? 'var(--color-bg-0)' : (active ? 'var(--color-text-1)' : 'var(--color-muted-2)'),
                        transition: 'all 280ms',
                        letterSpacing: '0.02em',
                      }}>
                        {String(i + 1).padStart(2, '0')} {c.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: ring visualization */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 360, height: 360 }}>
                  <svg viewBox="0 0 320 320" style={{ width: '100%', height: '100%' }}>
                    {/* 13-segment ring */}
                    {Array.from({ length: segments }).map((_, i) => {
                      const a0 = (i / segments) * Math.PI * 2 - Math.PI / 2 + 0.012;
                      const a1 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2 - 0.012;
                      const r1 = ringR, r2 = ringR - 22;
                      const x0 = cx + Math.cos(a0) * r1, y0 = cy + Math.sin(a0) * r1;
                      const x1 = cx + Math.cos(a1) * r1, y1 = cy + Math.sin(a1) * r1;
                      const x2 = cx + Math.cos(a1) * r2, y2 = cy + Math.sin(a1) * r2;
                      const x3 = cx + Math.cos(a0) * r2, y3 = cy + Math.sin(a0) * r2;
                      const active = i / segments <= loadingProgress;
                      const current = i === loadingCatIdx;
                      return (
                        <path key={i}
                          d={`M ${x0} ${y0} A ${r1} ${r1} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 0 ${x3} ${y3} Z`}
                          fill={current ? 'var(--color-text-1)' : (active ? 'var(--color-accent)' : 'var(--color-border)')}
                          style={{ transition: 'fill 360ms var(--ease-out)' }}
                        />
                      );
                    })}
                    {/* Inner tick ring */}
                    {Array.from({ length: 104 }).map((_, i) => {
                      const a = (i / 104) * Math.PI * 2 - Math.PI / 2;
                      const r1 = innerR - 4, r2 = innerR - 12;
                      const tickActive = i < counted;
                      return (
                        <line key={i}
                          x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1}
                          x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2}
                          stroke={tickActive ? 'var(--color-text-1)' : 'var(--color-border)'}
                          strokeWidth="1.4"
                          style={{ transition: 'stroke 240ms' }}
                        />
                      );
                    })}
                    {/* Center disk */}
                    <circle cx={cx} cy={cy} r={innerR - 24} fill="var(--color-bg-0)" stroke="var(--color-border)" />
                  </svg>
                  {/* Center text */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.12em', marginBottom: 8 }}>KATEGORIA</div>
                    <div key={loadingCatIdx} className="fade" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>
                      {CATEGORIES[loadingCatIdx].label}
                    </div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 8 }}>
                      {String(loadingCatIdx + 1).padStart(2, '0')} / 13
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ===================== CHAT =====================
  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--color-bg-0)' }}>
      <TopBar theme={theme} onToggle={toggleTheme} />

      <ChatWindow
        messages={messages}
        results={results}
        isStreaming={isStreaming}
        onSendMessage={handleSendMessage}
        onGuide={setGuideBenefitId}
        guideBenefitId={guideBenefitId}
        onCloseGuide={() => setGuideBenefitId(null)}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
