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

type Tab = 'list' | 'chat';

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
  const [activeTab, setActiveTab] = useState<Tab>(results.length > 0 ? 'list' : 'chat');
  const [filter, setFilter] = useState<'all' | 'pewne' | 'mozliwe'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(results.length > 0 ? results[0]?.benefit.id ?? null : null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [chatFocusBenefitId, setChatFocusBenefitId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 720);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    const hasNewUserMsg = messages.length > prevMsgCount.current &&
      messages[messages.length - 2]?.role === 'user';
    if (hasNewUserMsg) {
      setActiveTab('chat');
    }
    prevMsgCount.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (guideBenefitId) {
      setActiveTab('list');
      setSelectedId(guideBenefitId);
    }
  }, [guideBenefitId]);

  useEffect(() => {
    if (activeTab === 'list') {
      setMobileShowDetail(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (mobileShowDetail && detailRef.current) {
      detailRef.current.scrollTop = 0;
    }
  }, [mobileShowDetail, selectedId]);

  function resetTextareaHeight() {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = input.trim();
      if (!text || isStreaming) return;
      setInput('');
      resetTextareaHeight();
      onSendMessage(text, chatFocusBenefitId);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    resetTextareaHeight();
    onSendMessage(text, chatFocusBenefitId);
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
      lines.push('');
      lines.push(`## ${b.nazwa}`);
      lines.push('');
      lines.push(`**Status:** ${r.status === 'PRZYSLUGUJE' ? 'Pewne (przysługuje)' : 'Możliwe (do weryfikacji)'}`);
      lines.push(`**Kwota:** ${b.kwota}`);
      lines.push(`**Termin realizacji:** ${b.wniosek.terminRealizacji}`);
      if (b.wniosek.formularz) {
        lines.push(`**Formularz:** ${b.wniosek.formularz}`);
      }
      lines.push('');
      lines.push('### Wymagane dokumenty');
      b.wniosek.dokumenty.forEach(d => lines.push(`- ${d}`));
      lines.push('');
      lines.push('### Jak złożyć wniosek');
      b.wniosek.kroki.forEach((k, i) => lines.push(`${i + 1}. ${k}`));
      if (b.wniosek.pulapki.length > 0) {
        lines.push('');
        lines.push('### Na co uważać');
        b.wniosek.pulapki.forEach(p => lines.push(`- ${p}`));
      }
      if (r.matchedCriteria.length > 0) {
        lines.push('');
        lines.push('### Spełnione kryteria');
        r.matchedCriteria.forEach(c => lines.push(`- [x] ${c}`));
      }
      lines.push('');
      lines.push(`**Źródło:** [${b.zrodloNazwa}](${b.zrodloUrl})`);
      lines.push('');
      lines.push('---');
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
      const statusClass = r.status === 'PRZYSLUGUJE' ? 'status-pewne' : 'status-mozliwe';
      const statusText = r.status === 'PRZYSLUGUJE' ? 'PEWNE' : 'MOŻLIWE';
      return `<div class="benefit">
<h2>${b.nazwa}</h2>
<span class="${statusClass}">${statusText}</span> <span class="kwota">${b.kwota}</span>
<h3>Wymagane dokumenty</h3>
<ul>${b.wniosek.dokumenty.map(d => `<li>${d}</li>`).join('')}</ul>
<h3>Jak złożyć wniosek</h3>
<ol>${b.wniosek.kroki.map(k => `<li>${k}</li>`).join('')}</ol>
${b.wniosek.pulapki.length > 0 ? `<h3>Na co uważać</h3><ul>${b.wniosek.pulapki.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
<div class="source">Źródło: <a href="${b.zrodloUrl}">${b.zrodloNazwa}</a> &mdash; zweryfikowano: ${b.dataWeryfikacji}</div>
</div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>Moje świadczenia - wezmezadarmo.com</title>
<style>
body{font-family:system-ui,sans-serif;max-width:820px;margin:0 auto;padding:20px 32px;color:#111;font-size:14px}
h1{font-size:22px;margin-bottom:4px}
.meta{font-size:12px;color:#666;margin-bottom:24px}
.benefit{margin-bottom:32px;page-break-inside:avoid;border-top:1px solid #e0e0e0;padding-top:20px}
h2{font-size:17px;margin:0 0 8px}
h3{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#555;margin:12px 0 6px}
ul,ol{margin:0;padding-left:20px;line-height:1.6}
.status-pewne{display:inline-block;font-size:11px;font-weight:600;color:#2d6b2a;background:#e0f0db;padding:2px 10px;border-radius:99px}
.status-mozliwe{display:inline-block;font-size:11px;font-weight:600;color:#a05a1a;background:#fdebd0;padding:2px 10px;border-radius:99px}
.kwota{font-size:14px;font-weight:500;margin-left:8px}
.source{font-size:11px;color:#999;margin-top:10px}
.source a{color:#999}
@media print{body{padding:0}h1{font-size:18px}}
</style>
</head>
<body>
<h1>Moje świadczenia i ulgi</h1>
<div class="meta">wezmezadarmo.com &mdash; ${new Date().toLocaleDateString('pl-PL')} &mdash; Łącznie: ${results.length} świadczeń<br>Informacja orientacyjna, nie decyzja urzędowa. Zweryfikuj na stronach źródłowych przed złożeniem wniosku.</div>
${benefitsHtml}
</body></html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 400);
    }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Header bar */}
      {results.length > 0 && (
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
          {/* Summary row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="label-eyebrow" style={{ marginBottom: 6 }}>WYNIK ANALIZY</div>
              <h2 style={{ fontSize: isMobile ? 18 : 24, letterSpacing: '-0.025em', fontWeight: 500 }}>
                Znaleźliśmy <span style={{ color: 'var(--color-accent)' }}>{results.length}</span> świadczeń dla Ciebie.
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {pewne.length > 0 && (
                <span className="mono" style={{ fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 999, background: 'var(--color-green-bg)', color: 'var(--color-green)', letterSpacing: '0.04em' }}>
                  {pewne.length} PEWNYCH
                </span>
              )}
              {mozliwe.length > 0 && (
                <span className="mono" style={{ fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 999, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', letterSpacing: '0.04em' }}>
                  {mozliwe.length} MOŻLIWYCH
                </span>
              )}
              <button onClick={downloadMd} title="Pobierz jako Markdown" style={{
                background: 'transparent', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '5px 10px', fontSize: 11,
                color: 'var(--color-text-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', transition: 'all 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-3)'; }}
              >.MD</button>
              <button onClick={printResults} title="Drukuj / Zapisz jako PDF" style={{
                background: 'transparent', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '5px 10px', fontSize: 11,
                color: 'var(--color-text-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em', transition: 'all 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-3)'; }}
              >PDF</button>
              {onClearHistory && (
                <button onClick={onClearHistory} title="Zacznij od nowa" style={{
                  background: 'transparent', border: '1px solid var(--color-border)',
                  borderRadius: 8, padding: '5px 12px', fontSize: 12,
                  color: 'var(--color-text-2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 200ms',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-2)'; e.currentTarget.style.color = 'var(--color-text-1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-2)'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Zacznij od nowa
                </button>
              )}
            </div>
          </div>

          {/* Źródła danych */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 10, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>Źródła:</span>
            {[
              { label: 'gov.pl', url: 'https://www.gov.pl/web/rodzina' },
              { label: 'zus.pl', url: 'https://www.zus.pl' },
              { label: 'nfz.gov.pl', url: 'https://www.nfz.gov.pl' },
              { label: 'podatki.gov.pl', url: 'https://www.podatki.gov.pl' },
              { label: 'pfron.org.pl', url: 'https://www.pfron.org.pl' },
              { label: 'praca.gov.pl', url: 'https://www.praca.gov.pl' },
              { label: 'krus.gov.pl', url: 'https://www.krus.gov.pl' },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', textDecoration: 'none', letterSpacing: '0.02em' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >{s.label}</a>
            ))}
            <span style={{ fontSize: 10, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>· baza ręcznie zweryfikowana {new Date().getFullYear()}</span>
          </div>

          {/* Tabs + filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
            {[
              { id: 'list' as Tab, label: 'Świadczenia', count: results.length },
              { id: 'chat' as Tab, label: 'Czat AI', count: null },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                background: 'none', border: 'none',
                padding: '12px 0',
                borderBottom: `2px solid ${activeTab === item.id ? 'var(--color-text-1)' : 'transparent'}`,
                color: activeTab === item.id ? 'var(--color-text-1)' : 'var(--color-text-3)',
                fontSize: 14, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                marginBottom: -1,
                cursor: 'pointer',
                transition: 'color 200ms',
              }}>
                {item.label}
                {item.count != null && <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{item.count}</span>}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            {activeTab === 'list' && (
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'all' as const, label: 'Wszystkie' },
                  { id: 'pewne' as const, label: 'Pewne' },
                  { id: 'mozliwe' as const, label: 'Możliwe' },
                ].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} className="mono" style={{
                    background: filter === f.id ? 'var(--color-text-1)' : 'transparent',
                    color: filter === f.id ? 'var(--color-bg-0)' : 'var(--color-text-3)',
                    border: `1px solid ${filter === f.id ? 'var(--color-text-1)' : 'var(--color-border)'}`,
                    padding: '5px 12px',
                    fontSize: 11, fontWeight: 500,
                    borderRadius: 999,
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    letterSpacing: '0.04em',
                  }}>{f.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content: Split-panel (desktop) lub single-panel (mobile) */}
      {activeTab === 'list' && results.length > 0 && (
        <div style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateColumns: guideBenefitId ? '1fr' : (isMobile ? '1fr' : '360px 1fr'),
          border: '1px solid var(--color-border)',
          borderTop: 'none',
          background: 'var(--color-surface)',
          overflow: 'hidden',
        }}>
          {/* Pełny przewodnik (full width) */}
          {guideBenefitId && guideBenefit ? (
            <div className="no-scrollbar" style={{ overflowY: 'auto', padding: isMobile ? 16 : 32 }}>
              <StepByStepGuide benefit={guideBenefit} onClose={onCloseGuide} />
            </div>
          ) : (
            <>
              {/* LEWA: lista -- ukryta na mobile gdy widoczny szczegół */}
              {(!isMobile || !mobileShowDetail) && (
                <div ref={listRef} className="no-scrollbar" style={{
                  borderRight: isMobile ? 'none' : '1px solid var(--color-border)',
                  overflowY: 'auto',
                }}>
                  {(() => {
                    // Group by category, preserving order of first appearance
                    const seen: BenefitCategory[] = [];
                    filteredResults.forEach(r => {
                      if (!seen.includes(r.benefit.kategoria)) seen.push(r.benefit.kategoria);
                    });
                    const groups = seen.map(cat => ({
                      cat,
                      items: filteredResults.filter(r => r.benefit.kategoria === cat),
                    }));

                    let globalIdx = 0;
                    return groups.map(({ cat, items }) => (
                      <div key={cat}>
                        {/* Category header */}
                        <div style={{
                          padding: '10px 20px 6px',
                          background: 'var(--color-surface-2)',
                          borderBottom: '1px solid var(--color-border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-3)',
                          }}>{CATEGORY_LABELS[cat] ?? cat}</span>
                          <span style={{
                            fontSize: 11,
                            color: 'var(--color-text-3)',
                            background: 'var(--color-border)',
                            borderRadius: 999,
                            padding: '1px 7px',
                            fontWeight: 500,
                          }}>{items.length}</span>
                        </div>
                        {/* Items */}
                        {items.map((r, itemIdx) => {
                          const idx = globalIdx++;
                          const isSel = r.benefit.id === selectedId;
                          const isLast = itemIdx === items.length - 1;
                          return (
                            <button key={r.benefit.id} onClick={() => {
                              setSelectedId(r.benefit.id);
                              if (isMobile) setMobileShowDetail(true);
                            }} style={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              padding: isMobile ? '14px 16px' : '13px 20px',
                              background: isSel && !isMobile ? 'var(--color-surface-2)' : 'transparent',
                              border: 'none',
                              borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                              textAlign: 'left',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'background 200ms',
                            }}>
                              {isSel && !isMobile && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, background: 'var(--color-accent)', borderRadius: '0 3px 3px 0' }} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                                  {r.benefit.nazwa}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--color-text-3)' }}>{r.benefit.kwota}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingLeft: 8 }}>
                                <span style={{
                                  width: 7, height: 7, borderRadius: 999,
                                  background: r.status === 'PRZYSLUGUJE' ? 'var(--color-green)' : 'var(--color-accent)',
                                }} />
                                {isMobile && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-3)" strokeWidth="1.6"><path d="M9 18l6-6-6-6"/></svg>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ));
                  })()}
                </div>
              )}

              {/* PRAWA: szczegół -- na mobile tylko gdy mobileShowDetail */}
              {(!isMobile || mobileShowDetail) && (
                <div ref={detailRef} className="no-scrollbar" style={{ overflowY: 'auto', padding: isMobile ? '16px 16px' : 32, paddingBottom: isMobile ? 'max(32px, env(safe-area-inset-bottom))' : 32 }}>
                  {isMobile && (
                    <button onClick={() => setMobileShowDetail(false)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'none', border: 'none',
                      color: 'var(--color-accent)', fontSize: 14,
                      cursor: 'pointer', padding: '0 0 16px',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
                      Wróć do listy
                    </button>
                  )}
                  {selectedResult && selectedBenefit ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                          <div className="label-eyebrow" style={{ color: 'var(--color-accent)', marginBottom: 12 }}>JAK ZŁOŻYĆ WNIOSEK</div>
                          <h2 style={{ fontSize: isMobile ? 22 : 32, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{selectedBenefit.nazwa}</h2>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
                            <div className="mono" style={{ fontSize: isMobile ? 15 : 18, color: 'var(--color-text-1)' }}>{selectedBenefit.kwota}</div>
                            <span style={{ width: 4, height: 4, background: 'var(--color-muted-2)', borderRadius: 999 }} />
                            <span className="mono" style={{
                              fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 999,
                              background: selectedResult.status === 'PRZYSLUGUJE' ? 'var(--color-green-bg)' : 'var(--color-accent-soft)',
                              color: selectedResult.status === 'PRZYSLUGUJE' ? 'var(--color-green)' : 'var(--color-accent)',
                              letterSpacing: '0.04em',
                            }}>
                              {selectedResult.status === 'PRZYSLUGUJE' ? 'PEWNE' : 'MOŻLIWE'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => {
                            setChatFocusBenefitId(selectedBenefit.id);
                            setActiveTab('chat');
                          }} style={{
                            height: 40, padding: '0 14px', fontSize: 13,
                            background: 'var(--color-surface-2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 10, cursor: 'pointer',
                            color: 'var(--color-text-2)',
                            fontFamily: 'var(--font-sans)',
                            display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 200ms',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-2)'; }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Zapytaj AI
                          </button>
                          <button onClick={() => onGuide(selectedBenefit.id)} className="btn btn-primary" style={{ height: 40, padding: '0 18px', fontSize: 13 }}>
                            Pełny przewodnik
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                        <DetailBlock title="Co potrzebujesz">
                          <ol style={{ paddingLeft: 18, margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-2)' }}>
                            {selectedBenefit.wniosek.dokumenty.map((d, i) => <li key={i}>{d}</li>)}
                          </ol>
                        </DetailBlock>
                        <DetailBlock title="Gdzie złożyć">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {selectedBenefit.wniosek.kanal.map(k => (
                              <span key={k} className="mono" style={{ fontSize: 11, padding: '5px 10px', borderRadius: 999, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', letterSpacing: '0.04em' }}>
                                {k.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                          {selectedBenefit.wniosek.formularz && (
                            <p className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 8 }}>Formularz: {selectedBenefit.wniosek.formularz}</p>
                          )}
                        </DetailBlock>
                        <DetailBlock title="Krok po kroku">
                          <ol style={{ paddingLeft: 18, margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-2)' }}>
                            {selectedBenefit.wniosek.kroki.map((k, i) => <li key={i}>{k}</li>)}
                          </ol>
                        </DetailBlock>
                        <DetailBlock title="Termin realizacji">
                          <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>{selectedBenefit.wniosek.terminRealizacji}</p>
                        </DetailBlock>
                        {selectedBenefit.wniosek.pulapki.length > 0 && (
                          <DetailBlock title="Na co uważać" span={isMobile ? 1 : 2} tone="red">
                            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-red)' }}>
                              {selectedBenefit.wniosek.pulapki.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </DetailBlock>
                        )}
                        <DetailBlock title="Co dalej" span={isMobile ? 1 : 2}>
                          <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>{selectedBenefit.wniosek.odwolanie}</p>
                        </DetailBlock>
                      </div>

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

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                          Źródło: <a href={selectedBenefit.zrodloUrl} target="_blank" rel="noopener noreferrer" className="link-u" style={{ color: 'var(--color-accent)' }}>{selectedBenefit.zrodloNazwa}</a>
                          <span className="mono" style={{ marginLeft: 8, fontSize: 11 }}>{selectedBenefit.dataWeryfikacji}</span>
                        </span>
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
            </>
          )}
        </div>
      )}

      {/* Content: Chat */}
      {(activeTab === 'chat' || results.length === 0) && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 8,
            background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
            marginBottom: 16, flexShrink: 0, flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>
              Historia czatu przechowywana lokalnie w przeglądarce (localStorage), nie wysyłamy jej na serwer.
            </span>
            {onClearHistory && (
              <button onClick={onClearHistory} style={{
                background: 'none', border: 'none',
                fontSize: 11, color: 'var(--color-text-3)',
                cursor: 'pointer', padding: '2px 0',
                textDecoration: 'underline', fontFamily: 'var(--font-mono)',
                transition: 'color 200ms',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-3)'}
              >
                Zacznij od nowa
              </button>
            )}
          </div>
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
      )}

      {/* Input bar -- hidden on mobile when viewing benefit detail */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: isMobile && mobileShowDetail ? 'none' : 'flex', flexDirection: 'column', gap: 8,
          padding: '12px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          flexShrink: 0,
        }}
      >
        {chatFocusBenefitId && (() => {
          const focused = results.find(r => r.benefit.id === chatFocusBenefitId);
          if (!focused) return null;
          return (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px',
              background: 'var(--color-accent-soft)',
              border: '1px solid var(--color-accent)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-mono)',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Kontekst: {focused.benefit.nazwa}
              </span>
              <button
                type="button"
                onClick={() => setChatFocusBenefitId(null)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--color-accent)', cursor: 'pointer',
                  padding: 0, lineHeight: 1, flexShrink: 0,
                  opacity: 0.7, fontSize: 14,
                }}
                title="Usuń kontekst"
              >x</button>
            </div>
          );
        })()}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Zadaj pytanie... (Shift+Enter = nowa linia)"
          disabled={isStreaming}
          rows={1}
          style={{
            flex: 1,
            height: 48,
            minHeight: 48,
            maxHeight: 120,
            padding: '13px 18px',
            borderRadius: 14,
            background: 'var(--color-bg-0)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-1)',
            fontSize: 15,
            fontFamily: 'var(--font-sans)',
            transition: 'border-color 200ms',
            resize: 'none',
            overflowY: 'auto',
            lineHeight: 1.5,
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="btn btn-primary"
          style={{
            height: 48, padding: '0 20px',
            borderRadius: 14,
            opacity: (isStreaming || !input.trim()) ? 0.3 : 1,
            cursor: (isStreaming || !input.trim()) ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          Wyślij
        </button>
        </div>
      </form>

      {/* Disclaimer -- hidden on mobile when viewing benefit detail */}
      <div style={{
        display: isMobile && mobileShowDetail ? 'none' : 'block',
        padding: '8px 24px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        fontSize: 11, color: 'var(--color-text-3)',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-0)',
        flexShrink: 0,
      }}>
        Informacja orientacyjna, nie decyzja urzędowa. Zweryfikuj na <a href="/o-projekcie" className="link-u" style={{ color: 'var(--color-accent)' }}>stronach źródłowych</a>. Odpowiedzi AI generowane przez model językowy zgodnie z <a href="/regulamin" className="link-u" style={{ color: 'var(--color-accent)' }}>regulaminem</a>.
      </div>
    </div>
  );
}

function DetailBlock({ title, children, span = 1, tone = 'primary' }: { title: string; children: React.ReactNode; span?: number; tone?: string }) {
  return (
    <div style={{ gridColumn: `span ${span}`, paddingBottom: 18, borderBottom: '1px solid var(--color-border)' }}>
      <div className="label-eyebrow" style={{ color: tone === 'red' ? 'var(--color-red)' : 'var(--color-accent)', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
