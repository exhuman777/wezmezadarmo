'use client';

import { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAgentMode } from '../AgentModeContext';
import { ChatFallbackPrompt } from '@/components/ChatFallbackPrompt';
import ChatSidebar from '@/components/ChatSidebar';
import { MessageContent } from '@/components/MessageContent';
import type { AgentId } from '@/agents/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const MODE_LABELS: Record<AgentId, string> = {
  konsjerz: 'Konsjerż - pytania ogólne',
  swiadczenia: 'Świadczenia i ulgi',
  wnioski: 'Wnioski i formularze',
  'nfz-zdrowie': 'NFZ i zdrowie',
  'finanse-jdg': 'Finanse i JDG',
  dotacje: 'Dotacje i granty',
  'prawo-terminy': 'Prawo i terminy',
  rolnik: 'Rolnik',
};

const DEFAULT_HINTS: string[] = [
  'Jakie mam świadczenia?',
  'Jak złożyć wniosek o 800+?',
  'Czy przysługuje mi zasiłek?',
];

const MODE_HINTS: Partial<Record<AgentId, string[]>> = {
  konsjerz: DEFAULT_HINTS,
  swiadczenia: [
    'Co mi przysługuje z mojego profilu?',
    'Ile wynosi zasiłek opiekuńczy?',
    'Czy kwalifikuję się do Dobry Start?',
  ],
  wnioski: [
    'Pomóż mi wypełnić Z-15a',
    'Jakie dokumenty potrzebuję do ZAS-53?',
    'Gdzie złożyć wniosek o emeryturę?',
  ],
  dotacje: [
    'Jakie są aktualne nabory?',
    'Dofinansowanie dla JDG na szkolenia',
    'Granty EU dla mikrofirm',
  ],
  'finanse-jdg': [
    'Od kiedy obowiązkowy KSeF?',
    'Jak wystawić fakturę zagraniczną?',
    'Termin rozliczenia VAT',
  ],
  'prawo-terminy': [
    'Kiedy termin PIT roczny?',
    'Do kiedy ZUS miesięcznie?',
    'Terminy składania wniosków PFRON',
  ],
};

export default function AgentChatPage() {
  return (
    <Suspense fallback={null}>
      <AgentChatInner />
    </Suspense>
  );
}

function AgentChatInner() {
  const { mode } = useAgentMode();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeAgent, setActiveAgent] = useState<string>('konsjerz');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const autoSentRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);

  // Keep ref in sync ze stanem (potrzebne w sendMessage closure)
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

  // Scroll only container, only if user is near the bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !shouldAutoScrollRef.current) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  // Track if user manually scrolled up
  function handleScroll() {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 80;
  }

  // Reset chat on mode change
  useEffect(() => {
    setMessages([]);
    setInput('');
    setConversationId(null);
  }, [mode]);

  // Save messages do bazy (po kazdym sendMessage komplecie)
  const saveMessagesRef = useRef<(id: string, msgs: Message[]) => Promise<void>>(async () => {});
  useEffect(() => {
    saveMessagesRef.current = async (id: string, msgs: Message[]) => {
      try {
        await fetch(`/api/agent/chat/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: msgs.map(m => ({ role: m.role, content: m.content, ts: Date.now() })),
          }),
        });
      } catch { /* fail silently - chat dziala bez save */ }
    };
  }, []);

  const createConversationRef = useRef<(firstMsg: string) => Promise<string | null>>(async () => null);
  useEffect(() => {
    createConversationRef.current = async (firstMsg: string) => {
      try {
        const res = await fetch('/api/agent/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, firstMessage: firstMsg }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const id = data.conversation?.id ?? null;
        if (id) {
          setConversationId(id);
          conversationIdRef.current = id;
          setRefreshKey(k => k + 1);
        }
        return id;
      } catch { return null; }
    };
  }, [mode]);

  // Load istniejaca konwersacja po klik w sidebar
  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/agent/chat/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const conv = data.conversation;
      if (!conv) return;
      const loaded: Message[] = (conv.messages || []).map((m: { role: 'user' | 'assistant'; content: string }, i: number) => ({
        id: `${conv.id}-${i}`,
        role: m.role,
        content: m.content,
      }));
      setMessages(loaded);
      setConversationId(conv.id);
      conversationIdRef.current = conv.id;
    } catch { /* ignore */ }
  }, []);

  function handleNewConversation() {
    setMessages([]);
    setInput('');
    setConversationId(null);
    conversationIdRef.current = null;
  }

  function handleDeleteConversation(id: string) {
    if (conversationIdRef.current === id) {
      handleNewConversation();
    }
    setRefreshKey(k => k + 1);
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    shouldAutoScrollRef.current = true;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
    };

    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, assistantMsg]);
    setIsStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let accum = '';

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode: mode === 'konsjerz' ? 'auto' : mode,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Blad polaczenia.' }));
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: err.error || 'Blad czatu.' };
          return copy;
        });
        setIsStreaming(false);
        return;
      }

      const agentHeader = res.headers.get('X-Agent-Id');
      if (agentHeader) setActiveAgent(agentHeader);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6);
              if (payload === '[DONE]') continue;
              try {
                const { content } = JSON.parse(payload);
                if (content) {
                  accum += content;
                  setMessages(prev => {
                    const copy = [...prev];
                    copy[copy.length - 1] = { ...copy[copy.length - 1], content: accum };
                    return copy;
                  });
                }
              } catch {
                // ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: 'Blad polaczenia z serwerem.' };
          return copy;
        });
      }
    }

    setIsStreaming(false);
    abortRef.current = null;

    // Auto-save: jesli nie ma jeszcze conversationId - utworz; potem PATCH messages
    const finalMessages = [...newMessages, { ...assistantMsg, content: accum }];
    let convId = conversationIdRef.current;
    if (!convId) {
      convId = await createConversationRef.current(text.trim());
    }
    if (convId) {
      saveMessagesRef.current(convId, finalMessages);
    }
  }, [messages, mode, isStreaming]);

  // Auto-send query z URL (?q=...) - dziala raz przy mount, np. przy przekierowaniu z /agent
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !autoSentRef.current && !isStreaming && messages.length === 0) {
      autoSentRef.current = true;
      sendMessage(q);
    }
  }, [searchParams, isStreaming, messages.length, sendMessage]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = '48px';
    sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  function handleHint(hint: string) {
    setInput('');
    sendMessage(hint);
  }

  const hints = MODE_HINTS[mode] ?? DEFAULT_HINTS;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 700px) {
          .chat-sidebar-wrap { display: ${sidebarOpen ? 'flex' : 'none'} !important; width: 100% !important; }
          .chat-main-wrap { display: ${sidebarOpen ? 'none' : 'flex'} !important; }
        }
      `}</style>

      {/* Sidebar z historia rozmow */}
      <div className="chat-sidebar-wrap" style={{ display: 'flex', height: '100%' }}>
        <ChatSidebar
          activeId={conversationId}
          onSelect={(id) => { loadConversation(id); setSidebarOpen(false); }}
          onNew={() => { handleNewConversation(); setSidebarOpen(false); }}
          onDelete={handleDeleteConversation}
          refreshKey={refreshKey}
        />
      </div>

      {/* Glowny chat */}
      <div className="chat-main-wrap chat-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minWidth: 0 }}>
      <style>{`
        @media (max-width: 480px) {
          .chat-root .chat-header { padding: 10px 14px !important; }
          .chat-root .chat-messages { padding: 12px 14px !important; }
          .chat-root .chat-input-form { padding: 10px 14px !important; gap: 6px !important; }
          .chat-root .chat-input { font-size: 16px !important; padding: 11px 14px !important; }
          .chat-root .chat-send-btn { padding: 0 14px !important; min-width: auto !important; }
          .chat-root .chat-bubble { max-width: 92% !important; font-size: 14px !important; }
          .chat-root .chat-hint { font-size: 13px !important; padding: 10px 12px !important; }
        }
      `}</style>
      {/* Header */}
      <div className="chat-header" style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--color-text-3)', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 2,
          }}>
            Czat z AI
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-1)' }}>
            {MODE_LABELS[mode]}
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setInput(''); }}
            style={{
              background: 'none', border: '1px solid var(--color-border)',
              borderRadius: 6, padding: '6px 12px',
              fontSize: 12, color: 'var(--color-text-3)',
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
            }}
          >
            Nowa rozmowa

          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="chat-messages"
        style={{
          flex: 1, overflowY: 'auto', padding: '16px 24px',
          display: 'flex', flexDirection: 'column',
        }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 24, padding: '40px 0',
          }}>
            <div style={{
              width: 56, height: 56,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 14,
              background: 'var(--color-green)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              fontSize: 20, fontWeight: 700,
            }}>
              {mode.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 6 }}>
                {MODE_LABELS[mode]}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-3)', maxWidth: 400 }}>
                Zadaj pytanie lub wybierz podpowiedź poniżej
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {hints.map(hint => (
                <button
                  key={hint}
                  onClick={() => handleHint(hint)}
                  style={{
                    padding: '8px 14px',
                    background: 'var(--color-bg-1)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--color-text-2)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            style={{
              maxWidth: '85%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--color-text-3)', letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 4,
              }}>
                {activeAgent.replace('-', ' / ')}
              </div>
            )}
            <div style={{
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? 'var(--color-green)' : 'var(--color-bg-1)',
              color: msg.role === 'user' ? 'var(--color-bg-0)' : 'var(--color-text-1)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              <MessageContent text={msg.content} />
              {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
                <span style={{
                  display: 'inline-block',
                  width: 6, height: 14,
                  background: 'var(--color-green)',
                  marginLeft: 2,
                  animation: 'blink 1s steps(2) infinite',
                }} />
              )}
            </div>
          </div>
        ))}
        {/* Live chat fallback -- pokazuje sie gdy AI 2x z rzedu nie wie */}
        {!isStreaming && <ChatFallbackPrompt messages={messages} context="agent-panel-chat" />}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="chat-input-form"
        style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          padding: '12px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-1)',
          flexShrink: 0,
        }}
        // class added below via className on textarea/button via separate form
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Zadaj pytanie..."

          disabled={isStreaming}
          rows={1}
          className="chat-input"
          style={{
            flex: 1,
            height: 48, minHeight: 48, maxHeight: 120,
            padding: '13px 18px',
            borderRadius: 14,
            background: 'var(--color-bg-0)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-1)',
            fontSize: 15,
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            overflowY: 'auto',
            lineHeight: 1.5,
            transition: 'border-color 200ms',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-green)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="btn btn-primary chat-send-btn"
          style={{
            height: 48, padding: '0 20px',
            borderRadius: 14,
            opacity: (isStreaming || !input.trim()) ? 0.3 : 1,
            cursor: (isStreaming || !input.trim()) ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          Wyślij
        </button>
      </form>

      {/* Disclaimer */}
      <div style={{
        padding: '6px 24px',
        fontSize: 11, color: 'var(--color-text-3)',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-0)',
        flexShrink: 0,
      }}>
        Odpowiedzi AI generowane przez model. Zweryfikuj na stronach źródłowych.
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      </div>
    </div>
  );
}
