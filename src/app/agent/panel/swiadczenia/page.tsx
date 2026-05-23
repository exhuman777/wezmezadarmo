'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllBenefits } from '@/engine/benefits';
import type { Benefit, MatchResult } from '@/engine/types';

const CATEGORY_LABELS: Record<string, string> = {
  ZDROWIE: 'Zdrowie',
  RODZINA: 'Rodzina',
  PODATKI: 'Podatki i ulgi',
  BIZNES: 'Biznes',
  MIESZKANIE: 'Mieszkanie',
  NIEPELNOSPRAWNOSC: 'Niepełnosprawność',
  ENERGIA: 'Energia',
  ZUS: 'ZUS',
  PRACA: 'Praca',
  EDUKACJA: 'Edukacja',
  SENIOR: 'Seniorzy',
  POMOC_SPOLECZNA: 'Pomoc społeczna',
  EKOLOGIA: 'Ekologia',
};

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface LocalResult {
  match: MatchResult;
  full: Benefit;
}

function DetailView({
  item,
  onAskAI,
}: {
  item: LocalResult;
  onAskAI: (q: string) => void;
}) {
  const { match, full } = item;
  const pewne = match.status === 'PRZYSLUGUJE';

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 10, padding: '3px 10px', borderRadius: 4,
          background: 'rgba(0,0,0,0.04)', border: '1px solid var(--color-border)',
          color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {CATEGORY_LABELS[full.kategoria] || full.kategoria}
        </span>
        <span style={{
          fontSize: 10, padding: '3px 10px', borderRadius: 4,
          background: pewne ? 'rgba(34,160,107,0.1)' : 'rgba(220,150,40,0.1)',
          border: `1px solid ${pewne ? 'rgba(34,160,107,0.3)' : 'rgba(220,150,40,0.3)'}`,
          color: pewne ? '#22A06B' : '#c4841a',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {pewne ? 'przysługuje' : 'możliwe'}
        </span>
      </div>

      {/* Title */}
      <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 8, lineHeight: 1.3 }}>
        {full.nazwa}
      </h2>

      {/* Amount */}
      <div style={{
        fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 700, marginBottom: 6,
        background: 'linear-gradient(135deg, #22A06B, #1d9060)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {full.kwota}
      </div>

      {/* Timeline */}
      {full.wniosek.terminRealizacji && (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 16, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>&#x25F7;</span> {full.wniosek.terminRealizacji}
        </div>
      )}

      {/* Description */}
      {full.opis && (
        <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--color-text-2)', marginBottom: 20, borderLeft: '2px solid rgba(34,160,107,0.3)', paddingLeft: 12 }}>
          {full.opis}
        </p>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <a
          href={full.zrodloUrl}
          target="_blank" rel="noopener noreferrer"
          className="sw-btn-guide"
        >
          Pełny przewodnik <span style={{ fontSize: 13 }}>→</span>
        </a>
        <button
          onClick={() => onAskAI(`Czy przysługuje mi ${full.nazwa}? Jakie dokumenty potrzebuję?`)}
          className="sw-btn-ask"
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M1 1h13v9H8.5L4 14v-4H1z" />
          </svg>
          Zapytaj AI
        </button>
      </div>

      {/* CO POTRZEBUJESZ + KROK PO KROKU */}
      {(full.wniosek.dokumenty.length > 0 || full.wniosek.kroki.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 12, marginBottom: 16 }}>
          {full.wniosek.dokumenty.length > 0 && (
            <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 5px rgba(34,160,107,0.5)', flexShrink: 0 }} />
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
                  Co potrzebujesz
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {full.wniosek.dokumenty.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 18, height: 18, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 4, background: 'rgba(34,160,107,0.1)',
                      fontSize: 9, fontWeight: 700, color: '#22A06B',
                      fontFamily: 'var(--font-mono)', marginTop: 1,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-text-2)' }}>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {full.wniosek.kroki.length > 0 && (
            <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 5px rgba(34,160,107,0.5)', flexShrink: 0 }} />
                <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
                  Krok po kroku
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {full.wniosek.kroki.map((krok, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 20, height: 20, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22A06B, #1d9060)',
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      boxShadow: '0 2px 6px rgba(34,160,107,0.25)',
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-2)', paddingTop: 2 }}>{krok}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dopasowane kryteria */}
      {match.matchedCriteria.length > 0 && (
        <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(34,160,107,0.05)', border: '1px solid rgba(34,160,107,0.15)', borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22A06B', marginBottom: 8 }}>
            Dopasowane kryteria
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {match.matchedCriteria.map((c, i) => (
              <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,160,107,0.1)', color: '#22A06B', border: '1px solid rgba(34,160,107,0.2)' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings + pulapki */}
      {(match.warnings.length > 0 || full.wniosek.pulapki.length > 0) && (
        <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(220,80,80,0.04)', border: '1px solid rgba(220,80,80,0.18)', borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e05c5c', marginBottom: 8 }}>
            Na co uważać
          </div>
          {[...match.warnings, ...full.wniosek.pulapki].map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: '#c05555', lineHeight: 1.6, marginBottom: 3, display: 'flex', gap: 6 }}>
              <span style={{ flexShrink: 0 }}>!</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Odwołanie */}
      {full.wniosek.odwolanie && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: 6 }}>
            Odwołanie
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{full.wniosek.odwolanie}</div>
        </div>
      )}

      {/* Source + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
        <a href={full.zrodloUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#22A06B', textDecoration: 'none' }}>
          Źródło: {full.zrodloNazwa} →
        </a>
        <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
          Zweryfikowano: {full.dataWeryfikacji}
        </span>
        {full.dataWaznosci && (
          <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>
            Ważne do: {full.dataWaznosci}
          </span>
        )}
      </div>
    </div>
  );
}

export default function AgentSwiadczenia() {
  const router = useRouter();
  const [results, setResults] = useState<LocalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<LocalResult | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [chatOpen, setChatOpen] = useState(true);

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const chatAbortRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    if (!chatContainerRef.current || !shouldScrollRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatMsgs]);

  useEffect(() => {
    if (!selected) return;
    setChatMsgs([{
      id: 'ctx',
      role: 'assistant',
      content: `Wybrałeś: ${selected.full.nazwa} (${selected.full.kwota}). Zadaj pytanie lub kliknij podpowiedź.`,
    }]);
  }, [selected?.full.id]);

  const sendChat = useCallback(async (text: string) => {
    if (!text.trim() || chatStreaming) return;
    shouldScrollRef.current = true;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
    const assistantMsg: ChatMsg = { id: `a-${Date.now()}`, role: 'assistant', content: '' };
    setChatMsgs(prev => [...prev, userMsg, assistantMsg]);
    setChatStreaming(true);
    setChatOpen(true);

    const ctrl = new AbortController();
    chatAbortRef.current = ctrl;

    const ctx = selected
      ? `Kontekst: świadczenie "${selected.full.nazwa}" (${selected.full.kwota}), status: ${selected.match.status === 'PRZYSLUGUJE' ? 'przysługuje' : 'możliwe'}. `
      : '';

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: ctx + text.trim() }],
          mode: 'swiadczenie',
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        setChatMsgs(prev => { const c = [...prev]; c[c.length - 1] = { ...c[c.length - 1], content: 'Błąd połączenia.' }; return c; });
        setChatStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accum = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            if (payload === '[DONE]') continue;
            try {
              const { content } = JSON.parse(payload);
              if (content) {
                accum += content;
                setChatMsgs(prev => { const c = [...prev]; c[c.length - 1] = { ...c[c.length - 1], content: accum }; return c; });
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setChatMsgs(prev => { const c = [...prev]; c[c.length - 1] = { ...c[c.length - 1], content: 'Błąd połączenia.' }; return c; });
      }
    }
    setChatStreaming(false);
    chatAbortRef.current = null;
  }, [chatStreaming, selected]);

  useEffect(() => {
    async function load() {
      const profileRes = await fetch('/api/agent/profile');
      if (profileRes.status === 401) { router.push('/agent/logowanie'); return; }
      if (!profileRes.ok) { setError('Błąd ładowania profilu.'); setLoading(false); return; }

      const { profile } = await profileRes.json();
      if (profile.type !== 'private') { setLoading(false); return; }

      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: {
          wiek: profile.wiek,
          plec: profile.plec,
          stanCywilny: profile.stan_cywilny,
          liczbaDzieci: profile.liczba_dzieci,
          wiekDzieci: profile.wiek_dzieci ?? [],
          dochodMiesiecznie: profile.dochod_miesiecznie,
          dochodNaOsobe: profile.dochod_na_osobe,
          zatrudnienie: profile.zatrudnienie,
          niepelnosprawnosc: profile.niepelnosprawnosc,
          wlasnosc: profile.wlasnosc,
          wojewodztwo: profile.wojewodztwo,
          prowadzDzialalnosc: false, pierwszaDzialalnosc: false,
          ciaza: profile.ciaza, student: profile.student,
          emeryt: profile.emeryt, rolnik: profile.rolnik,
          bezrobotnyZarejestrowany: profile.bezrobotny_zarejestrowany,
        }}),
      });

      if (!verifyRes.ok) { setError('Błąd obliczania świadczeń.'); setLoading(false); return; }
      const data = await verifyRes.json();

      const fullMap = new Map<string, Benefit>();
      for (const b of getAllBenefits()) fullMap.set(b.id, b);

      const filtered: LocalResult[] = (data.results as MatchResult[])
        .filter(r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE')
        .sort((a, b) => (a.status === 'PRZYSLUGUJE' ? -1 : 1))
        .map(r => ({ match: r, full: fullMap.get(r.benefit.id) ?? r.benefit as unknown as Benefit }));

      setResults(filtered);
      if (filtered.length > 0) setSelected(filtered[0]);
      setLoading(false);
    }
    load();
  }, [router]);

  const groupedResults = results.reduce<Record<string, LocalResult[]>>((acc, r) => {
    const cat = r.full.kategoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const pewneCount = results.filter(r => r.match.status === 'PRZYSLUGUJE').length;
  const mozliweCount = results.filter(r => r.match.status === 'MOZLIWE').length;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22A06B', display: 'inline-block', animation: 'sw-pulse 1s ease-in-out infinite' }} />
      <div style={{ fontSize: 12, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>Obliczam świadczenia...</div>
      <style>{`@keyframes sw-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.5} }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes sw-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes sw-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.5} }

        .sw-list-item {
          width: 100%; text-align: left; padding: 10px 14px;
          background: transparent; border: none; border-left: 2px solid transparent;
          cursor: pointer; display: flex; align-items: flex-start; gap: 10;
          transition: background 150ms, border-color 150ms;
        }
        .sw-list-item:hover { background: rgba(34,160,107,0.04); }
        .sw-list-item.active {
          background: rgba(34,160,107,0.08) !important;
          border-left-color: #22A06B !important;
        }

        .sw-btn-guide {
          display: inline-flex; align-items: center; gap: 8;
          padding: 9px 18px; border-radius: 10;
          background: linear-gradient(135deg, #22A06B, #1d9060);
          color: #fff; font-size: 13px; font-weight: 600;
          text-decoration: none; position: relative; overflow: hidden;
          box-shadow: 0 4px 12px rgba(34,160,107,0.3);
          transition: transform 150ms, box-shadow 150ms;
        }
        .sw-btn-guide:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(34,160,107,0.4); }
        .sw-btn-guide::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-12deg);
          transition: left 0.4s;
        }
        .sw-btn-guide:hover::after { left: 160%; }

        .sw-btn-ask {
          display: inline-flex; align-items: center; gap: 7;
          padding: 9px 16px; border-radius: 10;
          background: transparent; color: var(--color-text-1);
          font-size: 13px; font-weight: 500;
          border: 1px solid var(--color-border); cursor: pointer;
          transition: border-color 150ms, color 150ms;
        }
        .sw-btn-ask:hover { border-color: rgba(34,160,107,0.4); color: #22A06B; }

        .sw-chat-hint {
          text-align: left; font-size: 11px; padding: 5px 8px;
          background: var(--color-bg-0); border: 1px solid var(--color-border);
          border-radius: 6; color: var(--color-text-2); cursor: pointer;
          width: 100%; transition: border-color 150ms, color 150ms;
        }
        .sw-chat-hint:hover { border-color: rgba(34,160,107,0.3); color: var(--color-text-1); }

        @media (max-width: 700px) {
          .sw-left { display: none !important; }
          .sw-left.show { display: flex !important; }
          .sw-center { display: none !important; }
          .sw-center.show { display: flex !important; }
          .sw-right { display: none !important; }
        }
      `}</style>

      {/* LEFT: benefit list */}
      <div
        className={`sw-left${mobileView === 'list' ? ' show' : ''}`}
        style={{
          width: 260, flexShrink: 0,
          borderRight: '1px solid var(--color-border)',
          overflowY: 'auto',
          background: 'var(--color-bg-1)',
          flexDirection: 'column',
          display: 'flex',
        }}
      >
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Twoje świadczenia
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,160,107,0.1)', color: '#22A06B', border: '1px solid rgba(34,160,107,0.2)' }}>
              {pewneCount} pewnych
            </span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(200,130,40,0.08)', color: '#c4841a', border: '1px solid rgba(200,130,40,0.2)' }}>
              {mozliweCount} możliwych
            </span>
          </div>
        </div>

        {error && <div style={{ padding: 14, fontSize: 12, color: '#e05c5c' }}>{error}</div>}

        {results.length === 0 && !error && (
          <div style={{ padding: 20, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
            Brak świadczeń. Uzupełnij <a href="/panel/profil" style={{ color: '#22A06B', textDecoration: 'none' }}>profil</a>.
          </div>
        )}

        {Object.keys(groupedResults).map(cat => (
          <div key={cat}>
            <div style={{
              padding: '10px 14px 4px',
              fontSize: 9, fontFamily: 'var(--font-mono)',
              letterSpacing: '0.09em', textTransform: 'uppercase',
              color: 'var(--color-text-3)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{CATEGORY_LABELS[cat] || cat}</span>
              <span style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 3, padding: '1px 5px', fontSize: 9 }}>
                {groupedResults[cat].length}
              </span>
            </div>
            {groupedResults[cat].map(r => (
              <button
                key={r.full.id}
                className={`sw-list-item${selected?.full.id === r.full.id ? ' active' : ''}`}
                onClick={() => { setSelected(r); setMobileView('detail'); }}
                style={{ borderLeft: `2px solid ${selected?.full.id === r.full.id ? '#22A06B' : 'transparent'}` }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                  background: r.match.status === 'PRZYSLUGUJE' ? '#22A06B' : '#e07a35',
                  boxShadow: r.match.status === 'PRZYSLUGUJE'
                    ? '0 0 6px rgba(34,160,107,0.5)'
                    : '0 0 6px rgba(224,122,53,0.35)',
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-1)', lineHeight: 1.35, wordBreak: 'break-word' }}>
                    {r.full.nazwa}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>
                    {r.full.kwota}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* CENTER: detail */}
      <div
        className={`sw-center${mobileView === 'detail' ? ' show' : ''}`}
        style={{
          flex: 1, overflowY: 'auto', minWidth: 0,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Mobile: back to list */}
        <div className="sw-mobile-back" style={{ display: 'none', padding: '10px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <button
            onClick={() => setMobileView('list')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#22A06B', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            ← Lista świadczeń
          </button>
        </div>

        {selected ? (
          <DetailView item={selected} onAskAI={sendChat} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-3)', fontSize: 13 }}>
            Wybierz świadczenie z listy
          </div>
        )}
      </div>

      {/* RIGHT: AI chat */}
      {chatOpen && (
        <div style={{
          width: 300, flexShrink: 0,
          borderLeft: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--color-bg-1)',
        }}>
          {/* Chat header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.7)' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--color-text-2)', fontWeight: 600 }}>
                Asystent AI
              </span>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1 }}>
              ✕
            </button>
          </div>

          {/* Context chip */}
          {selected && (
            <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 4,
                background: 'rgba(34,160,107,0.08)', color: 'var(--color-text-2)',
                border: '1px solid rgba(34,160,107,0.15)',
                display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {selected.full.nazwa}
              </span>
            </div>
          )}

          {/* Messages */}
          <div
            ref={chatContainerRef}
            onScroll={() => {
              const c = chatContainerRef.current;
              if (c) shouldScrollRef.current = c.scrollHeight - c.scrollTop - c.clientHeight < 80;
            }}
            style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {chatMsgs.map((msg, i) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: '#22A06B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                    AI
                  </div>
                )}
                <div style={{
                  padding: '7px 11px',
                  borderRadius: msg.role === 'user' ? '10px 10px 4px 10px' : '10px 10px 10px 4px',
                  background: msg.role === 'user' ? '#22A06B' : 'var(--color-bg-0)',
                  color: msg.role === 'user' ? '#fff' : 'var(--color-text-1)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                  fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  maxWidth: '88%',
                }}>
                  {msg.content}
                  {chatStreaming && i === chatMsgs.length - 1 && msg.role === 'assistant' && (
                    <span style={{ display: 'inline-block', width: 5, height: 11, background: '#22A06B', marginLeft: 2, animation: 'sw-blink 1s steps(2) infinite' }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={chatScrollRef} />
          </div>

          {/* Quick hints */}
          {selected && chatMsgs.length <= 1 && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              {[
                `Czy to świadczenie mi przysługuje?`,
                'Jakie dokumenty potrzebuję?',
                'Jak złożyć wniosek krok po kroku?',
              ].map(hint => (
                <button key={hint} className="sw-chat-hint" onClick={() => sendChat(hint)}>
                  {hint}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); sendChat(chatInput); setChatInput(''); }}
            style={{ padding: '10px 12px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 6, flexShrink: 0 }}
          >
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Zadaj pytanie..."
              disabled={chatStreaming}
              style={{
                flex: 1, padding: '7px 11px', borderRadius: 8,
                background: 'var(--color-bg-0)', border: '1px solid var(--color-border)',
                color: 'var(--color-text-1)', fontSize: 12, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={chatStreaming || !chatInput.trim()}
              style={{
                padding: '7px 12px', borderRadius: 8,
                background: '#22A06B', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                opacity: (chatStreaming || !chatInput.trim()) ? 0.35 : 1,
                flexShrink: 0,
              }}
            >
              Wyślij
            </button>
          </form>
        </div>
      )}

      {/* Chat toggle when closed */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: 'absolute', right: 16, bottom: 20,
            width: 42, height: 42, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22A06B, #1d9060)',
            border: 'none', cursor: 'pointer', color: '#fff',
            boxShadow: '0 4px 16px rgba(34,160,107,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Otwórz Asystenta AI"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M1 1h14v10H9L5 15v-4H1z" />
          </svg>
        </button>
      )}
    </div>
  );
}
