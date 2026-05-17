'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

const FORM_LABELS: Record<string, string> = {
  'zus-zas53': 'ZAS-53 Zasilek chorobowy',
  'zus-z15a':  'Z-15A Zasilek opiekunczy (dziecko)',
  'zus-z15b':  'Z-15B Zasilek opiekunczy (dorosly)',
  'zus-pel':   'PEL Pelnomocnictwo ZUS',
  'zus-erpo':  'ERPO Emerytura',
  'zus-ersu':  'ERSU Mama 4+',
  'zus-z3':    'Z-3 Zaswiadczenie platnika',
};

const STARTER_HINTS: Record<string, string[]> = {
  'zus-zas53': ['Kto moze zlozyc ZAS-53?', 'Ile wynosi zasilek chorobowy?', 'Jaki jest termin zloze?'],
  'zus-z15a':  ['Ile dni zasilku przysluguje?', 'Co wpisac w e-ZLA?', 'Czy drugi rodzic musi podpisac?'],
  'zus-z15b':  ['Kto jest czlonkiem rodziny wg ZUS?', 'Ile dni zasilku?', 'Co oznacza wspolne gospodarstwo?'],
  'zus-pel':   ['Kto moze byc pelnomocnikiem?', 'Jak zlozyc pelnomocnictwo?', 'Jak odwolac pelnomocnictwo?'],
  'zus-erpo':  ['Kiedy moge przejsc na emeryture?', 'Co to jest emerytura kapitałowa?', 'Jakie dokumenty potrzebuje?'],
  'zus-ersu':  ['Komu przysluguje Mama 4+?', 'Ile wynosi swiadczenie?', 'Kiedy ojciec moze ubiegac sie o Tata 4+?'],
  'zus-z3':    ['Kto wystawia Z-3?', 'Kiedy potrzebne jest Z-3?', 'Jakie wynagrodzenie wpisac?'],
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
        content: `Czesc! Jestem asystentem do formularza ${formLabel}. Zadaj mi pytanie -- odpowiem konkretnie.`,
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
        updated[updated.length - 1] = { role: 'assistant', content: 'Przepraszam, cos pojechalo nie tak. Sprobuj ponownie.' };
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
          background: '#0f0d0b',
          border: '1px solid #3a2e1e',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #3a2e1e',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#e6993a', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Asystent AI
              </div>
              <div style={{ fontSize: 10, color: '#7a6a54', marginTop: 2 }}>{formLabel}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#7a6a54', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}
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
                  background: m.role === 'user' ? '#e6993a' : '#1c1712',
                  color: m.role === 'user' ? '#0f0d0b' : '#c4a882',
                  border: m.role === 'assistant' ? '1px solid #3a2e1e' : 'none',
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
                    background: 'none', border: '1px solid #3a2e1e', borderRadius: 20,
                    color: '#7a6a54', fontSize: 10, cursor: 'pointer', padding: '4px 10px',
                    fontFamily: 'inherit',
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #3a2e1e', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              placeholder="Zadaj pytanie..."
              style={{
                flex: 1, background: '#1c1712', border: '1px solid #3a2e1e', borderRadius: 8,
                color: '#c4a882', fontSize: 12, padding: '7px 10px', fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: '#e6993a', border: 'none', borderRadius: 8,
                color: '#0f0d0b', fontSize: 12, fontWeight: 700,
                padding: '7px 12px', cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit', opacity: (!input.trim() || loading) ? 0.5 : 1,
              }}
            >
              {loading ? '...' : 'Wyslij'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? '#3a2e1e' : '#e6993a',
          border: `1px solid ${open ? '#e6993a' : '#e6993a'}`,
          borderRadius: 24,
          color: open ? '#e6993a' : '#0f0d0b',
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
