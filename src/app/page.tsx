'use client';

import { useState, useEffect, useRef } from 'react';
import { IntakeForm } from '@/components/IntakeForm';
import { ChatWindow, ChatMessage } from '@/components/ChatWindow';
import { MatchResult, UserProfile } from '@/engine/types';
import { CeidgBusinessData } from '@/lib/ceidg';

type Phase = 'landing' | 'questions' | 'loading' | 'chat';

const LOADING_MESSAGES = [
  'Szukamy pieniędzy dla Twojej rodziny...',
  'Sprawdzamy 117 świadczeń w 15 kategoriach...',
  'Szukam dla Ciebie funduszy...',
  'Analizujemy Twój profil...',
  'Twoje darmowe pieniądze od Państwa w zasięgu ręki...',
];

const CATEGORIES = [
  { id: 'praca', label: 'Praca', count: 15 },
  { id: 'krus', label: 'KRUS', count: 11 },
  { id: 'zus', label: 'ZUS', count: 11 },
  { id: 'rodzina', label: 'Rodzina', count: 10 },
  { id: 'zdrowie', label: 'Zdrowie', count: 10 },
  { id: 'pomoc', label: 'Pomoc społeczna', count: 10 },
  { id: 'senior', label: 'Seniorzy', count: 8 },
  { id: 'podatki', label: 'Ulgi podatkowe', count: 8 },
  { id: 'edukacja', label: 'Edukacja', count: 7 },
  { id: 'biznes', label: 'Przedsiębiorcy', count: 6 },
  { id: 'ekologia', label: 'Ekologia', count: 6 },
  { id: 'niepelnosprawnosc', label: 'Niepełnosprawność', count: 5 },
  { id: 'mieszkanie', label: 'Mieszkanie', count: 4 },
  { id: 'inne', label: 'Inne', count: 4 },
  { id: 'energia', label: 'Energia', count: 2 },
];

const EXAMPLE_BENEFITS = [
  { nazwa: 'Świadczenie 800+', kwota: '800 PLN/mies.', opis: 'Na każde dziecko do 18 roku życia, bez progu dochodowego' },
  { nazwa: 'Bon ciepłowniczy', kwota: 'do 3500 PLN', opis: 'Świadczenie dla odbiorców ciepła systemowego (nabór od lipca 2026)' },
  { nazwa: 'Ulga na dziecko (PIT)', kwota: 'do 2700 PLN/rok', opis: 'Odliczenie od podatku za każde dziecko' },
  { nazwa: 'Dodatek mieszkaniowy', kwota: 'do 1500 PLN/mies.', opis: 'Dopłata do czynszu przy niskim dochodzie' },
  { nazwa: 'Refundacja okularów (NFZ)', kwota: 'do 500 PLN', opis: 'Dofinansowanie do soczewek i oprawek' },
  { nazwa: 'Zasiłek pogrzebowy', kwota: '7000 PLN', opis: 'Jednorazowe świadczenie na pokrycie kosztów pogrzebu (od 2026 r.)' },
  { nazwa: 'Trzynasta emerytura', kwota: '1978 PLN brutto', opis: 'Dodatkowe roczne świadczenie dla emerytów i rencistów (kwiecień 2026)' },
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
      { label: 'Dolnośląskie', value: 'dolnoslaskie' },
      { label: 'Kujawsko-pomorskie', value: 'kujawsko-pomorskie' },
      { label: 'Lubelskie', value: 'lubelskie' },
      { label: 'Lubuskie', value: 'lubuskie' },
      { label: 'Łódzkie', value: 'lodzkie' },
      { label: 'Małopolskie', value: 'malopolskie' },
      { label: 'Mazowieckie', value: 'mazowieckie' },
      { label: 'Opolskie', value: 'opolskie' },
      { label: 'Podkarpackie', value: 'podkarpackie' },
      { label: 'Podlaskie', value: 'podlaskie' },
      { label: 'Pomorskie', value: 'pomorskie' },
      { label: 'Śląskie', value: 'slaskie' },
      { label: 'Świętokrzyskie', value: 'swietokrzyskie' },
      { label: 'Warmińsko-mazurskie', value: 'warminsko-mazurskie' },
      { label: 'Wielkopolskie', value: 'wielkopolskie' },
      { label: 'Zachodniopomorskie', value: 'zachodniopomorskie' },
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

/* ---- FlagStripe + Logo removed: no longer used (SiteNav in root layout) ---- */

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

/* ---- TopBar removed: SiteNav is in root layout ---- */

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
  const [phase, setPhase] = useState<Phase>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [guideBenefitId, setGuideBenefitId] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Loading progress for ring animation
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [copyDone, setCopyDone] = useState(false);
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

  // Animated progress for loading ring (throttled to integer pct changes to avoid 60fps re-renders)
  useEffect(() => {
    if (phase !== 'loading') return;
    let raf: number;
    let lastPct = -1;
    const t0 = performance.now();
    const total = 4200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / total);
      const pct = Math.round(p * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        setLoadingProgress(p);
      }
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

  async function handleIntakeSubmit(data: { wiek: number; plec: 'K' | 'M'; nip?: string }) {
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
        welcomeText += 'Algorytm przeszukał 117 świadczeń z 15 kategorii. Opisz mi swoją sytuację, a sprawdzę czy czegoś nie przeoczyłem.\n\n';
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

  async function handleSendMessage(text: string, focusedBenefitId?: string | null) {
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
          focusedBenefitId: focusedBenefitId ?? null,
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

        {/* Dark Hero Banner */}
        <section style={{ position: 'relative', paddingTop: 16, paddingBottom: 0 }}>
          <div className="container" style={{ position: 'relative' }}>
            <div className="rise" style={{
              background: 'linear-gradient(145deg, #0A1A10 0%, #122A1A 50%, #0F2215 100%)',
              borderRadius: 24,
              padding: 'clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px)',
              marginBottom: 48,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#6DC08A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>START</span>
              </div>
              <h1 style={{
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                margin: '0 0 20px',
              }}>
                <span style={{ color: '#F0F7F0' }}>Sprawdź teraz.</span><br />
                <span style={{ color: '#4ADE80', fontStyle: 'italic' }}>Należy się Tobie.</span>
              </h1>
              <p style={{
                fontSize: 16,
                lineHeight: 1.65,
                color: '#A0B8A0',
                maxWidth: 560,
                margin: '0 0 36px',
              }}>
                Dwie minuty, jedenaście pytań, lista świadczeń wartych setki -
                czasem tysiące - złotych. Bez rejestracji, bez opłat, bez urzędu.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="#formularz" style={{
                  padding: '13px 28px',
                  background: '#2E7D4F',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 12,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  Zacznij sprawdzanie &rarr;
                </a>
                <a href="/dla-firm" style={{
                  padding: '13px 28px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 500,
                  fontSize: 15,
                  borderRadius: 12,
                  textDecoration: 'none',
                }}>
                  Jestem firmą
                </a>
              </div>
            </div>
          </div>
        </section>

        <section style={{ position: 'relative', paddingTop: 0, paddingBottom: 80 }}>
          <div className="grain-bg" />
          <div className="container" style={{ position: 'relative' }}>

            {/* Form + info section */}
            <div id="formularz" className="grid-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start', marginBottom: 64 }}>

              {/* LEFT: stats + trust */}
              <div>
                <p className="rise" style={{
                  maxWidth: 480,
                  fontSize: 16, lineHeight: 1.65,
                  color: 'var(--color-text-2)',
                  marginBottom: 32,
                  animationDelay: '60ms',
                }}>
                  Polska ma ponad 110 świadczeń, ulg i dotacji wartych miliardy złotych rocznie.
                  Większość ludzi nie wie, że im przysługują.
                  Na stronie WezmeZaDarmo wbudowany jest asystent AI, który przez chat odpowie na Twoje pytania i pomoże potwierdzić, czy dane świadczenie Ci przysługuje.
                </p>

                {/* Stat counters */}
                <div className="rise grid-stats" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 0, marginBottom: 32, animationDelay: '120ms',
                  borderTop: '1px solid var(--color-border)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '20px 0',
                }}>
                  {[
                    { n: 117, suf: '', lbl: 'świadczeń w bazie' },
                    { n: 13, suf: '', lbl: 'kategorii życiowych' },
                    { n: 2, suf: ' min', lbl: 'średni czas analizy' },
                  ].map((s, i) => (
                    <div key={i} style={{ borderLeft: i ? '1px solid var(--color-border)' : 'none', paddingLeft: i ? 28 : 0 }}>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div style={{
                        fontSize: 48, fontWeight: 400, letterSpacing: '-0.04em',
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
                <div className="rise" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, animationDelay: '180ms' }}>
                  {[
                    { label: 'PESEL dekodowany lokalnie w przeglądarce', icon: <IconLock /> },
                    { label: 'Kalkulator bez bazy danych', icon: <IconShield /> },
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
                    Wiek i płeć wystarczą do dopasowania świadczeń.
                  </p>

                  <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18, fontSize: 13 }}>
                    <a className="link-u" href="/swiadczenia" style={{ color: 'var(--color-accent)' }}>
                      Przegladaj baze <IconArrowRight />
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

            {/* Photo strip */}
            <div className="rise" style={{ marginTop: 64, animationDelay: '380ms' }}>
              <div className="grid-photos" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.35fr 1fr',
                gap: 12,
                alignItems: 'flex-end',
              }}>
                <div style={{ position: 'relative', height: 220, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src="/foto-rodzina.png"
                    alt="Seniorka z pomocą bliskich sprawdza przysługujące świadczenia"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.92) saturate(0.9)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,18,10,0.75) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8EEAAD', marginBottom: 4, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Dla seniorów i rodzin</div>
                    <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>Każde pokolenie może skorzystać</div>
                  </div>
                </div>
                <div style={{ position: 'relative', height: 260, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src="/foto-biuro.jpg"
                    alt="Zespół w pracy sprawdza dostępne świadczenia i ulgi"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9) saturate(0.9)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,18,10,0.75) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8EEAAD', marginBottom: 4, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Dla firm i pracowników</div>
                    <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>Świadczenia, do których pracownicy mają prawo</div>
                  </div>
                </div>
                <div style={{ position: 'relative', height: 220, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src="/foto-ekspert.png"
                    alt="Ekspert przy komputerze korzysta z asystenta AI"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9) saturate(0.9)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,18,10,0.75) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8EEAAD', marginBottom: 4, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Asystent AI</div>
                    <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>Odpowie na każde pytanie o świadczenia</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example benefits */}
            <div className="rise" style={{ marginTop: 80, animationDelay: '420ms' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                <span className="label-eyebrow">Przykładowe świadczenia</span>
                <span className="label-eyebrow" style={{ color: 'var(--color-muted-2)' }}>3 z 117</span>
              </div>
              <div className="grid-benefits" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {EXAMPLE_BENEFITS.slice(0, 3).map((b, i) => {
                  const icons = ['8', 'R', 'U'];
                  return (
                  <a key={i} href="/swiadczenia" className="hover-lift" style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: '22px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 38, height: 38, borderRadius: '50%', background: '#0F1F14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{icons[i]}</span>
                      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>{b.nazwa}</div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.5, flex: 1 }}>{b.opis}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-green)', flexShrink: 0 }} />
                        <div className="mono" style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)' }}>{b.kwota}</div>
                      </div>
                      <span className="mono" style={{ fontSize: 10, padding: '3px 10px', border: '1px solid var(--color-border)', borderRadius: 999, color: 'var(--color-text-3)' }}>Sprawdź</span>
                    </div>
                  </a>
                  );
                })}
              </div>
            </div>

            {/* ---- Narzedzia dla firm i JDG ---- */}
            <div className="rise" style={{ marginTop: 80, animationDelay: '460ms' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                <span className="label-eyebrow">Narzędzia dla firm i JDG</span>
                <span className="label-eyebrow" style={{ color: 'var(--color-muted-2)' }}>3 moduły</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>

                {/* Card: Wnioski ZUS */}
                <a href="/wnioski" className="hover-lift" style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#0F1F14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>W</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>
                        Wypełnij wniosek ZUS
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>Kreator formularzy z PDF</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.55, flex: 1, margin: 0 }}>
                    Kreator pyta o Twoje dane krok po kroku i wypełnia formularz ZUS.
                    Na końcu generuje PDF, który drukujesz i składasz osobiście lub wysyłasz pocztą.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                    {['Z-15a', 'Z-15b', 'Z-3', 'ERPO', 'ZAS-53', 'PEL'].map(sym => (
                      <span key={sym} className="mono" style={{
                        fontSize: 10, padding: '3px 8px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 999, color: 'var(--color-text-3)',
                      }}>{sym}</span>
                    ))}
                  </div>
                </a>

                {/* Card: Automatyzacje */}
                <a href="/automatyzacje" className="hover-lift" style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#0F1F14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>A</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>
                        Faktury zagraniczne z maila do arkusza
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>Automatyzacje AI</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.55, flex: 1, margin: 0 }}>
                    Polskie faktury trafiają do KSeF automatycznie. Ale faktury z USA i spoza UE
                    (np. Stripe, OpenAI, Notion) przychodzą mailem i łatwo je przegapić.
                    System czyta skrzynkę, wyciąga kwoty i wpisuje je do arkusza.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                    {['Faktury spoza UE', 'KSeF nie obejmuje', '399 PLN'].map(tag => (
                      <span key={tag} className="mono" style={{
                        fontSize: 10, padding: '3px 8px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 999, color: 'var(--color-text-3)',
                      }}>{tag}</span>
                    ))}
                  </div>
                </a>

                {/* Card: Dotacje AI */}
                <a href="/dotacje" className="hover-lift" style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '24px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  textDecoration: 'none', color: 'inherit',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#0F1F14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>D</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--color-text-1)' }}>
                        Monitoring dotacji dla Twojej firmy
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>Agent AI dotacje</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.55, flex: 1, margin: 0 }}>
                    Podajesz NIP i branżę. Agent sprawdza otwarte nabory z KFS, PUP, PFRON, KPO
                    i programów samorządowych. Gdy pojawi się nabór pasujący do Twojego profilu,
                    dostajesz maila z linkiem i terminem.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                    {['KFS', 'PFRON', 'KPO', 'PARP', '16 województw'].map(tag => (
                      <span key={tag} className="mono" style={{
                        fontSize: 10, padding: '3px 8px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 999, color: 'var(--color-text-3)',
                      }}>{tag}</span>
                    ))}
                  </div>
                </a>

              </div>
            </div>

            {/* Jak to działa -- 3 steps */}
            <div className="rise" style={{ marginTop: 80, animationDelay: '475ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-green)', flexShrink: 0 }} />
                <span className="label-eyebrow" style={{ color: 'var(--color-green)' }}>Jak to działa</span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 32, color: 'var(--color-text-1)' }}>
                3 kroki, <span className="serif" style={{ fontStyle: 'italic' }}>2 minuty</span>, gotowe.
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { num: '01', icon: '1', title: 'Odpowiedz na pytania', desc: 'Podaj wiek, sytuację rodzinną i zawodową. Bez numeru PESEL, bez logowania. Zajmuje to 2 minuty.' },
                  { num: '02', icon: '2', title: 'Algorytm + AI weryfikacja', desc: 'System sprawdza 117 świadczeń, ulg i dotacji. AI weryfikuje przypadki graniczne i dodaje ostrzeżenia.' },
                  { num: '03', icon: '3', title: 'Twoja lista świadczeń', desc: 'Dostajesz spersonalizowaną listę z kwotami, instrukcjami i linkami do oficjalnych źródeł rządowych.' },
                ].map((step) => (
                  <div key={step.num} style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                    padding: '24px 22px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#0F1F14', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>{step.icon}</span>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-1)' }}>{step.title}</div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                  </div>
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
                  <span className="label-eyebrow" style={{ color: 'var(--color-green)' }}>Czy wiesz?</span>
                  <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                </div>
                <h3 style={{ fontSize: 24, letterSpacing: '-0.025em', marginBottom: 12 }}>
                  OKI: 100{'\u00A0'}000 PLN wolne od podatku
                </h3>
                <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.55, marginBottom: 16, maxWidth: 680 }}>
                  Ogólnopolskie Konto Inwestycyjne: sposób na inwestowanie bez podatku Belki (19%).
                  Do <strong>100{'\u00A0'}000{'\u00A0'}PLN rocznie</strong> bez ani złotówki podatku od zysków.
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
            {/* Testimonials */}
            <div className="rise" style={{ marginTop: 80, animationDelay: '540ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span className="label-eyebrow">Co mówią użytkownicy</span>
                <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

                {/* Testimonial 1 */}
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '20px 22px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--color-accent-soft)',
                      border: '1px solid var(--color-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 600, color: 'var(--color-accent)',
                      flexShrink: 0,
                    }}>A</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)' }}>Mikka</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>użytkowniczka</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-2)', margin: 0 }}>
                    &ldquo;Byłam wczoraj służbowo w takim stowarzyszeniu i poleciłam im wezmezadarmo.com.
                    I koleś który tam pracuje był tak wdzięczny, że trudno opisać.
                    Polecam polecać.&rdquo;
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>3 polubienia</span>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-2)' }}>08:12</span>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '20px 22px',
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--color-green-bg)',
                      border: '1px solid var(--color-green-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 600, color: 'var(--color-green)',
                      flexShrink: 0,
                    }}>M</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)' }}>Marek</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>użytkownik</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-2)', margin: 0 }}>
                    &ldquo;Ooo, przysługuje mi: Refundacja okularów i soczewek z NFZ
                    50&ndash;700 PLN na okulary, do 600 PLN na soczewki kontaktowe.&rdquo;
                  </p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 500 }}>Znalazł świadczenie</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ---- Aktualnosci rzadowe ---- */}
            <div className="rise" style={{ marginTop: 80, animationDelay: '580ms' }}>
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px',
                boxShadow: 'var(--shadow-2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span className="label-eyebrow" style={{ color: 'var(--color-green)' }}>Agregator RSS</span>
                  <span style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                  <span className="mono" style={{ fontSize: 10, color: 'var(--color-muted-2)' }}>odswiezane co 30 min</span>
                </div>
                <h3 style={{ fontSize: 22, letterSpacing: '-0.025em', marginBottom: 10 }}>
                  Aktualnosci z ZUS, GUS, NBP i 5 innych instytucji
                </h3>
                <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.55, marginBottom: 20, maxWidth: 620 }}>
                  Wszystkie ważne komunikaty rządowe w jednym miejscu, dopasowane do Twojego profilu.
                  Filtruj po: JDG, firma lub wszyscy. Bez szukania po 8 osobnych stronach.
                </p>

                {/* Source badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                  {[
                    { id: 'zus', name: 'ZUS', color: '#003874', for: 'wszyscy' },
                    { id: 'gus', name: 'GUS', color: '#004B8D', for: 'wszyscy' },
                    { id: 'nbp', name: 'NBP', color: '#CC0000', for: 'firmy' },
                    { id: 'uokik', name: 'UOKiK', color: '#1B5E20', for: 'wszyscy' },
                    { id: 'fundusze', name: 'Fundusze EU', color: '#6A0DAD', for: 'JDG/firmy' },
                    { id: 'ezdrowie', name: 'e-Zdrowie', color: '#00695C', for: 'wszyscy' },
                    { id: 'sejm', name: 'Sejm', color: '#8B0000', for: 'wszyscy' },
                    { id: 'arimr', name: 'ARiMR', color: '#4E342E', for: 'JDG' },
                  ].map(s => (
                    <span key={s.id} title={`Dla: ${s.for}`} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 999,
                      background: s.color, color: '#fff',
                      fontSize: 11, fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{s.name}</span>
                  ))}
                </div>

                {/* Filter preview pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                  {['Wszystkie', 'Dla wszystkich', 'JDG', 'Firmy'].map((label, i) => (
                    <span key={label} style={{
                      padding: '6px 14px', borderRadius: 999,
                      border: `1px solid ${i === 0 ? 'var(--color-text-1)' : 'var(--color-border)'}`,
                      background: i === 0 ? 'var(--color-text-1)' : 'transparent',
                      color: i === 0 ? 'var(--color-bg-0)' : 'var(--color-text-3)',
                      fontSize: 12, fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.04em',
                    }}>{label}</span>
                  ))}
                </div>

                <a href="/aktualnosci" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 999,
                  background: 'var(--color-accent)', color: 'var(--color-bg-0)',
                  fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
                  transition: 'opacity 200ms',
                }}>
                  Otworz agregator <IconArrowRight />
                </a>
              </div>
            </div>

            {/* Share section */}
            <div className="rise" style={{ marginTop: 64, animationDelay: '600ms' }}>
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '32px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: 12 }}>
                  Ta strona działa, jeśli ją udostępniasz
                </div>
                <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', marginBottom: 12 }}>
                  Podziel się z bliskimi
                </h3>
                <p style={{ fontSize: 15, color: 'var(--color-text-2)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 28px' }}>
                  Ta strona walczy z niewiedzą. Im więcej osób o niej wie, tym więcej ludzi
                  dostaje pieniądze, które im się należą. Podziel się z rodziną, znajomymi,
                  kolegami z pracy, sąsiadami. Jeden link może komuś pomóc znaleźć kilka
                  tysięcy złotych rocznie.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent('Sprawdź co Ci się należy od państwa! wezmezadarmo.com – 117 świadczeń, ulg i dotacji. Bez logowania, za darmo, w 2 minuty.')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 999,
                      background: '#25D366', color: '#fff',
                      fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    }}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://wezmezadarmo.com')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 999,
                      background: '#1877F2', color: '#fff',
                      fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    }}
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://x.com/intent/tweet?text=${encodeURIComponent('Sprawdź co Ci się należy od państwa!')}&url=${encodeURIComponent('https://wezmezadarmo.com')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 999,
                      background: 'var(--color-text-1)', color: 'var(--color-bg-0)',
                      fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    }}
                  >
                    X (Twitter)
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('https://wezmezadarmo.com').then(() => {
                        setCopyDone(true);
                        setTimeout(() => setCopyDone(false), 2500);
                      });
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', borderRadius: 999,
                      background: copyDone ? 'var(--color-green-bg)' : 'var(--color-surface-2)',
                      color: copyDone ? 'var(--color-green)' : 'var(--color-text-1)',
                      border: `1px solid ${copyDone ? 'var(--color-green-border)' : 'var(--color-border)'}`,
                      fontSize: 14, fontWeight: 500, cursor: 'pointer',
                      transition: 'all 200ms',
                    }}
                  >
                    {copyDone ? 'Skopiowano!' : 'Kopiuj link'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Footer is rendered by root layout */}

      </div>
    );
  }

  // ===================== QUESTIONS =====================
  if (phase === 'questions') {
    const q = QUESTIONS[questionIndex];
    const progress = ((questionIndex + 1) / QUESTIONS.length) * 100;
    return (
      <div style={{ minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          <Chip mono>{questionIndex + 1}/{QUESTIONS.length}</Chip>
        </div>

        <section style={{ position: 'relative', minHeight: 'calc(100vh - 105px)', display: 'flex', alignItems: 'center' }}>
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
    const counted = Math.round(loadingProgress * 117);
    const pct = Math.round(loadingProgress * 100);
    const segments = 13;
    const ringR = 130;
    const cx = 160, cy = 160;
    const innerR = 100;

    return (
      <div style={{ minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          <Chip mono>ANALIZA</Chip>
        </div>

        <section style={{ position: 'relative', minHeight: 'calc(100vh - 105px)', display: 'flex', alignItems: 'center' }}>
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
                  <span style={{ color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{counted}/117</span>
                  <span style={{ color: 'var(--color-text-3)' }}> świadczeń</span>
                </h1>

                <p style={{ fontSize: 17, color: 'var(--color-text-2)', maxWidth: 480, marginBottom: 32, lineHeight: 1.5 }}>
                  Dopasowujemy 117 świadczeń z 15 kategorii do Twojej sytuacji.
                  Dopasowanie odbywa się na serwerze, ale dane nie są zapisywane.
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
                  <svg viewBox="0 0 320 320" style={{ width: '100%', height: '100%', willChange: 'transform' }}>
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
                    {Array.from({ length: 117 }).map((_, i) => {
                      const a = (i / 117) * Math.PI * 2 - Math.PI / 2;
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
    <div className="fixed inset-0 flex flex-col" style={{ background: 'var(--color-bg-0)', paddingTop: 60 }}>
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
