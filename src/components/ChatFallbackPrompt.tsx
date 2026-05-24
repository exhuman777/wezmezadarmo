'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Detekcja "AI nie wie" -- gdy ostatnie 2+ assistant messages zawierają
 * frazy o braku danych. Wtedy pokazujemy CTA "Napisz do nas".
 */
const NOT_KNOWING_PATTERNS = [
  /nie mam zweryfikowanych danych/i,
  /nie mam danych/i,
  /nie wiem/i,
  /nie posiadam informacji/i,
  /skontaktuj się z\b/i,
  /sprawdź bezpośrednio/i,
  /nie znalazłem informacji/i,
];

function isNotKnowing(content: string): boolean {
  if (!content || content.length < 10) return false;
  return NOT_KNOWING_PATTERNS.some(p => p.test(content));
}

function detectStreak(messages: ChatMessage[]): number {
  let streak = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== 'assistant') continue;
    if (isNotKnowing(messages[i].content)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

interface Props {
  messages: ChatMessage[];
  /** Override threshold (default 2 = pokazuje po 2. "nie wiem" pod rząd) */
  threshold?: number;
  /** Custom context dla formularza (np. "agent panel", "kalkulator") */
  context?: string;
}

const DISMISS_KEY = 'wzd_chat_fallback_dismissed_v1';

export function ChatFallbackPrompt({ messages, threshold = 2, context = 'chat' }: Props) {
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (raw) {
      const ts = parseInt(raw, 10);
      // Reset dismissal after 24h
      if (Date.now() - ts < 24 * 60 * 60 * 1000) {
        setDismissedAt(ts);
      } else {
        window.localStorage.removeItem(DISMISS_KEY);
      }
    }
  }, []);

  const streak = detectStreak(messages);

  if (streak < threshold) return null;
  if (dismissedAt !== null) return null;

  function dismiss() {
    const now = Date.now();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, String(now));
    }
    setDismissedAt(now);
  }

  // Encode last 200 chars of last user question for prefill
  const lastUserQuestion = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const prefillSubject = encodeURIComponent(`Pomoc z czata: ${lastUserQuestion.slice(0, 100)}`);
  const contactHref = `/o-projekcie#kontakt?prefill=${prefillSubject}&from=${context}`;

  return (
    <div style={{
      margin: '12px 0',
      padding: '14px 18px',
      background: 'rgba(255, 176, 32, 0.08)',
      border: '1px solid rgba(255, 176, 32, 0.35)',
      borderLeft: '3px solid #FFB020',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: 'var(--color-text-1)',
          marginBottom: 4,
          letterSpacing: '-0.005em',
        }}>
          AI nie ma tej informacji w bazie
        </div>
        <p style={{
          fontSize: 12, color: 'var(--color-text-2)',
          margin: 0, lineHeight: 1.5,
        }}>
          Asystent kilka razy nie znalazł odpowiedzi. Napisz nam co potrzebujesz, dodamy do bazy.
          Średni czas odpowiedzi: 24h.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Link
          href={contactHref}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            background: 'var(--color-text-1)',
            color: 'var(--color-bg-0)',
            border: 'none', borderRadius: 8,
            fontSize: 12, fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Napisz do nas
        </Link>
        <button
          onClick={dismiss}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: 'var(--color-text-3)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 12, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Zamknij
        </button>
      </div>
    </div>
  );
}
