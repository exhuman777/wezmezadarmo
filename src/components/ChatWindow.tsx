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

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}

        {/* Benefit cards */}
        {results.length > 0 && !guideBenefitId && (
          <div className="mt-2 mb-3">
            <div className="text-[10px] font-bold tracking-[1.5px] text-accent mb-2 uppercase">
              Dopasowane swiadczenia
            </div>
            {results.map((r) => (
              <BenefitCard key={r.benefit.id} result={r} onGuide={onGuide} />
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
        className="flex gap-2 px-4 py-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-md" style={{
          background: 'var(--color-bg-2)',
          border: '1px solid var(--color-border)',
        }}>
          <span className="text-accent font-bold text-[12px]">/</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Zadaj pytanie..."
            disabled={isStreaming}
            className="flex-1 bg-transparent border-none text-text-1 text-[12px] outline-none placeholder:text-text-3 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="px-4 py-2 rounded-md text-[11px] font-bold tracking-[0.5px] transition-all disabled:opacity-30"
          style={{
            background: 'linear-gradient(135deg, #f0a860, #ffb56b)',
            color: '#1a1208',
          }}
        >
          Wyslij
        </button>
      </form>

      {/* Disclaimer */}
      <div className="px-4 py-1.5 text-[9px] text-text-3 text-center" style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-1)',
      }}>
        Nie jestem urzednikiem -- to informacja orientacyjna, nie decyzja urzedowa.
        Zweryfikuj informacje na stronach zrodlowych.
      </div>
    </div>
  );
}
