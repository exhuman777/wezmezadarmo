'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

const FORM_LABELS: Record<string, string> = {
  'zus-zas53': 'ZAS-53 Zasiłek chorobowy',
  'zus-z15a':  'Z-15A Zasiłek opiekuńczy (dziecko)',
  'zus-z15b':  'Z-15B Zasiłek opiekuńczy (dorosły)',
  'zus-pel':   'PEL Pełnomocnictwo ZUS',
  'zus-erpo':  'ERPO Emerytura',
  'zus-ersu':  'ERSU Mama 4+',
  'zus-z3':    'Z-3 Zaświadczenie płatnika',
};

const STARTER_HINTS: Record<string, string[]> = {
  'zus-zas53': ['Kto może złożyć ZAS-53?', 'Ile wynosi zasiłek chorobowy?', 'Jaki jest termin złożenia?'],
  'zus-z15a':  ['Ile dni zasiłku przysługuje?', 'Co wpisać w e-ZLA?', 'Czy drugi rodzic musi podpisać?'],
  'zus-z15b':  ['Kto jest członkiem rodziny wg ZUS?', 'Ile dni zasiłku?', 'Co oznacza wspólne gospodarstwo?'],
  'zus-pel':   ['Kto może być pełnomocnikiem?', 'Jak złożyć pełnomocnictwo?', 'Jak odwołać pełnomocnictwo?'],
  'zus-erpo':  ['Kiedy mogę przejść na emeryturę?', 'Co to jest emerytura kapitałowa?', 'Jakie dokumenty potrzebuję?'],
  'zus-ersu':  ['Komu przysługuje Mama 4+?', 'Ile wynosi świadczenie?', 'Kiedy ojciec może ubiegać się o Tata 4+?'],
  'zus-z3':    ['Kto wystawia Z-3?', 'Kiedy potrzebne jest Z-3?', 'Jakie wynagrodzenie wpisać?'],
};

interface Props {
  formType: string;
}

export function FormChatWidget({ formType }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formLabel = FORM_LABELS[formType] ?? formType;
  const hints = STARTER_HINTS[formType] ?? [];

  useEffect(() => {
    if (open && messages.length === 0) {
      // welcome message
      setMessages([{
        role: 'assistant',
        content: `Cześć! Jestem asystentem do formularza ${formLabel}. Zadaj mi pytanie. Odpowiem konkretnie.`,
      }]);
    }
  }, [open, formLabel, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  async function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: userText };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '', streaming: true };
    setMessages([...history, assistantMsg]);

    try {
      const res = await fetch('/api/form-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          messages: history
            .filter(m => !m.streaming)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error('API error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated, streaming: true };
          return updated;
        });
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: accumulated };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Przepraszam, coś poszło nie tak. Spróbuj ponownie.' };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 56, right: 0,
          width: 340, maxHeight: 480,
          background: '#0A120A',
          border: '1px solid #243024',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #243024',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#2E7D4F', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Asystent AI
              </div>
              <div style={{ fontSize: 10, color: '#7A907A', marginTop: 2 }}>{formLabel}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#7A907A', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}
              aria-label="Zamknij"
            >
              x
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <div style={{
                  fontSize: 12, lineHeight: 1.55,
                  padding: '8px 11px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? '#2E7D4F' : '#121A12',
                  color: m.role === 'user' ? '#0A120A' : '#C2D4C2',
                  border: m.role === 'assistant' ? '1px solid #243024' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                  {m.streaming && <span style={{ opacity: 0.5 }}> |</span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Hint chips (show only at start) */}
          {messages.length <= 1 && hints.length > 0 && (
            <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {hints.map(h => (
                <button
                  key={h}
                  onClick={() => send(h)}
                  style={{
                    background: 'none', border: '1px solid #243024', borderRadius: 20,
                    color: '#7A907A', fontSize: 10, cursor: 'pointer', padding: '4px 10px',
                    fontFamily: 'inherit',
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #243024', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder="Zadaj pytanie..."
              style={{
                flex: 1, background: '#121A12', border: '1px solid #243024', borderRadius: 8,
                color: '#C2D4C2', fontSize: 12, padding: '7px 10px', fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: '#2E7D4F', border: 'none', borderRadius: 8,
                color: '#0A120A', fontSize: 12, fontWeight: 700,
                padding: '7px 12px', cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit', opacity: (!input.trim() || loading) ? 0.5 : 1,
              }}
            >
              {loading ? '...' : 'Wyślij'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? '#243024' : '#2E7D4F',
          border: `1px solid ${open ? '#2E7D4F' : '#2E7D4F'}`,
          borderRadius: 24,
          color: open ? '#2E7D4F' : '#0A120A',
          fontSize: 12, fontWeight: 700,
          padding: '10px 18px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 8,
          whiteSpace: 'nowrap',
        }}
        aria-label={open ? 'Zamknij asystenta' : 'Otwórz asystenta AI'}
      >
        <span style={{ fontSize: 14 }}>{open ? 'x' : '?'}</span>
        {open ? 'Zamknij' : 'Pomoc AI'}
      </button>
    </div>
  );
}
