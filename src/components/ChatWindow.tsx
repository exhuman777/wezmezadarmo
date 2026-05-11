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
      // When opening a guide, scroll to top so the guide header is visible
      // When closing a guide (guideBenefitId is null), also scroll to top
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [guideBenefitId, activeTab]);

  // Switch to chat tab only when a new user message appears (not during streaming)
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

  // When guide is open, switch to benefits tab
  useEffect(() => {
    if (guideBenefitId) setActiveTab('swiadczenia');
  }, [guideBenefitId]);

  const grouped = groupByCategory(results);
  const pewne = results.filter((r) => r.status === 'PRZYSLUGUJE');
  const możliwe = results.filter((r) => r.status === 'MOZLIWE');

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Tab bar */}
      {results.length > 0 && (
        <div className="flex items-center gap-1 px-3 sm:px-4 py-1.5 border-b border-border bg-bg-1 shrink-0">
          <button
            onClick={() => setActiveTab('swiadczenia')}
            className="px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-bold tracking-wide border-none cursor-pointer transition-all"
            style={activeTab === 'swiadczenia' ? {
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
              color: '#1a1208',
            } : {
              background: 'transparent',
              color: 'var(--color-text-3)',
            }}
          >
            Świadczenia
            {results.length > 0 && (
              <span
                className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: activeTab === 'swiadczenia' ? 'rgba(0,0,0,0.15)' : 'var(--color-green-bg)',
                  color: activeTab === 'swiadczenia' ? '#1a1208' : 'var(--color-green)',
                }}
              >
                {results.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('czat')}
            className="px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-bold tracking-wide border-none cursor-pointer transition-all"
            style={activeTab === 'czat' ? {
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
              color: '#1a1208',
            } : {
              background: 'transparent',
              color: 'var(--color-text-3)',
            }}
          >
            Czat AI
          </button>

          {/* Stats pills */}
          <span className="flex-1" />
          {pewne.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)' }}>
              {pewne.length} pewnych
            </span>
          )}
          {możliwe.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline" style={{ background: 'var(--color-amber-bg)', color: 'var(--color-accent)' }}>
              {możliwe.length} możliwych
            </span>
          )}
        </div>
      )}

      {/* Tab content: Świadczenia */}
      {activeTab === 'swiadczenia' && results.length > 0 && (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 min-h-0">
          {/* Guide view */}
          {guideBenefit ? (
            <StepByStepGuide benefit={guideBenefit} onClose={onCloseGuide} />
          ) : (
            <>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="mb-5">
                  <div className="text-[11px] sm:text-[12px] font-bold tracking-wider text-text-3 uppercase mb-2 px-1">
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
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 min-h-0 flex flex-col">
          <div className="flex-1" />
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
        className="flex gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-border bg-bg-1 shrink-0"
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
      <div
        className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] text-text-3 text-center border-t border-border bg-bg-0 shrink-0"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        Informacja orientacyjna, nie decyzja urzędowa. Zweryfikuj na stronach źródłowych.
      </div>
    </div>
  );
}
