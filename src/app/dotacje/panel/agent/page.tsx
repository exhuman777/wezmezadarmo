'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const updated: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...updated, assistantMsg]);

    try {
      const response = await fetch('/api/dotacje/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: accumulated };
          return next;
        });
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: 'Błąd połączenia z agentem. Spróbuj ponownie.',
        };
        return next;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 52px)',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px',
      }}
    >
      {/* Disclaimer */}
      <div
        style={{
          background: 'var(--color-bg-1)',
          borderBottom: '1px solid var(--color-border)',
          padding: '8px 0',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Agent AI -- charakter informacyjny. Nie gwarantujemy przyznania dofinansowania.
        </p>
      </div>

      {/* Message list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 0 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 && !loading && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--color-text-3)',
                textAlign: 'center',
              }}
            >
              Zadaj pytanie o dotacje dla Twojej firmy...
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '72%',
                padding: '12px 16px',
                borderRadius: '6px',
                background:
                  msg.role === 'user'
                    ? 'var(--color-accent)'
                    : 'var(--color-bg-2)',
                border:
                  msg.role === 'user'
                    ? 'none'
                    : '1px solid var(--color-border-light)',
                fontFamily:
                  msg.role === 'assistant' ? 'var(--font-mono)' : 'var(--font-sans)',
                fontSize: msg.role === 'assistant' ? '13px' : '14px',
                color:
                  msg.role === 'user' ? 'var(--color-bg-0)' : 'var(--color-text-1)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
              {loading && i === messages.length - 1 && msg.role === 'assistant' && msg.content === '' && (
                <span style={{ opacity: 0.5 }}>...</span>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '6px',
                background: 'var(--color-bg-2)',
                border: '1px solid var(--color-border-light)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--color-text-3)',
              }}
            >
              ...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          flexShrink: 0,
          borderTop: '1px solid var(--color-border)',
          padding: '12px 0',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Napisz wiadomość... (Enter wysyła, Shift+Enter = nowa linia)"
          rows={2}
          className="input-focus"
          style={{
            flex: 1,
            background: 'var(--color-bg-1)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: 'var(--color-text-1)',
            resize: 'none',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? 'var(--color-bg-2)' : 'var(--color-accent)',
            color: loading || !input.trim() ? 'var(--color-text-3)' : 'var(--color-bg-0)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '6px',
            padding: '10px 18px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            height: '60px',
          }}
        >
          {loading ? '...' : 'Wyślij'}
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          padding: '6px 0 8px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-text-3)',
            margin: 0,
          }}
        >
          Stan wiedzy: maj 2026
        </p>
      </div>
    </div>
  );
}
