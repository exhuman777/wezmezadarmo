'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { BenefitCard } from './BenefitCard';
import { StepByStepGuide } from './StepByStepGuide';
import { MatchResult } from '@/engine/types';
import { getAllBenefits } from '@/engine/benefits';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  results: MatchResult[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onGuide: (benefitId: string) => void;
  guideBenefitId: string | null;
  onCloseGuide: () => void;
}

type Tab = 'list' | 'chat';

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
  SENIOR: 'Senior',
  POMOC_SPOLECZNA: 'Pomoc społeczna',
  EKOLOGIA: 'Ekologia',
};

export function ChatWindow({
  messages,
  results,
  isStreaming,
  onSendMessage,
  onGuide,
  guideBenefitId,
  onCloseGuide,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>(results.length > 0 ? 'list' : 'chat');
  const [filter, setFilter] = useState<'all' | 'pewne' | 'mozliwe'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(results.length > 0 ? results[0]?.benefit.id ?? null : null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    onSendMessage(text);
  }

  const guideBenefit = guideBenefitId
    ? getAllBenefits().find((b) => b.id === guideBenefitId) ?? null
    : null;

  useEffect(() => {
    if (guideBenefitId) {
      setActiveTab('list');
      setSelectedId(guideBenefitId);
    }
  }, [guideBenefitId]);

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px' }}>
            <div>
              <div className="label-eyebrow" style={{ marginBottom: 6 }}>WYNIK ANALIZY</div>
              <h2 style={{ fontSize: 24, letterSpacing: '-0.025em', fontWeight: 500 }}>
                Znaleźliśmy <span style={{ color: 'var(--color-accent)' }}>{results.length}</span> świadczeń dla Ciebie.
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 4 }}>Teoretycznie możesz skorzystać z co najmniej {results.length} świadczeń. Sprawdź dokładnie wymagania.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
            </div>
          </div>

          {/* Tabs + filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
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

      {/* Content: Split-panel benefits */}
      {activeTab === 'list' && results.length > 0 && (
        <div className={guideBenefitId ? '' : 'grid-split'} style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateColumns: guideBenefitId ? '1fr' : '360px 1fr',
          border: '1px solid var(--color-border)',
          borderTop: 'none',
          background: 'var(--color-surface)',
          overflow: 'hidden',
        }}>
          {/* Guide view (full width) */}
          {guideBenefitId && guideBenefit ? (
            <div className="no-scrollbar" style={{ overflowY: 'auto', padding: 32 }}>
              <StepByStepGuide benefit={guideBenefit} onClose={onCloseGuide} />
            </div>
          ) : (
            <>
              {/* LEFT: Sidebar list */}
              <div ref={listRef} className="no-scrollbar" style={{
                borderRight: '1px solid var(--color-border)',
                overflowY: 'auto',
              }}>
                {filteredResults.map((r, i) => {
                  const isSel = r.benefit.id === selectedId;
                  return (
                    <button key={r.benefit.id} onClick={() => setSelectedId(r.benefit.id)} style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '14px 20px',
                      background: isSel ? 'var(--color-surface-2)' : 'transparent',
                      border: 'none',
                      borderBottom: i === filteredResults.length - 1 ? 'none' : '1px solid var(--color-border)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 200ms',
                    }}>
                      {isSel && <span style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, background: 'var(--color-accent)', borderRadius: '0 3px 3px 0' }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-3)', letterSpacing: '0.04em' }}>{String(i + 1).padStart(2, '0')}</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.benefit.nazwa}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)', letterSpacing: '0.02em' }}>{r.benefit.kwota}</div>
                      </div>
                      <span style={{
                        width: 6, height: 6, borderRadius: 999, flexShrink: 0,
                        background: r.status === 'PRZYSLUGUJE' ? 'var(--color-green)' : 'var(--color-accent)',
                      }} />
                    </button>
                  );
                })}
              </div>

              {/* RIGHT: Detail */}
              <div className="no-scrollbar" style={{ overflowY: 'auto', padding: 32 }}>
                {selectedResult && selectedBenefit ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                      <div>
                        <div className="label-eyebrow" style={{ color: 'var(--color-accent)', marginBottom: 12 }}>JAK ZŁOŻYĆ WNIOSEK</div>
                        <h2 style={{ fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{selectedBenefit.nazwa}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
                          <div className="mono" style={{ fontSize: 18, color: 'var(--color-text-1)' }}>{selectedBenefit.kwota}</div>
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
                      <button onClick={() => onGuide(selectedBenefit.id)} className="btn btn-primary" style={{ height: 40, padding: '0 18px', fontSize: 13 }}>
                        Pełny przewodnik
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                      </button>
                    </div>

                    {/* Detail blocks in 2-col grid */}
                    <div className="grid-detail" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
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
                        <DetailBlock title="Na co uważać" span={2} tone="red">
                          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-red)' }}>
                            {selectedBenefit.wniosek.pulapki.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </DetailBlock>
                      )}
                      <DetailBlock title="Co dalej" span={2}>
                        <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>{selectedBenefit.wniosek.odwolanie}</p>
                      </DetailBlock>
                    </div>

                    {/* Matched criteria + warnings */}
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

                    {/* Source footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                        Źródło: <a href={selectedBenefit.zrodloUrl} target="_blank" rel="noopener noreferrer" className="link-u" style={{ color: 'var(--color-accent)' }}>{selectedBenefit.zrodloNazwa}</a>
                        <span className="mono" style={{ marginLeft: 8, fontSize: 11 }}>{selectedBenefit.dataWeryfikacji}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-3)', fontSize: 14 }}>
                    Wybierz świadczenie z listy
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content: Chat */}
      {(activeTab === 'chat' || results.length === 0) && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', gap: 8,
          padding: '12px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Zadaj pytanie o świadczenie..."
          disabled={isStreaming}
          style={{
            flex: 1,
            height: 48,
            padding: '0 18px',
            borderRadius: 14,
            background: 'var(--color-bg-0)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-1)',
            fontSize: 15,
            fontFamily: 'var(--font-sans)',
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
            height: 48, padding: '0 20px',
            borderRadius: 14,
            opacity: (isStreaming || !input.trim()) ? 0.3 : 1,
            cursor: (isStreaming || !input.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          Wyślij
        </button>
      </form>

      {/* Disclaimer */}
      <div style={{
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
