'use client';

import { useState, useMemo } from 'react';
import type { FeedItem, Audience } from './rss';
import { FEEDS } from './rss';

interface Props {
  items: FeedItem[];
  active: string[];
  failed: string[];
  fetchedAt: string;
}

const AUDIENCE_LABELS: Record<Audience | 'all', string> = {
  all: 'Wszystkie',
  wszyscy: 'Dla wszystkich',
  jdg: 'JDG',
  firmy: 'Firmy',
};

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  zus:      { bg: '#003874', text: '#fff' },
  gus:      { bg: '#004B8D', text: '#fff' },
  nbp:      { bg: '#CC0000', text: '#fff' },
  uokik:    { bg: '#1B5E20', text: '#fff' },
  fundusze: { bg: '#6A0DAD', text: '#fff' },
  ezdrowie: { bg: '#00695C', text: '#fff' },
  sejm:     { bg: '#8B0000', text: '#fff' },
  arimr:    { bg: '#4E342E', text: '#fff' },
};

function relativeTime(isoStr: string | null, now: Date): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '';
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'przed chwilą';
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
  if (diff < 86400 * 2) return 'wczoraj';
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} dni temu`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FeedClient({ items, active, failed, fetchedAt }: Props) {
  const [audience, setAudience] = useState<Audience | 'all'>('all');
  const [activeSources, setActiveSources] = useState<Set<string>>(new Set(active));
  const [showSourceFilter, setShowSourceFilter] = useState(false);

  const now = new Date(fetchedAt);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const audienceOk = audience === 'all' || item.audiences.includes(audience);
      const sourceOk = activeSources.has(item.sourceId);
      return audienceOk && sourceOk;
    });
  }, [items, audience, activeSources]);

  function toggleSource(id: string) {
    setActiveSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const feedMap = Object.fromEntries(FEEDS.map(f => [f.id, f]));

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-120%) skewX(-12deg); }
          100% { transform: translateX(220%)  skewX(-12deg); }
        }

        .feed-item {
          position: relative;
          transition: box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          background: var(--color-bg-1);
        }
        .feed-item::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, transparent 0%, #22A06B 30%, #8EEAAD 60%, #22A06B 80%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .feed-item:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(34,160,107,0.06); }
        .feed-item:hover::after { opacity: 1; }

        .filter-pill {
          position: relative; overflow: hidden;
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease, background 0.15s, border-color 0.15s;
          font-family: var(--font-mono);
        }
        .filter-pill:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
        .filter-pill:active { transform: translateY(0) scale(0.97); }
        .filter-pill-active {
          background: linear-gradient(135deg, rgba(34,160,107,0.14) 0%, rgba(34,160,107,0.08) 100%) !important;
          box-shadow: 0 2px 8px rgba(34,160,107,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .filter-pill-active::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-120%) skewX(-12deg);
          animation: shimmer 0.6s ease-out;
        }

        .source-toggle {
          position: relative; overflow: hidden;
          transition: transform 0.15s, opacity 0.15s, border-color 0.15s;
          font-family: var(--font-mono);
        }
        .source-toggle:not(:disabled):hover { transform: translateY(-1px); }
        .source-toggle:not(:disabled):active { transform: scale(0.97); }
      `}</style>

      {/* Status + controls row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: active.length > 0 ? '#22A06B' : '#e06c75',
            boxShadow: active.length > 0 ? '0 0 6px rgba(34,160,107,0.6)' : '0 0 6px rgba(224,108,117,0.6)',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--color-text-3)' }}>
            {active.length} z {FEEDS.length} źródeł aktywnych
          </span>
        </div>
        {failed.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', opacity: 0.7 }}>
            niedostępne: {failed.map(id => feedMap[id]?.name ?? id).join(', ')}
          </span>
        )}
        <button
          onClick={() => setShowSourceFilter(s => !s)}
          className="filter-pill"
          style={{
            marginLeft: 'auto', fontSize: 11, letterSpacing: '0.06em',
            padding: '5px 12px', borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: showSourceFilter ? 'rgba(34,160,107,0.08)' : 'var(--color-bg-2)',
            color: showSourceFilter ? '#22A06B' : 'var(--color-text-3)',
            cursor: 'pointer',
          }}
        >
          {showSourceFilter ? 'ukryj źródła' : 'filtruj źródła'}
        </button>
      </div>

      {/* Audience filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {(['all', 'wszyscy', 'jdg', 'firmy'] as const).map(a => (
          <button
            key={a}
            onClick={() => setAudience(a)}
            className={`filter-pill${audience === a ? ' filter-pill-active' : ''}`}
            style={{
              fontSize: 12, letterSpacing: '0.04em',
              padding: '6px 14px', borderRadius: 8,
              border: audience === a ? '1px solid rgba(34,160,107,0.35)' : '1px solid var(--color-border)',
              background: audience === a ? undefined : 'var(--color-bg-2)',
              color: audience === a ? '#22A06B' : 'var(--color-text-3)',
              cursor: 'pointer',
            }}
          >
            {AUDIENCE_LABELS[a]}
          </button>
        ))}
      </div>

      {/* Source filter panel */}
      {showSourceFilter && (
        <div style={{
          padding: '14px 16px', marginBottom: 12,
          background: 'rgba(34,160,107,0.04)',
          border: '1px solid rgba(34,160,107,0.12)',
          borderRadius: 10,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            color: 'var(--color-text-3)', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22A06B', opacity: 0.6 }} />
            Aktywne źródła
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FEEDS.map(f => {
              const isOn = activeSources.has(f.id);
              const isFailed = failed.includes(f.id);
              const col = SOURCE_COLORS[f.id] ?? { bg: '#444', text: '#fff' };
              return (
                <button
                  key={f.id}
                  onClick={() => !isFailed && toggleSource(f.id)}
                  disabled={isFailed}
                  title={isFailed ? `${f.fullName} - niedostępne` : f.fullName}
                  className="source-toggle"
                  style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)',
                    padding: '4px 10px', borderRadius: 6,
                    border: `1px solid ${isOn && !isFailed ? col.bg + '80' : 'var(--color-border)'}`,
                    background: isOn && !isFailed ? col.bg + '18' : 'var(--color-bg-2)',
                    color: isOn && !isFailed ? col.bg : 'var(--color-text-3)',
                    opacity: isFailed ? 0.3 : 1,
                    cursor: isFailed ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Count */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12 }}>
        {filtered.length} {filtered.length === 1 ? 'wynik' : 'wyników'}
        {audience !== 'all' && ` · ${AUDIENCE_LABELS[audience]}`}
      </div>

      {/* Feed items */}
      {filtered.length === 0 ? (
        <div style={{
          border: '1px solid var(--color-border)', borderRadius: 12,
          padding: '32px 20px', textAlign: 'center',
        }}>
          {items.length === 0 ? (
            <>
              <p style={{ fontSize: 14, color: 'var(--color-text-2)', fontWeight: 500, marginBottom: 8 }}>
                Nie udało się pobrać aktualności.
              </p>
              <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 14 }}>
                Źródła RSS mogą być chwilowo niedostępne.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {FEEDS.map(f => (
                  <a
                    key={f.id}
                    href={f.url.split('/rss')[0].split('/kanal-rss')[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="filter-pill"
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-3)',
                      textDecoration: 'none',
                    }}
                  >
                    {f.name}
                  </a>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--color-text-3)' }}>Brak wyników dla wybranych filtrów.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(item => {
            const col = SOURCE_COLORS[item.sourceId] ?? { bg: '#444', text: '#fff' };
            return (
              <article
                key={item.id}
                className="feed-item"
                style={{
                  borderRadius: 12,
                  border: '1px solid var(--color-border)',
                  padding: '14px 16px',
                  overflow: 'hidden',
                }}
              >
                {/* Source + meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    padding: '2px 8px', borderRadius: 5,
                    background: col.bg, color: col.text,
                    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                    flexShrink: 0,
                  }}>
                    {item.source}
                  </span>
                  {item.pubDate && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)' }}>
                      {relativeTime(item.pubDate, now)}
                    </span>
                  )}
                  {item.audiences.includes('jdg') && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      padding: '2px 7px', borderRadius: 5,
                      border: '1px solid rgba(34,160,107,0.2)',
                      background: 'rgba(34,160,107,0.06)',
                      color: '#22A06B', letterSpacing: '0.04em',
                    }}>JDG</span>
                  )}
                  {item.audiences.includes('firmy') && !item.audiences.includes('jdg') && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      padding: '2px 7px', borderRadius: 5,
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-3)', letterSpacing: '0.04em',
                    }}>Firmy</span>
                  )}
                </div>

                {/* Title + arrow */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 14, fontWeight: 500,
                        color: 'var(--color-text-1)',
                        textDecoration: 'none',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: 'hidden',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = '#22A06B'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--color-text-1)'; }}
                    >
                      {item.title}
                    </a>
                    {item.description && (
                      <p style={{
                        marginTop: 5, fontSize: 12,
                        color: 'var(--color-text-3)', lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: 'hidden',
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Czytaj"
                    style={{
                      flexShrink: 0,
                      width: 28, height: 28,
                      borderRadius: '50%',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-text-3)',
                      fontSize: 12, textDecoration: 'none',
                      transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                      marginTop: 1,
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'rgba(34,160,107,0.4)';
                      el.style.background = 'rgba(34,160,107,0.08)';
                      el.style.color = '#22A06B';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget;
                      el.style.borderColor = 'var(--color-border)';
                      el.style.background = 'var(--color-bg-2)';
                      el.style.color = 'var(--color-text-3)';
                    }}
                  >
                    →
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
