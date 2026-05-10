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
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, results, guideBenefitId]);

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

  const grouped = groupByCategory(results);
  const pewne = results.filter((r) => r.status === 'PRZYSLUGUJE');
  const możliwe = results.filter((r) => r.status === 'MOZLIWE');

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}

        {/* Benefit cards grouped by category */}
        {results.length > 0 && !guideBenefitId && (
          <div className="mt-2 mb-4">
            {/* Summary bar */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="text-[14px] sm:text-[15px] font-semibold text-text-1">
                {results.length} świadczeń
              </div>
              {pewne.length > 0 && (
                <span className="text-[12px] sm:text-[13px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)' }}>
                  {pewne.length} pewnych
                </span>
              )}
              {możliwe.length > 0 && (
                <span className="text-[12px] sm:text-[13px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-amber-bg)', color: 'var(--color-accent)' }}>
                  {możliwe.length} możliwych
                </span>
              )}
            </div>

            {/* Grouped cards */}
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <div className="text-[12px] sm:text-[13px] font-semibold tracking-wide text-text-3 uppercase mb-2 px-1">
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                {items.map((r) => (
                  <BenefitCard key={r.benefit.id} result={r} onGuide={onGuide} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Step by step guide */}
        {guideBenefit && (
          <StepByStepGuide benefit={guideBenefit} onClose={onCloseGuide} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-border bg-bg-1"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Zadaj pytanie o świadczenie..."
          disabled={isStreaming}
          className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-bg-2 border border-border text-text-1 text-[15px] outline-none placeholder:text-text-3 disabled:opacity-50 focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[14px] font-semibold transition-all disabled:opacity-25 cursor-pointer shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            color: '#fff',
          }}
        >
          Wyślij
        </button>
      </form>

      {/* Disclaimer */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] text-text-3 text-center border-t border-border bg-bg-0">
        Informacja orientacyjna, nie decyzja urzędowa. Zweryfikuj na stronach źródłowych.
      </div>
    </div>
  );
}
