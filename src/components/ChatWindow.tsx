'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { StepByStepGuide } from './StepByStepGuide';
import { MatchResult, BenefitCategory } from '@/engine/types';
import { getAllBenefits } from '@/engine/benefits';

const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  RODZINA: 'Rodzina i dzieci',
  ZUS: 'ZUS i zasiłki',
  PRACA: 'Praca',
  PODATKI: 'Ulgi podatkowe',
  ZDROWIE: 'Zdrowie',
  NIEPELNOSPRAWNOSC: 'Niepełnosprawność',
  SENIOR: 'Seniorzy',
  POMOC_SPOLECZNA: 'Pomoc społeczna',
  MIESZKANIE: 'Mieszkanie',
  EDUKACJA: 'Edukacja',
  BIZNES: 'Działalność gospodarcza',
  ENERGIA: 'Energia',
  EKOLOGIA: 'Ekologia i środowisko',
};

const SUGGESTED_QUESTIONS = [
  'Co mi przysługuje?',
  'Jak złożyć wniosek?',
  'Jakie dokumenty?',
];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  results: MatchResult[];
  isStreaming: boolean;
  onSendMessage: (text: string, focusedBenefitId?: string | null) => void;
  onGuide: (benefitId: string) => void;
  guideBenefitId: string | null;
  onCloseGuide: () => void;
  onClearHistory?: () => void;
}

export function ChatWindow({
  messages,
  results,
  isStreaming,
  onSendMessage,
  onGuide,
  guideBenefitId,
  onCloseGuide,
  onClearHistory,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'pewne' | 'mozliwe'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(results.length > 0 ? results[0]?.benefit.id ?? null : null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail' | 'chat'>('list');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFocusBenefitId, setChatFocusBenefitId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 920);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (guideBenefitId) {
      setSelectedId(guideBenefitId);
      if (isMobile) setMobileView('detail');
    }
  }, [guideBenefitId, isMobile]);

  useEffect(() => {
    if (detailRef.current) detailRef.current.scrollTop = 0;
  }, [selectedId]);

  function resetTextareaHeight() {
    if (textareaRef.current) textareaRef.current.style.height = '44px';
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  }

  function submitMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isStreaming) return;
    setInput('');
    resetTextareaHeight();
    onSendMessage(msg, chatFocusBenefitId);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitMessage();
  }

  function openChatForBenefit(benefitId: string) {
    setChatFocusBenefitId(benefitId);
    if (isMobile) {
      setMobileView('chat');
    } else {
      setChatOpen(true);
    }
  }

  function downloadMd() {
    const allBenefits = getAllBenefits();
    const lines: string[] = [
      '# Moje świadczenia i ulgi | wezmezadarmo.com',
      '',
      `Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`,
      `Łącznie: ${results.length} świadczeń`,
      '',
      '---',
    ];
    for (const r of results) {
      const b = allBenefits.find(x => x.id === r.benefit.id);
      if (!b) continue;
      lines.push('', `## ${b.nazwa}`, '');
      lines.push(`**Status:** ${r.status === 'PRZYSLUGUJE' ? 'Pewne' : 'Możliwe'}`);
      lines.push(`**Kwota:** ${b.kwota}`);
      lines.push(`**Termin:** ${b.wniosek.terminRealizacji}`);
      if (b.wniosek.formularz) lines.push(`**Formularz:** ${b.wniosek.formularz}`);
      lines.push('', '### Dokumenty');
      b.wniosek.dokumenty.forEach(d => lines.push(`- ${d}`));
      lines.push('', '### Kroki');
      b.wniosek.kroki.forEach((k, i) => lines.push(`${i + 1}. ${k}`));
      if (b.wniosek.pulapki.length > 0) {
        lines.push('', '### Na co uważać');
        b.wniosek.pulapki.forEach(p => lines.push(`- ${p}`));
      }
      lines.push('', `**Źródło:** [${b.zrodloNazwa}](${b.zrodloUrl})`, '', '---');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moje-swiadczenia.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function printResults() {
    const allBenefits = getAllBenefits();
    const benefitsHtml = results.map(r => {
      const b = allBenefits.find(x => x.id === r.benefit.id);
      if (!b) return '';
      const sc = r.status === 'PRZYSLUGUJE' ? 'status-pewne' : 'status-mozliwe';
      const st = r.status === 'PRZYSLUGUJE' ? 'PEWNE' : 'MOŻLIWE';
      return `<div class="benefit"><h2>${b.nazwa}</h2><span class="${sc}">${st}</span> <span class="kwota">${b.kwota}</span><h3>Dokumenty</h3><ul>${b.wniosek.dokumenty.map(d => `<li>${d}</li>`).join('')}</ul><h3>Kroki</h3><ol>${b.wniosek.kroki.map(k => `<li>${k}</li>`).join('')}</ol>${b.wniosek.pulapki.length > 0 ? `<h3>Uwagi</h3><ul>${b.wniosek.pulapki.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}<div class="source">Źródło: <a href="${b.zrodloUrl}">${b.zrodloNazwa}</a></div></div>`;
    }).join('');

    const html = `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"><title>Moje świadczenia</title><style>body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:20px 32px;color:#111;font-size:14px}h1{font-size:22px;margin-bottom:4px}.meta{font-size:12px;color:#666;margin-bottom:24px}.benefit{margin-bottom:32px;page-break-inside:avoid;border-top:1px solid #e0e0e0;padding-top:20px}h2{font-size:17px;margin:0 0 8px}h3{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#555;margin:12px 0 6px}ul,ol{margin:0;padding-left:20px;line-height:1.6}.status-pewne{display:inline-block;font-size:11px;font-weight:600;color:#2d6b2a;background:#e0f0db;padding:2px 10px;border-radius:99px}.status-mozliwe{display:inline-block;font-size:11px;font-weight:600;color:#a05a1a;background:#fdebd0;padding:2px 10px;border-radius:99px}.kwota{font-size:14px;font-weight:500;margin-left:8px}.source{font-size:11px;color:#999;margin-top:10px}.source a{color:#999}@media print{body{padding:0}}</style></head><body><h1>Moje świadczenia i ulgi</h1><div class="meta">wezmezadarmo.com | ${new Date().toLocaleDateString('pl-PL')} | ${results.length} świadczeń<br>Informacja orientacyjna, nie decyzja urzędowa.</div>${benefitsHtml}</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 400); }
  }

  const guideBenefit = guideBenefitId
    ? getAllBenefits().find((b) => b.id === guideBenefitId) ?? null
    : null;

  const pewne = results.filter((r) => r.status === 'PRZYSLUGUJE');
  const mozliwe = results.filter((r) => r.status === 'MOZLIWE');

  const filteredResults = filter === 'all' ? results
    : filter === 'pewne' ? pewne
    : mozliwe;

  const selectedResult = results.find(r => r.benefit.id === selectedId) ?? null;
  const selectedBenefit = selectedResult ? getAllBenefits().find(b => b.id === selectedResult.benefit.id) ?? null : null;

  // Group by category
  const groups = (() => {
    const seen: BenefitCategory[] = [];
    filteredResults.forEach(r => {
      if (!seen.includes(r.benefit.kategoria)) seen.push(r.benefit.kategoria);
    });
    return seen.map(cat => ({
      cat,
      items: filteredResults.filter(r => r.benefit.kategoria === cat),
    }));
  })();

  // ---- Chat panel (shared between desktop side panel and mobile fullscreen) ----
  function renderChatPanel(isPanel: boolean) {
    const focusedBenefit = chatFocusBenefitId
      ? results.find(r => r.benefit.id === chatFocusBenefitId)
      : null;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100%',
        background: 'var(--color-surface)',
        ...(isPanel ? {
          borderLeft: '1px solid var(--color-border)',
          width: 'min(360px, 35vw)',
          minWidth: 280,
          flexShrink: 0,
        } : {}),
      }}>
        {/* Chat header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-green)', flexShrink: 0 }} />
          <span className="mono" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-text-1)', flex: 1 }}>
            ASYSTENT AI
          </span>
          <button
            onClick={() => {
              if (isMobile) setMobileView('list');
              else setChatOpen(false);
            }}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', padding: 4, fontSize: 16, lineHeight: 1 }}
            title="Zamknij czat"
          >x</button>
        </div>

        {/* Focus context pill */}
        {focusedBenefit && (
          <div style={{
            margin: '8px 12px 0',
            padding: '6px 10px',
            background: 'var(--color-accent-soft)',
            border: '1px solid var(--color-accent)',
            borderRadius: 8,
            fontSize: 11, color: 'var(--color-accent)',
            fontFamily: 'var(--font-mono)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {focusedBenefit.benefit.nazwa}
            </span>
            <button
              onClick={() => setChatFocusBenefitId(null)}
              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: 0, fontSize: 13, opacity: 0.7 }}
            >x</button>
          </div>
        )}

        {/* Messages */}
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }} />
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 14px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(selectedBenefit
              ? [`Czy ${selectedBenefit.nazwa} mi przysługuje?`, 'Jakie dokumenty?', 'Jak złożyć wniosek?']
              : SUGGESTED_QUESTIONS
            ).map((q, i) => (
              <button key={i} onClick={() => submitMessage(q)} style={{
                padding: '6px 12px', fontSize: 12,
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 999, cursor: 'pointer',
                color: 'var(--color-text-2)',
                transition: 'all 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-2)'; }}
              >{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Zadaj pytanie..."
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1, height: 44, minHeight: 44, maxHeight: 120,
              padding: '11px 14px', borderRadius: 12,
              background: 'var(--color-bg-0)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-1)',
              fontSize: 14, fontFamily: 'var(--font-sans)',
              resize: 'none', overflowY: 'auto', lineHeight: 1.5,
              transition: 'border-color 200ms',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="btn btn-primary"
            style={{
              height: 44, padding: '0 16px',
              borderRadius: 12,
              opacity: (isStreaming || !input.trim()) ? 0.3 : 1,
              cursor: (isStreaming || !input.trim()) ? 'not-allowed' : 'pointer',
              flexShrink: 0, fontSize: 13,
            }}
          >Wyślij</button>
        </form>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* ---- HEADER BAR ---- */}
      {results.length > 0 && (
        <div style={{ padding: isMobile ? '0 12px' : '0 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>

          {/* Sources row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>Źródła:</span>
            {[
              { label: 'gov.pl', url: 'https://www.gov.pl/web/rodzina' },
              { label: 'zus.pl', url: 'https://www.zus.pl' },
              { label: 'nfz.gov.pl', url: 'https://www.nfz.gov.pl' },
              { label: 'podatki.gov.pl', url: 'https://www.podatki.gov.pl' },
              { label: 'pfron.org.pl', url: 'https://www.pfron.org.pl' },
              { label: 'praca.gov.pl', url: 'https://www.praca.gov.pl' },
              { label: 'krus.gov.pl', url: 'https://www.krus.gov.pl' },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize: 10, color: 'var(--color-accent)', textDecoration: 'none', letterSpacing: '0.02em' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >{s.label}</a>
            ))}
            <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-3)' }}>· baza zweryfikowana {new Date().getFullYear()}</span>
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 10px', flexWrap: 'wrap' }}>
            {[
              { id: 'all' as const, label: 'Wszystkie', count: results.length },
              { id: 'pewne' as const, label: 'Pewne', count: pewne.length },
              { id: 'mozliwe' as const, label: 'Możliwe', count: mozliwe.length },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className="mono" style={{
                background: filter === f.id ? 'var(--color-text-1)' : 'transparent',
                color: filter === f.id ? 'var(--color-bg-0)' : 'var(--color-text-3)',
                border: `1px solid ${filter === f.id ? 'var(--color-text-1)' : 'var(--color-border)'}`,
                padding: '6px 14px',
                fontSize: 11, fontWeight: 500,
                borderRadius: 999,
                cursor: 'pointer',
                transition: 'all 200ms',
                letterSpacing: '0.04em',
              }}>{f.label} · {f.count}</button>
            ))}

            <div style={{ flex: 1 }} />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {!isMobile && !chatOpen && (
                <button onClick={() => setChatOpen(true)} style={{
                  background: 'var(--color-accent)', border: 'none',
                  borderRadius: 8, padding: '6px 14px', fontSize: 12,
                  color: '#fff', cursor: 'pointer', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'opacity 200ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Czat AI
                </button>
              )}
              {isMobile && (
                <button onClick={() => setMobileView('chat')} style={{
                  background: 'var(--color-accent)', border: 'none',
                  borderRadius: 8, padding: '6px 14px', fontSize: 12,
                  color: '#fff', cursor: 'pointer', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Czat
                </button>
              )}
              <button onClick={downloadMd} title="Pobierz .md" className="mono" style={{
                background: 'transparent', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '6px 10px', fontSize: 11,
                color: 'var(--color-text-3)', cursor: 'pointer', letterSpacing: '0.04em',
                transition: 'all 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-3)'; }}
              >.MD</button>
              <button onClick={printResults} title="Drukuj / PDF" className="mono" style={{
                background: 'transparent', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '6px 10px', fontSize: 11,
                color: 'var(--color-text-3)', cursor: 'pointer', letterSpacing: '0.04em',
                transition: 'all 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-3)'; }}
              >PDF</button>
              {onClearHistory && (
                <button onClick={onClearHistory} title="Zacznij od nowa" style={{
                  background: 'transparent', border: '1px solid var(--color-border)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 12,
                  color: 'var(--color-text-3)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 200ms',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-2)'; e.currentTarget.style.color = 'var(--color-text-1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-3)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Od nowa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- MAIN CONTENT ---- */}

      {/* Full-screen guide mode */}
      {guideBenefitId && guideBenefit ? (
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 32, background: 'var(--color-surface)' }}>
          <StepByStepGuide benefit={guideBenefit} onClose={onCloseGuide} />
        </div>
      ) : results.length > 0 ? (
        /* 3-panel layout (desktop) or single view (mobile) */
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT: Sidebar list */}
          {(!isMobile || mobileView === 'list') && (
            <div className="no-scrollbar" style={{
              width: isMobile ? '100%' : 300,
              flexShrink: 0,
              overflowY: 'auto',
              borderRight: isMobile ? 'none' : '1px solid var(--color-border)',
              background: 'var(--color-surface)',
            }}>
              {groups.map(({ cat, items }) => (
                <div key={cat}>
                  {/* Category header */}
                  <div style={{
                    padding: '10px 16px 7px',
                    background: 'var(--color-bg-0)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', background: 'var(--color-border)', borderRadius: 999, padding: '1px 8px', fontWeight: 500 }}>
                      {items.length}
                    </span>
                  </div>
                  {/* Items */}
                  {items.map((r, idx) => {
                    const isSel = r.benefit.id === selectedId;
                    return (
                      <button key={r.benefit.id} onClick={() => {
                        setSelectedId(r.benefit.id);
                        if (isMobile) setMobileView('detail');
                      }} style={{
                        display: 'flex', alignItems: 'center', width: '100%',
                        padding: '12px 16px',
                        background: isSel && !isMobile ? 'var(--color-surface-2)' : 'transparent',
                        border: 'none',
                        borderBottom: idx < items.length - 1 ? '1px solid var(--color-border)' : 'none',
                        borderLeft: isSel && !isMobile ? '3px solid var(--color-accent)' : '3px solid transparent',
                        textAlign: 'left', cursor: 'pointer',
                        transition: 'background 150ms',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                            {r.benefit.nazwa}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{r.benefit.kwota}</div>
                        </div>
                        <span style={{
                          width: 8, height: 8, borderRadius: 999, flexShrink: 0, marginLeft: 10,
                          background: r.status === 'PRZYSLUGUJE' ? 'var(--color-green)' : '#d44',
                        }} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* CENTER: Detail panel */}
          {(!isMobile || mobileView === 'detail') && (
            <div ref={detailRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg-0)' }}>
              {isMobile && (
                <button onClick={() => setMobileView('list')} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none',
                  color: 'var(--color-accent)', fontSize: 13,
                  cursor: 'pointer', padding: '12px 20px',
                  fontFamily: 'var(--font-sans)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
                  Wróć do listy
                </button>
              )}
              {selectedResult && selectedBenefit ? (
                <div style={{ padding: isMobile ? '8px 20px 32px' : '32px 40px 48px', maxWidth: 780 }}>

                  {/* Tags row */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span className="mono" style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 999,
                      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-3)', letterSpacing: '0.04em',
                    }}>
                      {CATEGORY_LABELS[selectedBenefit.kategoria] ?? selectedBenefit.kategoria}
                    </span>
                    <span className="mono" style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 999,
                      background: selectedResult.status === 'PRZYSLUGUJE' ? 'var(--color-green-bg)' : 'var(--color-accent-soft)',
                      color: selectedResult.status === 'PRZYSLUGUJE' ? 'var(--color-green)' : 'var(--color-accent)',
                      fontWeight: 500, letterSpacing: '0.04em',
                    }}>
                      {selectedResult.status === 'PRZYSLUGUJE' ? 'pewne' : 'możliwe'}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 14px', fontWeight: 600 }}>
                    {selectedBenefit.nazwa}
                  </h2>

                  {/* Amount + deadline */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: isMobile ? 22 : 28, fontWeight: 500, color: 'var(--color-accent)', letterSpacing: '-0.02em' }}>
                      {selectedBenefit.kwota}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-3)' }}>
                      · {selectedBenefit.wniosek.terminRealizacji}
                    </span>
                  </div>

                  {/* Description */}
                  {selectedBenefit.opis && (
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text-2)', margin: '0 0 24px', maxWidth: 600 }}>
                      {selectedBenefit.opis}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
                    <button onClick={() => onGuide(selectedBenefit.id)} className="btn btn-primary" style={{
                      height: 44, padding: '0 22px', fontSize: 14,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      Pełny przewodnik
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </button>
                    <button onClick={() => openChatForBenefit(selectedBenefit.id)} style={{
                      height: 44, padding: '0 18px', fontSize: 14,
                      background: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10, cursor: 'pointer',
                      color: 'var(--color-text-2)',
                      fontFamily: 'var(--font-sans)',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'all 200ms',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-2)'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Zapytaj AI
                    </button>
                  </div>

                  {/* Dotted divider */}
                  <div style={{ borderTop: '2px dotted var(--color-border)', margin: '0 0 28px' }} />

                  {/* Detail blocks in 2-col grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '28px 32px' }}>
                    <DetailBlock title="Co potrzebujesz">
                      <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-2)' }}>
                        {selectedBenefit.wniosek.dokumenty.map((d, i) => (
                          <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                            <span style={{ color: 'var(--color-accent)', fontSize: 16, lineHeight: 1.5, flexShrink: 0 }}>&#x2022;</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </DetailBlock>

                    <DetailBlock title="Krok po kroku">
                      <ol style={{ paddingLeft: 0, margin: 0, listStyle: 'none', fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-2)', counterReset: 'step' }}>
                        {selectedBenefit.wniosek.kroki.map((k, i) => (
                          <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                            <span className="mono" style={{ color: 'var(--color-text-3)', fontSize: 13, minWidth: '1.4em', flexShrink: 0 }}>{i + 1}.</span>
                            {k}
                          </li>
                        ))}
                      </ol>
                    </DetailBlock>

                    <DetailBlock title="Gdzie złożyć">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selectedBenefit.wniosek.kanal.map(k => (
                          <span key={k} className="mono" style={{ fontSize: 11, padding: '5px 10px', borderRadius: 999, background: 'var(--color-surface)', border: '1px solid var(--color-border)', letterSpacing: '0.04em' }}>
                            {k.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                      {selectedBenefit.wniosek.formularz && (
                        <p className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 8, marginBottom: 0 }}>Formularz: {selectedBenefit.wniosek.formularz}</p>
                      )}
                    </DetailBlock>

                    <DetailBlock title="Co dalej">
                      <p style={{ fontSize: 14, color: 'var(--color-text-2)', margin: 0, lineHeight: 1.6 }}>{selectedBenefit.wniosek.odwolanie}</p>
                    </DetailBlock>
                  </div>

                  {/* Warnings */}
                  {selectedBenefit.wniosek.pulapki.length > 0 && (
                    <div style={{ marginTop: 28 }}>
                      <DetailBlock title="Na co uważać" tone="red">
                        <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', fontSize: 14, lineHeight: 1.7, color: 'var(--color-red)' }}>
                          {selectedBenefit.wniosek.pulapki.map((p, i) => (
                            <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 600, flexShrink: 0, fontSize: 14 }}>!</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </DetailBlock>
                    </div>
                  )}

                  {/* Matched criteria / warnings */}
                  {(selectedResult.matchedCriteria.length > 0 || selectedResult.warnings.length > 0) && (
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
                      {selectedResult.matchedCriteria.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--color-text-3)', marginBottom: 4 }}>
                          <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>[v]</span> {c}
                        </div>
                      ))}
                      {selectedResult.warnings.map((w, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--color-red)', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>!</span> {w}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Source */}
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-3)' }}>
                    Źródło: <a href={selectedBenefit.zrodloUrl} target="_blank" rel="noopener noreferrer" className="link-u" style={{ color: 'var(--color-accent)' }}>{selectedBenefit.zrodloNazwa}</a>
                    <span className="mono" style={{ marginLeft: 8, fontSize: 11 }}>{selectedBenefit.dataWeryfikacji}</span>
                  </div>
                </div>
              ) : (
                !isMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-3)', fontSize: 14 }}>
                    Wybierz świadczenie z listy
                  </div>
                )
              )}
            </div>
          )}

          {/* RIGHT: Chat panel (desktop only, toggled) */}
          {!isMobile && chatOpen && renderChatPanel(true)}

          {/* MOBILE: Chat fullscreen */}
          {isMobile && mobileView === 'chat' && (
            <div style={{ width: '100%', height: '100%' }}>
              {renderChatPanel(false)}
            </div>
          )}
        </div>
      ) : (
        /* No results -- chat only */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {renderChatPanel(false)}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        padding: isMobile ? '8px 12px' : '8px 24px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        fontSize: 11, color: 'var(--color-text-3)',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-0)',
        flexShrink: 0,
      }}>
        Informacja orientacyjna, nie decyzja urzędowa. Zweryfikuj na <a href="/o-projekcie" className="link-u" style={{ color: 'var(--color-accent)' }}>stronach źródłowych</a>. Odpowiedzi AI zgodnie z <a href="/regulamin" className="link-u" style={{ color: 'var(--color-accent)' }}>regulaminem</a>.
      </div>
    </div>
  );
}

function DetailBlock({ title, children, tone = 'primary' }: { title: string; children: React.ReactNode; tone?: string }) {
  return (
    <div>
      <div className="mono" style={{
        fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: tone === 'red' ? 'var(--color-red)' : 'var(--color-accent)',
        marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}
