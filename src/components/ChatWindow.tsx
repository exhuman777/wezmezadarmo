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

type Tab = 'swiadczenia' | 'czat';

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

function groupByCategory(results: MatchResult[]) {
  const groups: Record<string, MatchResult[]> = {};
  for (const r of results) {
    const cat = r.benefit.kategoria;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  }
  for (const cat of Object.keys(groups)) {
    groups[cat].sort((a, b) => {
      const order = { PRZYSLUGUJE: 0, MOZLIWE: 1, NIE_PRZYSLUGUJE: 2 };
      return order[a.status] - order[b.status];
    });
  }
  return groups;
}

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
  const [activeTab, setActiveTab] = useState<Tab>(results.length > 0 ? 'swiadczenia' : 'czat');
  const [filter, setFilter] = useState<'all' | 'pewne' | 'mozliwe'>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'czat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab === 'swiadczenia' && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [guideBenefitId, activeTab]);

  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    const hasNewUserMsg = messages.length > prevMsgCount.current &&
      messages[messages.length - 2]?.role === 'user';
    if (hasNewUserMsg) {
      setActiveTab('czat');
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
    if (guideBenefitId) setActiveTab('swiadczenia');
  }, [guideBenefitId]);

  const grouped = groupByCategory(results);
  const pewne = results.filter((r) => r.status === 'PRZYSLUGUJE');
  const mozliwe = results.filter((r) => r.status === 'MOZLIWE');

  const filteredResults = filter === 'all' ? results
    : filter === 'pewne' ? pewne
    : mozliwe;

  const filteredGrouped = groupByCategory(filteredResults);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Tab bar */}
      {results.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          padding: '0 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          flexShrink: 0,
        }}>
          {[
            { id: 'swiadczenia' as Tab, label: 'Świadczenia', count: results.length },
            { id: 'czat' as Tab, label: 'Czat AI', count: null },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
              background: 'none', border: 'none',
              padding: '14px 0',
              borderBottom: `2px solid ${activeTab === item.id ? 'var(--color-text-1)' : 'transparent'}`,
              color: activeTab === item.id ? 'var(--color-text-1)' : 'var(--color-text-3)',
              fontSize: 14, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: -1,
              cursor: 'pointer',
              transition: 'color 200ms',
            }}>
              {item.label}
              {item.count != null && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{item.count}</span>
              )}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Filter pills */}
          {activeTab === 'swiadczenia' && (
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'all' as const, label: 'Wszystkie' },
                { id: 'pewne' as const, label: `Pewne (${pewne.length})` },
                { id: 'mozliwe' as const, label: `Możliwe (${mozliwe.length})` },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} className="mono" style={{
                  background: filter === f.id ? 'var(--color-text-1)' : 'transparent',
                  color: filter === f.id ? 'var(--color-bg-0)' : 'var(--color-text-3)',
                  border: '1px solid var(--color-border)',
                  borderColor: filter === f.id ? 'var(--color-text-1)' : 'var(--color-border)',
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

          {/* Stats chips */}
          {activeTab !== 'swiadczenia' && (
            <div style={{ display: 'flex', gap: 6 }}>
              {pewne.length > 0 && (
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 500, padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--color-green-bg)', color: 'var(--color-green)',
                  letterSpacing: '0.04em',
                }}>
                  {pewne.length} pewnych
                </span>
              )}
              {mozliwe.length > 0 && (
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 500, padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--color-accent-soft)', color: 'var(--color-accent)',
                  letterSpacing: '0.04em',
                }}>
                  {mozliwe.length} możliwych
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab content: Świadczenia */}
      {activeTab === 'swiadczenia' && results.length > 0 && (
        <div ref={scrollContainerRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', minHeight: 0 }}>
          {guideBenefit ? (
            <StepByStepGuide benefit={guideBenefit} onClose={onCloseGuide} />
          ) : (
            <>
              {Object.entries(filteredGrouped).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: 24 }}>
                  <div className="label-eyebrow" style={{ marginBottom: 10, paddingLeft: 4 }}>
                    {CATEGORY_LABELS[cat] || cat}
                  </div>
                  {items.map((r) => (
                    <BenefitCard key={r.benefit.id} result={r} onGuide={onGuide} />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Tab content: Czat */}
      {(activeTab === 'czat' || results.length === 0) && (
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
          ref={inputRef}
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
        Wyniki dopasowane algorytmem + zweryfikowane przez AI. Informacja orientacyjna, nie decyzja urzędowa. Zawsze zweryfikuj na stronach źródłowych.
      </div>
    </div>
  );
}
