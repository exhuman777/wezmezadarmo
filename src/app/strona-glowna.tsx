'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IntakeForm } from '@/components/IntakeForm';
import { ChatWindow, ChatMessage } from '@/components/ChatWindow';
import { MatchResult, UserProfile } from '@/engine/types';
import { getAllBenefits } from '@/engine/benefits';
import { CeidgBusinessData } from '@/lib/ceidg';
import { track } from '@/lib/analytics';

type Phase = 'landing' | 'questions' | 'loading' | 'chat';

const CATEGORY_LABELS: Record<string, string> = {
  PRACA: 'Praca', ZUS: 'ZUS', ZDROWIE: 'Zdrowie', RODZINA: 'Rodzina',
  SENIOR: 'Seniorzy', PODATKI: 'Ulgi podatkowe', POMOC_SPOLECZNA: 'Pomoc społeczna',
  EDUKACJA: 'Edukacja', BIZNES: 'Przedsiębiorcy', EKOLOGIA: 'Ekologia',
  NIEPELNOSPRAWNOSC: 'Niepełnosprawność', MIESZKANIE: 'Mieszkanie', ENERGIA: 'Energia',
};

// Liczone na żywo z bazy świadczeń, żeby nigdy nie rozjechały się z danymi.
const CATEGORIES = (() => {
  const counts = new Map<string, number>();
  for (const b of getAllBenefits()) counts.set(b.kategoria, (counts.get(b.kategoria) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([id, count]) => ({ id: id.toLowerCase(), label: CATEGORY_LABELS[id] ?? id, count }))
    .sort((a, b) => b.count - a.count);
})();

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
      borderRadius: 2,
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
  const router = useRouter();
  const [heroQuery, setHeroQuery] = useState('');
  const [phase, setPhase] = useState<Phase>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [guideBenefitId, setGuideBenefitId] = useState<string | null>(null);

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
    track.formSubmitted(Boolean(data.nip));
    setProfile((prev) => ({ ...prev, wiek: data.wiek, plec: data.plec }));

    if (data.nip) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/ceidg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nip: data.nip }),
        });
        track.ceidgLookup(res.ok);
        if (res.ok) {
          // CEIDG response is enriched with Biała Lista VAT status server-side
          const ceidg: CeidgBusinessData & { vat?: { status: string | null; registeredAt: string | null; removedAt: string | null } | null } = await res.json();
          setProfile((prev) => ({
            ...prev,
            prowadzDzialalnosc: ceidg.aktywna,
            dataDzialalnosci: ceidg.dataRejestracji ?? undefined,
            pkd: ceidg.pkd,
            statusVat: ceidg.vat?.status ?? undefined,
            nazwaFirmy: ceidg.nazwa ?? undefined,
          }));
        }
      } catch {
        track.ceidgLookup(false);
        // CEIDG lookup failed, continue without business data
      }
      setIsLoading(false);
    }

    setPhase('questions');
    window.scrollTo(0, 0);
    // Vercel Analytics - quiz started
    try {
      const { track } = await import('@/lib/track');
      track('quiz_started');
    } catch { /* ignore */ }
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
      window.scrollTo(0, 0);
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

      // Vercel Analytics event - quiz_completed (anonymous, bez PII)
      try {
        const { track } = await import('@/lib/track');
        track('quiz_completed', { total, pewne, mozliwe, ai_verified: aiVerified });
      } catch { /* ignore */ }

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
        welcomeText += 'Sprawdziłem 133 świadczenia z 13 kategorii. Opisz mi swoją sytuację, a sprawdzę czy czegoś nie przeoczyłem.\n\n';
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
    const shareText = 'Sprawdź, co Ci się należy od państwa. wezmezadarmo.com: świadczenia, ulgi i dotacje w jednym miejscu. Bez logowania, za darmo.';
    return (
      <div className="prosta">

        {/* Gra na start */}
        <section className="prosta-blok" aria-labelledby="gra-tytul" style={{ padding: 0 }}>
          <h1 id="gra-tytul" style={{ fontSize: 'clamp(26px, 5vw, 36px)' }}>Należy Ci się. Zagraj i sprawdź.</h1>
          <div className="gra-pelna" style={{ marginTop: 16 }}>
            <div className="gra-ramka">
              <iframe
                src="/gra/index.html"
                title="Gra Należy Ci się: dopasuj świadczenia do osób"
                loading="eager"
                allow="autoplay"
              />
            </div>
          </div>
          <p style={{ marginTop: 16 }}>W grze dopasowujesz świadczenia do osób. Poniżej sprawdzisz, które należą się Tobie.</p>
          <div className="przyciski">
            <a href="#kalkulator" className="btn btn-rdza btn-lg">Sprawdź, co Ci się należy</a>
          </div>
        </section>

        {/* Kalkulator */}
        <section id="kalkulator" className="prosta-blok" style={{ padding: '32px 0 0', scrollMarginTop: 80 }}>
          <span id="formularz" />
          <h2>Sprawdź, co Ci się należy</h2>
          <p className="pod">Kilka pytań o Twoją sytuację. Bez konta i za darmo.</p>
          <div style={{ marginTop: 20, padding: 20, background: 'var(--surface)', border: '2px solid var(--tusz)' }}>
            <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />
          </div>
          <p className="mala" style={{ marginTop: 12 }}>
            Informacja orientacyjna, nie decyzja urzędowa. Projekt prywatny, nie rządowy.
          </p>
        </section>

        {/* Pytanie do asystenta */}
        <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
          <h2>Zapytaj asystenta AI</h2>
          <p className="pod">Napisz pytanie własnymi słowami.</p>
          <form
            className="pytaj"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = heroQuery.trim();
              router.push(trimmed ? `/agent?q=${encodeURIComponent(trimmed)}` : '/agent');
            }}
          >
            <label htmlFor="pytanie-ai" className="sr-only">Twoje pytanie</label>
            <input
              id="pytanie-ai"
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Jakie świadczenia mi przysługują?"
            />
            <button type="submit" className="btn btn-primary">Zapytaj</button>
          </form>
        </section>

        {/* Linki jak w bio */}
        <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
          <h2>Więcej na stronie</h2>
          <ul className="linki">
            <li><a href="/swiadczenia"><span>Baza świadczeń<small>Kwoty, warunki i źródła.</small></span><IconArrowRight /></a></li>
            <li><a href="/wnioski"><span>Wnioski ZUS z pomocą AI<small>Wypełnisz i pobierzesz PDF.</small></span><IconArrowRight /></a></li>
            <li><a href="/dla-firm"><span>Dla firm i JDG<small>Dotacje, ulgi i automatyzacje.</small></span><IconArrowRight /></a></li>
            <li><a href="/dotacje"><span>Dotacje dla firm<small>Programy dopasowane do profilu firmy.</small></span><IconArrowRight /></a></li>
            <li><a href="/centrum-obywatela"><span>Centrum Obywatela<small>NFZ, NBP, GIOŚ, GUS i inne, bez logowania.</small></span><IconArrowRight /></a></li>
            <li><a href="/aktualnosci"><span>Aktualności<small>Zmiany w prawie i nowe nabory.</small></span><IconArrowRight /></a></li>
          </ul>
        </section>

        {/* Konto */}
        <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
          <h2>Konto</h2>
          <p className="pod">Konto zapamięta Twój profil i dopasowane świadczenia. Jest darmowe.</p>
          <div className="przyciski">
            <a href="/rejestracja" className="btn btn-primary btn-lg">Załóż konto</a>
            <a href="/logowanie" className="btn btn-lg">Mam już konto</a>
          </div>
        </section>

        {/* Udostępnij */}
        <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
          <h2>Podeślij komuś</h2>
          <p className="pod">Ktoś z bliskich może nie wiedzieć, co mu przysługuje.</p>
          <div className="przyciski">
            <a className="btn" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className="btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://wezmezadarmo.com')}`} target="_blank" rel="noopener noreferrer">Facebook</a>
            <a className="btn" href={`https://x.com/intent/tweet?text=${encodeURIComponent('Sprawdź, co Ci się należy od państwa.')}&url=${encodeURIComponent('https://wezmezadarmo.com')}`} target="_blank" rel="noopener noreferrer">X</a>
            <button
              type="button"
              className="btn"
              onClick={() => {
                navigator.clipboard.writeText('https://wezmezadarmo.com').then(() => {
                  setCopyDone(true);
                  setTimeout(() => setCopyDone(false), 2500);
                });
              }}
              aria-live="polite"
            >
              {copyDone ? 'Skopiowano' : 'Kopiuj link'}
            </button>
          </div>
        </section>

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
          <div className="wrap" style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
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

            {questionIndex === 0 && profile.statusVat && (
              <div style={{
                margin: '0 0 24px',
                padding: '12px 18px',
                background: profile.statusVat === 'Czynny' ? 'var(--green-50)'
                  : profile.statusVat === 'Zwolniony' ? 'rgba(196, 132, 26, 0.08)'
                  : 'rgba(150, 150, 150, 0.08)',
                border: `1px solid ${profile.statusVat === 'Czynny' ? 'var(--green-200)'
                  : profile.statusVat === 'Zwolniony' ? 'rgba(196, 132, 26, 0.25)'
                  : 'rgba(150, 150, 150, 0.25)'}`,
                borderRadius: 2,
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 2,
                  background: profile.statusVat === 'Czynny' ? '#2b7353' : profile.statusVat === 'Zwolniony' ? '#c4841a' : '#888',
                  color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  VAT: {profile.statusVat}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
                  {profile.nazwaFirmy ? `Wykryto firmę: ${profile.nazwaFirmy}` : 'Status z Białej Listy MF'}
                </span>
                <a href="/centrum-obywatela/biala-lista" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>
                  Pełne dane →
                </a>
              </div>
            )}

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
                    borderRadius: 2,
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
    const pct = Math.round(loadingProgress * 100);
    return (
      <div className="prosta" style={{ minHeight: '70vh' }}>
        <section className="prosta-blok" aria-live="polite">
          <p className="etykieta">Sprawdzam</p>
          <h1>Dopasowuję świadczenia do Twoich odpowiedzi</h1>
          <p className="pod">Teraz: {CATEGORIES[loadingCatIdx].label}. Odpowiedzi nie są zapisywane.</p>
          <div style={{ marginTop: 24, height: 8, border: '2px solid var(--tusz)', background: 'var(--surface)' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--tusz)' }} />
          </div>
        </section>
      </div>
    );
  }

  // ===================== CHAT =====================
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--color-bg-0)',
      paddingTop: 64,
      zIndex: 10,
    }}>
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
