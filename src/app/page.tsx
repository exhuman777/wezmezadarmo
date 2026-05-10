'use client';

import { useState } from 'react';
import { IntakeForm } from '@/components/IntakeForm';
import { ChatWindow, ChatMessage } from '@/components/ChatWindow';
import { MatchResult, UserProfile } from '@/engine/types';
import { CeidgBusinessData } from '@/lib/ceidg';

type Phase = 'landing' | 'questions' | 'chat';

interface QualifyingQuestion {
  id: string;
  question: string;
  options: { label: string; value: string }[];
  profileKey: keyof UserProfile;
}

const QUESTIONS: QualifyingQuestion[] = [
  {
    id: 'stanCywilny',
    question: 'Jaki jest Twoj stan cywilny?',
    options: [
      { label: 'Wolny/wolna', value: 'wolny' },
      { label: 'W zwiazku malzenskim', value: 'malzenstwo' },
      { label: 'Rozwiedziony/a', value: 'rozwiedziony' },
      { label: 'Wdowiec/wdowa', value: 'wdowiec' },
    ],
    profileKey: 'stanCywilny',
  },
  {
    id: 'liczbaDzieci',
    question: 'Ile masz dzieci ponizej 18 roku zycia?',
    options: [
      { label: 'Brak', value: '0' },
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3 lub wiecej', value: '3' },
    ],
    profileKey: 'liczbaDzieci',
  },
  {
    id: 'dochodMiesiecznie',
    question: 'Jaki jest miesieczny dochod netto Twojego gospodarstwa domowego?',
    options: [
      { label: 'Ponizej 2000 PLN', value: '1500' },
      { label: '2000-4000 PLN', value: '3000' },
      { label: '4000-7000 PLN', value: '5500' },
      { label: 'Powyzej 7000 PLN', value: '9000' },
    ],
    profileKey: 'dochodMiesiecznie',
  },
  {
    id: 'zatrudnienie',
    question: 'Jaki jest Twoj status zatrudnienia?',
    options: [
      { label: 'Umowa o prace', value: 'umowa_o_prace' },
      { label: 'Dzialalnosc gospodarcza', value: 'dzialalnosc' },
      { label: 'Umowa zlecenie/dzielo', value: 'umowa_zlecenie' },
      { label: 'Bezrobotny/a', value: 'bezrobotny' },
      { label: 'Emeryt/rencista', value: 'emeryt' },
    ],
    profileKey: 'zatrudnienie',
  },
  {
    id: 'niepelnosprawnosc',
    question: 'Czy posiadasz orzeczenie o niepelnosprawnosci?',
    options: [
      { label: 'Nie', value: 'brak' },
      { label: 'Lekki stopien', value: 'lekki' },
      { label: 'Umiarkowany stopien', value: 'umiarkowany' },
      { label: 'Znaczny stopien', value: 'znaczny' },
    ],
    profileKey: 'niepelnosprawnosc',
  },
  {
    id: 'wlasnosc',
    question: 'Jaka jest Twoja sytuacja mieszkaniowa?',
    options: [
      { label: 'Wlasne mieszkanie', value: 'mieszkanie' },
      { label: 'Wlasny dom', value: 'dom' },
      { label: 'Wynajem', value: 'wynajem' },
      { label: 'Zamieszkanie z rodzina', value: 'rodzina' },
    ],
    profileKey: 'wlasnosc',
  },
  {
    id: 'wojewodztwo',
    question: 'W jakim wojewodztwie mieszkasz?',
    options: [
      { label: 'Mazowieckie', value: 'mazowieckie' },
      { label: 'Malopolskie', value: 'malopolskie' },
      { label: 'Slaskie', value: 'slaskie' },
      { label: 'Wielkopolskie', value: 'wielkopolskie' },
      { label: 'Dolnoslaskie', value: 'dolnoslaskie' },
      { label: 'Inne', value: 'inne' },
    ],
    profileKey: 'wojewodztwo',
  },
  {
    id: 'ciaza',
    question: 'Czy ktos w Twoim gospodarstwie domowym jest w ciazy?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'ciaza',
  },
  {
    id: 'student',
    question: 'Czy jestes studentem/studentka?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'student',
  },
  {
    id: 'rolnik',
    question: 'Czy jestes ubezpieczony/a w KRUS (rolnik)?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'rolnik',
  },
  {
    id: 'bezrobotnyZarejestrowany',
    question: 'Czy jestes zarejestrowany/a jako bezrobotny/a w urzedzie pracy (PUP)?',
    options: [
      { label: 'Nie', value: 'false' },
      { label: 'Tak', value: 'true' },
    ],
    profileKey: 'bezrobotnyZarejestrowany',
  },
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [guideBenefitId, setGuideBenefitId] = useState<string | null>(null);

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
        // CEIDG lookup failed -- continue without business data
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

    // Derive dochodNaOsobe from dochodMiesiecznie and family size
    if (updated.dochodMiesiecznie != null) {
      const familySize = 1 + (typeof updated.liczbaDzieci === 'number' ? updated.liczbaDzieci : 0) +
        (updated.stanCywilny === 'malzenstwo' ? 1 : 0);
      updated.dochodNaOsobe = Math.round((updated.dochodMiesiecznie as number) / familySize);
    }

    setProfile(updated);

    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      // All questions answered -- run verification
      runVerification(updated as UserProfile);
    }
  }

  async function runVerification(fullProfile: UserProfile) {
    setIsLoading(true);
    setPhase('chat');

    // Fill in defaults for missing optional fields
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

      if (!res.ok) throw new Error('Blad weryfikacji');

      const data = await res.json();
      setResults(data.results ?? []);

      const count = data.results?.length ?? 0;
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: count > 0
          ? `Znalazlem ${count} swiadczen, na ktore mozesz sie kwalifikowac. Przejrzyj je ponizej -- kliknij "Jak zlozyc wniosek" przy kazdym swiadczeniu, zeby zobaczyc instrukcje krok po kroku. Mozesz tez zadac mi pytanie o dowolne swiadczenie.`
          : 'Nie znalazlem swiadczen pasujacych do Twojego profilu. Sprawdz dane lub zadaj pytanie -- postaram sie pomoc.',
      }]);
    } catch {
      setMessages([{
        id: 'error',
        role: 'assistant',
        content: 'Wystapil blad podczas weryfikacji. Sprobuj ponownie za chwile.',
      }]);
    }

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

      if (!res.ok || !res.body) throw new Error('Blad czatu');

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
            content: 'Przepraszam, wystapil blad. Sprobuj ponownie.',
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: 'var(--color-bg-1)',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 8px 60px rgba(0,0,0,0.5), inset 0 0 80px rgba(240,168,96,0.03)',
          }}
        >
          {/* Panel header */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              borderBottom: '1px solid var(--color-border)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent" style={{ boxShadow: '0 0 8px rgba(240,168,96,0.4)' }} />
            <span className="text-[13px] font-extrabold tracking-[3px] text-text-1 uppercase">
              WEZMEZADARMO
            </span>
            <span className="flex-1" />
            <span className="text-[12px] text-text-3 tracking-[1px]">v1.0</span>
          </div>

          {/* Header content */}
          <div className="px-6 pt-6 pb-4">
            <pre className="text-accent text-[5.5px] leading-none mb-5 select-none hidden sm:block">{`
 __        ________ ________  __ __ ________ ________  _____  _____  _____  __  ___ ___  ___
|  |      |   ____|/  __   / |  |  |   ____|/  __   / /  _  ||  _  \\|  _  \\|  |/  /|   \\/   |
|  |  __  |  |__  |  / /  /  |  |  |  |__  |  / /  / |  | | || | |  | |_|  |     / |  \\  /  |
|  | |  | |   __| | |/  /   |  |  |   __| | |/  /  |  |_| || | |  |      /|  |  \\ |  |\\/|  |
|   \\|  | |  |____|  /  /---|  |  |  |____|  /  /---|     || |_|  |  |\\  \\|  |  \\\\|  |  |  |
 \\      / |_______|_/ /____|  |__|_______|_/ /____|\\___/\\_\\|_____/|__| \\__|__|\\__\\|__|  |__|
  \\____/
`}</pre>

            {/* Mobile title */}
            <h1 className="text-accent text-2xl font-extrabold tracking-[4px] mb-2 sm:hidden">
              WEZMEZADARMO
            </h1>

            <p className="text-text-1 text-[18px] font-semibold mb-1.5">
              Sprawdz co Ci sie nalezy
            </p>
            <p className="text-text-2 text-[14px] mb-6">
              Zasilki, ulgi, badania, dotacje -- sprawdz w 2 minuty
            </p>
          </div>

          {/* Form section */}
          <div className="px-6 pb-6">
            <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />
          </div>

          {/* Disclaimer footer */}
          <div
            className="px-6 py-3 text-[12px] text-text-3 leading-relaxed"
            style={{
              borderTop: '1px solid var(--color-border)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            Nie jestem urzednikiem -- to informacja orientacyjna, nie decyzja urzedowa.
            Twoj numer PESEL nie opuszcza Twojej przegladarki. NIP jest uzywany jednorazowo
            do sprawdzenia statusu firmy i nie jest przechowywany.
          </div>
        </div>

        {/* Benefit count */}
        <div className="mt-4 text-[13px] text-text-3 text-center">
          Baza: 99 swiadczen | 15 kategorii
        </div>
      </div>
    );
  }

  // QUESTIONS
  if (phase === 'questions') {
    const q = QUESTIONS[questionIndex];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: 'var(--color-bg-1)',
            border: '1px solid var(--color-border-light)',
            boxShadow: '0 8px 60px rgba(0,0,0,0.5), inset 0 0 80px rgba(240,168,96,0.03)',
          }}
        >
          {/* Panel header with progress */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              borderBottom: '1px solid var(--color-border)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-accent" style={{ boxShadow: '0 0 8px rgba(240,168,96,0.4)' }} />
            <span className="text-[13px] font-extrabold tracking-[3px] text-text-1 uppercase">
              WEZMEZADARMO
            </span>
            <span className="flex-1" />
            <span className="text-[14px] text-accent font-bold tracking-[1px]">
              {questionIndex + 1}/{QUESTIONS.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5" style={{ background: 'var(--color-bg-3)' }}>
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%`,
                background: 'linear-gradient(90deg, #f0a860, #ffb56b)',
                boxShadow: '0 0 12px rgba(240,168,96,0.3)',
              }}
            />
          </div>

          {/* Question content */}
          <div className="px-6 py-7">
            <h2 className="text-[18px] font-semibold text-text-1 mb-6 leading-relaxed">
              {q.question}
            </h2>

            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => handleQuestionAnswer(opt.value)}
                  disabled={isLoading}
                  className="w-full text-left px-5 py-4 rounded-xl text-[15px] border transition-all hover:-translate-y-px disabled:opacity-40 cursor-pointer"
                  style={{
                    background: 'var(--color-bg-2)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(240,168,96,0.4)';
                    e.currentTarget.style.background = 'rgba(240,168,96,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.background = 'var(--color-bg-2)';
                  }}
                >
                  <span className="text-accent font-bold mr-2.5">
                    {String.fromCharCode(97 + i)})
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHAT
  return (
    <div className="h-screen flex flex-col">
      {/* Topbar */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent), var(--color-bg-1)',
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-accent" style={{ boxShadow: '0 0 8px var(--color-accent)' }} />
        <span className="text-[13px] font-extrabold tracking-[3px] text-text-1 uppercase">
          wezmezadarmo
        </span>
        {results.length > 0 && (
          <span className="text-[13px] text-green font-bold ml-2">
            {results.filter((r) => r.status === 'PRZYSLUGUJE').length} pewnych
            {results.filter((r) => r.status === 'MOZLIWE').length > 0 &&
              ` / ${results.filter((r) => r.status === 'MOZLIWE').length} do weryfikacji`
            }
          </span>
        )}
      </div>

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
