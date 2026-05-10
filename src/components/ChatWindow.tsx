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
    <div className="flex flex-col h-full min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 min-h-0">
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
          <div className="mt-3 mb-4">
            <div className="text-[12px] sm:text-[13px] font-bold tracking-[2px] mb-3 uppercase text-accent">
              Dopasowane świadczenia ({results.length})
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
        className="flex gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-t border-border"
      >
        <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-bg-2 border border-border">
          <span className="font-bold text-[16px] text-accent">/</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Zadaj pytanie..."
            disabled={isStreaming}
            className="flex-1 bg-transparent border-none text-text-1 text-[14px] sm:text-[15px] outline-none placeholder:text-text-3 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-[13px] sm:text-[14px] font-bold tracking-[0.5px] transition-all disabled:opacity-30 cursor-pointer shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            color: '#fff',
          }}
        >
          Wyślij
        </button>
      </form>

      {/* Disclaimer */}
      <div className="px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] text-text-3 text-center border-t border-border bg-bg-1">
        Informacja orientacyjna, nie decyzja urzędowa. Zweryfikuj na stronach źródłowych.
      </div>
    </div>
  );
}
