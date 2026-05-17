'use client';

import { useState, useMemo } from 'react';
import type { FeedItem, Audience } from './rss';
import { FEEDS } from './rss';

interface Props {
  items: FeedItem[];
  active: string[];
  failed: string[];
  fetchedAt: string; // ISO string
}

const AUDIENCE_LABELS: Record<Audience | 'all', string> = {
  all: 'Wszystkie',
  wszyscy: 'Dla wszystkich',
  jdg: 'JDG',
  firmy: 'Firmy',
};

const SOURCE_COLORS: Record<string, string> = {
  zus:      'bg-[#003874] text-white',
  gus:      'bg-[#004B8D] text-white',
  nbp:      'bg-[#CC0000] text-white',
  uokik:    'bg-[#1B5E20] text-white',
  fundusze: 'bg-[#6A0DAD] text-white',
  ezdrowie: 'bg-[#00695C] text-white',
  sejm:     'bg-[#8B0000] text-white',
  arimr:    'bg-[#4E342E] text-white',
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

function AbsoluteDate({ isoStr }: { isoStr: string | null }) {
  if (!isoStr) return null;
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return null;
  return (
    <span>
      {date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
    </span>
  );
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
        if (next.size > 1) next.delete(id); // keep at least one
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const feedMap = Object.fromEntries(FEEDS.map(f => [f.id, f]));

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-mono text-text-3">
        <span>
          {active.length} z {FEEDS.length} źródeł aktywnych
        </span>
        {failed.length > 0 && (
          <span className="text-warn">
            niedostępne: {failed.map(id => feedMap[id]?.name ?? id).join(', ')}
          </span>
        )}
        <span className="ml-auto">
          odświeżone: <AbsoluteDate isoStr={fetchedAt} />
        </span>
      </div>

      {/* Audience filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'wszyscy', 'jdg', 'firmy'] as const).map(a => (
          <button
            key={a}
            onClick={() => setAudience(a)}
            className={`font-mono text-[12px] tracking-wide px-3 py-1.5 rounded border transition-colors ${
              audience === a
                ? 'bg-accent text-bg-0 border-accent'
                : 'border-border text-text-3 hover:border-accent hover:text-accent'
            }`}
          >
            {AUDIENCE_LABELS[a]}
          </button>
        ))}
        <button
          onClick={() => setShowSourceFilter(s => !s)}
          className="ml-auto font-mono text-[12px] text-text-3 hover:text-accent border border-border hover:border-accent px-3 py-1.5 rounded transition-colors"
        >
          {showSourceFilter ? 'ukryj źródła' : 'filtruj źródła'}
        </button>
      </div>

      {/* Source filter */}
      {showSourceFilter && (
        <div className="border border-border rounded-lg p-4">
          <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase mb-3">
            Aktywne źródła
          </div>
          <div className="flex flex-wrap gap-2">
            {FEEDS.map(f => {
              const isActive = activeSources.has(f.id);
              const isFailed = failed.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => !isFailed && toggleSource(f.id)}
                  title={isFailed ? `${f.fullName} -- niedostępne` : f.fullName}
                  disabled={isFailed}
                  className={`font-mono text-[11px] px-2.5 py-1 rounded border transition-colors ${
                    isFailed
                      ? 'opacity-30 cursor-not-allowed border-border text-text-3'
                      : isActive
                      ? 'border-accent text-accent bg-accent-soft'
                      : 'border-border text-text-3 hover:border-accent'
                  }`}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Count */}
      <div className="font-mono text-[12px] text-text-3">
        {filtered.length} wyników
        {audience !== 'all' && ` dla: ${AUDIENCE_LABELS[audience]}`}
      </div>

      {/* Feed items */}
      {filtered.length === 0 ? (
        <div className="border border-border rounded-lg px-5 py-10 text-center text-[14px] text-text-3">
          Brak wyników dla wybranych filtrów.
        </div>
      ) : (
        <div className="space-y-0 border border-border rounded-lg divide-y divide-border overflow-hidden">
          {filtered.map(item => (
            <article key={item.id} className="px-5 py-4 hover:bg-bg-2 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Source + date */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded tracking-widest uppercase ${
                        SOURCE_COLORS[item.sourceId] ?? 'bg-bg-3 text-text-2'
                      }`}
                    >
                      {item.source}
                    </span>
                    {item.pubDate && (
                      <span className="font-mono text-[11px] text-text-3">
                        {relativeTime(item.pubDate, now)}
                      </span>
                    )}

                    {/* Audience badges */}
                    {item.audiences.includes('jdg') && (
                      <span className="font-mono text-[10px] border border-border rounded px-1.5 py-0.5 text-text-3 tracking-wide">
                        JDG
                      </span>
                    )}
                    {item.audiences.includes('firmy') && !item.audiences.includes('jdg') && (
                      <span className="font-mono text-[10px] border border-border rounded px-1.5 py-0.5 text-text-3 tracking-wide">
                        Firmy
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-medium text-text-1 hover:text-accent transition-colors leading-snug line-clamp-2 block"
                  >
                    {item.title}
                  </a>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-1 text-[12px] text-text-3 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-mono text-[12px] text-text-3 group-hover:text-accent transition-colors mt-1"
                  aria-label="Czytaj dalej"
                >
                  --&gt;
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
