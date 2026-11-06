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
      {/* Stan źródeł i przełącznik filtra źródeł */}
      <div className="ak-stan">
        <p className="mala" style={{ margin: 0 }}>
          {active.length} z {FEEDS.length} źródeł aktywnych
          {failed.length > 0 && <>, niedostępne: {failed.map(id => feedMap[id]?.name ?? id).join(', ')}</>}
        </p>
        <button
          type="button"
          onClick={() => setShowSourceFilter(s => !s)}
          className="filtr"
          aria-expanded={showSourceFilter}
        >
          {showSourceFilter ? 'Ukryj źródła' : 'Filtruj źródła'}
        </button>
      </div>

      {/* Dla kogo */}
      <div className="filtry" role="group" aria-label="Dla kogo">
        {(['all', 'wszyscy', 'jdg', 'firmy'] as const).map(a => (
          <button
            type="button"
            key={a}
            onClick={() => setAudience(a)}
            className="filtr"
            aria-pressed={audience === a}
          >
            {AUDIENCE_LABELS[a]}
          </button>
        ))}
      </div>

      {/* Źródła */}
      {showSourceFilter && (
        <div style={{ marginTop: 16 }}>
          <p className="etykieta">Aktywne źródła</p>
          <div className="filtry" role="group" aria-label="Źródła" style={{ marginTop: 0 }}>
            {FEEDS.map(f => {
              const isOn = activeSources.has(f.id);
              const isFailed = failed.includes(f.id);
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => !isFailed && toggleSource(f.id)}
                  disabled={isFailed}
                  title={isFailed ? `${f.fullName} - niedostępne` : f.fullName}
                  className="filtr"
                  aria-pressed={isOn && !isFailed}
                >
                  {f.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mala" style={{ margin: '16px 0 0' }}>
        {filtered.length} {filtered.length === 1 ? 'wynik' : 'wyników'}
        {audience !== 'all' && ` · ${AUDIENCE_LABELS[audience]}`}
      </p>

      {/* Lista komunikatów */}
      {filtered.length === 0 ? (
        <div style={{ borderTop: '1px solid var(--linia)', borderBottom: '1px solid var(--linia)', padding: '24px 0', marginTop: 12 }}>
          {items.length === 0 ? (
            <>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Nie udało się pobrać aktualności.</p>
              <p className="mala" style={{ margin: '0 0 12px' }}>Źródła RSS mogą być chwilowo niedostępne. Zajrzyj prosto na strony instytucji:</p>
              <div className="filtry" style={{ marginTop: 0 }}>
                {FEEDS.map(f => (
                  <a
                    key={f.id}
                    href={f.url.split('/rss')[0].split('/kanal-rss')[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="filtr"
                  >
                    {f.name}
                  </a>
                ))}
              </div>
            </>
          ) : (
            <p className="mala" style={{ margin: 0 }}>Brak wyników dla wybranych filtrów.</p>
          )}
        </div>
      ) : (
        <ul className="ak-lista">
          {filtered.map(item => (
            <li key={item.id}>
              <p className="ak-meta">
                <span className="znacznik">{item.source}</span>
                {item.pubDate && <span>{relativeTime(item.pubDate, now)}</span>}
                {item.audiences.includes('jdg') && <span className="znacznik znacznik-zielony">JDG</span>}
                {item.audiences.includes('firmy') && !item.audiences.includes('jdg') && <span className="znacznik znacznik-zielony">Firmy</span>}
              </p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="ak-tytul">
                {item.title}
              </a>
              {item.description && <p className="ak-opis">{item.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
