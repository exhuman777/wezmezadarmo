'use client';

import { useEffect, useState } from 'react';

export interface ConversationSummary {
  id: string;
  title: string;
  mode: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  /** Wywoluje sie gdy usunieta - parent musi przeladowac liste */
  onDelete?: (id: string) => void;
  /** Reload trigger - parent moze wymusic refresh po dodaniu/update */
  refreshKey?: number;
}

const FREE_LIMIT = 10;

function relativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return 'teraz';
  if (diffMin < 60) return `${diffMin} min temu`;
  if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)} h temu`;
  if (diffMin < 60 * 24 * 7) return `${Math.floor(diffMin / 60 / 24)} dni temu`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

export default function ChatSidebar({ activeId, onSelect, onNew, onDelete, refreshKey = 0 }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/agent/chat/conversations')
      .then(res => res.ok ? res.json() : { conversations: [], count: 0 })
      .then(data => {
        if (cancelled) return;
        setConversations(data.conversations ?? []);
        setCount(data.count ?? 0);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm('Usunąć tę rozmowę?')) return;
    const res = await fetch(`/api/agent/chat/conversations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setConversations(prev => prev.filter(c => c.id !== id));
      setCount(prev => Math.max(0, prev - 1));
      onDelete?.(id);
    }
  }

  const isOverLimit = count >= FREE_LIMIT;

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      borderRight: '1px solid var(--color-border)',
      background: 'var(--color-bg-1)',
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      <style>{`
        .chat-conv-item { transition: background 120ms; }
        .chat-conv-item:hover { background: rgba(34,160,107,0.05); }
        .chat-conv-item.active { background: rgba(34,160,107,0.1); border-left-color: #22A06B !important; }
        .chat-conv-del { opacity: 0; transition: opacity 120ms; }
        .chat-conv-item:hover .chat-conv-del { opacity: 0.6; }
        .chat-conv-del:hover { opacity: 1 !important; color: #dc5050 !important; }
        @media (max-width: 700px) {
          .chat-sidebar-root { width: 100% !important; }
        }
      `}</style>

      <div className="chat-sidebar-root" style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <button
          onClick={onNew}
          disabled={isOverLimit}
          style={{
            width: '100%', padding: '10px 14px',
            borderRadius: 10,
            background: isOverLimit ? 'var(--color-bg-2)' : 'linear-gradient(135deg, #22A06B, #1d9060)',
            color: isOverLimit ? 'var(--color-text-3)' : '#fff',
            fontSize: 13, fontWeight: 600,
            border: 'none', cursor: isOverLimit ? 'not-allowed' : 'pointer',
            boxShadow: isOverLimit ? 'none' : '0 2px 8px rgba(34,160,107,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {isOverLimit ? 'Limit osiągnięty (10/10)' : '+ Nowa rozmowa'}
        </button>
        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {count}/{FREE_LIMIT} rozmów (free tier)
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px 14px' }}>
        {loading && (
          <div style={{ padding: 20, fontSize: 12, color: 'var(--color-text-3)', textAlign: 'center' }}>
            Ładowanie...
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div style={{ padding: '20px 14px', fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.5 }}>
            Brak zapisanych rozmów. Kliknij <strong>Nowa rozmowa</strong> i zacznij pytać AI.
          </div>
        )}

        {!loading && conversations.map(conv => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`chat-conv-item${activeId === conv.id ? ' active' : ''}`}
            style={{
              width: '100%', textAlign: 'left',
              padding: '10px 12px',
              background: 'transparent',
              border: 'none', borderLeft: `2px solid ${activeId === conv.id ? '#22A06B' : 'transparent'}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: 8,
              marginBottom: 1,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {conv.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 3, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span>{relativeDate(conv.updated_at)}</span>
                <span style={{ opacity: 0.6 }}>·</span>
                <span>{conv.message_count} wiad.</span>
              </div>
            </div>
            <span
              className="chat-conv-del"
              role="button"
              tabIndex={0}
              onClick={(e) => handleDelete(e, conv.id)}
              style={{ fontSize: 16, color: 'var(--color-text-3)', cursor: 'pointer', padding: 4, lineHeight: 1, flexShrink: 0 }}
              title="Usuń rozmowę"
            >
              ×
            </span>
          </button>
        ))}
      </div>

      {isOverLimit && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--color-border)', background: 'rgba(220,150,40,0.05)', fontSize: 11, color: 'var(--color-text-2)', lineHeight: 1.5, flexShrink: 0 }}>
          <strong style={{ color: 'var(--color-text-1)' }}>Osiągnięty limit free.</strong> Wkrótce wersja płatna bez limitów. Usuń starszą rozmowę żeby stworzyć nową.
        </div>
      )}
    </aside>
  );
}
